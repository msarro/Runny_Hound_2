// Maps a KeyboardEvent.code to a game action.
const KEYS = {
  Space: "jump",
  ArrowUp: "jump",
  KeyW: "jump",
  KeyM: "mute",
  KeyP: "pause",
  KeyH: "help",
};

export function actionForKey(code) {
  return KEYS[code] ?? null;
}
