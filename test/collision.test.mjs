import { test } from "node:test";
import assert from "node:assert/strict";
import { overlaps } from "../src/collision.js";

const r = (x, y, width, height) => ({ x, y, width, height });

test("overlapping boxes collide", () => {
  assert.equal(overlaps(r(0, 0, 10, 10), r(5, 5, 10, 10)), true);
});

test("separate boxes do not collide", () => {
  assert.equal(overlaps(r(0, 0, 10, 10), r(20, 0, 10, 10)), false);
  assert.equal(overlaps(r(0, 0, 10, 10), r(0, 20, 10, 10)), false);
});

test("boxes that only touch edges do not collide", () => {
  assert.equal(overlaps(r(0, 0, 10, 10), r(10, 0, 10, 10)), false);
});

test("a box inside another collides", () => {
  assert.equal(overlaps(r(0, 0, 100, 100), r(40, 40, 5, 5)), true);
});
