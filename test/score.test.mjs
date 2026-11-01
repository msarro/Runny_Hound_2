import { test } from "node:test";
import assert from "node:assert/strict";
import { IN_DULCI_JUBILO as score } from "../src/score.js";

const VOICES = ["soprano", "alto", "tenor", "bass"];
const length = (notes) => notes.reduce((sum, [, beats]) => sum + beats, 0);
const pitchAt = (notes, beat) => {
  let t = 0;
  for (const [midi, beats] of notes) {
    if (beat >= t && beat < t + beats) return midi;
    t += beats;
  }
  return null;
};

test("the score credits Bach's harmonization and its source", () => {
  assert.match(score.title, /In dulci jubilo/);
  assert.match(score.arranger, /Bach/);
  assert.equal(score.catalog, "BWV 368");
  assert.ok(score.source.length > 10);
  assert.ok(score.tempo >= 60 && score.tempo <= 200);
});

test("there are four parts, like a trombone choir", () => {
  assert.deepEqual(Object.keys(score.voices), VOICES);
});

test("every note has a real pitch (or is a rest) and a positive length", () => {
  for (const voice of VOICES) {
    for (const [midi, beats] of score.voices[voice]) {
      assert.ok(midi === null || Number.isInteger(midi), `${voice} pitch ${midi}`);
      assert.ok(beats > 0, `${voice} length ${beats}`);
    }
  }
});

test("all four parts are the same length, in whole bars of 3/4", () => {
  const lengths = VOICES.map((v) => length(score.voices[v]));
  assert.equal(new Set(lengths).size, 1, `lengths ${lengths}`);
  assert.equal(
    lengths[0] % 3,
    0,
    "pickup and last bar must add up to a whole bar for a seamless loop",
  );
});

test("the melody opens 'In dul-ci ju-bi-lo' (Good Christian men, rejoice)", () => {
  // F F F A Bb C D C
  assert.deepEqual(
    score.voices.soprano.slice(0, 8).map(([midi]) => midi),
    [65, 65, 65, 69, 70, 72, 74, 72],
  );
});

test("each part stays in a range a trombone can play", () => {
  const ranges = { soprano: [58, 84], alto: [52, 79], tenor: [40, 74], bass: [28, 65] };
  for (const voice of VOICES) {
    const pitches = score.voices[voice].map(([m]) => m).filter((m) => m !== null);
    const [low, high] = ranges[voice];
    assert.ok(Math.min(...pitches) >= low && Math.max(...pitches) <= high, voice);
  }
});

test("on every beat the melody is on top and the bass at the bottom", () => {
  const total = length(score.voices.soprano);
  for (let beat = 0; beat < total; beat++) {
    const [s, a, t, b] = VOICES.map((v) => pitchAt(score.voices[v], beat));
    for (const inner of [a, t].filter((p) => p !== null)) {
      assert.ok(inner <= s && inner >= b, `beat ${beat}: ${[s, a, t, b]}`);
    }
  }
});
