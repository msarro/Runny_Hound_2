// A pretend Web Audio context that records what the game asks it to do and, like the
// real one, refuses exponential ramps to zero or below and a second stop() call.
export function fakeContext() {
  const started = [];
  const stopped = [];
  const gains = [];
  const param = (value = 0) => {
    const p = {
      value,
      events: [],
      setValueAtTime(v, t) {
        p.events.push(["set", v, t]);
      },
      linearRampToValueAtTime(v, t) {
        p.events.push(["linear", v, t]);
      },
      exponentialRampToValueAtTime(v, t) {
        if (!(v > 0)) throw new RangeError("exponential ramp target must be > 0");
        p.events.push(["exp", v, t]);
      },
      setTargetAtTime(v, t, c) {
        p.events.push(["target", v, t, c]);
      },
      cancelScheduledValues(t) {
        p.events.push(["cancel", t]);
      },
    };
    return p;
  };
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
        if (this.stopTime !== undefined) throw new Error("stop() called twice");
        stopped.push(this);
        this.stopTime = t;
      },
      ...extra,
    });
  return {
    started,
    stopped,
    gains,
    state: "running",
    currentTime: 1,
    sampleRate: 44100,
    destination: node(),
    resume() {
      this.state = "running";
      return Promise.resolve();
    },
    createOscillator: () => source({ type: "sine", frequency: param(440), detune: param() }),
    createGain: () => {
      const g = node({ gain: param(1) });
      gains.push(g);
      return g;
    },
    createBiquadFilter: () => node({ type: "lowpass", frequency: param(350), Q: param(1) }),
    createBuffer: (channels, length) => ({
      length,
      getChannelData: () => new Float32Array(length),
    }),
    createBufferSource: () => source({ buffer: null }),
  };
}

// The pitch an oscillator was set to play, as a MIDI note number.
export function midiOf(oscillator) {
  const hz = oscillator.frequency.events.find((e) => e[0] === "set")?.[1];
  return Math.round(69 + 12 * Math.log2(hz / 440));
}
