// Background music: plays a score (see src/score.js) like a Moravian trombone choir,
// synthesized with Web Audio. Notes are scheduled a fraction of a second ahead by
// pump(), which the game calls every frame; this keeps the timing exact even if a
// frame is late.

const SILENT = 0.0001; // exponential ramps can't reach 0
const START_DELAY = 0.05;
const LOOKAHEAD = 0.3;
const FADE = 0.04;

// Louder melody and bass, softer inner parts, as a trombone choir balances a chorale.
const LEVELS = { soprano: 0.11, alto: 0.07, tenor: 0.07, bass: 0.09 };

export function shouldPlayMusic(game, { musicOn, muted }) {
  return game.phase === "running" && !game.paused && musicOn && !muted;
}

// All parts merged into one timeline: [{ beat, midi, beats, voice }], rests left out.
export function scoreEvents(score) {
  const events = [];
  let lengthBeats = 0;
  const order = Object.keys(score.voices);
  for (const voice of order) {
    let beat = 0;
    for (const [midi, beats] of score.voices[voice]) {
      if (midi !== null) events.push({ beat, midi, beats, voice });
      beat += beats;
    }
    lengthBeats = Math.max(lengthBeats, beat);
  }
  events.sort((a, b) => a.beat - b.beat || order.indexOf(a.voice) - order.indexOf(b.voice));
  return { events, lengthBeats };
}

// One trombone note: a sawtooth wave through a filter that opens as the note starts,
// giving the brassy "blat" of a trombone attack.
function trombone(ctx, out, midi, t, seconds, level) {
  const hz = 440 * 2 ** ((midi - 69) / 12);
  const end = t + Math.max(0.08, seconds - 0.03);
  const osc = ctx.createOscillator();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(hz, t);
  const tone = ctx.createBiquadFilter();
  tone.type = "lowpass";
  tone.frequency.setValueAtTime(hz * 1.5, t);
  tone.frequency.exponentialRampToValueAtTime(hz * 6, t + 0.05);
  tone.frequency.exponentialRampToValueAtTime(hz * 3.5, Math.min(t + 0.25, end));
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(SILENT, t);
  gain.gain.exponentialRampToValueAtTime(level, t + 0.04);
  gain.gain.linearRampToValueAtTime(level * 0.75, Math.min(t + 0.2, end));
  gain.gain.setValueAtTime(level * 0.75, end);
  gain.gain.exponentialRampToValueAtTime(SILENT, end + 0.08);
  osc.connect(tone).connect(gain).connect(out);
  osc.start(t);
  osc.stop(end + 0.1);
}

export function createMusicPlayer(ctx, destination, score) {
  const { events, lengthBeats } = scoreEvents(score);
  const secondsPerBeat = 60 / score.tempo;
  let playing = false;
  let position = 0; // beat to resume from
  let origin = 0; // audio-clock time of beat 0 of the current pass
  let next = 0; // index of the next event to schedule
  let bus = null;

  const player = {
    play() {
      if (playing) return;
      playing = true;
      origin = ctx.currentTime + START_DELAY - position * secondsPerBeat;
      next = events.findIndex((e) => e.beat >= position - 1e-9);
      if (next === -1) next = events.length;
      bus = ctx.createGain();
      bus.gain.setValueAtTime(1, ctx.currentTime);
      bus.connect(destination);
      player.pump();
    },
    pump() {
      if (!playing) return;
      const until = ctx.currentTime + LOOKAHEAD;
      for (;;) {
        if (next >= events.length) {
          next = 0;
          origin += lengthBeats * secondsPerBeat;
        }
        const e = events[next];
        const t = origin + e.beat * secondsPerBeat;
        if (t >= until) break;
        trombone(ctx, bus, e.midi, t, e.beats * secondsPerBeat, LEVELS[e.voice] ?? 0.08);
        next++;
      }
    },
    stop() {
      if (!playing) return;
      playing = false;
      const now = ctx.currentTime;
      const elapsed = (now - origin) / secondsPerBeat;
      position = ((elapsed % lengthBeats) + lengthBeats) % lengthBeats;
      // Notes already scheduled play into this bus; fading it silences them.
      bus.gain.cancelScheduledValues(now);
      bus.gain.setValueAtTime(1, now);
      bus.gain.setTargetAtTime(0, now, FADE);
      bus = null;
    },
    rewind() {
      const wasPlaying = playing;
      player.stop();
      position = 0;
      if (wasPlaying) player.play();
    },
  };
  return player;
}
