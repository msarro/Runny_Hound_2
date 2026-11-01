import { test } from "node:test";
import assert from "node:assert/strict";
import { createGame, press, release, step, togglePause, RESTART_DELAY } from "../src/game.js";
import { houndHitbox, HOUND } from "../src/hound.js";
import { obstacleHitbox, OBSTACLE_TYPES } from "../src/obstacles.js";
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

// A player who always jumps at the right moment, using a full-height jump.
function autopilot(game) {
  if (!game.hound.grounded) return;
  const me = houndHitbox(game.hound);
  const next = game.obstacles
    .map(obstacleHitbox)
    .filter((box) => box.x + box.width > me.x)
    .sort((a, b) => a.x - b.x)[0];
  if (!next) return;
  const mustReach = WORLD.groundY - next.y - HOUND.hitbox.bottomInset + 4;
  const { jumpVelocity: v, gravity: g } = PHYSICS;
  const timeToReach = (v - Math.sqrt(v * v - 2 * g * mustReach)) / g;
  if (next.x - (me.x + me.width) <= game.speed * (timeToReach + DT)) press(game);
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

test("pausing freezes the run and ignores jumps; unpausing resumes", () => {
  const game = newGame({ obstacles: false });
  press(game);
  run(game, 1);
  togglePause(game);
  const distance = game.distance;
  run(game, 1);
  assert.equal(game.distance, distance);
  assert.deepEqual(press(game), []);
  togglePause(game);
  run(game, 0.1);
  assert.ok(game.distance > distance);
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
  for (const seed of [1, 2, 3, 4, 5]) {
    const game = createGame({ rng: createRng(seed) });
    press(game);
    let maxOnScreen = 0;
    run(game, 120, (g) => {
      autopilot(g);
      maxOnScreen = Math.max(maxOnScreen, g.obstacles.length);
    });
    assert.equal(game.phase, "running", `seed ${seed} crashed into ${game.crashedInto?.id}`);
    assert.ok(game.score > 1000, `seed ${seed} score ${game.score}`);
    assert.ok(maxOnScreen <= 4, `obstacles are not cleaned up (${maxOnScreen})`);
  }
});
