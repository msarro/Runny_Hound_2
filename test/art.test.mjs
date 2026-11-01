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
  const state = { font: "10px sans-serif" };
  const gradient = { addColorStop: (o) => assert.ok(o >= 0 && o <= 1, `color stop ${o}`) };
  return new Proxy(state, {
    get(target, key) {
      if (key === "calls") return calls;
      if (key === "canvas") return { width: 960, height: 320 };
      if (PROPS.has(key)) return target[key];
      if (!METHODS.has(key)) throw new Error(`canvas has no method "${String(key)}"`);
      return (...args) => {
        for (const a of args) {
          if (typeof a === "number") assert.ok(Number.isFinite(a), `${key} got ${a}`);
        }
        calls.push(key);
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
