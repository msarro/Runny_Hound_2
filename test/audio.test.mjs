import { test } from "node:test";
import assert from "node:assert/strict";
import { createAudio, SOUND_NAMES } from "../src/audio.js";

// A pretend Web Audio context that records what the game asks it to do and, like the
// real one, refuses exponential ramps to zero or below.
function fakeContext() {
  const started = [];
  const stopped = [];
  const param = (value = 0) => ({
    value,
    setValueAtTime() {},
    linearRampToValueAtTime() {},
    exponentialRampToValueAtTime(v) {
      if (!(v > 0)) throw new RangeError("exponential ramp target must be > 0");
    },
    setTargetAtTime() {},
    cancelScheduledValues() {},
  });
  const node = (extra = {}) => ({
    connect(target) {
      return target;
    },
    disconnect() {},
    ...extra,
  });
  const source = (extra) =>
    node({
      start(t) {
        started.push(this);
        this.startTime = t;
      },
      stop(t) {
        stopped.push(this);
        this.stopTime = t;
      },
      ...extra,
    });
  return {
    started,
    stopped,
    state: "running",
    currentTime: 1,
    sampleRate: 44100,
    destination: node(),
    resume() {
      this.state = "running";
      return Promise.resolve();
    },
    createOscillator: () => source({ type: "sine", frequency: param(440), detune: param() }),
    createGain: () => node({ gain: param(1) }),
    createBiquadFilter: () => node({ type: "lowpass", frequency: param(350), Q: param(1) }),
    createBuffer: (channels, length) => ({
      length,
      getChannelData: () => new Float32Array(length),
    }),
    createBufferSource: () => source({ buffer: null }),
  };
}

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
  for (const name of ["start", "jump", "milestone", "crash"]) assert.ok(SOUND_NAMES.includes(name));
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
