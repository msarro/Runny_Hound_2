import path from "node:path";

// Folders that belong to tooling, not to the game, and are never served.
const PRIVATE_TOP_LEVEL = new Set(["node_modules", "scripts", "test", "docs"]);

// Maps a URL path to a file inside `root`, or returns null if the request tries to
// leave the project folder or reach hidden/tooling files.
export function resolveSafePath(root, urlPath) {
  let decoded;
  try {
    decoded = decodeURIComponent(String(urlPath).split(/[?#]/)[0]);
  } catch {
    return null;
  }
  const segments = decoded.split(/[/\\]+/).filter(Boolean);
  if (segments.some((s) => s === ".." || s.startsWith("."))) return null;
  if (segments.length > 0 && PRIVATE_TOP_LEVEL.has(segments[0])) return null;

  const resolved = path.resolve(root, ...(segments.length ? segments : ["index.html"]));
  if (resolved !== root && !resolved.startsWith(root + path.sep)) return null;
  return resolved;
}
