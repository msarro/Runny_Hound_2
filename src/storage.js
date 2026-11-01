// Saves the high score and mute setting in the browser. Any storage failure
// (blocked cookies, private browsing) just means nothing is remembered.
const HIGH_SCORE_KEY = "runny-hound:highScore";
const MUTED_KEY = "runny-hound:muted";
const MUSIC_KEY = "runny-hound:music";

export function createStore(storage) {
  const read = (key) => {
    try {
      return storage?.getItem(key) ?? null;
    } catch {
      return null;
    }
  };
  const write = (key, value) => {
    try {
      storage?.setItem(key, String(value));
    } catch {
      // Not remembered; the game carries on.
    }
  };
  return {
    getHighScore() {
      const raw = read(HIGH_SCORE_KEY);
      const value = Number(raw);
      return raw !== null && /^\d+$/.test(raw) && Number.isSafeInteger(value) ? value : 0;
    },
    setHighScore(score) {
      write(HIGH_SCORE_KEY, Math.floor(score));
    },
    getMuted() {
      return read(MUTED_KEY) === "true";
    },
    setMuted(muted) {
      write(MUTED_KEY, muted ? "true" : "false");
    },
    getMusicOn() {
      return read(MUSIC_KEY) !== "false";
    },
    setMusicOn(on) {
      write(MUSIC_KEY, on ? "true" : "false");
    },
  };
}
