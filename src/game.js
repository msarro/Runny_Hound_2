import { SCORE, SPEED, WORLD } from "./config.js";
import { overlaps } from "./collision.js";
import { createHound, houndHitbox, releaseJump, startJump, updateHound } from "./hound.js";
import { createObstacle, nextGap, obstacleHitbox, pickType } from "./obstacles.js";

// Seconds after a crash before Space starts a new run, so a held key doesn't restart.
export const RESTART_DELAY = 0.5;
const FIRST_OBSTACLE_DISTANCE = 600;

// phase is "ready" (title screen), "running" or "over".
// Functions return a list of events ("start", "jump", "milestone", "crash",
// "highscore") for the sound and screen-reader code to react to.
export function createGame({ rng = Math.random, highScore = 0, obstacles = true } = {}) {
  return {
    rng,
    spawnObstacles: obstacles,
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
  };
}

export function press(game) {
  if (game.phase === "ready") {
    game.phase = "running";
    startJump(game.hound);
    return ["start", "jump"];
  }
  if (game.phase === "over") {
    if (game.overTime < RESTART_DELAY) return [];
    Object.assign(game, freshRun(), { phase: "running", paused: false });
    startJump(game.hound);
    return ["start", "jump"];
  }
  if (game.paused) return [];
  return startJump(game.hound) ? ["jump"] : [];
}

export function release(game) {
  releaseJump(game.hound);
}

export function togglePause(game) {
  if (game.phase === "running") game.paused = !game.paused;
}

export function step(game, dt) {
  if (game.phase === "over") {
    game.overTime += dt;
    return [];
  }
  if (game.phase !== "running" || game.paused) return [];

  const events = [];
  game.speed = Math.min(SPEED.max, game.speed + SPEED.acceleration * dt);
  const moved = game.speed * dt;
  game.distance += moved;

  const score = Math.floor(game.distance / SCORE.pixelsPerPoint);
  if (Math.floor(score / SCORE.milestone) > Math.floor(game.score / SCORE.milestone)) {
    events.push("milestone");
  }
  game.score = score;

  updateHound(game.hound, dt);

  for (const obstacle of game.obstacles) obstacle.x -= moved;
  game.obstacles = game.obstacles.filter((o) => o.x + o.type.width > 0);

  if (game.spawnObstacles) {
    game.untilNextObstacle -= moved;
    if (game.untilNextObstacle <= 0) {
      const type = pickType(game.rng, game.score);
      game.obstacles.push(createObstacle(type, WORLD.width));
      game.untilNextObstacle = type.width + nextGap(game.speed, game.rng);
    }
  }

  const me = houndHitbox(game.hound);
  const hit = game.obstacles.find((o) => overlaps(me, obstacleHitbox(o)));
  if (hit) {
    game.phase = "over";
    game.crashedInto = hit.type;
    events.push("crash");
    if (game.score > game.highScore) {
      game.highScore = game.score;
      events.push("highscore");
    }
  }
  return events;
}
