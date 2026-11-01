import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PALETTE } from "../src/palette.js";

test("every palette entry is a valid color", () => {
  for (const [name, value] of Object.entries(PALETTE)) {
    assert.match(value, /^#[0-9a-f]{6}$/, name);
  }
});

test("the page and the game use the same Moravian colors", () => {
  const css = readFileSync(new URL("../src/style.css", import.meta.url), "utf8");
  const cssVar = (name) => css.match(new RegExp(`--${name}:\\s*(#[0-9a-f]{6})`))?.[1];
  assert.equal(cssVar("moravian-blue"), PALETTE.moravianBlue);
  assert.equal(cssVar("greyhound-grey"), PALETTE.greyhoundGrey);
  assert.equal(cssVar("star-gold"), PALETTE.starGold);
  assert.equal(cssVar("snow"), PALETTE.snow);
});

test("the colors match Runny Hound 1", () => {
  assert.equal(PALETTE.moravianBlue, "#002b5c");
  assert.equal(PALETTE.coatBlue, "#1d4f91");
  assert.equal(PALETTE.greyhoundGrey, "#a9b0b7");
  assert.equal(PALETTE.starGold, "#f4b223");
  const css = readFileSync(new URL("../src/style.css", import.meta.url), "utf8");
  assert.match(css, /--page:\s*#e9ecef/);
  assert.match(css, /--ink:\s*#1b2430/);
  assert.match(css, /--coat-blue:\s*#1d4f91/);
});
