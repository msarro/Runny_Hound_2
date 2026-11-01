# Publishing docs to the wiki

The `docs/` folder is the source of truth. The **Publish docs to wiki** workflow
(`.github/workflows/wiki.yml`) copies it to the GitHub wiki whenever a merge to `main`
changes `docs/`, and can be run by hand: Actions > "Publish docs to wiki" > Run
workflow. Edits made directly on the wiki are overwritten by the next publish.

Each file becomes a flat wiki page: `docs/index.md` is **Home**, and
`docs/runbooks/wiki.md` becomes **runbooks-wiki**. Links between docs are rewritten to
match.

## When it fails

Open the failed run in the Actions tab and read the message from the
"Run node scripts/publish-wiki.mjs" step.

| Message                                  | What to do                                                                                                                                                                                        |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| "The wiki has no pages yet"              | Follow the three steps in the message: open the wiki, click **Create the first page**, save it, then re-run the workflow.                                                                         |
| "Could not download the wiki. git said:" | Read git's message. "Authentication failed" means the workflow's token lacks access; check that the workflow still has `contents: write`. Other errors are usually a GitHub outage: re-run later. |

The access token is never printed in these messages.
