import { test } from "node:test";
import assert from "node:assert/strict";
import {
  OBSTACLE_TYPES,
  EARLY_TYPE_IDS,
  ALL_TYPES_SCORE,
  createObstacle,
  obstacleHitbox,
  minGap,
  nextGap,
  pickType,
} from "../src/obstacles.js";
import { createHound, startJump, updateHound, houndHitbox } from "../src/hound.js";
import { overlaps } from "../src/collision.js";
import { createRng } from "../src/random.js";
import { PHYSICS, SPEED, WORLD } from "../src/config.js";

const DT = 1 / 120;

test("there are at least five obstacles, each with a name and a fun fact", () => {
  assert.ok(OBSTACLE_TYPES.length >= 5);
  assert.equal(new Set(OBSTACLE_TYPES.map((t) => t.id)).size, OBSTACLE_TYPES.length);
  for (const t of OBSTACLE_TYPES) {
    assert.ok(t.name.length > 0, t.id);
    assert.ok(t.fact.length > 20, t.id);
    assert.ok(t.width > 0 && t.height > 0, t.id);
  }
});

test("obstacles stand on the ground", () => {
  for (const type of OBSTACLE_TYPES) {
    const box = obstacleHitbox(createObstacle(type, 500));
    assert.ok(box.y + box.height <= WORLD.groundY, type.id);
    assert.ok(box.y + box.height >= WORLD.groundY - 8, type.id);
  }
});

test("hitboxes are a little smaller than the drawing, to be forgiving", () => {
  for (const type of OBSTACLE_TYPES) {
    const box = obstacleHitbox(createObstacle(type, 500));
    assert.ok(box.x >= 500 && box.x + box.width <= 500 + type.width, type.id);
    assert.ok(box.height < type.height, type.id);
  }
});

test("early in a run only the easier obstacles appear", () => {
  const rng = createRng(3);
  for (let i = 0; i < 1000; i++) {
    assert.ok(EARLY_TYPE_IDS.includes(pickType(rng, ALL_TYPES_SCORE - 1).id));
  }
});

test("later in a run every obstacle appears", () => {
  const rng = createRng(3);
  const seen = new Set();
  for (let i = 0; i < 1000; i++) seen.add(pickType(rng, ALL_TYPES_SCORE).id);
  assert.equal(seen.size, OBSTACLE_TYPES.length);
});

test("the space between obstacles leaves time to land and jump again", () => {
  const airtime = (2 * PHYSICS.jumpVelocity) / PHYSICS.gravity;
  for (const speed of [SPEED.start, SPEED.max]) {
    assert.ok(minGap(speed) >= speed * airtime, `speed ${speed}`);
  }
});

test("random gaps are never shorter than the minimum", () => {
  const rng = createRng(9);
  for (const speed of [SPEED.start, 500, SPEED.max]) {
    for (let i = 0; i < 1000; i++) {
      const gap = nextGap(speed, rng);
      assert.ok(gap >= minGap(speed) && gap <= minGap(speed) + speed, `${gap}`);
    }
  }
});

// Tries every jump timing; passes if at least one gets the hound over the obstacle.
function canClear(type, speed) {
  const start = houndHitbox(createHound());
  for (let lead = 0; lead < 600; lead += 2) {
    const hound = createHound();
    const obstacle = createObstacle(type, start.x + start.width + lead);
    startJump(hound);
    let hit = false;
    while (obstacleHitbox(obstacle).x + obstacleHitbox(obstacle).width > start.x) {
      updateHound(hound, DT);
      obstacle.x -= speed * DT;
      if (overlaps(houndHitbox(hound), obstacleHitbox(obstacle))) {
        hit = true;
        break;
      }
    }
    if (!hit) return true;
  }
  return false;
}

test("every obstacle can be cleared with a well-timed jump at every speed", () => {
  for (const type of OBSTACLE_TYPES) {
    for (const speed of [SPEED.start, (SPEED.start + SPEED.max) / 2, SPEED.max]) {
      assert.ok(canClear(type, speed), `${type.id} at ${speed}px/s`);
    }
  }
});

test("every obstacle has a phrase for sentences that keeps proper names capitalized", () => {
  for (const t of OBSTACLE_TYPES) {
    assert.ok(t.phrase.toLowerCase().endsWith(t.name.toLowerCase()), t.id);
  }
  const phrase = (id) => OBSTACLE_TYPES.find((t) => t.id === id).phrase;
  assert.equal(phrase("star"), "a Moravian Star");
  assert.equal(phrase("beams"), "Bethlehem Steel beams");
  assert.equal(phrase("tree"), "a Christmas tree");
});
