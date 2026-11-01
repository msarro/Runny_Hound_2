// "In dulci jubilo" ("Good Christian Men, Rejoice") in J. S. Bach's four-part
// harmonization, BWV 368. The melody (1300s) and Bach's setting (1700s) are in the public
// domain. Notes were taken from the BWV 368 score in the Wikipedia article "In dulci
// jubilo" (which credits bach-chorales.com) and re-written in this game's own notation;
// see src/notation.js and docs/decisions/0004-background-music.md.
import { parseVoice } from "./notation.js";

const BARS = { beatsPerBar: 3, pickup: 1 };

export const IN_DULCI_JUBILO = {
  title: "In dulci jubilo (Good Christian Men, Rejoice)",
  arranger: "J. S. Bach",
  catalog: "BWV 368",
  source: "Wikipedia, In dulci jubilo (score from bach-chorales.com, BWV 368)",
  tempo: 138,
  voices: {
    soprano: parseVoice(
      "F4/1 | F4/2 F4/1 | A4/2 Bb4/1 | C5/2 D5/1 | C5/3 | F4/2 F4/1 | A4/2 Bb4/1 | C5/2 D5/1 | C5/3 | C5/2 D5/1 | C5/2 Bb4/1 | A4/1.5 Bb4/0.5 A4/0.5 G4/0.5 | F4/2 F4/1 | G4/2 G4/1 | A4/2 G4/1 | F4/2 G4/1 | A4/3 | C5/2 D5/1 | C5/2 Bb4/1 | A4/1.5 Bb4/0.5 A4/0.5 G4/0.5 | F4/2 F4/1 | G4/2 G4/1 | A4/2 G4/1 | F4/2 G4/1 | A4/3 | D4/2 D4/1 | E4/2 E4/1 | F4/0.5 E4/0.5 F4/0.5 G4/0.5 A4/0.5 Bb4/0.5 | C5/3 | A4/2 A4/1 | G4/2 G4/1 | F4/3~ | F4/2",
      BARS,
    ),
    alto: parseVoice(
      "C4/1 | D4/2 D4/1 | E4/2 E4/1 | F4/3~ | F4/3 | F4/1 E4/1 D4/1 | C4/2 D4/1 | C4/1 E4/1 G4/1 | E4/3 | F4/2 F4/1 | E4/1 F4/1 G4/1 | C#4/1 D4/1 E4/1 | D4/2 F4/1~ | F4/1 E4/0.5 D4/0.5 E4/1 | F4/2 E4/1 | F4/1.5 G4/0.5 F4/0.5 E4/0.5 | F4/3 | F4/2 F4/1 | G4/1 F4/1 G4/1 | G4/1 F4/1 E4/1 | D4/2 F4/1~ | F4/1 E4/0.5 D4/0.5 E4/1 | F4/2 E4/1~ | E4/1 A3/1 D4/1 | C#4/3 | D4/2 D4/1~ | D4/1 C4/0.5 D4/0.5 E4/1~ | E4/1 D4/2 | C4/3 | C4/1 F4/0.5 E4/0.5 F4/1 | F4/2 E4/1 | F4/0.5 Eb4/0.5 D4/0.5 C4/0.5 D4/0.5 Bb3/0.5 | C4/2",
      BARS,
    ),
    tenor: parseVoice(
      "A3/1 | A3/2 Bb3/1 | C4/2 Bb3/1 | A3/2 Bb3/1 | A3/3 | A3/2 Bb3/1 | A3/1 G3/1 F3/1 | G3/1 C4/1 B3/1 | G3/3 | A3/2 Bb3/1 | C4/1 D4/1 E4/1 | A3/1 B3/1 C#4/1 | A3/2 C4/1 | D4/1 Bb3/1 C4/1 | C4/3~ | C4/1 A3/1 C4/1 | C4/3 | A3/2 Bb3/1 | G3/2 E4/1 | E4/1 D4/1 C#4/1 | A3/2 C4/1 | D4/1 Bb3/1 C4/1 | C4/2 C4/1 | A3/2 Bb3/1 | E3/3 | r/0.5 F3/0.5 G3/0.5 A3/0.5 Bb3/0.5 A3/0.5 | G3/1 A3/0.5 Bb3/0.5 C4/0.5 Bb3/0.5 | A3/1.5 G3/0.5 F3/1 | G3/3 | A3/1 Bb3/1 C4/1 | D4/1 Bb3/1 C4/1~ | C4/1 Bb3/0.5 A3/0.5 Bb3/0.5 G3/0.5 | A3/2",
      BARS,
    ),
    bass: parseVoice(
      "F3/1 | D3/1 C3/1 Bb2/1 | A2/1 Bb2/0.5 A2/0.5 G2/0.5 A2/0.5 | F2/0.5 F3/0.5 Eb3/0.5 D3/0.5 C3/0.5 Bb2/0.5 | F3/3 | D3/1 C3/1 Bb2/1 | F3/1 E3/1 D3/1 | E3/1 C3/1 G2/1 | C3/3 | F3/2 Bb3/1 | Bb3/1 A3/1 G3/1 | G3/1 F3/1 E3/1 | D3/2 A2/1 | Bb2/1 G2/1 C3/1 | F2/0.5 G2/0.5 A2/0.5 Bb2/0.5 C3/0.5 Bb2/0.5 | A2/1 F2/1 C2/1 | F2/3 | F3/1 E3/1 D3/1 | E3/1 D3/1 C3/1 | F3/0.5 G3/0.5 A3/1 A2/1 | D3/2 A2/1 | Bb2/1 G2/1 C3/1 | F2/0.5 G2/0.5 A2/0.5 Bb2/0.5 C3/0.5 A2/0.5 | D3/1 C3/1 Bb2/1 | A2/3 | Bb2/1 A2/1 G2/1 | C3/1 Bb2/1 A2/1 | D3/0.5 C3/0.5 D3/0.5 E3/0.5 F3/0.5 D3/0.5 | E3/3 | F2/1 G2/1 A2/1 | Bb2/1 G2/1 C3/1 | A2/1 Bb2/2 | F2/2",
      BARS,
    ),
  },
};
