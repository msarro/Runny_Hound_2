# 0005: Project license, CC BY-NC-ND 4.0

- Status: accepted
- Date: 2026-11-01
- Updates: [0001](0001-usage-and-license-policy.md), which said the project had no
  license yet

## Context

Runny Hound is used for a lecture demonstration and is shared outside the organization
(see 0001). It needed a license saying what other people may do with it.

## Decision

The owner chose **Creative Commons Attribution-NonCommercial-NoDerivatives 4.0
International (CC BY-NC-ND 4.0)**. The licensor is **Matty Sarro**, © 2026.

- Others may copy and share the game **unchanged**, for **non-commercial** purposes,
  with **credit** to the author.
- Others may **not** share modified versions or use it commercially without permission.
- `LICENSE` contains the official legal code, downloaded from
  creativecommons.org (`legalcode.txt`), unmodified. Its SHA-256 at download was
  `38762e3777f4ec00a6f769062a7c3f704fb78ce08303ecff88558da4c49cf9ea`.
- `package.json` uses the SPDX id `CC-BY-NC-ND-4.0`, so the SBOM records it too.
- The README and the in-app help (About) state the license and the licensor.
- `test/project-license.test.mjs` checks that all of these agree.

## What the license does not cover

- **Public domain material.** The music, _In dulci jubilo_ in J. S. Bach's
  harmonization (BWV 368), is in the public domain (see
  [0004](0004-background-music.md)). CC licenses only apply to rights the licensor holds.
- **Trademarks.** The license grants no rights to Moravian University's names or
  symbols (Section 2(b)(2) of the legal code). The game remains a fan-made demo.

## Things considered

- **Creative Commons advises against its licenses for software**, because they don't
  address source code or patents. Accepted here: the goal is to control reuse of a
  demonstration, not to build a software community.
- **NoDerivatives** means students may change the game on their own computers but may
  not share modified copies. If remixing should be allowed later, CC BY-NC-SA 4.0 is the
  closest alternative. Changing the license needs a new decision record.
- **Dependency policy unchanged.** This license limits what _others_ may do. The owner
  can still use the work commercially, so commercial use stays possible and the
  dependency policy in 0001 still allows only permissive licenses. A test guards this.
