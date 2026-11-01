import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { HELP_SECTIONS } from "../src/help.js";

test("in-app help explains how to play and the controls", () => {
  const titles = HELP_SECTIONS.map((s) => s.title);
  assert.ok(titles.includes("How to play"));
  assert.ok(titles.includes("Controls"));
});

test("help tells players that Space makes the greyhound jump", () => {
  const text = JSON.stringify(HELP_SECTIONS);
  assert.match(text, /Space/);
  assert.match(text, /jump/i);
});

test("the page has a Help button wired to a help dialog", () => {
  const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
  assert.match(html, /<button[^>]*id="help-button"/);
  assert.match(html, /<dialog[^>]*id="help-dialog"/);
});
