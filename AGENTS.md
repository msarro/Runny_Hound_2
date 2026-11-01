# AGENTS.md

Rules for everyone working in this repository: people and AI assistants (Claude,
Copilot, Cursor, and others) alike. If a rule blocks you, stop and ask the owner. Never
work around it.

## Project in one paragraph

Runny Hound is a static browser game (Canvas + Web Audio, no asset files, no runtime
dependencies). A Moravian University greyhound jumps (Space) over Bethlehem, PA and
university-themed obstacles, in Moravian-inspired colors. See
[docs/architecture.md](docs/architecture.md).

## The workflow (every change)

1. **Issue first.** Every change starts as a GitHub issue. Comment on the issue as the
   work progresses (test written and failing, PR opened, and so on).
2. **One short-lived branch per issue**, named `<issue-number>-<short-name>`.
3. **Test first.** Write the test, run it, and show it failing before writing the code.
4. **Run `npm run check`** before pushing (the pre-push hook does this too).
5. **Pull request** with `Closes #<n>`. Only a person merges. **AI agents never merge
   pull requests and never push to `main`.**
6. **Wrap up** when the work is finished: close or update the issues, update `README.md`,
   `docs/` and player help (`src/help.js`), and prune stale notes from this file.

## Hard rules

- **Never weaken, skip or delete a test, and never disable a check, hook or pipeline
  job** to make something pass. No `--no-verify`, no `.skip`, no lowering the audit
  level, no adding licenses to the allowed list without a decision record.
- **No passwords, keys or tokens in code**, config or docs. Use environment variables
  or a secrets store. If one leaks, treat it as compromised and tell the owner.
- **Licenses:** usage is _shared outside the organization_, so commercial use is assumed.
  Only licenses in `license-policy.json` are allowed
  ([decision 0001](docs/decisions/0001-usage-and-license-policy.md)).
- **Dependencies:** pin exact versions, commit `package-lock.json`, and regenerate
  `sbom.cdx.json` (`npm run sbom`) in the same commit.
- **Run code only from this folder, against its own environment.** Use absolute paths
  or `git -C` / `npm --prefix` rather than a relative `cd`.
- **Infrastructure and data:** before any command that changes infrastructure or data
  (terraform/tofu, kubectl, database tools, cloud CLIs), show the owner the folder,
  workspace/context and account it will act on, and wait for an explicit OK. There is
  no infrastructure today.
- **Sign-in:** none today. If it is ever added, use Moravian institutional SSO, define
  roles and permissions in the app, and map people to roles via SSO groups or manual
  assignment ([decision 0002](docs/decisions/0002-no-sign-in.md)).
- **Assets:** all graphics and sounds are generated in code. No downloaded images,
  fonts or audio, no official Moravian logos, and nothing loaded from the internet
  (`test/assets.test.mjs` enforces this).
- **Music:** only public-domain pieces, with the source recorded in a decision record.
  Take notes from a written score, never from memory
  ([decision 0004](docs/decisions/0004-background-music.md)).
- **Fairness:** game-tuning changes must keep the "attentive player can survive" and
  "every obstacle can be cleared" tests passing. Never loosen them to fit a change.

## Documentation (both kinds are required)

- **Player help** lives in the app: `src/help.js`, shown by the Help button and the H key.
- **Maintainer docs** live in `docs/` (architecture, decisions in `docs/decisions/`,
  runbooks in `docs/runbooks/`) and are published to the wiki on merge to `main`.

## Commands

| Command          | Purpose                          |
| ---------------- | -------------------------------- |
| `npm install`    | Install tools, turn on git hooks |
| `npm start`      | Play at http://localhost:8000    |
| `npm test`       | Tests                            |
| `npm run check`  | Every pipeline check, locally    |
| `npm run format` | Fix formatting                   |
| `npm run sbom`   | Regenerate the SBOM              |

## Current notes

- `package.json` overrides `minimatch` to 11.0.3 for a security fix
  ([decision 0003](docs/decisions/0003-tooling.md)). Remove the override when ESLint ships a fixed dependency.
- Required PR approvals are 0 because the owner is the only collaborator; raise to 1
  when a second maintainer joins.
