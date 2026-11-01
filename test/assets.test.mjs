import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const MEDIA = /\.(png|jpe?g|gif|webp|avif|bmp|ico|svg|mp3|wav|ogg|m4a|flac|aac|woff2?|ttf|otf)$/i;

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === "node_modules" || entry.name === ".git") return [];
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

test("there are no image, sound or font files: everything is generated in code", () => {
  const media = walk(root).filter((f) => MEDIA.test(f));
  assert.deepEqual(media, []);
});

// Web addresses the page would load by itself. An ordinary clickable link
// (<a href="https://...">) loads nothing until someone clicks it, so it is allowed;
// any other web address (scripts, styles, images, fonts, fetches, CSS url()) is not.
function internetLoads(text) {
  const withoutLinks = text.replace(/<a\s[^>]*?href="https?:\/\/[^"]*"/g, "<a");
  return withoutLinks.match(/https?:\/\/[^\s"')]*/g) ?? [];
}

test("the internet-load check allows clickable links but catches everything else", () => {
  assert.deepEqual(internetLoads('<a href="https://example.com/">site</a>'), []);
  assert.deepEqual(
    internetLoads('<a class="x" href="https://example.com/a" rel="license">x</a>'),
    [],
  );
  for (const load of [
    '<script src="https://cdn.example.com/lib.js"></script>',
    '<link rel="stylesheet" href="https://fonts.example.com/a.css">',
    '<img src="https://example.com/dog.png">',
    "body { background: url(https://example.com/bg.png); }",
    'fetch("https://example.com/scores")',
    "import x from 'https://esm.example.com/x.js';",
    '<a href="https://example.com/">ok</a><img src="https://example.com/i.png">',
  ]) {
    assert.ok(internetLoads(load).length > 0, load);
  }
});

test("the game loads nothing from the internet", () => {
  const files = [path.join(root, "index.html"), ...walk(path.join(root, "src"))];
  for (const file of files) {
    assert.deepEqual(internetLoads(readFileSync(file, "utf8")), [], path.relative(root, file));
  }
});
