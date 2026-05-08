import { CAMERA, WORLD } from '../config.js';
import { getControls } from './camera.js';

const keys = { w: false, a: false, s: false, d: false };
const velocity = { x: 0, z: 0 };

export function initMovement() {
  window.addEventListener('keydown', (e) => {
    switch (e.code) {
      case 'KeyW': case 'ArrowUp':    keys.w = true; break;
      case 'KeyS': case 'ArrowDown':  keys.s = true; break;
      case 'KeyA': case 'ArrowLeft':  keys.a = true; break;
      case 'KeyD': case 'ArrowRight': keys.d = true; break;
    }
  });

  window.addEventListener('keyup', (e) => {
    switch (e.code) {
      case 'KeyW': case 'ArrowUp':    keys.w = false; break;
      case 'KeyS': case 'ArrowDown':  keys.s = false; break;
      case 'KeyA': case 'ArrowLeft':  keys.a = false; break;
      case 'KeyD': case 'ArrowRight': keys.d = false; break;
    }
  });
}

export function updateMovement(delta) {
  const controls = getControls();
  if (!controls || !controls.isLocked) return;

  const camera = controls.object;
  const speed = CAMERA.moveSpeed * 60;
  const damping = 8.0 * delta;

  // Apply damping
  velocity.x -= velocity.x * damping;
  velocity.z -= velocity.z * damping;

  // Build input direction
  let dirX = 0;
  let dirZ = 0;
  if (keys.w) dirZ -= 1;
  if (keys.s) dirZ += 1;
  if (keys.a) dirX -= 1;
  if (keys.d) dirX += 1;

  // Normalize if diagonal
  const len = Math.sqrt(dirX * dirX + dirZ * dirZ);
  if (len > 0) {
    dirX /= len;
    dirZ /= len;
  }

  // Accumulate velocity
  velocity.x += dirX * speed * delta;
  velocity.z += dirZ * speed * delta;

  // Move using PointerLockControls helpers
  controls.moveRight(velocity.x * delta);
  controls.moveForward(-velocity.z * delta);

  // Clamp to world bounds
  const bound = WORLD.size / 2 - 5;
  camera.position.x = Math.max(-bound, Math.min(bound, camera.position.x));
  camera.position.z = Math.max(-bound, Math.min(bound, camera.position.z));

  // Lock Y (eye height)
  camera.position.y = CAMERA.height;
}
