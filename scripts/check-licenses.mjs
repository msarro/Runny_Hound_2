// Fails if any dependency's license is not allowed by license-policy.json.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { findLicenseViolations } from "./lib/licenses.mjs";
import { generateRawSbom } from "./lib/sbom.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const policy = JSON.parse(readFileSync(new URL("../license-policy.json", import.meta.url)));
const sbom = generateRawSbom(root);
const violations = findLicenseViolations(sbom, policy);

if (violations.length > 0) {
  console.error(
    `License check FAILED. Usage is "${policy.usage}"; these licenses are not allowed:`,
  );
  for (const v of violations) console.error(`  - ${v.name}@${v.version}: ${v.license}`);
  console.error(`See ${policy.decision} before changing anything.`);
  process.exit(1);
}
console.log(
  `License check passed: ${sbom.components.length} dependencies, all allowed for "${policy.usage}".`,
);
