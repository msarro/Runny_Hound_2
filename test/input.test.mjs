import { test } from "node:test";
import assert from "node:assert/strict";
import { actionForKey, CONTROLS } from "../src/input.js";

test("Space, up arrow and W jump", () => {
  for (const code of ["Space", "ArrowUp", "KeyW"]) assert.equal(actionForKey(code), "jump", code);
});

test("M mutes, P pauses, H opens help", () => {
  assert.equal(actionForKey("KeyM"), "mute");
  assert.equal(actionForKey("KeyP"), "pause");
  assert.equal(actionForKey("Escape"), "pause");
  assert.equal(actionForKey("KeyH"), "help");
});

test("Down arrow and S duck", () => {
  assert.equal(actionForKey("ArrowDown"), "duck");
  assert.equal(actionForKey("KeyS"), "duck");
});

test("N turns the music on or off", () => {
  assert.equal(actionForKey("KeyN"), "music");
});

test("other keys do nothing", () => {
  for (const code of ["KeyQ", "Enter", "Tab", "", undefined])
    assert.equal(actionForKey(code), null);
});

test("every control has a label to show players", () => {
  for (const control of CONTROLS) {
    assert.ok(control.label.length > 0, control.code);
    assert.equal(actionForKey(control.code), control.action);
  }
});
