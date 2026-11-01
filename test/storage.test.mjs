import { test } from "node:test";
import assert from "node:assert/strict";
import { createStore } from "../src/storage.js";

function memoryStorage() {
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    map,
  };
}

test("the high score starts at 0 and is remembered", () => {
  const storage = memoryStorage();
  assert.equal(createStore(storage).getHighScore(), 0);
  createStore(storage).setHighScore(321);
  assert.equal(createStore(storage).getHighScore(), 321);
});

test("damaged saved values are ignored", () => {
  for (const bad of ["banana", "-5", "NaN", "1e400", "3.7"]) {
    const storage = memoryStorage();
    storage.map.set("runny-hound:highScore", bad);
    assert.equal(createStore(storage).getHighScore(), 0, bad);
  }
});

test("the mute setting is remembered and starts off", () => {
  const storage = memoryStorage();
  assert.equal(createStore(storage).getMuted(), false);
  createStore(storage).setMuted(true);
  assert.equal(createStore(storage).getMuted(), true);
});

test("the music setting is remembered and starts on", () => {
  const storage = memoryStorage();
  assert.equal(createStore(storage).getMusicOn(), true);
  createStore(storage).setMusicOn(false);
  assert.equal(createStore(storage).getMusicOn(), false);
  createStore(storage).setMusicOn(true);
  assert.equal(createStore(storage).getMusicOn(), true);
});

test("the game still works when the browser blocks storage", () => {
  const throwing = {
    getItem() {
      throw new Error("blocked");
    },
    setItem() {
      throw new Error("blocked");
    },
  };
  for (const storage of [null, undefined, throwing]) {
    const store = createStore(storage);
    assert.equal(store.getHighScore(), 0);
    assert.equal(store.getMuted(), false);
    assert.equal(store.getMusicOn(), true);
    store.setHighScore(5);
    store.setMuted(true);
    store.setMusicOn(false);
  }
});
