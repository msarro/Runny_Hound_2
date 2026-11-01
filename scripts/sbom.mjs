// Writes sbom.cdx.json. With --check, fails instead if the committed file is out of date.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { generateRawSbom, normalizeSbom, serializeSbom } from "./lib/sbom.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const target = new URL("../sbom.cdx.json", import.meta.url);
const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url)));
const fresh = serializeSbom(normalizeSbom(generateRawSbom(root), pkg));

if (process.argv.includes("--check")) {
  const current = existsSync(target) ? readFileSync(target, "utf8") : "";
  if (current !== fresh) {
    console.error("SBOM check FAILED: sbom.cdx.json does not match the dependencies.");
    console.error("Run `npm run sbom` and commit the updated sbom.cdx.json.");
    process.exit(1);
  }
  console.log("SBOM check passed: sbom.cdx.json is current.");
} else {
  writeFileSync(target, fresh);
  console.log("Wrote sbom.cdx.json");
}
