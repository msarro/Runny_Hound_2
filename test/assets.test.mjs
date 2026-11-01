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

test("the game loads nothing from the internet", () => {
  const files = [path.join(root, "index.html"), ...walk(path.join(root, "src"))];
  for (const file of files) {
    assert.doesNotMatch(readFileSync(file, "utf8"), /https?:\/\//, path.relative(root, file));
  }
});
