# Runny Hound

An endless-runner browser game for a demonstration at Moravian University. The Moravian
Greyhound runs through Bethlehem, PA, jumping over obstacles from campus and the
Christmas City when you press **Space**. Every graphic and sound is generated in code;
there are no image or audio files.

Jump over lovefeast candles, marshmallow chicks, a stack of books, a Moravian Star,
Bethlehem Steel beams and a Christmas tree, and duck under flying Moravian Stars, all
under South Mountain's star. Hit one and you get a fun fact
about it. The music is _In dulci jubilo_ ("Good Christian Men, Rejoice") in J. S. Bach's
harmonization (BWV 368), played like a Moravian trombone choir. How it is built:
[docs/architecture.md](docs/architecture.md).

| Control                   | Action                                                        |
| ------------------------- | ------------------------------------------------------------- |
| `Space` / `↑` / `W` / tap | Jump (hold for higher, tap for a hop); start, restart, resume |
| `↓` / `S`                 | Duck under flying stars; in the air, drop faster              |
| `M`                       | All sound on/off (remembered)                                 |
| `N`                       | Music on/off (remembered)                                     |
| `P` / `Esc`               | Pause                                                         |
| `H`                       | Help (pauses the game)                                        |

On phones and tablets **▼ Duck** and **▲ Jump** buttons appear under the game. The page and screens
match Runny Hound 1 ([decision 0006](docs/decisions/0006-parity-with-runny-hound-1.md)).

## Play it online

- **Runny Hound 2**, this version:
  [lvsoftworks.com/demos/runny_hound_2](https://lvsoftworks.com/demos/runny_hound_2)
- **Runny Hound 1**, the earlier version of the same game:
  [play it](https://lvsoftworks.com/demos/runny_hound_1) ·
  [source](https://github.com/msarro/Runny_Hound_1)

The prompt that started this version is in [The Prompt](#the-prompt) below.

## Play it on your computer

You need [Node.js](https://nodejs.org/) (the version in `.node-version`) and
[gitleaks](https://github.com/gitleaks/gitleaks) (`brew install gitleaks`).

```sh
npm install   # installs the tools and turns on the safety checks (git hooks)
npm start     # then open http://localhost:8000
```

Below the game, the page explains how to play and introduces each obstacle. Press **H** or
the **Help** button for the full player help.

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

## Usage and dependency licenses

This software is **shared outside Moravian University**, so commercial use is assumed.
Only permissive dependency licenses are allowed; the list is in
[license-policy.json](license-policy.json) and the reasoning in
[docs/decisions/0001](docs/decisions/0001-usage-and-license-policy.md).

Dependencies are tools used to build and check the game; none ship to players.

## The Prompt

```text
I want you to create a simple web based game. The game should use entirely generated assets for graphics and sound. The game should feature a greyhound (based on the Moravian University mascot) running along the ground, jumping over obstacles when the user presses the space bar. The obstacles should be items related to the University or the city of Bethlehem PA. This will be in the style of the Google Dino-Run game, or flappy bird. The game should use assets and a color scheme derived from and meaningful to Moravian University, such as Moravian Stars, and Moravian university's branding.


Set up the repository for me. I'm not a professional developer, so explain each step in plain language.

Before we write any features, set up this project so that:

1. Every change starts as an issue in our repository, and you update that
   issue as the work progresses.
2. Work happens on a short-lived branch per issue and reaches main only
   through a pull request that a person approves. Nobody pushes to main
   directly. Set up branch protection to enforce this.
3. Every change comes with automated tests. Write the test first and show
   me it failing before you write the code.
4. An automated pipeline runs on every pull request: formatting, linting,
   tests, a scan for leaked passwords or keys, a scan for vulnerable
   dependencies, and a license check. Run the same checks on my machine
   before pushing.
5. Every dependency is listed in a manifest with a lockfile, and a
   software bill of materials (SBOM) is committed and kept current.
6. Ask me how this software will be used (internal only, commercial,
   shared outside the organization, open source) and record the answer.
   The license check must reject any dependency whose license doesn't
   allow that use. If commercial use is possible at all, assume it.
7. Passwords and keys are never written into code.
8. Code only runs from the folder it lives in, against the environment it
   belongs to. Before any command that changes infrastructure or data
   (terraform/tofu, kubectl, database tools), show me the folder,
   workspace and account it will act on, and wait for my OK.
9. If people sign in, use our institutional single sign-on (SSO). Define
   the app's roles and what each can do in the app itself, then map
   people to those roles through SSO groups or manual assignment.
10. Keep two kinds of documentation, both required: help for end users
    (in the app), and engineering docs for maintainers (architecture,
    decisions, runbooks) in the repository, published to the wiki.
    Start with a README and an architecture page with a diagram.
12. When a piece of work is finished, wrap up: close or update the
    issues, update the README and docs, and prune stale notes from
    AGENTS.md.
13. Create AGENTS.md to assist all users of this repo so that the same rules are followed. Also add a CLAUDE.md containing only the line @AGENTS.md.

When setup is done, prove it works: show me the pipeline rejecting a
failing test and a fake password, and show me a direct push to main
being refused.

Never weaken or delete a test, or turn off a check, to make things pass.
If you're stuck, stop and ask me.
```

This is the prompt that started Runny Hound 2, in Claude Code on November 1, 2026. A few
minutes earlier the same prompt was sent with a different item 13, asking for AGENTS.md to
be created from a template in a separate guidelines repository. That repository wasn't
available, so the request was withdrawn and re-sent as above; nothing else changed.

Later requests in the same session built the game
([#6](https://github.com/msarro/Runny_Hound_2/issues/6)), added the music
([#8](https://github.com/msarro/Runny_Hound_2/issues/8)), a plain-language wiki error
([#10](https://github.com/msarro/Runny_Hound_2/issues/10)), the project license
([#12](https://github.com/msarro/Runny_Hound_2/issues/12)) and parity with Runny Hound 1
([#14](https://github.com/msarro/Runny_Hound_2/issues/14),
[#16](https://github.com/msarro/Runny_Hound_2/issues/16)). The prompt itself grew into
[AI Repo Setup Prompt](https://github.com/msarro/AI_Repo_Setup_Prompt), a general version
anyone can copy.

## License

Runny Hound © 2026 Matty Sarro is licensed under
[CC BY-NC-ND 4.0](LICENSE) (Creative Commons Attribution-NonCommercial-NoDerivatives
4.0 International). In short: you may share the game unchanged, for non-commercial
purposes, with credit to the author. You may not share modified versions. The full
legal code is in [LICENSE](LICENSE); see
[decision 0005](docs/decisions/0005-project-license.md).

What the license does **not** cover:

- **Public domain music.** _In dulci jubilo_ and J. S. Bach's harmonization (BWV 368)
  are in the public domain and stay free for anyone to use.
- **Moravian University names and symbols.** The license grants no trademark rights.
  This is a fan-made demo, not an official Moravian University product, and it uses no
  university logos.

## Documentation

- Players: the in-game **Help** dialog.
- Maintainers: [docs/](docs/index.md), published to the
  [wiki](https://github.com/msarro/Runny_Hound_2/wiki) on every merge to `main`.
  Start with the [architecture](docs/architecture.md).
