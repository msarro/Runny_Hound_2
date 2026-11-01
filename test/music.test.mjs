import { test } from "node:test";
import assert from "node:assert/strict";
import { scoreEvents, createMusicPlayer, shouldPlayMusic } from "../src/music.js";
import { fakeContext, midiOf } from "./helpers/fake-audio.mjs";

// Tempo 60 makes one beat one second. Each beat of the top voice has its own pitch.
const fixture = {
  tempo: 60,
  voices: {
    top: [
      [60, 1],
      [62, 1],
      [null, 1],
      [65, 1],
      [67, 2],
    ],
    low: [
      [48, 3],
      [43, 3],
    ],
  },
};

function advance(ctx, player, seconds) {
  for (let t = 0; t < seconds; t += 0.05) {
    ctx.currentTime += 0.05;
    player.pump();
  }
}

const topNotes = (ctx) =>
  ctx.started.filter((o) => o.frequency && midiOf(o) >= 60).map((o) => [midiOf(o), o.startTime]);

test("a score becomes one timeline of notes, skipping rests", () => {
  const { events, lengthBeats } = scoreEvents(fixture);
  assert.equal(lengthBeats, 6);
  assert.deepEqual(
    events.map((e) => [e.beat, e.midi, e.voice]),
    [
      [0, 60, "top"],
      [0, 48, "low"],
      [1, 62, "top"],
      [3, 65, "top"],
      [3, 43, "low"],
      [4, 67, "top"],
    ],
  );
});

test("nothing plays until play() is called", () => {
  const ctx = fakeContext();
  const player = createMusicPlayer(ctx, ctx.destination, fixture);
  advance(ctx, player, 3);
  assert.equal(ctx.started.length, 0);
});

test("only the next moment of music is scheduled at a time", () => {
  const ctx = fakeContext();
  const player = createMusicPlayer(ctx, ctx.destination, fixture);
  player.play();
  for (const o of ctx.started) assert.ok(o.startTime < ctx.currentTime + 0.5, `${o.startTime}`);
});

test("notes start on their beats", () => {
  const ctx = fakeContext();
  ctx.currentTime = 10;
  const player = createMusicPlayer(ctx, ctx.destination, fixture);
  player.play();
  advance(ctx, player, 5);
  const notes = topNotes(ctx);
  const begin = notes[0][1];
  assert.ok(begin >= 10 && begin < 10.2, `starts at ${begin}`);
  const unique = [...new Map(notes.map(([m, t]) => [`${m}@${t}`, [m, t - begin]])).values()];
  assert.deepEqual(
    unique.map(([m, t]) => [m, Math.round(t * 1000) / 1000]),
    [
      [60, 0],
      [62, 1],
      [65, 3],
      [67, 4],
    ],
  );
});

test("no note is scheduled twice", () => {
  const ctx = fakeContext();
  const player = createMusicPlayer(ctx, ctx.destination, fixture);
  player.play();
  advance(ctx, player, 5);
  const keys = ctx.started.map((o) => `${midiOf(o)}@${o.startTime.toFixed(4)}`);
  assert.ok(keys.length > 0);
  assert.equal(new Set(keys).size, keys.length);
});

test("the music loops seamlessly", () => {
  const ctx = fakeContext();
  const player = createMusicPlayer(ctx, ctx.destination, fixture);
  player.play();
  advance(ctx, player, 13);
  const firstNote = topNotes(ctx)
    .filter(([m]) => m === 60)
    .map(([, t]) => t);
  assert.equal(firstNote.length, 3);
  assert.ok(Math.abs(firstNote[1] - firstNote[0] - 6) < 1e-9);
  assert.ok(Math.abs(firstNote[2] - firstNote[1] - 6) < 1e-9);
});

test("stopping fades out quickly and nothing new is scheduled", () => {
  const ctx = fakeContext();
  const player = createMusicPlayer(ctx, ctx.destination, fixture);
  player.play();
  advance(ctx, player, 1);
  const count = ctx.started.length;
  const stopAt = ctx.currentTime;
  player.stop();
  advance(ctx, player, 3);
  assert.equal(ctx.started.length, count);
  const fades = ctx.gains
    .flatMap((g) => g.gain.events)
    .filter(
      (e) =>
        (e[0] === "target" || e[0] === "linear" || e[0] === "exp") &&
        e[1] <= 0.001 &&
        e[2] >= stopAt - 1e-9 &&
        e[2] <= stopAt + 0.3,
    );
  assert.ok(fades.length > 0, "the music was not faded out");
});

test("after a pause the music picks up where it left off", () => {
  const ctx = fakeContext();
  const player = createMusicPlayer(ctx, ctx.destination, fixture);
  player.play();
  advance(ctx, player, 2.3); // past beats 0 and 1, before beat 3
  player.stop();
  ctx.currentTime += 10;
  const before = ctx.started.length;
  player.play();
  advance(ctx, player, 1.5);
  const resumed = ctx.started
    .slice(before)
    .filter((o) => midiOf(o) >= 60)
    .map(midiOf);
  assert.equal(resumed[0], 65, `resumed with ${resumed[0]}`);
});

test("rewind starts the music from the top", () => {
  const ctx = fakeContext();
  const player = createMusicPlayer(ctx, ctx.destination, fixture);
  player.play();
  advance(ctx, player, 2.3);
  player.stop();
  player.rewind();
  const before = ctx.started.length;
  player.play();
  const restarted = ctx.started
    .slice(before)
    .filter((o) => midiOf(o) >= 60)
    .map(midiOf);
  assert.equal(restarted[0], 60);
});

test("every note that starts is also stopped, after it starts", () => {
  const ctx = fakeContext();
  const player = createMusicPlayer(ctx, ctx.destination, fixture);
  player.play();
  advance(ctx, player, 8);
  player.stop();
  assert.equal(ctx.stopped.length, ctx.started.length);
  for (const o of ctx.started) assert.ok(o.stopTime > o.startTime);
});

test("play and stop are safe to call more than once", () => {
  const ctx = fakeContext();
  const player = createMusicPlayer(ctx, ctx.destination, fixture);
  player.play();
  const count = ctx.started.length;
  player.play();
  assert.equal(ctx.started.length, count);
  player.stop();
  player.stop();
});

test("music plays only while running, unpaused, with music on and sound on", () => {
  const running = { phase: "running", paused: false };
  const on = { musicOn: true, muted: false };
  assert.equal(shouldPlayMusic(running, on), true);
  assert.equal(shouldPlayMusic({ phase: "ready", paused: false }, on), false);
  assert.equal(shouldPlayMusic({ phase: "over", paused: false }, on), false);
  assert.equal(shouldPlayMusic({ phase: "running", paused: true }, on), false);
  assert.equal(shouldPlayMusic(running, { musicOn: false, muted: false }), false);
  assert.equal(shouldPlayMusic(running, { musicOn: true, muted: true }), false);
});

test("stopping right after starting resumes from the same place, not the end", () => {
  const ctx = fakeContext();
  const player = createMusicPlayer(ctx, ctx.destination, fixture);
  player.play();
  player.stop(); // before the first note has even sounded
  ctx.currentTime += 5;
  const before = ctx.started.length;
  player.play();
  const resumed = ctx.started
    .slice(before)
    .filter((o) => midiOf(o) >= 60)
    .map(midiOf);
  assert.equal(resumed[0], 60, `resumed with ${resumed[0]}`);
});
