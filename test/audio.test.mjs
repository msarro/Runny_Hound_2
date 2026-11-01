import { test } from "node:test";
import assert from "node:assert/strict";
import { createAudio, SOUND_NAMES } from "../src/audio.js";
import { fakeContext } from "./helpers/fake-audio.mjs";

test("every game sound plays and every note it starts is also stopped", () => {
  for (const name of SOUND_NAMES) {
    const ctx = fakeContext();
    const audio = createAudio(() => ctx);
    audio.play(name);
    assert.ok(ctx.started.length > 0, `${name} made no sound`);
    assert.equal(ctx.stopped.length, ctx.started.length, `${name} leaves notes running`);
    for (const s of ctx.started) assert.ok(s.stopTime > s.startTime, name);
  }
});

test("the game has sounds for start, jump, milestone and crash", () => {
  for (const name of ["start", "jump", "land", "duck", "milestone", "crash"]) {
    assert.ok(SOUND_NAMES.includes(name), name);
  }
});

test("nothing plays while muted, and sound returns when unmuted", () => {
  const ctx = fakeContext();
  const audio = createAudio(() => ctx);
  audio.setMuted(true);
  assert.equal(audio.muted, true);
  audio.play("jump");
  assert.equal(ctx.started.length, 0);
  audio.setMuted(false);
  audio.play("jump");
  assert.ok(ctx.started.length > 0);
});

test("the game keeps working in browsers without Web Audio", () => {
  const audio = createAudio(() => null);
  for (const name of SOUND_NAMES) audio.play(name);
  audio.unlock();
});

test("unknown sound names are ignored", () => {
  const ctx = fakeContext();
  createAudio(() => ctx).play("does-not-exist");
  assert.equal(ctx.started.length, 0);
});

test("the audio system is created once, on first use", () => {
  let created = 0;
  const audio = createAudio(() => {
    created++;
    return fakeContext();
  });
  assert.equal(created, 0);
  audio.unlock();
  audio.play("jump");
  audio.play("crash");
  assert.equal(created, 1);
});

test("music plays when asked, keeps going as time passes, and stops when asked", () => {
  const ctx = fakeContext();
  const audio = createAudio(() => ctx);
  audio.syncMusic(true);
  const first = ctx.started.length;
  assert.ok(first > 0, "no music started");
  for (let i = 0; i < 40; i++) {
    ctx.currentTime += 0.05;
    audio.syncMusic(true);
  }
  assert.ok(ctx.started.length > first, "music did not continue");
  audio.syncMusic(false);
  const atStop = ctx.started.length;
  for (let i = 0; i < 40; i++) {
    ctx.currentTime += 0.05;
    audio.syncMusic(false);
  }
  assert.equal(ctx.started.length, atStop, "music kept playing after stop");
});

test("the music setting starts on and can be turned off", () => {
  const audio = createAudio(() => fakeContext());
  assert.equal(audio.musicOn, true);
  audio.setMusicOn(false);
  assert.equal(audio.musicOn, false);
});

test("music is safe without Web Audio", () => {
  const audio = createAudio(() => null);
  audio.syncMusic(true);
  audio.rewindMusic();
  audio.syncMusic(false);
});
