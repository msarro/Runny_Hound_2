import { execFileSync } from "node:child_process";

// Builds a CycloneDX SBOM from package-lock.json (not node_modules), so it is the
// same on every operating system.
export function generateRawSbom(cwd) {
  const out = execFileSync(
    "npm",
    ["sbom", "--sbom-format=cyclonedx", "--sbom-type=application", "--package-lock-only"],
    { cwd, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
  );
  return JSON.parse(out);
}

// Removes fields that change on every run (random serial number, timestamp, npm
// version) so the committed SBOM only changes when dependencies change.
export function normalizeSbom(sbom, pkg) {
  const copy = structuredClone(sbom);
  delete copy.serialNumber;
  if (copy.metadata) {
    delete copy.metadata.timestamp;
    delete copy.metadata.tools;
    if (copy.metadata.component) copy.metadata.component.name = pkg.name;
  }
  return copy;
}

export function serializeSbom(sbom) {
  return JSON.stringify(sbom, null, 2) + "\n";
}
