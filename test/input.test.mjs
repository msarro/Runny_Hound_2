import { test } from "node:test";
import assert from "node:assert/strict";
import { actionForKey } from "../src/input.js";

test("Space, up arrow and W jump", () => {
  for (const code of ["Space", "ArrowUp", "KeyW"]) assert.equal(actionForKey(code), "jump", code);
});

test("M mutes, P pauses, H opens help", () => {
  assert.equal(actionForKey("KeyM"), "mute");
  assert.equal(actionForKey("KeyP"), "pause");
  assert.equal(actionForKey("KeyH"), "help");
});

test("other keys do nothing", () => {
  for (const code of ["KeyQ", "Enter", "Tab", "", undefined])
    assert.equal(actionForKey(code), null);
});
