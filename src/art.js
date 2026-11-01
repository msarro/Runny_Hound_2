// Everything on screen is drawn here with Canvas 2D paths; there are no image files.
import { WORLD } from "./config.js";
import { HOUND } from "./hound.js";
import { RESTART_DELAY } from "./game.js";
import { PALETTE as C } from "./palette.js";

const { width: W, height: H, groundY: GROUND } = WORLD;
const TAU = Math.PI * 2;

// Repeatable pseudo-random number in [0, 1) for decoration positions.
const hash = (n) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};
const mod = (a, b) => ((a % b) + b) % b;

export function wrapText(measure, text, maxWidth) {
  const lines = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && measure(candidate) > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

// A Moravian Star seen face-on: many points, each split light/dark so it looks 3D.
export function drawMoravianStar(ctx, cx, cy, radius, { points = 12, glow = 0 } = {}) {
  if (glow > 0) {
    const g = ctx.createRadialGradient(cx, cy, radius * 0.3, cx, cy, radius * (1.6 + glow));
    g.addColorStop(0, "rgba(242, 199, 92, 0.55)");
    g.addColorStop(1, "rgba(242, 199, 92, 0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * (1.6 + glow), 0, TAU);
    ctx.fill();
  }
  const inner = radius * 0.38;
  for (let i = 0; i < points; i++) {
    const a = (i / points) * TAU - Math.PI / 2;
    const left = a - Math.PI / points;
    const right = a + Math.PI / points;
    const tipX = cx + Math.cos(a) * radius;
    const tipY = cy + Math.sin(a) * radius;
    for (const [side, color] of [
      [left, C.starGold],
      [right, C.starGoldDeep],
    ]) {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(side) * inner, cy + Math.sin(side) * inner);
      ctx.lineTo(tipX, tipY);
      ctx.closePath();
      ctx.fill();
    }
  }
}

// ---------- Background ----------

function drawSky(ctx, time) {
  const sky = ctx.createLinearGradient(0, 0, 0, GROUND);
  sky.addColorStop(0, C.nightTop);
  sky.addColorStop(0.55, C.moravianBlue);
  sky.addColorStop(1, C.skyHorizon);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, GROUND);

  for (let i = 0; i < 70; i++) {
    ctx.globalAlpha = 0.35 + 0.45 * (0.5 + 0.5 * Math.sin(time * (1 + hash(i + 9) * 2) + i));
    ctx.fillStyle = C.snow;
    ctx.fillRect(hash(i) * W, hash(i + 100) * 150, 1.5, 1.5);
  }
  ctx.globalAlpha = 1;
}

const FAR_PERIOD = 1920;
const ridgeY = (x) =>
  176 +
  16 * Math.sin((TAU * 2 * x) / FAR_PERIOD) +
  9 * Math.sin((TAU * 5 * x) / FAR_PERIOD + 1) +
  4 * Math.sin((TAU * 11 * x) / FAR_PERIOD + 2);

// South Mountain, with the big star that shines over Bethlehem.
function drawMountain(ctx, distance, time) {
  const offset = mod(distance * 0.06, FAR_PERIOD);
  ctx.fillStyle = C.mountain;
  ctx.beginPath();
  ctx.moveTo(0, GROUND);
  for (let x = 0; x <= W; x += 16) ctx.lineTo(x, ridgeY(x + offset));
  ctx.lineTo(W, GROUND);
  ctx.closePath();
  ctx.fill();

  for (const base of [0, FAR_PERIOD]) {
    const x = 640 + base - offset;
    if (x < -60 || x > W + 60) continue;
    const y = ridgeY(x + offset) - 26;
    ctx.strokeStyle = C.skyline;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y + 10);
    ctx.lineTo(x, y + 28);
    ctx.stroke();
    drawMoravianStar(ctx, x, y, 13, { points: 8, glow: 0.6 + 0.15 * Math.sin(time * 1.5) });
  }
}

const MID_PERIOD = 1400;

function rowhouses(ctx, x, count, time, seed) {
  for (let i = 0; i < count; i++) {
    const w = 44;
    const h = 52 + hash(seed + i) * 26;
    const left = x + i * w;
    const top = GROUND - h;
    ctx.fillStyle = C.skyline;
    ctx.beginPath();
    ctx.moveTo(left, GROUND);
    ctx.lineTo(left, top);
    ctx.lineTo(left + w / 2, top - 14);
    ctx.lineTo(left + w, top);
    ctx.lineTo(left + w, GROUND);
    ctx.closePath();
    ctx.fill();
    ctx.fillRect(left + 30, top - 14, 6, 10); // chimney
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 2; col++) {
        const lit = hash(seed * 7 + i * 4 + row * 2 + col) > 0.35;
        if (!lit) continue;
        ctx.globalAlpha = 0.75 + 0.2 * Math.sin(time * 0.7 + i + row);
        ctx.fillStyle = C.windowGlow;
        ctx.fillRect(left + 8 + col * 18, top + 10 + row * 20, 9, 12);
      }
    }
    ctx.globalAlpha = 1;
  }
}

// A church with a tall belfry, in the spirit of Central Moravian Church.
function belfryChurch(ctx, x) {
  ctx.fillStyle = C.skyline;
  ctx.fillRect(x, GROUND - 70, 130, 70);
  ctx.beginPath();
  ctx.moveTo(x - 6, GROUND - 70);
  ctx.lineTo(x + 65, GROUND - 98);
  ctx.lineTo(x + 136, GROUND - 70);
  ctx.closePath();
  ctx.fill();
  const tx = x + 50;
  ctx.fillRect(tx, GROUND - 150, 30, 80); // tower
  ctx.fillRect(tx + 4, GROUND - 172, 22, 22); // belfry
  ctx.beginPath();
  ctx.moveTo(tx + 2, GROUND - 172);
  ctx.quadraticCurveTo(tx + 15, GROUND - 196, tx + 28, GROUND - 172);
  ctx.closePath();
  ctx.fill();
  ctx.fillRect(tx + 14, GROUND - 210, 2, 22); // spire
  ctx.fillStyle = C.windowGlow;
  ctx.globalAlpha = 0.8;
  ctx.fillRect(tx + 11, GROUND - 166, 8, 12); // lit belfry opening
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.roundRect(x + 10 + i * 30, GROUND - 52, 10, 26, [5, 5, 0, 0]);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// The SteelStacks: the old Bethlehem Steel blast furnaces.
function blastFurnaces(ctx, x) {
  ctx.fillStyle = "#0a1d36";
  const furnaces = [
    [0, 150],
    [70, 168],
    [140, 158],
    [210, 172],
  ];
  for (const [dx, h] of furnaces) {
    const left = x + dx;
    ctx.fillRect(left, GROUND - h, 34, h);
    ctx.fillRect(left - 5, GROUND - h * 0.62, 44, 12); // bustle pipe
    ctx.fillRect(left + 12, GROUND - h - 26, 10, 26); // stack
    ctx.fillRect(left + 34, GROUND - h * 0.8, 36, 6); // connecting pipe
  }
  ctx.fillRect(x - 20, GROUND - 40, 300, 40);
  ctx.fillStyle = C.rust;
  ctx.globalAlpha = 0.35;
  for (const [dx, h] of furnaces) ctx.fillRect(x + dx + 26, GROUND - h, 4, h - 40);
  ctx.globalAlpha = 1;
}

function drawSkyline(ctx, distance, time) {
  const offset = mod(distance * 0.3, MID_PERIOD);
  for (const base of [0, MID_PERIOD]) {
    const x0 = base - offset;
    if (x0 > W || x0 + MID_PERIOD < 0) continue;
    rowhouses(ctx, x0 + 20, 5, time, 1);
    belfryChurch(ctx, x0 + 300);
    rowhouses(ctx, x0 + 480, 4, time, 20);
    blastFurnaces(ctx, x0 + 760);
    rowhouses(ctx, x0 + 1110, 5, time, 40);
  }
}

function drawSnow(ctx, distance, time) {
  ctx.fillStyle = C.snow;
  for (let i = 0; i < 60; i++) {
    const speed = 18 + hash(i + 50) * 24;
    const x = mod(hash(i) * W - distance * 0.45 - time * 12 + Math.sin(time + i) * 8, W);
    const y = mod(hash(i + 200) * H + time * speed, H);
    ctx.globalAlpha = 0.5 + hash(i + 300) * 0.4;
    ctx.beginPath();
    ctx.arc(x, y, 1 + hash(i + 400) * 1.6, 0, TAU);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// Bethlehem's brick sidewalks, with a snowy curb.
function drawGround(ctx, distance) {
  const brickW = 30;
  const brickH = 11;
  ctx.fillStyle = C.mortar;
  ctx.fillRect(0, GROUND, W, H - GROUND);
  for (let row = 0; GROUND + 6 + row * brickH < H; row++) {
    const y = GROUND + 6 + row * brickH;
    const shift = distance + (row % 2) * (brickW / 2);
    const first = Math.floor(shift / brickW);
    for (let i = first; i * brickW - shift < W; i++) {
      ctx.fillStyle = hash(i * 13 + row) > 0.5 ? C.brick : C.brickDark;
      ctx.fillRect(i * brickW - shift + 1, y + 1, brickW - 2, brickH - 2);
    }
  }
  ctx.fillStyle = C.curb;
  ctx.fillRect(0, GROUND, W, 6);
  ctx.fillStyle = C.snow;
  ctx.fillRect(0, GROUND - 1, W, 3);
}

// ---------- Obstacles ----------

function candle(ctx, x, base, w, h, time) {
  const cx = x + w / 2;
  const top = base - h;
  const flicker = 1 + 0.15 * Math.sin(time * 23) + 0.1 * Math.sin(time * 37);
  const glow = ctx.createRadialGradient(cx, top + 8, 1, cx, top + 8, 22 * flicker);
  glow.addColorStop(0, "rgba(255, 196, 92, 0.6)");
  glow.addColorStop(1, "rgba(255, 196, 92, 0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(cx, top + 8, 22 * flicker, 0, TAU);
  ctx.fill();

  ctx.fillStyle = C.flame;
  ctx.beginPath();
  ctx.moveTo(cx, top);
  ctx.quadraticCurveTo(cx + 5, top + 9 * flicker, cx, top + 13);
  ctx.quadraticCurveTo(cx - 5, top + 9 * flicker, cx, top);
  ctx.fill();
  ctx.fillStyle = C.nose;
  ctx.fillRect(cx - 0.5, top + 12, 1, 3);

  ctx.fillStyle = C.wax;
  ctx.fillRect(cx - 6, top + 15, 12, h - 15);
  ctx.fillStyle = C.waxShade;
  ctx.fillRect(cx + 2, top + 15, 4, h - 15);

  // Red paper frill.
  ctx.fillStyle = C.lovefeastRed;
  ctx.beginPath();
  ctx.moveTo(x, base);
  for (let i = 0; i <= 6; i++) ctx.lineTo(x + (i * w) / 6, base - (i % 2 ? 18 : 12));
  ctx.lineTo(x + w, base);
  ctx.closePath();
  ctx.fill();
}

function books(ctx, x, base, w) {
  const stack = [
    { dx: 0, width: w, color: C.coatBlue },
    { dx: 4, width: w - 8, color: C.bookGrey },
    { dx: -2, width: w - 4, color: C.starGoldDeep },
  ];
  stack.forEach((book, i) => {
    const y = base - (i + 1) * 13;
    ctx.fillStyle = C.pages;
    ctx.fillRect(x + book.dx + 2, y + 2, book.width - 4, 9);
    ctx.fillStyle = book.color;
    ctx.fillRect(x + book.dx, y, book.width, 3);
    ctx.fillRect(x + book.dx, y + 10, book.width, 3);
    ctx.fillRect(x + book.dx, y, 5, 13);
    ctx.fillStyle = C.starGold;
    ctx.fillRect(x + book.dx + 1, y + 5, 3, 3);
  });
}

function starOnStand(ctx, x, base, w, h, time) {
  const cx = x + w / 2;
  const cy = base - h + w / 2;
  ctx.fillStyle = C.trunk;
  ctx.fillRect(cx - 2, cy, 4, base - cy);
  ctx.fillRect(cx - 12, base - 4, 24, 4);
  drawMoravianStar(ctx, cx, cy, w / 2, { points: 12, glow: 0.3 + 0.1 * Math.sin(time * 3) });
}

function beams(ctx, x, base, w, h) {
  const beamH = h / 2;
  for (let i = 0; i < 2; i++) {
    const top = base - (i + 1) * beamH;
    const left = x + (i ? 6 : 0);
    const width = w - (i ? 12 : 0);
    ctx.fillStyle = C.steel;
    ctx.fillRect(left, top, width, beamH);
    ctx.fillStyle = C.rust;
    ctx.fillRect(left, top, width, 4);
    ctx.fillRect(left, top + beamH - 4, width, 4);
    ctx.fillStyle = C.curb;
    for (let r = left + 8; r < left + width - 4; r += 14) {
      ctx.beginPath();
      ctx.arc(r, top + beamH / 2, 1.5, 0, TAU);
      ctx.fill();
    }
    // The I-shaped end of the beam.
    ctx.fillStyle = "#2c333c";
    ctx.fillRect(left, top, 10, 4);
    ctx.fillRect(left + 3.5, top, 3, beamH);
    ctx.fillRect(left, top + beamH - 4, 10, 4);
  }
}

function tree(ctx, x, base, w, h, time) {
  const cx = x + w / 2;
  ctx.fillStyle = C.trunk;
  ctx.fillRect(cx - 4, base - 10, 8, 10);
  const tiers = [
    [base - 8, w / 2, 30],
    [base - 28, w * 0.4, 28],
    [base - 46, w * 0.3, 26],
  ];
  for (const [bottom, half, height] of tiers) {
    ctx.fillStyle = C.pine;
    ctx.beginPath();
    ctx.moveTo(cx - half, bottom);
    ctx.lineTo(cx, bottom - height);
    ctx.lineTo(cx + half, bottom);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = C.pineLight;
    ctx.beginPath();
    ctx.moveTo(cx, bottom - height);
    ctx.lineTo(cx + half, bottom);
    ctx.lineTo(cx + half * 0.3, bottom);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = C.snow;
    ctx.fillRect(cx - half, bottom - 2, half * 2, 2);
  }
  for (let i = 0; i < 9; i++) {
    const t = hash(i + 5);
    const ly = base - 12 - t * 54;
    const spread = ((base - ly) / h) * (w / 2) * 0.8;
    const lx = cx + (hash(i + 20) - 0.5) * 2 * (w / 2 - spread * 0.6);
    ctx.globalAlpha = 0.6 + 0.4 * Math.sin(time * 4 + i * 1.7);
    ctx.fillStyle = i % 2 ? C.windowGlow : C.snow;
    ctx.beginPath();
    ctx.arc(lx, ly, 1.8, 0, TAU);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  drawMoravianStar(ctx, cx, base - h + 8, 8, { points: 8, glow: 0.4 });
}

export const OBSTACLE_ART = { candle, books, star: starOnStand, beams, tree };

function drawObstacles(ctx, game, time) {
  for (const o of game.obstacles) {
    OBSTACLE_ART[o.type.id](ctx, o.x, GROUND, o.type.width, o.type.height, time);
  }
}

// ---------- The greyhound ----------

// One leg as two segments: thigh/upper arm, then lower leg, ending in a paw.
function leg(ctx, hipX, hipY, angle, bend, upper, lower, color) {
  const kneeX = hipX + Math.sin(angle) * upper;
  const kneeY = hipY + Math.cos(angle) * upper;
  const pawX = kneeX + Math.sin(angle + bend) * lower;
  const pawY = kneeY + Math.cos(angle + bend) * lower;
  ctx.strokeStyle = color;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(hipX, hipY);
  ctx.lineTo(kneeX, kneeY);
  ctx.lineWidth = 3.5;
  ctx.lineTo(pawX, pawY);
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(pawX + 1.5, pawY, 3, 2, 0, 0, TAU);
  ctx.fill();
}

// Leg angles for the double-suspension gallop, a standing pose and a flying leap.
function legPose(hound, phase, distance) {
  if (phase === "ready") return { front: [0.05, 0, -0.05], hind: [-0.05, 0, 0.05], bob: 0 };
  if (!hound.grounded || phase === "over") {
    return { front: [-1.1, 0.9, -0.95], hind: [1.0, -0.6, 0.85], bob: 0 };
  }
  const p = (distance / 78) * TAU;
  const swing = (offset) => Math.sin(p + offset);
  return {
    front: [-0.75 * swing(0), 0.7 * Math.max(0, swing(0)), -0.75 * swing(0.5)],
    hind: [0.75 * swing(0), -0.6 * Math.max(0, -swing(0)), 0.75 * swing(0.5)],
    bob: -2.5 * Math.abs(Math.cos(p)),
  };
}

function drawHound(ctx, game, time) {
  const { hound, phase, distance } = game;
  const pose = legPose(hound, phase, distance);
  const crashed = phase === "over";
  ctx.save();
  ctx.translate(HOUND.x, GROUND - hound.y + pose.bob);
  if (crashed) ctx.rotate(-0.12);

  // Shadow on the ground (stays on the ground while jumping).
  ctx.save();
  ctx.translate(0, hound.y - pose.bob);
  ctx.globalAlpha = Math.max(0.1, 0.35 - hound.y / 400);
  ctx.fillStyle = "#000000";
  ctx.beginPath();
  ctx.ellipse(52, 1, 34, 3, 0, 0, TAU);
  ctx.fill();
  ctx.restore();

  // Far legs (darker), drawn behind the body.
  const [fA, fBend, fFar] = pose.front;
  const [hA, hBend, hFar] = pose.hind;
  leg(ctx, 72, -28, fFar, -fBend, 13, 15, C.houndShade);
  leg(ctx, 30, -32, hFar, -hBend, 15, 17, C.houndShade);

  // Tail: long, thin, curving up at the tip.
  ctx.strokeStyle = C.greyhoundGrey;
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  const wag = Math.sin(time * 9) * 3;
  ctx.beginPath();
  ctx.moveTo(22, -42);
  ctx.bezierCurveTo(8, -36, 2, -22 + wag, -8, -26 + wag);
  ctx.stroke();

  // Body: deep chest, tucked waist, strong hindquarters.
  ctx.fillStyle = C.greyhoundGrey;
  ctx.beginPath();
  ctx.moveTo(20, -42);
  ctx.bezierCurveTo(32, -50, 52, -50, 72, -46);
  ctx.bezierCurveTo(82, -44, 84, -30, 74, -22);
  ctx.bezierCurveTo(64, -18, 54, -26, 46, -34);
  ctx.bezierCurveTo(40, -36, 30, -30, 22, -30);
  ctx.bezierCurveTo(16, -32, 15, -38, 20, -42);
  ctx.fill();

  // Neck and head: long and narrow, with a fine muzzle.
  ctx.beginPath();
  ctx.moveTo(70, -46);
  ctx.bezierCurveTo(76, -52, 80, -58, 86, -62);
  ctx.lineTo(92, -60);
  ctx.bezierCurveTo(96, -58, 102, -54, 104, -52);
  ctx.lineTo(103, -50);
  ctx.bezierCurveTo(98, -49, 92, -50, 86, -50);
  ctx.bezierCurveTo(82, -44, 80, -36, 78, -30);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = C.nose;
  ctx.beginPath();
  ctx.arc(103.5, -51.5, 1.8, 0, TAU);
  ctx.fill();

  // Folded "rose" ear.
  ctx.fillStyle = C.houndShade;
  ctx.beginPath();
  ctx.moveTo(85, -61);
  ctx.quadraticCurveTo(80, -66, 76, -60);
  ctx.quadraticCurveTo(80, -60, 84, -58);
  ctx.fill();

  // Eye (an X after a crash).
  ctx.strokeStyle = C.nose;
  ctx.fillStyle = C.nose;
  if (crashed) {
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(89, -59);
    ctx.lineTo(93, -55);
    ctx.moveTo(93, -59);
    ctx.lineTo(89, -55);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.arc(91, -57, 1.6, 0, TAU);
    ctx.fill();
  }

  // Racing coat in Moravian blue with gold trim and a Moravian Star.
  ctx.fillStyle = C.coatBlue;
  ctx.beginPath();
  ctx.moveTo(36, -47);
  ctx.bezierCurveTo(48, -50, 60, -49, 68, -46);
  ctx.lineTo(66, -28);
  ctx.bezierCurveTo(58, -26, 52, -30, 46, -34);
  ctx.bezierCurveTo(42, -36, 38, -35, 36, -34);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = C.starGold;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  drawMoravianStar(ctx, 52, -40, 5, { points: 8 });

  // Gold collar.
  ctx.strokeStyle = C.starGold;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(78, -54);
  ctx.lineTo(82, -46);
  ctx.stroke();

  // Near legs, drawn over the body.
  leg(ctx, 70, -28, fA, fBend, 13, 15, C.houndLight);
  leg(ctx, 28, -32, hA, hBend, 15, 17, C.houndLight);
  ctx.restore();
}

// ---------- Text ----------

const pad = (n) => String(n).padStart(5, "0");

function drawHud(ctx, game, muted, musicOn) {
  ctx.font = "bold 18px ui-monospace, Menlo, Consolas, monospace";
  ctx.textAlign = "right";
  ctx.textBaseline = "top";
  ctx.fillStyle = C.greyhoundGrey;
  ctx.fillText(`HI ${pad(game.highScore)}`, W - 110, 14);
  ctx.fillStyle = C.starGold;
  ctx.fillText(pad(game.score), W - 18, 14);
  const notice = muted ? "Sound off (M)" : musicOn ? null : "Music off (N)";
  if (notice) {
    ctx.textAlign = "left";
    ctx.font = "14px system-ui, sans-serif";
    ctx.fillStyle = C.greyhoundGrey;
    ctx.fillText(notice, 18, 16);
  }
}

function panel(ctx, lines, { title, footer }) {
  ctx.font = "16px system-ui, sans-serif";
  const body = lines.flatMap((l) => wrapText((s) => ctx.measureText(s).width, l, 460));
  const height = 64 + body.length * 22 + (footer ? 30 : 0);
  const top = (GROUND - height) / 2 + 10;
  ctx.fillStyle = "rgba(10, 34, 64, 0.88)";
  ctx.strokeStyle = C.starGold;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(W / 2 - 260, top, 520, height, 10);
  ctx.fill();
  ctx.stroke();

  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillStyle = C.starGold;
  ctx.font = "bold 26px system-ui, sans-serif";
  ctx.fillText(title, W / 2, top + 16);
  ctx.fillStyle = C.snow;
  ctx.font = "16px system-ui, sans-serif";
  body.forEach((line, i) => ctx.fillText(line, W / 2, top + 54 + i * 22));
  if (footer) {
    ctx.fillStyle = C.starGold;
    ctx.font = "bold 16px system-ui, sans-serif";
    ctx.fillText(footer, W / 2, top + height - 32);
  }
}

function drawOverlay(ctx, game, time) {
  if (game.phase === "ready") {
    panel(ctx, ["Help the Moravian Greyhound race through Bethlehem, PA."], {
      title: "Runny Hound",
      footer: "Press Space or tap to run",
    });
  } else if (game.paused) {
    panel(ctx, ["Take a breather."], { title: "Paused", footer: "Press P to keep running" });
  } else if (game.phase === "over") {
    const type = game.crashedInto;
    const blink = game.overTime >= RESTART_DELAY && Math.sin(time * 5) > -0.6;
    panel(ctx, [`Fun fact: ${type.fact}`], {
      title: `You tripped over a ${type.name.toLowerCase()}!`,
      footer: blink ? "Press Space to run again" : " ",
    });
  }
}

// ---------- Whole frame ----------

export function drawScene(ctx, game, time, { muted = false, musicOn = true } = {}) {
  drawSky(ctx, time);
  drawMountain(ctx, game.distance, time);
  drawSkyline(ctx, game.distance, time);
  drawGround(ctx, game.distance);
  drawObstacles(ctx, game, time);
  drawHound(ctx, game, time);
  drawSnow(ctx, game.distance, time);
  drawHud(ctx, game, muted, musicOn);
  drawOverlay(ctx, game, time);
}
