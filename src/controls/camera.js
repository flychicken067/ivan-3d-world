import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { events } from '../events.js';

let controls = null;

export function initCameraControls(camera, domElement) {
  controls = new PointerLockControls(camera, domElement);

  // Clicking the start screen locks the pointer and enters the world
  const startScreen = document.getElementById('start-screen');
  if (startScreen) {
    startScreen.addEventListener('click', () => {
      controls.lock();
    });
  }

  controls.addEventListener('lock', () => {
    // Fade out start screen
    if (startScreen) {
      startScreen.classList.add('fade-out');
      setTimeout(() => {
        startScreen.style.display = 'none';
        startScreen.classList.remove('fade-out');
      }, 600);
    }
    events.emit('controls:locked');
  });

  controls.addEventListener('unlock', () => {
    events.emit('controls:unlocked');
  });

  return controls;
}

export function getControls() {
  return controls;
}
