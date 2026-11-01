// All sounds are synthesized with the Web Audio API; there are no sound files.
// The audio context is created on first use, after the player presses a key, because
// browsers block sound until then.

const SILENT = 0.0001; // exponential ramps can't reach 0

function tone(ctx, out, { type, from, to = from, start = 0, length, volume }) {
  const t0 = ctx.currentTime + start;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(from, t0);
  if (to !== from) osc.frequency.exponentialRampToValueAtTime(to, t0 + length);
  gain.gain.setValueAtTime(SILENT, t0);
  gain.gain.exponentialRampToValueAtTime(volume, t0 + 0.01);
  gain.gain.exponentialRampToValueAtTime(SILENT, t0 + length);
  osc.connect(gain).connect(out);
  osc.start(t0);
  osc.stop(t0 + length + 0.02);
}

function noise(ctx, out, { start = 0, length, volume, filter }) {
  const t0 = ctx.currentTime + start;
  const frames = Math.ceil(ctx.sampleRate * length);
  const buffer = ctx.createBuffer(1, frames, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < frames; i++) data[i] = Math.random() * 2 - 1;
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const lowpass = ctx.createBiquadFilter();
  lowpass.type = "lowpass";
  lowpass.frequency.setValueAtTime(filter, t0);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(volume, t0);
  gain.gain.exponentialRampToValueAtTime(SILENT, t0 + length);
  source.connect(lowpass).connect(gain).connect(out);
  source.start(t0);
  source.stop(t0 + length + 0.02);
}

const SOUNDS = {
  // Two quick "yips": the hound is off.
  start(ctx, out) {
    tone(ctx, out, { type: "triangle", from: 520, to: 780, length: 0.08, volume: 0.25 });
    tone(ctx, out, { type: "triangle", from: 620, to: 940, start: 0.1, length: 0.1, volume: 0.25 });
  },
  // A rising chirp with a soft paw-push thump.
  jump(ctx, out) {
    tone(ctx, out, { type: "square", from: 300, to: 620, length: 0.12, volume: 0.08 });
    noise(ctx, out, { length: 0.05, volume: 0.15, filter: 900 });
  },
  // A small bell chord, like a church bell over Bethlehem.
  milestone(ctx, out) {
    tone(ctx, out, { type: "sine", from: 880, length: 0.5, volume: 0.18 });
    tone(ctx, out, { type: "sine", from: 1320, start: 0.08, length: 0.6, volume: 0.12 });
    tone(ctx, out, { type: "sine", from: 1760, start: 0.16, length: 0.7, volume: 0.06 });
  },
  // A thud and a falling yelp.
  crash(ctx, out) {
    noise(ctx, out, { length: 0.25, volume: 0.5, filter: 400 });
    tone(ctx, out, { type: "sawtooth", from: 700, to: 140, length: 0.35, volume: 0.12 });
  },
};

export const SOUND_NAMES = Object.keys(SOUNDS);

export function createAudio(makeContext) {
  let ctx;
  let output;
  let triedToCreate = false;

  const ready = () => {
    if (!triedToCreate) {
      triedToCreate = true;
      try {
        ctx = makeContext() ?? undefined;
        if (ctx) {
          output = ctx.createGain();
          output.gain.setValueAtTime(0.8, ctx.currentTime);
          output.connect(ctx.destination);
        }
      } catch {
        ctx = undefined;
      }
    }
    if (ctx?.state === "suspended") ctx.resume().catch(() => {});
    return ctx;
  };

  const audio = {
    muted: false,
    setMuted(muted) {
      audio.muted = muted;
    },
    unlock() {
      ready();
    },
    play(name) {
      const sound = SOUNDS[name];
      if (!sound || audio.muted || !ready()) return;
      sound(ctx, output);
    },
  };
  return audio;
}
