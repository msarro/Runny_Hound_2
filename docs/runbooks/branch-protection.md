# Branch protection settings

`main` is protected on GitHub (Settings, then Branches) with:

- Pull request required before merging. Required approvals: **0**, because GitHub does
  not allow approving your own pull request and the owner is currently the only
  collaborator. The owner reviews and merges by hand. Raise this to 1 when a second
  maintainer joins.
- Required status checks, branch must be up to date: `format`, `lint`, `test`,
  `secrets`, `dependencies`, `licenses`, `sbom` (the job names in
  `.github/workflows/ci.yml`).
- Rules apply to administrators too.
- Linear history, conversations must be resolved, no force pushes, no deletion.

Repository settings: squash merging only; branches are deleted after merge.

To re-apply from the command line (owner only):

```sh
gh api repos/msarro/Runny_Hound_2/branches/main/protection
```
