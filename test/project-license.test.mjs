// The project's own license (what others may do with Runny Hound). Dependency
// licenses are a separate policy, tested in licenses.test.mjs.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { HELP_SECTIONS } from "../src/help.js";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const SPDX_ID = "CC-BY-NC-ND-4.0";
const SHORT_NAME = "CC BY-NC-ND 4.0";
const LICENSOR = "Matty Sarro";

test("LICENSE holds the full CC BY-NC-ND 4.0 legal code", () => {
  const text = read("LICENSE");
  assert.ok(text.startsWith("Attribution-NonCommercial-NoDerivatives 4.0 International"));
  for (const heading of ["Section 1 -- Definitions.", "Section 8 -- Interpretation."]) {
    assert.ok(text.includes(heading), heading);
  }
});

test("package.json declares the license by its SPDX id", () => {
  assert.equal(JSON.parse(read("package.json")).license, SPDX_ID);
});

test("the SBOM records the project's license", () => {
  const sbom = JSON.parse(read("sbom.cdx.json"));
  const ids = (sbom.metadata.component.licenses ?? []).map((l) => l.license?.id ?? l.expression);
  assert.deepEqual(ids, [SPDX_ID]);
});

test("the README names the license, the licensor, and what it does not cover", () => {
  const readme = read("README.md");
  assert.ok(readme.includes(SHORT_NAME));
  assert.ok(readme.includes(LICENSOR));
  assert.ok(readme.includes("(LICENSE)"), "README should link to the LICENSE file");
  assert.match(readme, /public domain/i);
  assert.match(readme, /trademark/i);
});

test("in-app help tells players the license and who made the game", () => {
  const text = JSON.stringify(HELP_SECTIONS);
  assert.ok(text.includes(SHORT_NAME));
  assert.ok(text.includes(LICENSOR));
});

test("the project's NonCommercial license does not relax the dependency policy", () => {
  const policy = JSON.parse(read("license-policy.json"));
  assert.equal(policy.commercialUseAssumed, true);
  assert.ok(!policy.allowed.includes(SPDX_ID));
});
