# 0004: Background music

- Status: accepted
- Date: 2026-11-01

## Context

Runny Hound 1 had background music: an original chorale voiced like a Moravian trombone
choir, toggled with N. The owner asked for music that is meaningful to Moravian
University: something from Moravian vespers ("Good Christian Men, Rejoice", "Morning
Star") or something by Bach, who matters to Bethlehem through the Bach Choir (founded
1898).

## Decision

Play **"In dulci jubilo"** ("Good Christian Men, Rejoice") in **J. S. Bach's four-part
harmonization, BWV 368**, voiced like a **Moravian trombone choir** (soprano, alto,
tenor, bass trombones), synthesized with Web Audio. One piece covers all three
connections: a carol sung at Moravian Christmas Eve vespers, a Bach chorale, and the
trombone-choir tradition.

- **Copyright:** the melody (1300s) and Bach's harmonization (1700s) are in the public
  domain.
- **Source of the notes:** the BWV 368 score in the Wikipedia article "In dulci jubilo",
  which credits bach-chorales.com. It was converted by a one-off script into this
  game's own text notation (`src/score.js`, read by `src/notation.js`). No text or
  layout from the article was copied.
- **Checks on the data:**
  - Every bar of every part is checked when the game loads.
  - The tests check that the four parts are the same length, the opening melody, the
    trombone ranges, and that the melody stays on top and the bass at the bottom on
    every beat. The alto crosses above the melody for one eighth note in bar 15, as
    Bach wrote it.
- **Behavior:** music plays only during a run. It stops on a crash, on pause, while help
  is open and when the tab is hidden. It restarts from the top each run, resumes after a
  pause, and loops seamlessly. N toggles it (remembered); M silences everything.
- **Tempo:** quarter note = 138, a brisk 3/4 that suits running. One pass is about 42
  seconds.

## Not chosen (yet)

**"Morning Star"** (Francis F. Hagen, 1836) is the most Moravian choice, but no
public-domain score in a machine-readable form was found, and modern hymnal editions are
copyrighted. Writing it down from memory risks a wrong melody. Add it later from a
public-domain source (for example the 1891 _Offices of Worship_ on IMSLP or Hymnary.org
page images).

## Consequences

- To add another piece, write it in the same notation in a new score file and pass it
  to `createMusicPlayer`. The bar check and score tests apply to it.
- No audio files are added; `test/assets.test.mjs` still forbids them.
