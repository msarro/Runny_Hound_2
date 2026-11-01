// The web page around the game, matching Runny Hound 1.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { CONTROLS } from "../src/input.js";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const section = (id) => {
  const start = html.indexOf(`id="${id}"`);
  assert.ok(start > 0, `missing #${id}`);
  return html.slice(start, html.indexOf("</section>", start));
};

test("the header has the Moravian Star emblem, the name and the tagline", () => {
  assert.match(html, /<header class="brand-bar">/);
  assert.match(html, /<canvas[^>]*id="brand-star"/);
  assert.match(html, /<h1>Runny Hound<\/h1>/);
  assert.ok(html.includes("Go, Greyhounds! Leap through Bethlehem, the Christmas City."));
});

test("touch screens get Duck and Jump buttons", () => {
  assert.match(html, /class="touch-controls"/);
  assert.match(html, /<button[^>]*id="duck-btn"[^>]*>▼ Duck<\/button>/);
  assert.match(html, /<button[^>]*id="jump-btn"[^>]*>▲ Jump<\/button>/);
});

test("How to play shows every control as a key cap", () => {
  const how = section("how-to-play");
  for (const control of CONTROLS) {
    assert.ok(how.includes(`<kbd>${control.label}</kbd>`), control.label);
  }
});

test("there is a place for the obstacle cards", () => {
  assert.ok(section("obstacles").includes('id="obstacle-cards"'));
});

test("the footer credits the author, links the license, and carries the disclaimers", () => {
  // Line breaks are collapsed: the formatter wraps long lines, which readers never see.
  const footer = html
    .slice(html.indexOf("<footer>"), html.indexOf("</footer>"))
    .replace(/\s+/g, " ");
  assert.ok(footer.includes("© 2026 Matty Sarro"));
  assert.match(
    footer,
    // Spacing inside the tag is allowed: the formatter may wrap it across lines.
    /<a href="https:\/\/creativecommons\.org\/licenses\/by-nc-nd\/4\.0\/" rel="license"\s*>CC BY-NC-ND 4\.0<\/a\s*>/,
  );
  assert.match(footer, /generated in code/);
  assert.match(footer, /not an official university product/);
  assert.match(footer, /In dulci jubilo/);
});

test("the browser tab gets an icon slot (the star is drawn into it by code)", () => {
  assert.match(html, /<link rel="icon" href="data:,"/);
});
