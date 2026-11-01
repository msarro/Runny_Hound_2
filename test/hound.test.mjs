import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createHound,
  startJump,
  releaseJump,
  updateHound,
  houndHitbox,
  setDucking,
} from "../src/hound.js";
import { WORLD } from "../src/config.js";

const DT = 1 / 120;

function simulateJump(holdFor = Infinity) {
  const hound = createHound();
  startJump(hound);
  let t = 0;
  let peak = 0;
  while (!hound.grounded) {
    if (t >= holdFor && hound.jumpHeld) releaseJump(hound);
    updateHound(hound, DT);
    t += DT;
    peak = Math.max(peak, hound.y);
    assert.ok(t < 5, "jump never landed");
  }
  return { peak, airtime: t };
}

test("the hound starts standing on the ground", () => {
  const hound = createHound();
  assert.equal(hound.y, 0);
  assert.equal(hound.grounded, true);
});

test("jumping from the ground lifts the hound", () => {
  const hound = createHound();
  assert.equal(startJump(hound), true);
  updateHound(hound, DT);
  assert.ok(hound.y > 0);
  assert.equal(hound.grounded, false);
});

test("there is no double jump", () => {
  const hound = createHound();
  startJump(hound);
  updateHound(hound, 0.1);
  const vy = hound.vy;
  assert.equal(startJump(hound), false);
  assert.equal(hound.vy, vy);
});

test("a full jump is about 120 pixels high and lasts about 0.7 seconds", () => {
  const { peak, airtime } = simulateJump();
  assert.ok(peak >= 110 && peak <= 130, `peak ${peak}`);
  assert.ok(airtime >= 0.6 && airtime <= 0.8, `airtime ${airtime}`);
});

test("letting go of Space early gives a lower hop", () => {
  const full = simulateJump().peak;
  const hop = simulateJump(0.08).peak;
  assert.ok(hop < full - 20, `hop ${hop} vs full ${full}`);
  assert.ok(hop > 50, `hop ${hop} is too small to be useful`);
});

test("the hound never sinks below the ground", () => {
  const hound = createHound();
  startJump(hound);
  for (let i = 0; i < 600; i++) {
    updateHound(hound, DT);
    assert.ok(hound.y >= 0);
  }
  assert.equal(hound.grounded, true);
});

test("the hitbox rises with the hound and rests on the ground", () => {
  const hound = createHound();
  const standing = houndHitbox(hound);
  assert.ok(standing.y + standing.height <= WORLD.groundY);
  assert.ok(standing.y + standing.height >= WORLD.groundY - 8);
  startJump(hound);
  updateHound(hound, 0.1);
  assert.ok(houndHitbox(hound).y < standing.y);
});

test("ducking on the ground lowers the hitbox but keeps the paws on the ground", () => {
  const hound = createHound();
  const standing = houndHitbox(hound);
  setDucking(hound, true);
  const ducked = houndHitbox(hound);
  assert.ok(ducked.height <= standing.height * 0.6, `ducked height ${ducked.height}`);
  assert.equal(ducked.y + ducked.height, standing.y + standing.height);
  setDucking(hound, false);
  assert.deepEqual(houndHitbox(hound), standing);
});

test("holding duck in the air drops the hound faster", () => {
  const land = (duckAt) => {
    const hound = createHound();
    startJump(hound);
    let t = 0;
    while (!hound.grounded) {
      if (t >= duckAt) setDucking(hound, true);
      updateHound(hound, DT);
      t += DT;
    }
    return t;
  };
  assert.ok(land(0.3) < land(Infinity) - 0.1);
});

test("updateHound says when the hound lands", () => {
  const hound = createHound();
  startJump(hound);
  let landings = 0;
  for (let i = 0; i < 240; i++) if (updateHound(hound, DT)) landings++;
  assert.equal(landings, 1);
});
