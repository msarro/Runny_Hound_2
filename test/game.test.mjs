import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createGame,
  press,
  release,
  pressDuck,
  releaseDuck,
  step,
  togglePause,
  RESTART_DELAY,
} from "../src/game.js";
import { houndHitbox, HOUND, CROUCH_HEIGHT } from "../src/hound.js";
import { obstacleHitbox, OBSTACLE_TYPES, BOB } from "../src/obstacles.js";
import { createRng } from "../src/random.js";
import { PHYSICS, SCORE, SPEED, WORLD } from "../src/config.js";

const DT = 1 / 120;

function run(game, seconds, each = () => {}) {
  const events = [];
  for (let i = 0; i < Math.round(seconds / DT); i++) {
    each(game);
    events.push(...step(game, DT));
  }
  return events;
}

function runUntilOver(game, maxSeconds = 60) {
  const events = [];
  for (let t = 0; t < maxSeconds && game.phase !== "over"; t += DT) events.push(...step(game, DT));
  return events;
}

// An attentive player: runs under high stars, ducks under middle ones, and jumps
// everything else at the right moment with a full-height jump.
const STANDING_TOP = HOUND.hitbox.bottomInset + HOUND.hitbox.height;
const CROUCH_TOP = HOUND.hitbox.bottomInset + CROUCH_HEIGHT;
function autopilot(game) {
  const me = houndHitbox(game.hound);
  const next = game.obstacles
    .map((o) => ({ o, box: obstacleHitbox(o) }))
    .filter(({ box }) => box.x + box.width > me.x)
    .sort((a, b) => a.box.x - b.box.x)[0];
  const distance = next ? next.box.x - (me.x + me.width) : Infinity;
  const lowest = next ? next.o.altitude - BOB : 0;
  if (next && next.o.type.flying && lowest > STANDING_TOP) {
    releaseDuck(game); // high star: just keep running
    return;
  }
  if (next && next.o.type.flying && lowest > CROUCH_TOP) {
    if (distance < game.speed * 0.4) pressDuck(game); // middle star: duck under it
    return;
  }
  releaseDuck(game);
  if (!next || !game.hound.grounded) return;
  const mustReach = WORLD.groundY - next.box.y + BOB - HOUND.hitbox.bottomInset + 4;
  const { jumpVelocity: v, gravity: g } = PHYSICS;
  const timeToReach = (v - Math.sqrt(v * v - 2 * g * mustReach)) / g;
  if (distance <= game.speed * (timeToReach + DT)) press(game);
}

const newGame = (options = {}) => createGame({ rng: createRng(1), ...options });

test("a new game waits for the player", () => {
  const game = newGame();
  assert.equal(game.phase, "ready");
  assert.equal(game.score, 0);
  assert.deepEqual(game.obstacles, []);
});

test("nothing moves before the player starts", () => {
  const game = newGame();
  run(game, 2);
  assert.equal(game.distance, 0);
  assert.deepEqual(game.obstacles, []);
});

test("pressing Space starts the run with a jump", () => {
  const game = newGame();
  assert.deepEqual(press(game), ["start", "jump"]);
  assert.equal(game.phase, "running");
  assert.equal(game.hound.grounded, false);
});

test("the score goes up as the hound runs", () => {
  const game = newGame({ obstacles: false });
  press(game);
  run(game, 1);
  assert.equal(game.score, Math.floor(game.distance / SCORE.pixelsPerPoint));
  assert.ok(game.score >= 8, `score ${game.score}`);
});

test("the game speeds up over time but never past the top speed", () => {
  const game = newGame({ obstacles: false });
  press(game);
  run(game, 1);
  assert.ok(game.speed > SPEED.start);
  run(game, 300);
  assert.equal(game.speed, SPEED.max);
});

test("a chime plays every milestone", () => {
  const game = newGame({ obstacles: false });
  press(game);
  const events = [];
  while (game.score < SCORE.milestone * 2.5) events.push(...step(game, DT));
  assert.equal(events.filter((e) => e === "milestone").length, 2);
});

test("obstacles appear at the right edge and move toward the hound", () => {
  const game = newGame();
  press(game);
  run(game, 2.5);
  assert.ok(game.obstacles.length >= 1);
  const before = game.obstacles[0].x;
  step(game, DT);
  assert.ok(game.obstacles[0].x < before);
  assert.ok(before <= WORLD.width);
});

test("running into an obstacle ends the run", () => {
  const game = newGame();
  press(game);
  const events = runUntilOver(game);
  assert.equal(game.phase, "over");
  assert.ok(events.includes("crash"));
  assert.ok(OBSTACLE_TYPES.includes(game.crashedInto));
  assert.equal(game.highScore, game.score);
});

test("the world freezes after a crash", () => {
  const game = newGame();
  press(game);
  runUntilOver(game);
  const distance = game.distance;
  run(game, 1);
  assert.equal(game.distance, distance);
});

test("a new high score is announced, a lower one is not", () => {
  const first = newGame();
  press(first);
  assert.ok(runUntilOver(first).includes("highscore"));

  const second = newGame({ highScore: 1_000_000 });
  press(second);
  const events = runUntilOver(second);
  assert.ok(events.includes("crash"));
  assert.ok(!events.includes("highscore"));
  assert.equal(second.highScore, 1_000_000);
});

test("you can't restart by accident right after crashing", () => {
  const game = newGame();
  press(game);
  runUntilOver(game);
  assert.deepEqual(press(game), []);
  assert.equal(game.phase, "over");
});

test("after a short pause, Space starts a fresh run and keeps the high score", () => {
  const game = newGame();
  press(game);
  runUntilOver(game);
  const best = game.highScore;
  run(game, RESTART_DELAY + 0.05);
  assert.deepEqual(press(game), ["start", "jump"]);
  assert.equal(game.phase, "running");
  assert.equal(game.score, 0);
  assert.equal(game.distance, 0);
  assert.deepEqual(game.obstacles, []);
  assert.equal(game.highScore, best);
  assert.equal(game.crashedInto, null);
});

test("pausing freezes the run; P unpauses it", () => {
  const game = newGame({ obstacles: false });
  press(game);
  run(game, 1);
  togglePause(game);
  const distance = game.distance;
  run(game, 1);
  assert.equal(game.distance, distance);
  togglePause(game);
  run(game, 0.1);
  assert.ok(game.distance > distance);
});

test("Space (or a tap) resumes a paused run without jumping, like Runny Hound 1", () => {
  const game = newGame({ obstacles: false });
  press(game);
  run(game, 1);
  togglePause(game);
  assert.deepEqual(press(game), ["resume"]);
  assert.equal(game.paused, false);
  assert.equal(game.hound.grounded, true);
});

test("pause does nothing before the run starts", () => {
  const game = newGame();
  togglePause(game);
  assert.equal(game.paused, false);
});

test("releasing Space is safe at any time", () => {
  const game = newGame();
  release(game);
  press(game);
  release(game);
  assert.equal(game.hound.jumpHeld, false);
});

test("an attentive player can survive two minutes on any course", () => {
  const met = new Set();
  for (const seed of [1, 2, 3, 4, 5]) {
    const game = createGame({ rng: createRng(seed) });
    press(game);
    let maxOnScreen = 0;
    run(game, 120, (g) => {
      autopilot(g);
      maxOnScreen = Math.max(maxOnScreen, g.obstacles.length);
      for (const o of g.obstacles) met.add(`${o.type.id}:${o.count}:${o.altitude}`);
    });
    assert.equal(game.phase, "running", `seed ${seed} crashed into ${game.crashedInto?.id}`);
    assert.ok(game.score > 1000, `seed ${seed} score ${game.score}`);
    assert.ok(maxOnScreen <= 4, `obstacles are not cleaned up (${maxOnScreen})`);
  }
  const ids = new Set([...met].map((k) => k.split(":")[0]));
  assert.equal(ids.size, OBSTACLE_TYPES.length, `met only ${[...ids]}`);
  assert.ok(
    [...met].some((k) => /^(candle|chick):3:/.test(k)),
    "never met a group of three",
  );
  const starHeights = new Set(
    [...met].filter((k) => k.startsWith("flyer")).map((k) => k.split(":")[2]),
  );
  assert.equal(starHeights.size, 3, `met star heights ${[...starHeights]}`);
});

test("the score flashes for a moment at each milestone", () => {
  const game = newGame({ obstacles: false });
  press(game);
  assert.equal(game.flash, 0);
  while (!step(game, DT).includes("milestone"));
  assert.ok(game.flash > 1);
  run(game, 1.3);
  assert.equal(game.flash, 0);
});

test("game over remembers whether the score was a new best", () => {
  const first = newGame();
  press(first);
  runUntilOver(first);
  assert.equal(first.newHighScore, true);
  const second = newGame({ highScore: 1_000_000 });
  press(second);
  runUntilOver(second);
  assert.equal(second.newHighScore, false);
  run(first, RESTART_DELAY + 0.05);
  press(first);
  assert.equal(first.newHighScore, false);
  assert.equal(first.flash, 0);
});

test("Down makes the hound duck while running, and letting go stands it up", () => {
  const game = newGame({ obstacles: false });
  press(game);
  run(game, 1);
  assert.deepEqual(pressDuck(game), ["duck"]);
  assert.equal(game.hound.ducking, true);
  releaseDuck(game);
  assert.equal(game.hound.ducking, false);
});

test("ducking does nothing before the run starts or while paused", () => {
  const game = newGame({ obstacles: false });
  assert.deepEqual(pressDuck(game), []);
  assert.equal(game.hound.ducking, false);
  press(game);
  togglePause(game);
  assert.deepEqual(pressDuck(game), []);
  assert.equal(game.hound.ducking, false);
});

test("a jump pressed just before landing still happens", () => {
  const game = newGame({ obstacles: false });
  press(game);
  while (!(game.hound.vy < 0 && game.hound.y < 20)) step(game, DT);
  assert.deepEqual(press(game), []);
  const events = run(game, 0.2);
  assert.ok(events.includes("land") && events.includes("jump"), events.join());
  assert.equal(game.hound.grounded, false);
});

test("a jump pressed long before landing is ignored", () => {
  const game = newGame({ obstacles: false });
  press(game);
  run(game, 0.3);
  release(game);
  press(game);
  release(game);
  const events = run(game, 1);
  assert.ok(events.includes("land"));
  assert.equal(events.filter((e) => e === "jump").length, 0);
  assert.equal(game.hound.grounded, true);
});

test("running kicks up dust that fades away", () => {
  const game = newGame({ obstacles: false });
  press(game);
  run(game, 1.5);
  assert.ok(game.particles.some((p) => p.kind === "dust"));
  togglePause(game);
  togglePause(game);
  for (const p of game.particles) assert.ok(p.life > 0);
});

test("a crash throws sparks and shakes the screen, and both settle down", () => {
  const game = newGame();
  press(game);
  runUntilOver(game);
  assert.ok(game.particles.some((p) => p.kind === "spark"));
  assert.ok(game.shake > 0);
  run(game, 3);
  assert.equal(game.particles.length, 0);
  assert.equal(game.shake, 0);
});
