import { test } from "node:test";
import assert from "node:assert/strict";
import { parseVoice } from "../src/notation.js";

test("note names, rests and lengths are read correctly", () => {
  assert.deepEqual(parseVoice("F4/1 r/2 Bb3/1 C#5/0.5 E2/1.5"), [
    [65, 1],
    [null, 2],
    [58, 1],
    [73, 0.5],
    [40, 1.5],
  ]);
});

test("a tie (~) joins a note to the next one of the same pitch", () => {
  assert.deepEqual(parseVoice("F4/3~ | F4/3 G4/1"), [
    [65, 6],
    [67, 1],
  ]);
});

test("a tie to a different pitch is a mistake", () => {
  assert.throws(() => parseVoice("F4/1~ G4/1"), /tie/);
});

test("unknown notes are a mistake", () => {
  assert.throws(() => parseVoice("H4/1"), /H4\/1/);
  assert.throws(() => parseVoice("F4"), /F4/);
});

test("bar lines are checked: pickup, full bars, and a last bar that completes the pickup", () => {
  const bars = { beatsPerBar: 3, pickup: 1 };
  assert.doesNotThrow(() => parseVoice("F4/1 | F4/2 F4/1 | A4/2", bars));
  assert.throws(() => parseVoice("F4/1 | F4/2 | A4/2", bars), /bar 2 has 2 beats/);
  assert.throws(() => parseVoice("F4/2 | F4/3 | A4/1", bars), /bar 1 has 2 beats/);
  assert.throws(() => parseVoice("F4/1 | F4/3 | A4/3", bars), /bar 3 has 3 beats/);
});
