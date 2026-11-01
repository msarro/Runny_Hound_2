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
