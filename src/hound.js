import { PHYSICS, WORLD } from "./config.js";

// The drawing box, and a smaller hitbox inside it so near misses feel fair.
// bottomInset is how far above the paws the hitbox starts.
export const HOUND = {
  x: 80,
  width: 100,
  height: 64,
  hitbox: { offsetX: 22, width: 60, bottomInset: 4, height: 40 },
};

// y is the height of the paws above the ground; vy is upward speed.
export function createHound() {
  return { y: 0, vy: 0, grounded: true, jumpHeld: false };
}

export function startJump(hound) {
  if (!hound.grounded) return false;
  hound.vy = PHYSICS.jumpVelocity;
  hound.grounded = false;
  hound.jumpHeld = true;
  return true;
}

export function releaseJump(hound) {
  hound.jumpHeld = false;
  if (hound.vy > PHYSICS.releaseVelocity) hound.vy = PHYSICS.releaseVelocity;
}

export function updateHound(hound, dt) {
  if (hound.grounded) return;
  hound.vy -= PHYSICS.gravity * dt;
  hound.y += hound.vy * dt;
  if (hound.y <= 0) {
    hound.y = 0;
    hound.vy = 0;
    hound.grounded = true;
    hound.jumpHeld = false;
  }
}

export function houndHitbox(hound) {
  const { offsetX, width, bottomInset, height } = HOUND.hitbox;
  return {
    x: HOUND.x + offsetX,
    y: WORLD.groundY - hound.y - bottomInset - height,
    width,
    height,
  };
}
