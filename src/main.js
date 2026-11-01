// Connects the game to the browser: drawing loop, keyboard/touch, sound, saving.
import { drawScene } from "./art.js";
import { createAudio } from "./audio.js";
import { WORLD } from "./config.js";
import { createGame, press, release, step, togglePause } from "./game.js";
import { HELP_SECTIONS } from "./help.js";
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
      status.textContent = `You tripped over a ${game.crashedInto.name.toLowerCase()}. Score ${game.score}. Best ${game.highScore}. Press Space to run again.`;
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
  canvas.focus();
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
  if (actionForKey(event.code) === "jump") release(game);
});

// ----- Touch and mouse -----
canvas.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  canvas.focus();
  jump();
});
for (const type of ["pointerup", "pointercancel", "pointerleave"]) {
  canvas.addEventListener(type, () => release(game));
}

// Pause when the player switches tabs.
document.addEventListener("visibilitychange", () => {
  if (document.hidden) setPaused(true);
});

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
canvas.focus();
