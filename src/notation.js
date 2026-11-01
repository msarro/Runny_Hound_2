// Reads music written as text, one part at a time, e.g. "F4/1 | F4/2 A4/1 | C5/3~ | C5/3".
// Each note is a name with octave (C4 is middle C; # sharp, b flat) or r for a rest,
// then / and its length in beats. ~ ties a note to the next one. | marks a bar line.

const STEPS = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const NOTE = /^(?:([A-G])(#|b)?(-?\d)|r)\/(\d+(?:\.\d+)?)(~?)$/;

function checkBars(bars, { beatsPerBar, pickup = 0 }) {
  bars.forEach((beats, i) => {
    const isFirst = i === 0;
    const isLast = i === bars.length - 1;
    let expected = beatsPerBar;
    if (isFirst && pickup) expected = pickup;
    else if (isLast && pickup) expected = beatsPerBar - pickup;
    if (Math.abs(beats - expected) > 1e-9) {
      throw new Error(`bar ${i + 1} has ${beats} beats, expected ${expected}`);
    }
  });
}

// Returns [[midi or null, beats], ...]. Pass { beatsPerBar, pickup } to check bar lengths.
export function parseVoice(text, barCheck) {
  const notes = [];
  const bars = [0];
  let tied = false;
  for (const token of text.trim().split(/\s+/)) {
    if (token === "|") {
      bars.push(0);
      continue;
    }
    const m = token.match(NOTE);
    if (!m) throw new Error(`can't read note "${token}"`);
    const [, letter, accidental, octave, length, tie] = m;
    const midi = letter
      ? (Number(octave) + 1) * 12 +
        STEPS[letter] +
        (accidental === "#" ? 1 : accidental === "b" ? -1 : 0)
      : null;
    const beats = Number(length);
    bars[bars.length - 1] += beats;
    if (tied) {
      const last = notes[notes.length - 1];
      if (last[0] !== midi) throw new Error(`tie from ${last[0]} to a different pitch "${token}"`);
      last[1] += beats;
    } else {
      notes.push([midi, beats]);
    }
    tied = tie === "~";
  }
  if (barCheck) checkBars(bars, barCheck);
  return notes;
}
