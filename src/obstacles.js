import { PHYSICS, WORLD } from "./config.js";

// Things from Moravian University and Bethlehem, PA to jump over.
// width/height are the drawing size in pixels. The fun fact is shown after a crash
// and in the in-app help.
export const OBSTACLE_TYPES = [
  {
    id: "candle",
    name: "Lovefeast candle",
    width: 22,
    height: 48,
    fact: "Beeswax candles trimmed with red paper are handed out at Moravian Christmas Eve lovefeasts.",
  },
  {
    id: "books",
    name: "Stack of books",
    width: 46,
    height: 40,
    fact: "Moravian University traces its roots to 1742, making it one of the oldest colleges in the United States.",
  },
  {
    id: "star",
    name: "Moravian Star",
    width: 50,
    height: 60,
    fact: "The many-pointed Moravian Star began as a geometry lesson at a Moravian boys' school in Germany in the 1800s.",
  },
  {
    id: "beams",
    name: "Bethlehem Steel beams",
    width: 92,
    height: 38,
    fact: "Bethlehem Steel made the steel for the Golden Gate Bridge and many New York City skyscrapers.",
  },
  {
    id: "tree",
    name: "Christmas tree",
    width: 48,
    height: 82,
    fact: "Bethlehem has called itself Christmas City, USA since 1937.",
  },
];

// Until this score, only the smaller obstacles appear.
export const ALL_TYPES_SCORE = 150;
export const EARLY_TYPE_IDS = ["candle", "books", "star"];

const HITBOX_INSET = 4;
const AIRTIME = (2 * PHYSICS.jumpVelocity) / PHYSICS.gravity;
const REACTION_TIME = 0.35;

export function createObstacle(type, x) {
  return { type, x };
}

export function obstacleHitbox(obstacle) {
  const { width, height } = obstacle.type;
  return {
    x: obstacle.x + HITBOX_INSET,
    y: WORLD.groundY - height + HITBOX_INSET,
    width: width - 2 * HITBOX_INSET,
    height: height - HITBOX_INSET,
  };
}

// Shortest space between two obstacles: a whole jump plus time to react.
export function minGap(speed) {
  return speed * (AIRTIME + REACTION_TIME);
}

export function nextGap(speed, rng) {
  return minGap(speed) + rng() * speed * 0.8;
}

export function pickType(rng, score) {
  const pool =
    score < ALL_TYPES_SCORE
      ? OBSTACLE_TYPES.filter((t) => EARLY_TYPE_IDS.includes(t.id))
      : OBSTACLE_TYPES;
  return pool[Math.floor(rng() * pool.length)];
}
