# 0006: Parity with Runny Hound 1

- Status: accepted (part 1: page and screens; part 2: gameplay)
- Date: 2026-11-01

## Context

The owner wants the two versions of the game to give the same experience. Runny Hound 1
(a separate repository) has a light page with a navy header, "How to play" and "Meet the
obstacles" sections, a footer, touch buttons, and specific in-game screens ("RUFF
LANDING!", "★ NEW!", a status line). It also has gameplay this version lacked: ducking,
flying stars and marshmallow chicks.

## Decisions (owner's choices)

1. **Full parity, gameplay included**, in two pull requests: page and screens first,
   then gameplay.
2. **Keep the Help button and H key** in addition to Runny Hound 1's page sections. The
   page sections are built from the same data as help (`src/obstacles.js`,
   `src/input.js`), so they cannot drift apart.
3. **Allow ordinary clickable links.** `test/assets.test.mjs` used to reject any web
   address in the page, which also blocked the footer's license link. It now rejects only
   what the page would _load_ by itself (scripts, styles, images, fonts, fetches, CSS
   `url()`, imports) and allows `<a href="https://…">` links, which load nothing until
   clicked. The checker has its own tests for both halves. Approved by the owner before
   the change.

## Details

- Colors are now Runny Hound 1's (`#002b5c` navy, `#1d4f91` blue, `#a9b0b7` grey,
  `#f4b223` gold, `#e9ecef` page, `#1b2430` ink). They are still approximations of
  Moravian branding.
- Space or a tap now **resumes** a paused run, and Esc also pauses, as in Runny Hound 1.
  The test that expected Space to be ignored while paused was changed to expect this.
- The status line ("SOUND ON · MUSIC ON …") is always shown, replacing the old
  "Music off (N)" notice. Its test was changed to match.
- Obstacles gained a `phrase` ("a Moravian Star"). The old game-over text lowercased
  proper names ("a moravian star", "a bethlehem steel beams").

## Part 2: gameplay

- **Duck** (↓ or S, ▼ Duck button on touch screens): crouches on the ground (lower
  hitbox), drops faster in the air (gravity × 3.2, as in Runny Hound 1).
- **Flying Moravian Stars** from 300 points at three heights: low (jump), middle (duck
  under), high (run under). They bob by 4 pixels and get 80 pixels of extra room.
- **Marshmallow chicks**, and **groups** of up to three chicks or candles: up to two
  before 150 points, up to three after (Runny Hound 1's rule).
- Obstacles unlock with the score: candles, chicks, books and stars from the start;
  beams and trees from 150; flying stars from 300. The Christmas tree, which Runny Hound
  1 does not have, stays.
- **Jump buffer**: a jump pressed up to 0.13 s before landing happens on landing.
- **Effects**: dust while running, puffs on jump and landing, sparks and stars plus a
  screen shake on a crash; landing and ducking sounds. Effects use their own random
  numbers, so they never change the course.
- **One deliberate difference:** Runny Hound 1's flying stars move 45 px/s faster than
  the ground. That can leave less room after the previous obstacle than a jump plus
  reaction time, which the fairness tests forbid. Here they move with the ground.
- Fairness tests were extended rather than loosened: every group size and star height
  must be passable at every speed by running, ducking or jumping, and the simulated
  player (now also ducking) must survive two minutes on five courses and meet every
  obstacle, a group of three, and all three star heights.

## Not matched

- Runny Hound 1's scenery and day/night sky cycle. These are artwork
  rather than UI or gameplay; this version keeps its own Bethlehem night scene.
