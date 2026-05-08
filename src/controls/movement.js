import { CAMERA, WORLD } from '../config.js';
import { getControls } from './camera.js';

const keys = { w: false, a: false, s: false, d: false };
const velocity = { x: 0, z: 0 };

// Touch joystick state
const touch = { joystickActive: false, startX: 0, startY: 0, moveX: 0, moveZ: 0 };
let _joystickEl = null;
let _knobEl = null;

export function initTouchControls() {
  if (!('ontouchstart' in window)) return;

  const joystick = document.createElement('div');
  joystick.id = 'touch-joystick';
  joystick.innerHTML = '<div class="joystick-knob"></div>';

  const uiLayer = document.getElementById('ui-layer');
  if (uiLayer) {
    uiLayer.appendChild(joystick);
  } else {
    document.body.appendChild(joystick);
  }

  _joystickEl = joystick;
  _knobEl = joystick.querySelector('.joystick-knob');

  joystick.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const t = e.changedTouches[0];
    touch.joystickActive = true;
    touch.startX = t.clientX;
    touch.startY = t.clientY;
    touch.moveX = 0;
    touch.moveZ = 0;
  }, { passive: false });

  joystick.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (!touch.joystickActive) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touch.startX;
    const dy = t.clientY - touch.startY;

    // Normalize to -1..1 (divide by 40, clamp)
    touch.moveX = Math.max(-1, Math.min(1, dx / 40));
    touch.moveZ = Math.max(-1, Math.min(1, dy / 40));

    // Move knob visually
    if (_knobEl) {
      _knobEl.style.transform = `translate(${touch.moveX * 20}px, ${touch.moveZ * 20}px)`;
    }
  }, { passive: false });

  joystick.addEventListener('touchend', () => {
    touch.joystickActive = false;
    touch.moveX = 0;
    touch.moveZ = 0;
    if (_knobEl) {
      _knobEl.style.transform = 'translate(0, 0)';
    }
  });
}

function getTouchInput() {
  return { x: touch.moveX, z: touch.moveZ };
}

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
  const isTouchDevice = 'ontouchstart' in window;
  if (!controls) return;
  // On touch devices allow movement without pointer lock
  if (!isTouchDevice && !controls.isLocked) return;

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

  // Apply touch joystick input if nonzero
  const touchInput = getTouchInput();
  if (touchInput.x !== 0 || touchInput.z !== 0) {
    dirX += touchInput.x;
    dirZ += touchInput.z;
  }

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
