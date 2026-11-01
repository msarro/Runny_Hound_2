# Architecture

Runny Hound is a static web page: HTML, CSS and JavaScript modules that run entirely in
the player's browser. There is no server-side code, no database, no sign-in and no
cloud infrastructure. Graphics are drawn on a `<canvas>` with code and sounds are
synthesized with the Web Audio API, so there are no asset files.

```mermaid
flowchart LR
  subgraph Browser["Player's browser"]
    HTML["index.html"] --> Main["main.js<br/>loop, keys, touch"]
    Main --> Game["game.js<br/>rules and state"]
    Game --> Hound["hound.js<br/>jump physics"]
    Game --> Obst["obstacles.js<br/>catalog, gaps"]
    Game --> Coll["collision.js"]
    Main --> Art["art.js<br/>Canvas 2D drawing"]
    Main --> Audio["audio.js<br/>Web Audio synth"]
    Main --> Store["storage.js<br/>high score, mute"]
    Main --> Help["help.js<br/>in-app help"]
    Help --> Obst
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

## How a frame works

1. `main.js` asks the browser for a frame (`requestAnimationFrame`).
2. It advances the game in fixed steps of 1/120 s (`game.step`), so the game plays the
   same on a 60 Hz laptop and a 120 Hz phone. A long pause (switching tabs) is capped
   at 0.1 s so the hound doesn't teleport.
3. Each step returns events (`start`, `jump`, `milestone`, `crash`, `highscore`).
   `main.js` turns them into sounds, saves the high score, and updates a hidden
   screen-reader message.
4. `art.js` draws the whole scene from the game state. Drawing never changes the state.

The game logic (`game.js`, `hound.js`, `obstacles.js`, `collision.js`) has no browser
code at all, so it is tested directly in Node. Randomness comes from a seeded
generator (`random.js`), so tests can replay the same course. The key test is a
simulated player that jumps at the right moment and must survive two minutes on
several courses: that proves the game never generates an impossible sequence.

## Pieces

| Path                  | What it is                                                                            |
| --------------------- | ------------------------------------------------------------------------------------- |
| `index.html`          | The page: canvas, Help button and dialog, screen-reader status line.                  |
| `src/main.js`         | Wires the browser to the game: loop, keyboard, touch, sound, saving.                  |
| `src/game.js`         | Game rules: phases (ready, running, over), score, speed, spawning, crashes.           |
| `src/hound.js`        | Jump physics and the hound's hitbox.                                                  |
| `src/obstacles.js`    | The obstacle catalog (with fun facts), hitboxes, spacing rules.                       |
| `src/collision.js`    | Box overlap test.                                                                     |
| `src/config.js`       | Tuning numbers: world size, gravity, speeds, scoring.                                 |
| `src/art.js`          | All drawing: sky, South Mountain star, skyline, snow, bricks, obstacles, hound, text. |
| `src/audio.js`        | All sounds, synthesized: start yips, jump chirp, milestone bell, crash.               |
| `src/palette.js`      | Colors. The first four must match `src/style.css` (tested).                           |
| `src/storage.js`      | High score and mute setting in `localStorage`, safe if blocked.                       |
| `src/input.js`        | Key-to-action mapping.                                                                |
| `src/help.js`         | Player help; the obstacle list is generated from `obstacles.js`.                      |
| `test/`               | Automated tests (`node --test`).                                                      |
| `scripts/`            | Project tools: local server, license check, SBOM, wiki publishing.                    |
| `license-policy.json` | Recorded usage and the allowed dependency licenses.                                   |
| `sbom.cdx.json`       | Software bill of materials (CycloneDX), generated from the lockfile.                  |
| `.githooks/`          | Local checks: secret scan before commit, all checks before push.                      |
| `.github/workflows/`  | The CI pipeline and wiki publishing.                                                  |

## Tuning the game

Change numbers in `src/config.js` (speed, gravity) or obstacle sizes in
`src/obstacles.js`, then run `npm test`. If the "attentive player can survive" or
"every obstacle can be cleared" tests fail, the change made the game unfair.

## Adding an obstacle

1. Add an entry to `OBSTACLE_TYPES` in `src/obstacles.js` (id, name, size, fun fact).
2. Run `npm test`: the art test fails until you add a drawing function to
   `OBSTACLE_ART` in `src/art.js`. Help updates itself.
3. Check it in the browser with `npm start`.

## Dependencies

The game has **no runtime dependencies**. Everything in `package.json` is a
development tool (formatter, linter) that never reaches players. They are still
license-checked and vulnerability-scanned, because they run on our computers.

## Hosting

Not decided yet. Because the game is static files, any static host works (for example
GitHub Pages). Adding hosting is a change that needs its own issue and decision record.
