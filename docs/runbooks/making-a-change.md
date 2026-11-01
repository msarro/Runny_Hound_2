# Make a change, from issue to merge

1. **Issue.** Open (or pick) a GitHub issue describing the change and what "done" means.
2. **Branch.** `git switch main && git pull && git switch -c <issue-number>-<short-name>`.
3. **Test first.** Write or extend a test in `test/`. Run `npm test` and confirm it
   **fails** for the right reason. Note the failure in the issue.
4. **Code.** Write the smallest change that makes the test pass.
5. **Check.** `npm run check`. If dependencies changed, `npm run sbom` and commit the SBOM.
6. **Docs.** Update player help (`src/help.js`) if anything a player sees changed, and
   `docs/` and `README.md` if anything a maintainer needs to know changed.
7. **Push and open a PR** with `Closes #<issue>` in the description. Comment on the
   issue with the PR link.
8. **Merge.** The owner reviews and merges once every check is green. The branch is
   deleted automatically.
9. **Wrap up.** Make sure the issue is closed or updated, and remove anything stale
   from AGENTS.md.
