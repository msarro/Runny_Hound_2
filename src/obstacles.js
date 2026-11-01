import { PHYSICS, WORLD } from "./config.js";

// Things from Moravian University and Bethlehem, PA to jump over.
// phrase is the name as used in a sentence ("You tripped over a Moravian Star").
// width/height are the drawing size in pixels (of one item, for groups).
// fromScore: the score from which it can appear. maxGroup/spacing: it comes in rows of
// up to maxGroup items, spacing pixels apart. flying: it floats at one of `altitudes`
// (pixels above the ground): low to jump, middle to duck under, high to run under. The fun fact is shown after a crash
// and in the in-app help.
export const OBSTACLE_TYPES = [
  {
    id: "candle",
    name: "Lovefeast candle",
    phrase: "a lovefeast candle",
    width: 22,
    height: 48,
    maxGroup: 3,
    spacing: 15,
    fact: "Beeswax candles trimmed with red paper are handed out at Moravian Christmas Eve lovefeasts.",
  },
  {
    id: "chick",
    name: "Marshmallow chick",
    phrase: "a marshmallow chick",
    width: 26,
    height: 26,
    maxGroup: 3,
    spacing: 24,
    fact: "Just Born, the candy company famous for its marshmallow chicks, has called Bethlehem home for decades.",
  },
  {
    id: "books",
    name: "Stack of books",
    phrase: "a stack of books",
    width: 46,
    height: 40,
    fact: "Moravian University traces its roots to 1742, making it one of the oldest colleges in the United States.",
  },
  {
    id: "star",
    name: "Moravian Star",
    phrase: "a Moravian Star",
    width: 50,
    height: 60,
    fact: "The many-pointed Moravian Star began as a geometry lesson at a Moravian boys' school in Germany in the 1800s.",
  },
  {
    id: "beams",
    name: "Bethlehem Steel beams",
    phrase: "Bethlehem Steel beams",
    width: 92,
    height: 38,
    fromScore: 150,
    fact: "Bethlehem Steel made the steel for the Golden Gate Bridge and many New York City skyscrapers.",
  },
  {
    id: "tree",
    name: "Christmas tree",
    phrase: "a Christmas tree",
    width: 48,
    height: 82,
    fromScore: 150,
    fact: "Bethlehem has called itself Christmas City, USA since 1937.",
  },
  {
    id: "flyer",
    name: "Flying Moravian Star",
    phrase: "a flying Moravian Star",
    width: 32,
    height: 22,
    fromScore: 300,
    flying: true,
    altitudes: [18, 34, 72],
    fact: "A giant star has shone over Bethlehem from South Mountain since 1937, and it can be seen for miles.",
  },
];

// Flying stars bob up and down by this many pixels, and need a little extra room.
export const BOB = 4;
export const FLYER_GAP = 80;

const HITBOX_INSET = 4;
const AIRTIME = (2 * PHYSICS.jumpVelocity) / PHYSICS.gravity;
const REACTION_TIME = 0.35;

// options: count (group size) or altitude (flying height). age drives the bob.
export function createObstacle(type, x, { count = 1, altitude = type.altitudes?.[0] ?? 0 } = {}) {
  return {
    type,
    x,
    count,
    altitude,
    width: type.width + (count - 1) * (type.spacing ?? 0),
    height: type.height,
    age: 0,
  };
}

export function obstacleBob(obstacle) {
  return obstacle.type.flying ? BOB * Math.sin(obstacle.age * 3) : 0;
}

export function obstacleHitbox(obstacle) {
  const bottom = WORLD.groundY - obstacle.altitude - obstacleBob(obstacle);
  return {
    x: obstacle.x + HITBOX_INSET,
    y: bottom - obstacle.height + HITBOX_INSET,
    width: obstacle.width - 2 * HITBOX_INSET,
    height: obstacle.height - HITBOX_INSET,
  };
}

// Every form an obstacle can take: each group size, or each flying height.
export function obstacleVariants(type) {
  if (type.flying) return type.altitudes.map((altitude) => ({ altitude }));
  if (type.maxGroup) {
    return Array.from({ length: type.maxGroup }, (_, i) => ({ count: i + 1 }));
  }
  return [{}];
}

// Shortest space between two obstacles: a whole jump plus time to react.
export function minGap(speed) {
  return speed * (AIRTIME + REACTION_TIME);
}

export function nextGap(speed, rng) {
  return minGap(speed) + rng() * speed * 0.8;
}

export function pickType(rng, score) {
  const pool = OBSTACLE_TYPES.filter((t) => (t.fromScore ?? 0) <= score);
  return pool[Math.floor(rng() * pool.length)];
}

// Picks the next obstacle and its form. Groups grow with the score, like Runny Hound 1:
// up to two at first, up to three from 150 points.
export function pickObstacle(rng, score) {
  const type = pickType(rng, score);
  const level = score < 150 ? 0 : score < 450 ? 1 : 2;
  const count = type.maxGroup ? 1 + Math.floor(rng() * Math.min(type.maxGroup, level + 1.6)) : 1;
  const altitude = type.flying ? type.altitudes[Math.floor(rng() * type.altitudes.length)] : 0;
  return { type, count, altitude };
}
