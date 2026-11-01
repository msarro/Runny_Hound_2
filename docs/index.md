# Runny Hound engineering docs

These pages are for people who maintain the project. Player help lives in the game
itself (`src/help.js`). This folder is the source of truth; it is copied to the GitHub
wiki on every merge to `main`, and edits made directly on the wiki are overwritten.

## Architecture

- [Architecture](architecture.md): what the pieces are and how they fit together

## Decisions

- [0001: Usage and license policy](decisions/0001-usage-and-license-policy.md)
- [0002: No sign-in, and the SSO rule if that changes](decisions/0002-no-sign-in.md)
- [0003: Tooling choices](decisions/0003-tooling.md)

## Runbooks

- [Set up your computer](runbooks/local-setup.md)
- [Make a change, from issue to merge](runbooks/making-a-change.md)
- [When a check fails](runbooks/failed-checks.md)
- [Add or update a dependency](runbooks/dependencies.md)
- [Branch protection settings](runbooks/branch-protection.md)
