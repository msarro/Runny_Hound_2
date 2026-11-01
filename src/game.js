import { SCORE, SPEED, WORLD } from "./config.js";
import { overlaps } from "./collision.js";
import {
  HOUND,
  createHound,
  houndHitbox,
  releaseJump,
  setDucking,
  startJump,
  updateHound,
} from "./hound.js";
import { FLYER_GAP, createObstacle, nextGap, obstacleHitbox, pickObstacle } from "./obstacles.js";
import { createRng } from "./random.js";

// Seconds after a crash before Space starts a new run, so a held key doesn't restart.
export const RESTART_DELAY = 0.5;
const FIRST_OBSTACLE_DISTANCE = 600;
const FLASH_SECONDS = 1.2;
// A jump pressed this soon before landing still happens when the hound lands.
const JUMP_BUFFER = 0.13;
const DUST_EVERY = 0.09;

// phase is "ready" (title screen), "running" or "over".
// Functions return a list of events ("start", "jump", "land", "duck", "resume",
// "milestone", "crash", "highscore") for the sound and screen-reader code to react to.
// flash counts down after a milestone (the score blinks); newHighScore is set on a
// crash that beat the best score.
export function createGame({ rng = Math.random, highScore = 0, obstacles = true } = {}) {
  return {
    rng,
    fx: createRng(1742), // randomness for dust and sparks, separate from the course
    spawnObstacles: obstacles,
    jumpKeyHeld: false,
    highScore,
    phase: "ready",
    paused: false,
    ...freshRun(),
  };
}

function freshRun() {
  return {
    hound: createHound(),
    obstacles: [],
    speed: SPEED.start,
    distance: 0,
    score: 0,
    untilNextObstacle: FIRST_OBSTACLE_DISTANCE,
    overTime: 0,
    crashedInto: null,
    flash: 0,
    newHighScore: false,
    jumpBuffer: 0,
    dustTimer: 0,
    particles: [],
    shake: 0,
  };
}

// ----- Dust, sparks and stars (as in Runny Hound 1) -----

function puff(game, x, count, spread) {
  const r = game.fx;
  for (let i = 0; i < count; i++) {
    game.particles.push({
      kind: "dust",
      x: x + (r() - 0.5) * spread,
      y: WORLD.groundY - r() * 3,
      vx: -game.speed * 0.9 - r() * 60,
      vy: -20 - r() * 60,
      life: 0.35 + r() * 0.25,
      max: 0.6,
      size: 2 + r() * 3,
      gravity: 60,
    });
  }
}

function crashBurst(game) {
  const r = game.fx;
  const x = HOUND.x + 60;
  const y = WORLD.groundY - game.hound.y - 40;
  for (let i = 0; i < 26; i++) {
    const angle = r() * Math.PI * 2;
    const speed = 80 + r() * 260;
    game.particles.push({
      kind: i % 3 ? "spark" : "star",
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 120,
      life: 0.9 + r() * 0.5,
      max: 1.4,
      size: 2 + r() * 3,
      rotation: r() * Math.PI * 2,
      gravity: 500,
    });
  }
}

function updateEffects(game, dt) {
  for (const p of game.particles) {
    p.life -= dt;
    p.vy += p.gravity * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    if (p.rotation !== undefined) p.rotation += dt * 6;
  }
  game.particles = game.particles.filter((p) => p.life > 0);
  game.shake = Math.max(0, game.shake - dt * 30);
}

export function press(game) {
  if (game.phase === "ready") {
    game.phase = "running";
    game.jumpKeyHeld = true;
    startJump(game.hound);
    return ["start", "jump"];
  }
  if (game.phase === "over") {
    if (game.overTime < RESTART_DELAY) return [];
    Object.assign(game, freshRun(), { phase: "running", paused: false, jumpKeyHeld: true });
    startJump(game.hound);
    return ["start", "jump"];
  }
  if (game.paused) {
    game.paused = false;
    return ["resume"];
  }
  game.jumpKeyHeld = true;
  if (startJump(game.hound)) {
    puff(game, HOUND.x + 20, 6, 30);
    return ["jump"];
  }
  game.jumpBuffer = JUMP_BUFFER;
  return [];
}

export function release(game) {
  game.jumpKeyHeld = false;
  releaseJump(game.hound);
}

export function pressDuck(game) {
  if (game.phase !== "running" || game.paused) return [];
  setDucking(game.hound, true);
  return game.hound.grounded ? ["duck"] : [];
}

export function releaseDuck(game) {
  setDucking(game.hound, false);
}

export function togglePause(game) {
  if (game.phase === "running") game.paused = !game.paused;
}

export function step(game, dt) {
  if (game.phase === "over") {
    game.overTime += dt;
    updateEffects(game, dt);
    return [];
  }
  if (game.phase !== "running" || game.paused) return [];

  const events = [];
  game.flash = Math.max(0, game.flash - dt);
  game.speed = Math.min(SPEED.max, game.speed + SPEED.acceleration * dt);
  const moved = game.speed * dt;
  game.distance += moved;

  const score = Math.floor(game.distance / SCORE.pixelsPerPoint);
  if (Math.floor(score / SCORE.milestone) > Math.floor(game.score / SCORE.milestone)) {
    events.push("milestone");
    game.flash = FLASH_SECONDS;
  }
  game.score = score;

  if (updateHound(game.hound, dt)) {
    events.push("land");
    puff(game, HOUND.x + 30, 8, 50);
  }
  if (game.jumpBuffer > 0 && startJump(game.hound)) {
    events.push("jump");
    puff(game, HOUND.x + 20, 6, 30);
    if (!game.jumpKeyHeld) releaseJump(game.hound);
    game.jumpBuffer = 0;
  }
  game.jumpBuffer = Math.max(0, game.jumpBuffer - dt);

  game.dustTimer -= dt;
  if (game.hound.grounded && game.dustTimer <= 0) {
    game.dustTimer = DUST_EVERY;
    puff(game, HOUND.x + 14, 1, 8);
  }
  updateEffects(game, dt);

  for (const obstacle of game.obstacles) {
    obstacle.x -= moved;
    obstacle.age += dt;
  }
  game.obstacles = game.obstacles.filter((o) => o.x + o.width > 0);

  if (game.spawnObstacles) {
    game.untilNextObstacle -= moved;
    if (game.untilNextObstacle <= 0) {
      const pick = pickObstacle(game.rng, game.score);
      const obstacle = createObstacle(pick.type, WORLD.width, pick);
      game.obstacles.push(obstacle);
      game.untilNextObstacle =
        obstacle.width + nextGap(game.speed, game.rng) + (pick.type.flying ? FLYER_GAP : 0);
    }
  }

  const me = houndHitbox(game.hound);
  const hit = game.obstacles.find((o) => overlaps(me, obstacleHitbox(o)));
  if (hit) {
    game.phase = "over";
    game.crashedInto = hit.type;
    events.push("crash");
    game.flash = 0;
    game.shake = 10;
    crashBurst(game);
    if (game.score > game.highScore) {
      game.highScore = game.score;
      game.newHighScore = true;
      events.push("highscore");
    }
  }
  return events;
}
