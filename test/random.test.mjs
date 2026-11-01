import { test } from "node:test";
import assert from "node:assert/strict";
import { createRng } from "../src/random.js";

const take = (rng, n) => Array.from({ length: n }, rng);

test("the same seed gives the same sequence (so tests are repeatable)", () => {
  assert.deepEqual(take(createRng(42), 20), take(createRng(42), 20));
});

test("different seeds give different sequences", () => {
  assert.notDeepEqual(take(createRng(1), 20), take(createRng(2), 20));
});

test("values are at least 0 and below 1", () => {
  for (const v of take(createRng(7), 10000)) assert.ok(v >= 0 && v < 1, String(v));
});
