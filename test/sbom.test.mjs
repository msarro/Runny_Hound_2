import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizeSbom } from "../scripts/lib/sbom.mjs";

const raw = () => ({
  bomFormat: "CycloneDX",
  serialNumber: "urn:uuid:random",
  version: 1,
  metadata: {
    timestamp: "2026-01-01T00:00:00.000Z",
    tools: [{ vendor: "npm", name: "cli", version: "11.0.0" }],
    component: { name: "Some_Folder_Name", version: "0.1.0" },
  },
  components: [{ name: "b" }, { name: "a" }],
});

test("volatile fields are removed so the committed SBOM only changes when dependencies do", () => {
  const out = normalizeSbom(raw(), { name: "runny-hound" });
  assert.equal("serialNumber" in out, false);
  assert.equal("timestamp" in out.metadata, false);
  assert.equal("tools" in out.metadata, false);
});

test("the app is named from package.json, not from the folder it was cloned into", () => {
  assert.equal(
    normalizeSbom(raw(), { name: "runny-hound" }).metadata.component.name,
    "runny-hound",
  );
});

test("normalizing is stable and does not change the input", () => {
  const input = raw();
  const once = normalizeSbom(input, { name: "runny-hound" });
  assert.deepEqual(normalizeSbom(once, { name: "runny-hound" }), once);
  assert.equal(input.serialNumber, "urn:uuid:random");
});
