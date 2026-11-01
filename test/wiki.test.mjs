import { test } from "node:test";
import assert from "node:assert/strict";
import { wikiPageName, rewriteLinks } from "../scripts/lib/wiki.mjs";

test("docs/index.md becomes the wiki Home page", () => {
  assert.equal(wikiPageName("index.md"), "Home");
});

test("nested docs become flat wiki page names", () => {
  assert.equal(wikiPageName("architecture.md"), "architecture");
  assert.equal(wikiPageName("runbooks/local-setup.md"), "runbooks-local-setup");
});

test("links between docs are rewritten to wiki page links", () => {
  assert.equal(
    rewriteLinks("See [setup](runbooks/local-setup.md#install).", "index.md"),
    "See [setup](runbooks-local-setup#install).",
  );
});

test("relative links from a nested page resolve correctly", () => {
  assert.equal(
    rewriteLinks(
      "[arch](../architecture.md) and [next](0002-no-sign-in.md)",
      "decisions/0001-x.md",
    ),
    "[arch](architecture) and [next](decisions-0002-no-sign-in)",
  );
});

test("links to files outside docs point at the file on GitHub", () => {
  assert.equal(
    rewriteLinks("[readme](../README.md)", "index.md", "https://github.com/o/r/blob/main"),
    "[readme](https://github.com/o/r/blob/main/README.md)",
  );
});

test("web links and anchors are left alone", () => {
  const md = "[site](https://example.com/a.md) [top](#top)";
  assert.equal(rewriteLinks(md, "index.md"), md);
});
