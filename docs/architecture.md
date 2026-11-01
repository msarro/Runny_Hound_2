# Architecture

Runny Hound is a static web page: HTML, CSS and JavaScript modules that run entirely in
the player's browser. There is no server-side code, no database, no sign-in and no
cloud infrastructure. Graphics are drawn on a `<canvas>` with code and sounds are
synthesized with the Web Audio API, so there are no asset files.

```mermaid
flowchart LR
  subgraph Browser["Player's browser"]
    HTML["index.html"] --> Main["src/main.js"]
    Main --> Help["src/help.js<br/>(in-app help)"]
    Main -. planned .-> Game["Game loop, art and sound<br/>(Canvas 2D + Web Audio)"]
  end

  subgraph Repo["GitHub repository"]
    Code["Source code"] --> PR["Pull request"]
    PR --> CI["CI pipeline<br/>format, lint, test, secrets,<br/>dependencies, licenses, sbom"]
    CI -->|all green + owner merges| MainBranch["main (protected)"]
    MainBranch --> Wiki["Wiki<br/>(copy of docs/)"]
  end

  Dev["Developer computer<br/>npm run check + git hooks"] -->|push branch| PR
  MainBranch -. served as static files .-> HTML
```

## Pieces

| Path                  | What it is                                                           |
| --------------------- | -------------------------------------------------------------------- |
| `index.html`, `src/`  | The game. Only these files are shipped to players.                   |
| `src/help.js`         | Player help text shown in the Help dialog.                           |
| `test/`               | Automated tests (`node --test`).                                     |
| `scripts/`            | Project tools: local server, license check, SBOM, wiki publishing.   |
| `scripts/lib/`        | The logic behind those tools, kept separate so it can be tested.     |
| `license-policy.json` | Recorded usage and the allowed dependency licenses.                  |
| `sbom.cdx.json`       | Software bill of materials (CycloneDX), generated from the lockfile. |
| `.githooks/`          | Local checks: secret scan before commit, all checks before push.     |
| `.github/workflows/`  | The CI pipeline and wiki publishing.                                 |

## Dependencies

The game has **no runtime dependencies**. Everything in `package.json` is a
development tool (formatter, linter) that never reaches players. They are still
license-checked and vulnerability-scanned, because they run on our computers.

## Hosting

Not decided yet. Because the game is static files, any static host works (for example
GitHub Pages). Adding hosting is a change that needs its own issue and decision record.
