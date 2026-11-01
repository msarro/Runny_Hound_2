# 0002: No sign-in, and the SSO rule if that changes

- Status: accepted
- Date: 2026-11-01

## Decision

The game has **no sign-in, no accounts and no roles**. Everyone who opens the page can
play, and nothing is stored about them.

## If sign-in is ever added

For example, a shared high-score board. Then:

1. Sign-in must use Moravian University's institutional single sign-on (SSO). The
   app never stores its own passwords.
2. Roles and what each role can do are defined **in the app's code**, with tests.
3. People are mapped to roles through SSO groups or a manual assignment list that is
   managed outside the code.
4. Client IDs and secrets come from the environment or a secrets store, never from
   the repository.
5. A new decision record replaces this one before any code is written.
