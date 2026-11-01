# Add or update a dependency

1. Prefer no new dependency. The game is meant to have none at runtime.
2. Check the package's license against `license-policy.json` before installing.
3. `npm install --save-exact <pkg>` (add `--save-dev` for tools).
4. `npm run sbom` to regenerate `sbom.cdx.json`.
5. `npm run check`, then commit `package.json`, `package-lock.json` and `sbom.cdx.json`
   together.

GitHub Dependabot alerts are on for this repository. When one appears, open an issue
and follow the steps above.
