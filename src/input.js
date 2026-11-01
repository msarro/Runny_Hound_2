// Every control: the KeyboardEvent.code, the label shown to players, and the action.
// The page's "How to play" must show every label (test/page.test.mjs checks).
export const CONTROLS = [
  { code: "Space", label: "Space", action: "jump" },
  { code: "ArrowUp", label: "↑", action: "jump" },
  { code: "KeyW", label: "W", action: "jump" },
  { code: "KeyM", label: "M", action: "mute" },
  { code: "KeyN", label: "N", action: "music" },
  { code: "KeyP", label: "P", action: "pause" },
  { code: "Escape", label: "Esc", action: "pause" },
  { code: "KeyH", label: "H", action: "help" },
];

const ACTIONS = Object.fromEntries(CONTROLS.map((c) => [c.code, c.action]));

export function actionForKey(code) {
  return ACTIONS[code] ?? null;
}
