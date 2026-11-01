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
