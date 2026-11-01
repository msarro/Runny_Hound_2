# Set up your computer

1. Install Node.js at the version in `.node-version` (for example with `nvm` or `brew`).
2. Install gitleaks: `brew install gitleaks`.
3. Clone the repository and, from inside its folder, run `npm install`. This installs
   the tools from `package-lock.json` and turns on the git hooks
   (`git config core.hooksPath .githooks`).
4. Run `npm run check`. Everything should pass.
5. Run `npm start` and open http://localhost:8000.

The hooks:

- **pre-commit** scans the staged changes for passwords and keys.
- **pre-push** refuses pushes to `main` and runs `npm run check`.

Never skip them with `--no-verify`. If a hook is wrong, fix the hook in a pull request.
