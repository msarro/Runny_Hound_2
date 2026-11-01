import { test } from "node:test";
import assert from "node:assert/strict";
import {
  OBSTACLE_TYPES,
  createObstacle,
  obstacleHitbox,
  obstacleVariants,
  minGap,
  nextGap,
  pickType,
  pickObstacle,
} from "../src/obstacles.js";
import { createHound, startJump, updateHound, houndHitbox, setDucking } from "../src/hound.js";
import { overlaps } from "../src/collision.js";
import { createRng } from "../src/random.js";
import { PHYSICS, SPEED, WORLD } from "../src/config.js";

const DT = 1 / 120;
const byId = (id) => OBSTACLE_TYPES.find((t) => t.id === id);

test("there are at least five obstacles, each with a name and a fun fact", () => {
  assert.ok(OBSTACLE_TYPES.length >= 5);
  assert.equal(new Set(OBSTACLE_TYPES.map((t) => t.id)).size, OBSTACLE_TYPES.length);
  for (const t of OBSTACLE_TYPES) {
    assert.ok(t.name.length > 0, t.id);
    assert.ok(t.fact.length > 20, t.id);
    assert.ok(t.width > 0 && t.height > 0, t.id);
  }
});

test("Runny Hound 1's marshmallow chicks and flying stars are here", () => {
  assert.ok(byId("chick"));
  assert.equal(byId("flyer").flying, true);
});

test("ground obstacles stand on the ground", () => {
  for (const type of OBSTACLE_TYPES.filter((t) => !t.flying)) {
    const box = obstacleHitbox(createObstacle(type, 500));
    assert.ok(box.y + box.height <= WORLD.groundY, type.id);
    assert.ok(box.y + box.height >= WORLD.groundY - 8, type.id);
  }
});

test("hitboxes are a little smaller than the drawing, to be forgiving", () => {
  for (const type of OBSTACLE_TYPES) {
    for (const variant of obstacleVariants(type)) {
      const obstacle = createObstacle(type, 500, variant);
      const box = obstacleHitbox(obstacle);
      assert.ok(box.x >= 500 && box.x + box.width <= 500 + obstacle.width, type.id);
      assert.ok(box.height < type.height, type.id);
    }
  }
});

test("each obstacle appears only once the score reaches its starting point", () => {
  const rng = createRng(3);
  for (const score of [0, 149, 150, 299, 300, 1000]) {
    for (let i = 0; i < 500; i++) {
      const type = pickType(rng, score);
      assert.ok((type.fromScore ?? 0) <= score, `${type.id} at ${score}`);
    }
  }
});

test("candles, chicks, books and stars from the start; every obstacle by 300", () => {
  const seen = (score) => {
    const rng = createRng(5);
    const ids = new Set();
    for (let i = 0; i < 2000; i++) ids.add(pickType(rng, score).id);
    return ids;
  };
  assert.deepEqual([...seen(0)].sort(), ["books", "candle", "chick", "star"]);
  assert.equal(seen(300).size, OBSTACLE_TYPES.length);
});

test("candles and chicks come in groups of up to three, bigger later in the run", () => {
  const counts = (score) => {
    const rng = createRng(7);
    const found = new Set();
    for (let i = 0; i < 3000; i++) {
      const pick = pickObstacle(rng, score);
      if (["candle", "chick"].includes(pick.type.id)) found.add(pick.count);
      else assert.equal(pick.count, 1, pick.type.id);
    }
    return [...found].sort();
  };
  assert.deepEqual(counts(0), [1, 2]);
  assert.deepEqual(counts(500), [1, 2, 3]);
  const group = createObstacle(byId("chick"), 0, { count: 3 });
  assert.equal(group.width, byId("chick").width + 2 * byId("chick").spacing);
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

// Plays one obstacle with a fixed strategy: "run" (do nothing), "duck" (hold duck),
// or a jump started `lead` pixels before the obstacle. True if the hound gets past.
function survives(type, variant, speed, strategy, lead = 0) {
  const hound = createHound();
  const start = houndHitbox(hound);
  const obstacle = createObstacle(type, start.x + start.width + lead + 2, variant);
  if (strategy === "duck") setDucking(hound, true);
  if (strategy === "jump") startJump(hound);
  while (obstacleHitbox(obstacle).x + obstacleHitbox(obstacle).width > start.x) {
    updateHound(hound, DT);
    obstacle.x -= speed * DT;
    obstacle.age += DT;
    if (overlaps(houndHitbox(hound), obstacleHitbox(obstacle))) return false;
  }
  return true;
}

const canJump = (type, variant, speed) => {
  for (let lead = 0; lead < 600; lead += 2) {
    if (survives(type, variant, speed, "jump", lead)) return true;
  }
  return false;
};

test("every obstacle, in every group size and height, can be passed at every speed", () => {
  for (const type of OBSTACLE_TYPES) {
    for (const variant of obstacleVariants(type)) {
      for (const speed of [SPEED.start, (SPEED.start + SPEED.max) / 2, SPEED.max]) {
        const ok =
          survives(type, variant, speed, "run") ||
          survives(type, variant, speed, "duck") ||
          canJump(type, variant, speed);
        assert.ok(ok, `${type.id} ${JSON.stringify(variant)} at ${speed}px/s`);
      }
    }
  }
});

test("flying stars come at three heights: one to jump, one to duck under, one to run under", () => {
  const flyer = byId("flyer");
  const [low, mid, high] = obstacleVariants(flyer);
  for (const speed of [SPEED.start, SPEED.max]) {
    assert.ok(!survives(flyer, low, speed, "run") && !survives(flyer, low, speed, "duck"));
    assert.ok(canJump(flyer, low, speed), "the low star can be jumped");
    assert.ok(!survives(flyer, mid, speed, "run"), "the middle star hits a standing hound");
    assert.ok(survives(flyer, mid, speed, "duck"), "the middle star can be ducked");
    assert.ok(survives(flyer, high, speed, "run"), "the high star passes overhead");
  }
});

test("flying stars bob gently", () => {
  const star = createObstacle(byId("flyer"), 500, obstacleVariants(byId("flyer"))[1]);
  const heights = [];
  for (let t = 0; t < 3; t += 0.1) {
    star.age = t;
    heights.push(obstacleHitbox(star).y);
  }
  const range = Math.max(...heights) - Math.min(...heights);
  assert.ok(range > 2 && range <= 8, `bob range ${range}`);
});

test("every obstacle has a phrase for sentences that keeps proper names capitalized", () => {
  for (const t of OBSTACLE_TYPES) {
    assert.ok(t.phrase.toLowerCase().endsWith(t.name.toLowerCase()), t.id);
  }
  const phrase = (id) => byId(id).phrase;
  assert.equal(phrase("star"), "a Moravian Star");
  assert.equal(phrase("beams"), "Bethlehem Steel beams");
  assert.equal(phrase("tree"), "a Christmas tree");
  assert.equal(phrase("flyer"), "a flying Moravian Star");
});
