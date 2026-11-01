# When a check fails

Never turn a check off, weaken a test, or skip hooks to get past a failure. Fix the
cause, or ask the owner.

| Check          | What to do                                                                                                                                                                         |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `format`       | Run `npm run format` and commit.                                                                                                                                                   |
| `lint`         | Read the message; fix the code.                                                                                                                                                    |
| `test`         | Fix the code. Only change a test if the expected behavior truly changed, and say so in the PR.                                                                                     |
| `secrets`      | **Treat the secret as leaked.** Revoke or rotate it with whoever issued it first. Then remove it from the code; if it was committed, the history must be rewritten. Ask the owner. |
| `dependencies` | Update the vulnerable package (`npm update <pkg>` or a newer version). If no fix exists, ask the owner.                                                                            |
| `licenses`     | Replace the dependency with one whose license is allowed. Changing the policy needs a new decision record.                                                                         |
| `sbom`         | Run `npm run sbom` and commit `sbom.cdx.json`.                                                                                                                                     |
