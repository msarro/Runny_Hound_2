// Copies docs/ into the GitHub wiki and pushes it. Runs in CI (see .github/workflows/wiki.yml).
import { execFileSync } from "node:child_process";
import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { rewriteLinks, wikiPageName } from "./lib/wiki.mjs";

const { GITHUB_TOKEN, GITHUB_REPOSITORY, GITHUB_SHA = "local" } = process.env;
if (!GITHUB_TOKEN || !GITHUB_REPOSITORY) {
  console.error("GITHUB_TOKEN and GITHUB_REPOSITORY must be provided by the workflow.");
  process.exit(1);
}

const docsDir = fileURLToPath(new URL("../docs", import.meta.url));
const wikiDir = mkdtempSync(path.join(tmpdir(), "wiki-"));
const git = (...args) => execFileSync("git", ["-C", wikiDir, ...args], { stdio: "inherit" });
const blobBase = `https://github.com/${GITHUB_REPOSITORY}/blob/main`;

execFileSync("git", [
  "clone",
  "--depth=1",
  `https://x-access-token:${GITHUB_TOKEN}@github.com/${GITHUB_REPOSITORY}.wiki.git`,
  wikiDir,
]);
for (const entry of readdirSync(wikiDir)) {
  if (entry !== ".git") rmSync(path.join(wikiDir, entry), { recursive: true });
}
for (const rel of readdirSync(docsDir, { recursive: true })) {
  if (!rel.endsWith(".md")) continue;
  const relPosix = rel.split(path.sep).join("/");
  const body = rewriteLinks(readFileSync(path.join(docsDir, rel), "utf8"), relPosix, blobBase);
  writeFileSync(path.join(wikiDir, `${wikiPageName(relPosix)}.md`), body);
}

git("config", "user.name", "github-actions[bot]");
git("config", "user.email", "41898282+github-actions[bot]@users.noreply.github.com");
git("add", "-A");
try {
  execFileSync("git", ["-C", wikiDir, "diff", "--cached", "--quiet"]);
  console.log("Wiki already up to date.");
} catch {
  git("commit", "-m", `Publish docs from ${GITHUB_SHA}`);
  git("push");
}
