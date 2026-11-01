# 0001: Usage and license policy

- Status: accepted
- Date: 2026-11-01

## Context

The owner was asked how the software will be used: internal only, commercial, shared
outside the organization, or open source.

## Decision

**Usage: shared outside the organization** (for example, demos for people who are not
Moravian staff or students). Because the code leaves the organization and commercial
use cannot be ruled out, we **assume commercial use**.

Only **permissive** licenses are allowed for dependencies, listed in
`license-policy.json`: 0BSD, Apache-2.0, BlueOak-1.0.0, BSD-2-Clause, BSD-3-Clause,
CC0-1.0, ISC, MIT, MIT-0, Unlicense, Zlib.

Rejected: anything copyleft or with use restrictions (GPL, LGPL, AGPL, MPL, EPL, EUPL,
CDDL, SSPL, BUSL, Commons Clause, CC-BY-NC, CC-BY-SA), and any package with a missing,
custom or unreadable license. The check fails closed: unknown means rejected.

The license check (`npm run licenses`) runs on every push and pull request. A test
(`test/licenses.test.mjs`) fails if a copyleft license is ever added to the allowed list.

## Consequences

- Adding a license to the allowed list needs a new decision record and owner approval.
- MPL-2.0 does permit commercial use, but it adds sharing obligations, so it is
  excluded. That is why the project uses Node's built-in test runner instead of
  Vitest, which pulls in MPL-2.0 packages (see [0003](0003-tooling.md)).
- The project itself had no license at first. **Updated by
  [0005](0005-project-license.md):** it is now licensed under CC BY-NC-ND 4.0. That
  does not change the dependency policy above.
- Moravian University names, colors and symbols (such as the Moravian Star) are used
  as inspiration for original art. Official logos are not used. Get university
  approval before any official or public-facing release.
