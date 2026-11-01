import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { isLicenseAllowed, findLicenseViolations } from "../scripts/lib/licenses.mjs";

const policy = JSON.parse(readFileSync(new URL("../license-policy.json", import.meta.url)));
const allowed = policy.allowed;

const component = (name, licenses) => ({ name, version: "1.0.0", licenses });

test("the recorded usage is 'shared outside the organization' with commercial use assumed", () => {
  assert.equal(policy.usage, "shared-outside-organization");
  assert.equal(policy.commercialUseAssumed, true);
});

test("the policy never allows copyleft or non-commercial licenses", () => {
  const forbidden = /GPL|MPL|EPL|EUPL|SSPL|CDDL|OSL|CC-BY-NC|CC-BY-SA|Commons-Clause|BUSL/i;
  for (const id of allowed) assert.doesNotMatch(id, forbidden, `${id} must not be allowed`);
});

test("permissive licenses are allowed", () => {
  for (const id of ["MIT", "ISC", "Apache-2.0", "BSD-2-Clause", "BSD-3-Clause"]) {
    assert.equal(isLicenseAllowed(id, allowed), true, id);
  }
});

test("copyleft and unknown licenses are rejected", () => {
  for (const id of [
    "GPL-3.0-only",
    "AGPL-3.0-or-later",
    "LGPL-2.1-only",
    "MPL-2.0",
    "UNLICENSED",
    "SEE LICENSE IN LICENSE.txt",
    "",
  ]) {
    assert.equal(isLicenseAllowed(id, allowed), false, id);
  }
});

test("an OR expression is allowed when any choice is allowed", () => {
  assert.equal(isLicenseAllowed("(MIT OR GPL-3.0-only)", allowed), true);
  assert.equal(isLicenseAllowed("GPL-2.0-only OR AGPL-3.0-only", allowed), false);
});

test("an AND expression is allowed only when every part is allowed", () => {
  assert.equal(isLicenseAllowed("MIT AND ISC", allowed), true);
  assert.equal(isLicenseAllowed("(MIT AND GPL-3.0-only)", allowed), false);
});

test("nested expressions are evaluated correctly", () => {
  assert.equal(
    isLicenseAllowed("(MIT OR GPL-3.0-only) AND (Apache-2.0 OR AGPL-3.0-only)", allowed),
    true,
  );
  assert.equal(isLicenseAllowed("MIT AND (GPL-2.0-only OR AGPL-3.0-only)", allowed), false);
});

test("a license exception (WITH) is rejected unless explicitly allowed", () => {
  assert.equal(isLicenseAllowed("GPL-2.0-only WITH Classpath-exception-2.0", allowed), false);
});

test("findLicenseViolations reports each bad component with its license", () => {
  const sbom = {
    components: [
      component("good", [{ license: { id: "MIT" } }]),
      component("expr-good", [{ expression: "MIT OR Apache-2.0" }]),
      component("copyleft", [{ license: { id: "GPL-3.0-only" } }]),
      component("custom-name", [{ license: { name: "My Custom License" } }]),
      component("none", undefined),
      component("empty", []),
      component("mixed", [{ license: { id: "MIT" } }, { license: { id: "AGPL-3.0-only" } }]),
    ],
  };
  const bad = findLicenseViolations(sbom, policy).map((v) => v.name);
  assert.deepEqual(bad, ["copyleft", "custom-name", "none", "empty", "mixed"]);
  const none = findLicenseViolations(sbom, policy).find((v) => v.name === "none");
  assert.equal(none.version, "1.0.0");
  assert.match(none.license, /no license/i);
});
