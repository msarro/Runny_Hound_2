import path from "node:path";

// docs/<rel path>.md -> wiki page name. Wikis are flat, so "/" becomes "-".
export function wikiPageName(relPath) {
  const name = relPath.replace(/\.md$/, "").split("/").join("-");
  return name === "index" ? "Home" : name;
}

// Rewrites relative Markdown links in a doc at `fromRelPath` (relative to docs/) so
// they work on the wiki. Links that leave docs/ point at the file on GitHub instead.
export function rewriteLinks(markdown, fromRelPath, blobBase = "") {
  return markdown.replace(/\]\(([^)\s]+)\)/g, (match, target) => {
    if (/^[a-z]+:/i.test(target) || target.startsWith("#")) return match;
    const [file, anchor] = target.split("#");
    const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(fromRelPath), file));
    const suffix = anchor ? `#${anchor}` : "";
    if (resolved.startsWith("../")) {
      return `](${blobBase}/${resolved.replace(/^(\.\.\/)+/, "")}${suffix})`;
    }
    if (resolved.endsWith(".md")) return `](${wikiPageName(resolved)}${suffix})`;
    return match;
  });
}

// Turns a failed `git clone` of the wiki into a message a person can act on.
// git's error arrives as raw bytes; the access token is always removed.
export function explainCloneFailure(stderr, { repository, token }) {
  let text = Buffer.isBuffer(stderr) ? stderr.toString("utf8") : String(stderr ?? "");
  if (token) text = text.split(token).join("***");
  if (/repository not found|not found/i.test(text)) {
    return [
      "The wiki has no pages yet, so there is nowhere to publish the docs.",
      "GitHub only creates a wiki's storage when its first page is saved. To fix it:",
      `  1. Open https://github.com/${repository}/wiki`,
      '  2. Click "Create the first page", type anything, and click "Save page".',
      '  3. Re-run this workflow: Actions > "Publish docs to wiki" > Run workflow.',
    ].join("\n");
  }
  return `Could not download the wiki. git said:\n${text.trim() || "(no details)"}`;
}
