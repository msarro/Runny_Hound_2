# 0003: Tooling choices

- Status: accepted
- Date: 2026-11-01

| Need                    | Choice                                                | Why                                              |
| ----------------------- | ----------------------------------------------------- | ------------------------------------------------ |
| Game                    | Plain JavaScript modules, Canvas, Web Audio           | No build step, no runtime dependencies           |
| Tests                   | `node --test` (built into Node)                       | No extra packages; Vitest brings in MPL-2.0 code |
| Formatting              | Prettier                                              | Standard, zero debate                            |
| Linting                 | ESLint (recommended rules)                            | Catches common mistakes                          |
| Secret scan             | gitleaks, pinned and checksum-verified in CI          | Scans every commit, not only the latest          |
| Vulnerable dependencies | `npm audit --audit-level=low`                         | Built in; fails on any known advisory            |
| License check + SBOM    | `npm sbom` (CycloneDX) + `scripts/check-licenses.mjs` | Built in; one source of truth                    |
| Local checks            | Git hooks in `.githooks/`, turned on by `npm install` | No extra packages                                |

## Notes

- **minimatch override.** ESLint 10.14.0 depends on `minimatch@^10.2.4`, which has a
  moderate denial-of-service advisory (GHSA-g3hv-75wg-m249). `package.json` forces
  `minimatch@11.0.3` through `overrides`, and ESLint works with it. Remove the override
  once ESLint depends on a fixed version itself.
- **SBOM is generated from the lockfile** (`--package-lock-only`), so it is identical on
  macOS and Linux. Random serial numbers, timestamps and tool versions are removed so
  the file only changes when dependencies change.
- **GitHub Actions are pinned to commit SHAs**, so a moved tag cannot change what runs.
- **Infrastructure:** none. If any is added (Terraform/OpenTofu, kubectl, databases),
  the rules in AGENTS.md apply: show the folder, workspace and account, and wait for
  the owner's OK before any command that changes something.
