// Connects the game to the browser: drawing loop, keyboard/touch, sound, saving.
import { drawMoravianStar, drawScene, OBSTACLE_ART } from "./art.js";
import { createAudio } from "./audio.js";
import { WORLD } from "./config.js";
import { createGame, press, pressDuck, release, releaseDuck, step, togglePause } from "./game.js";
import { HELP_SECTIONS } from "./help.js";
import { OBSTACLE_TYPES, createObstacle, obstacleVariants } from "./obstacles.js";
import { PALETTE } from "./palette.js";
import { actionForKey } from "./input.js";
import { shouldPlayMusic } from "./music.js";
import { createStore } from "./storage.js";

const STEP = 1 / 120; // the game updates in fixed steps so it plays the same on any screen

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const dialog = document.getElementById("help-dialog");
const status = document.getElementById("status");

const store = createStore(globalThis.localStorage);
const audio = createAudio(() => {
  const AudioContextClass = globalThis.AudioContext ?? globalThis.webkitAudioContext;
  return AudioContextClass ? new AudioContextClass() : null;
});
audio.setMuted(store.getMuted());
audio.setMusicOn(store.getMusicOn());

const game = createGame({ highScore: store.getHighScore() });

function handle(events) {
  for (const event of events) {
    audio.play(event);
    if (event === "start") {
      status.textContent = "";
      audio.rewindMusic();
    }
    if (event === "crash") {
      store.setHighScore(game.highScore);
      status.textContent = `Your Greyhound tripped over ${game.crashedInto.phrase}. Score ${game.score}. Best ${game.highScore}. Press Space to run again.`;
    }
  }
}

function jump() {
  if (dialog.open) return;
  audio.unlock();
  handle(press(game));
}

function setPaused(paused) {
  if (game.paused !== paused) togglePause(game);
}

// ----- Help dialog -----
const content = document.getElementById("help-content");
for (const section of HELP_SECTIONS) {
  const heading = document.createElement("h3");
  heading.textContent = section.title;
  const list = document.createElement("ul");
  for (const line of section.lines) {
    const item = document.createElement("li");
    item.textContent = line;
    list.append(item);
  }
  content.append(heading, list);
}
let pausedByHelp = false;
function openHelp() {
  pausedByHelp = game.phase === "running" && !game.paused;
  setPaused(true);
  dialog.showModal();
}
dialog.addEventListener("close", () => {
  if (pausedByHelp) setPaused(false);
  pausedByHelp = false;
});
document.getElementById("help-button").addEventListener("click", openHelp);

// ----- Keyboard -----
document.addEventListener("keydown", (event) => {
  const action = actionForKey(event.code);
  if (!action || event.ctrlKey || event.metaKey || event.altKey) return;
  if (action === "help") {
    event.preventDefault();
    if (dialog.open) dialog.close();
    else openHelp();
    return;
  }
  if (dialog.open) return;
  event.preventDefault(); // stop Space from scrolling the page
  if (event.repeat) return;
  if (action === "jump") jump();
  if (action === "duck") handle(pressDuck(game));
  if (action === "pause") togglePause(game);
  if (action === "mute") {
    audio.setMuted(!audio.muted);
    store.setMuted(audio.muted);
  }
  if (action === "music") {
    audio.setMusicOn(!audio.musicOn);
    store.setMusicOn(audio.musicOn);
  }
});
document.addEventListener("keyup", (event) => {
  const action = actionForKey(event.code);
  if (action === "jump") release(game);
  if (action === "duck") releaseDuck(game);
});

// ----- Touch and mouse -----
canvas.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  jump();
});
for (const type of ["pointerup", "pointercancel", "pointerleave"]) {
  canvas.addEventListener(type, () => release(game));
}

// ----- On-screen Jump button (touch screens) -----
const jumpButton = document.getElementById("jump-btn");
jumpButton.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  jump();
});
for (const type of ["pointerup", "pointercancel", "pointerleave"]) {
  jumpButton.addEventListener(type, () => release(game));
}

// Pause when the player switches tabs or windows.
document.addEventListener("visibilitychange", () => {
  if (document.hidden) setPaused(true);
});
globalThis.addEventListener("blur", () => {
  setPaused(true);
  releaseDuck(game);
});

// ----- On-screen Duck button (touch screens) -----
const duckButton = document.getElementById("duck-btn");
duckButton.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  if (dialog.open) return;
  audio.unlock();
  handle(pressDuck(game));
});
for (const type of ["pointerup", "pointercancel", "pointerleave"]) {
  duckButton.addEventListener(type, () => releaseDuck(game));
}

// ----- Page decorations, all drawn in code: header star, tab icon, obstacle cards -----
function sharpCanvas(canvas, width, height) {
  const ratio = Math.min(2, globalThis.devicePixelRatio || 1);
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  const context = canvas.getContext("2d");
  context.scale(ratio, ratio);
  return context;
}

drawMoravianStar(sharpCanvas(document.getElementById("brand-star"), 56, 56), 28, 28, 25, {
  points: 8,
});

const icon = document.createElement("canvas");
const iconContext = sharpCanvas(icon, 64, 64);
iconContext.fillStyle = PALETTE.moravianBlue;
iconContext.beginPath();
iconContext.roundRect(0, 0, 64, 64, 14);
iconContext.fill();
drawMoravianStar(iconContext, 32, 32, 27, { points: 8 });
document.querySelector('link[rel="icon"]').href = icon.toDataURL("image/png");

const cards = document.getElementById("obstacle-cards");
for (const type of OBSTACLE_TYPES) {
  const figure = document.createElement("figure");
  const thumb = document.createElement("canvas");
  const context = sharpCanvas(thumb, 96, 80);
  const ground = 70;
  context.fillStyle = "rgba(0, 43, 92, 0.12)";
  context.fillRect(0, ground, 96, 80 - ground);
  const sample = createObstacle(type, 0, obstacleVariants(type)[0]);
  const scale = Math.min(1, 84 / sample.width, 62 / (sample.height + sample.altitude));
  context.translate(48 - (sample.width * scale) / 2, ground);
  context.scale(scale, scale);
  OBSTACLE_ART[type.id](context, sample, 0, 0.4);
  const caption = document.createElement("figcaption");
  const name = document.createElement("strong");
  name.textContent = type.name;
  const fact = document.createElement("span");
  fact.textContent = type.fact;
  caption.append(name, fact);
  figure.append(thumb, caption);
  cards.append(figure);
}

// ----- Sharp drawing on high-resolution screens -----
function fitCanvas() {
  const ratio = Math.min(globalThis.devicePixelRatio || 1, 3);
  canvas.width = WORLD.width * ratio;
  canvas.height = WORLD.height * ratio;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}
fitCanvas();
globalThis
  .matchMedia?.(`(resolution: ${devicePixelRatio}dppx)`)
  ?.addEventListener("change", fitCanvas);

// ----- Main loop -----
let last = performance.now();
let carry = 0;
function frame(now) {
  carry += Math.min(0.1, (now - last) / 1000); // after a long pause, don't jump ahead
  last = now;
  while (carry >= STEP) {
    handle(step(game, STEP));
    carry -= STEP;
  }
  audio.syncMusic(shouldPlayMusic(game, audio));
  drawScene(ctx, game, now / 1000, { muted: audio.muted, musicOn: audio.musicOn });
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
