import { PHYSICS, WORLD } from "./config.js";

// The drawing box, and a smaller hitbox inside it so near misses feel fair.
// bottomInset is how far above the paws the hitbox starts.
export const HOUND = {
  x: 80,
  width: 100,
  height: 64,
  hitbox: { offsetX: 22, width: 60, bottomInset: 4, height: 40 },
};

// Hitbox height while ducking on the ground: low enough to pass under a middle star.
export const CROUCH_HEIGHT = 22;

// y is the height of the paws above the ground; vy is upward speed.
export function createHound() {
  return { y: 0, vy: 0, grounded: true, jumpHeld: false, ducking: false };
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

// On the ground, ducking crouches; in the air, it makes the hound drop faster.
export function setDucking(hound, ducking) {
  hound.ducking = ducking;
}

// Moves the hound one step. Returns true on the step it lands.
export function updateHound(hound, dt) {
  if (hound.grounded) return false;
  hound.vy -= PHYSICS.gravity * (hound.ducking ? PHYSICS.fastFall : 1) * dt;
  hound.y += hound.vy * dt;
  if (hound.y <= 0) {
    hound.y = 0;
    hound.vy = 0;
    hound.grounded = true;
    hound.jumpHeld = false;
    return true;
  }
  return false;
}

export function houndHitbox(hound) {
  const { offsetX, width, bottomInset } = HOUND.hitbox;
  const height = hound.ducking && hound.grounded ? CROUCH_HEIGHT : HOUND.hitbox.height;
  return {
    x: HOUND.x + offsetX,
    y: WORLD.groundY - hound.y - bottomInset - height,
    width,
    height,
  };
}
