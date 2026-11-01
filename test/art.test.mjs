import { test } from "node:test";
import assert from "node:assert/strict";
import { drawScene, OBSTACLE_ART, wrapText } from "../src/art.js";
import { createGame, press, step } from "../src/game.js";
import { OBSTACLE_TYPES, createObstacle } from "../src/obstacles.js";
import { createRng } from "../src/random.js";

const METHODS = new Set(
  "save restore scale rotate translate transform setTransform resetTransform createLinearGradient createRadialGradient clearRect fillRect strokeRect beginPath closePath moveTo lineTo bezierCurveTo quadraticCurveTo arc arcTo ellipse rect roundRect fill stroke clip fillText strokeText measureText setLineDash".split(
    " ",
  ),
);
const PROPS = new Set(
  "fillStyle strokeStyle lineWidth lineCap lineJoin font textAlign textBaseline globalAlpha shadowBlur shadowColor shadowOffsetX shadowOffsetY globalCompositeOperation".split(
    " ",
  ),
);

// A strict pretend canvas: it fails on misspelled methods, unknown properties and
// NaN/Infinity coordinates, which a real canvas would silently ignore.
function strictContext() {
  const calls = [];
  const texts = [];
  const state = { font: "10px sans-serif" };
  const gradient = { addColorStop: (o) => assert.ok(o >= 0 && o <= 1, `color stop ${o}`) };
  return new Proxy(state, {
    get(target, key) {
      if (key === "calls") return calls;
      if (key === "texts") return texts;
      if (key === "canvas") return { width: 960, height: 320 };
      if (PROPS.has(key)) return target[key];
      if (!METHODS.has(key)) throw new Error(`canvas has no method "${String(key)}"`);
      return (...args) => {
        for (const a of args) {
          if (typeof a === "number") assert.ok(Number.isFinite(a), `${key} got ${a}`);
        }
        calls.push(key);
        if (key === "fillText") texts.push(args[0]);
        if (key === "measureText") return { width: String(args[0]).length * 8 };
        if (key.startsWith("create")) return gradient;
        return undefined;
      };
    },
    set(target, key, value) {
      if (!PROPS.has(key)) throw new Error(`canvas has no property "${String(key)}"`);
      if (typeof value === "number") assert.ok(Number.isFinite(value), `${key} = ${value}`);
      target[key] = value;
      return true;
    },
  });
}

const countDrawing = (ctx) => ctx.calls.filter((c) => /fill|stroke/.test(c)).length;

test("every obstacle has a drawing", () => {
  assert.deepEqual(Object.keys(OBSTACLE_ART).sort(), OBSTACLE_TYPES.map((t) => t.id).sort());
});

test("the title screen draws", () => {
  const ctx = strictContext();
  drawScene(ctx, createGame({ rng: createRng(1) }), 0);
  assert.ok(countDrawing(ctx) > 50);
});

test("a running scene with every obstacle draws, at many moments in time", () => {
  const game = createGame({ rng: createRng(1) });
  press(game);
  game.obstacles = OBSTACLE_TYPES.map((t, i) => createObstacle(t, 200 + i * 140));
  for (let t = 0; t < 3; t += 0.37) {
    step(game, 1 / 60);
    drawScene(strictContext(), game, t);
  }
});

test("the paused and game-over screens draw", () => {
  const game = createGame({ rng: createRng(1) });
  press(game);
  game.paused = true;
  drawScene(strictContext(), game, 1);
  game.paused = false;
  while (game.phase !== "over") step(game, 1 / 120);
  const ctx = strictContext();
  drawScene(ctx, game, 2);
  assert.ok(ctx.calls.includes("fillText"));
});

test("long text wraps to fit and keeps every word", () => {
  const measure = (s) => s.length * 8;
  const text = "Bethlehem has called itself Christmas City USA since 1937 and still does";
  const lines = wrapText(measure, text, 200);
  assert.ok(lines.length > 1);
  for (const line of lines) assert.ok(measure(line) <= 200, line);
  assert.equal(lines.join(" "), text);
});

const KEYS_HINT = "[M] mute  [N] music  [P] pause";
const textsFor = (game, time, options) => {
  const ctx = strictContext();
  drawScene(ctx, game, time, options);
  return ctx.texts;
};
function crashedGame({ newBest = false } = {}) {
  const game = createGame({ rng: createRng(1) });
  press(game);
  while (game.phase !== "over") step(game, 1 / 120);
  game.crashedInto = OBSTACLE_TYPES.find((t) => t.id === "star");
  game.newHighScore = newBest;
  return game;
}

test("the status line always shows sound and music, with their keys", () => {
  const game = createGame({ rng: createRng(1) });
  assert.ok(textsFor(game, 0, { musicOn: true }).includes(`SOUND ON · MUSIC ON   ${KEYS_HINT}`));
  assert.ok(textsFor(game, 0, { musicOn: false }).includes(`SOUND ON · MUSIC OFF   ${KEYS_HINT}`));
  assert.ok(textsFor(game, 0, { muted: true, musicOn: true }).includes(`SOUND OFF   ${KEYS_HINT}`));
});

test("the title screen matches Runny Hound 1", () => {
  const game = createGame({ rng: createRng(1) });
  const texts = textsFor(game, 0);
  assert.ok(texts.includes("RUNNY HOUND"));
  assert.ok(texts.includes("A Greyhound’s dash through Bethlehem, PA — the Christmas City"));
  assert.ok(texts.includes("PRESS SPACE OR TAP TO RUN"));
  assert.ok(
    texts.some((s) => s.startsWith("SPACE / ↑ jump (hold for higher)") && s.includes("H help")),
  );
  assert.ok(!textsFor(game, 0.5).includes("PRESS SPACE OR TAP TO RUN"), "the prompt blinks");
});

test("the game-over screen says RUFF LANDING!, what you hit, the fact and the scores", () => {
  const game = crashedGame({ newBest: true });
  game.overTime = 1;
  const texts = textsFor(game, 0);
  assert.ok(texts.includes("RUFF LANDING!"));
  assert.ok(texts.includes("Your Greyhound tripped over a Moravian Star."));
  assert.ok(texts.join(" ").includes(game.crashedInto.fact));
  const scores = texts.find((s) => s.startsWith("SCORE "));
  assert.ok(scores && scores.includes("BEST ") && scores.includes("★ NEW!"), scores);
  assert.ok(texts.includes("PRESS SPACE OR TAP TO RUN AGAIN"));
});

test("the game-over screen only says NEW! for a new best, and waits before offering a restart", () => {
  const game = crashedGame({ newBest: false });
  game.overTime = 0.1;
  const texts = textsFor(game, 0);
  assert.ok(!texts.some((s) => s.includes("NEW!")));
  assert.ok(!texts.includes("PRESS SPACE OR TAP TO RUN AGAIN"));
});

test("the paused screen tells players how to resume", () => {
  const game = createGame({ rng: createRng(1) });
  press(game);
  game.paused = true;
  const texts = textsFor(game, 0);
  assert.ok(texts.includes("PAUSED"));
  assert.ok(texts.includes("Press P, SPACE or tap to resume"));
});

test("the score blinks at a milestone, showing the round hundred", () => {
  const game = createGame({ rng: createRng(1) });
  press(game);
  game.score = 213;
  game.flash = 1.0; // blink off
  assert.ok(!textsFor(game, 0).some((s) => s === "00213" || s === "00200"));
  game.flash = 0.9; // blink on
  assert.ok(textsFor(game, 0).includes("00200"));
  game.flash = 0;
  assert.ok(textsFor(game, 0).includes("00213"));
});
