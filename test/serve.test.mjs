import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { resolveSafePath } from "../scripts/lib/serve.mjs";

const root = path.resolve("/srv/game");

test("a normal file maps inside the project folder", () => {
  assert.equal(resolveSafePath(root, "/src/main.js"), path.join(root, "src/main.js"));
});

test("the site root serves index.html", () => {
  assert.equal(resolveSafePath(root, "/"), path.join(root, "index.html"));
});

test("query strings are ignored", () => {
  assert.equal(resolveSafePath(root, "/index.html?v=2"), path.join(root, "index.html"));
});

test("paths that escape the project folder are refused", () => {
  for (const p of [
    "/../secret",
    "/src/../../etc/passwd",
    "/%2e%2e/etc/passwd",
    "/..%2fetc/passwd",
  ]) {
    assert.equal(resolveSafePath(root, p), null, p);
  }
});

test("hidden files and folders (like .git or .env) are refused", () => {
  for (const p of ["/.git/config", "/.env", "/src/.secret"]) {
    assert.equal(resolveSafePath(root, p), null, p);
  }
});

test("dependency and tooling folders are not served", () => {
  for (const p of ["/node_modules/eslint/package.json", "/scripts/serve.mjs"]) {
    assert.equal(resolveSafePath(root, p), null, p);
  }
});
