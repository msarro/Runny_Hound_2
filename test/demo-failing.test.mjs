// DEMO ONLY (#3): this test is meant to fail. Never merge.
import { test } from "node:test";
import assert from "node:assert/strict";
import { HELP_SECTIONS } from "../src/help.js";

test("help documents a double-jump control (it doesn't exist, so this fails)", () => {
  assert.match(JSON.stringify(HELP_SECTIONS), /double jump/i);
});
