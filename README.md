# Runny Hound

An endless-runner browser game for a demonstration at Moravian University. The Moravian
Greyhound runs through Bethlehem, PA, jumping over obstacles from campus and the
Christmas City when you press **Space**. Every graphic and sound is generated in code;
there are no image or audio files.

Jump over a lovefeast candle, a stack of books, a Moravian Star, Bethlehem Steel beams
and a Christmas tree, under South Mountain's star. Hit one and you get a fun fact
about it. How it is built: [docs/architecture.md](docs/architecture.md).

| Control                   | Action                                                 |
| ------------------------- | ------------------------------------------------------ |
| `Space` / `↑` / `W` / tap | Jump (hold for higher, tap for a hop); start / restart |
| `M`                       | Sound on/off (remembered)                              |
| `P`                       | Pause                                                  |
| `H`                       | Help (pauses the game)                                 |

## Play it on your computer

You need [Node.js](https://nodejs.org/) (the version in `.node-version`) and
[gitleaks](https://github.com/gitleaks/gitleaks) (`brew install gitleaks`).

```sh
npm install   # installs the tools and turns on the safety checks (git hooks)
npm start     # then open http://localhost:8000
```

Press **H** or the **Help** button in the game for player help.

## How work gets done here

1. Open an **issue** describing the change.
2. Create a branch named after it, e.g. `12-add-jump`.
3. Write a **test first**, run `npm test`, and see it fail. Then write the code until it passes.
4. Run `npm run check`. It runs the same checks as the pipeline (this also runs
   automatically before every `git push`).
5. Push the branch and open a **pull request** that says `Closes #12`.
6. The owner reviews and merges. Nobody can push to `main` directly.

The full rules, for people and AI assistants alike, are in [AGENTS.md](AGENTS.md).

## Checks (local and in the pipeline)

| Command                | What it checks                                                           |
| ---------------------- | ------------------------------------------------------------------------ |
| `npm run format:check` | Code is formatted consistently (Prettier). Fix with `npm run format`.    |
| `npm run lint`         | Common mistakes in JavaScript (ESLint).                                  |
| `npm test`             | Automated tests (Node's built-in test runner).                           |
| `npm run secrets`      | No passwords, keys or tokens anywhere in the code or history (gitleaks). |
| `npm run audit`        | No dependency with a known security hole (npm audit).                    |
| `npm run licenses`     | Every dependency's license allows our use (see below).                   |
| `npm run sbom:check`   | `sbom.cdx.json` lists exactly the current dependencies.                  |
| `npm run check`        | All of the above.                                                        |

## Usage and licensing

This software is **shared outside Moravian University**, so commercial use is assumed.
Only permissive dependency licenses are allowed; the list is in
[license-policy.json](license-policy.json) and the reasoning in
[docs/decisions/0001](docs/decisions/0001-usage-and-license-policy.md).

The project itself has no open-source license yet, so all rights are reserved by the
owner. This is a fan-made demo, not an official Moravian University product. The art
is original and uses no university logos.

## Documentation

- Players: the in-game **Help** dialog.
- Maintainers: [docs/](docs/index.md), published to the
  [wiki](https://github.com/msarro/Runny_Hound_2/wiki) on every merge to `main`.
  Start with the [architecture](docs/architecture.md).
