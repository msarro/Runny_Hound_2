// Game tuning. Distances are canvas pixels, times are seconds.
export const WORLD = { width: 960, height: 320, groundY: 268 };

// A full jump is about 120px high and 0.7s long; letting go early cuts it short.
// Holding duck in the air multiplies gravity by fastFall (as in Runny Hound 1).
export const PHYSICS = { gravity: 1960, jumpVelocity: 686, releaseVelocity: 350, fastFall: 3.2 };

export const SPEED = { start: 360, max: 780, acceleration: 6 };

export const SCORE = { pixelsPerPoint: 40, milestone: 100 };
