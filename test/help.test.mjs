import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { HELP_SECTIONS } from "../src/help.js";
import { OBSTACLE_TYPES } from "../src/obstacles.js";

const text = JSON.stringify(HELP_SECTIONS);

test("in-app help explains how to play and the controls", () => {
  const titles = HELP_SECTIONS.map((s) => s.title);
  assert.ok(titles.includes("How to play"));
  assert.ok(titles.includes("Controls"));
});

test("help tells players that Space makes the greyhound jump", () => {
  assert.match(text, /Space/);
  assert.match(text, /jump/i);
});

test("help lists every control", () => {
  for (const control of ["Space", "Hold", "M:", "N:", "P:", "H:", "Tap", "Esc"])
    assert.ok(text.includes(control), control);
});

test("help describes every obstacle, with its fun fact", () => {
  for (const type of OBSTACLE_TYPES) {
    assert.ok(text.includes(type.name), type.name);
    assert.ok(text.includes(type.fact), type.id);
  }
});

test("the page has a Help button wired to a help dialog", () => {
  const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
  assert.match(html, /<button[^>]*id="help-button"/);
  assert.match(html, /<dialog[^>]*id="help-dialog"/);
});

test("the page announces the score for screen readers", () => {
  const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
  assert.match(html, /aria-live="polite"/);
});

test("help credits the music: In dulci jubilo in Bach's harmonization", () => {
  assert.match(text, /In dulci jubilo/);
  assert.match(text, /Good Christian Men, Rejoice/);
  assert.match(text, /Bach/);
  assert.match(text, /BWV 368/);
  assert.match(text, /trombone choir/i);
});
