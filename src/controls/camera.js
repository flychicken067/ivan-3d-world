import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { events } from '../events.js';
import { isPanelOpen } from '../ui/overlay.js';
import { startTour } from '../tour.js';

let controls = null;

function fadeOutStartScreen(startScreen) {
  if (!startScreen) return;
  startScreen.classList.add('fade-out');
  setTimeout(() => {
    startScreen.style.display = 'none';
    startScreen.classList.remove('fade-out');
  }, 600);
}

export function initCameraControls(camera, domElement) {
  controls = new PointerLockControls(camera, domElement);

  const startScreen = document.getElementById('start-screen');
  const tourBtn = document.getElementById('start-tour-btn');
  const exploreBtn = document.getElementById('start-explore-btn');

  // EXPLORE FREELY → engage pointer lock for WASD
  if (exploreBtn) {
    exploreBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      controls.lock();
    });
  }

  // TAKE THE TOUR → fade start screen, start tour without pointer lock
  if (tourBtn) {
    tourBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      fadeOutStartScreen(startScreen);
      startTour();
    });
  }

  // Fallback: clicking anywhere else on the start screen also enters explore mode
  if (startScreen) {
    startScreen.addEventListener('click', (e) => {
      // Ignore if a child button handled it
      if (e.target.closest('.start-action-btn')) return;
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
    // Re-show start screen only when no panel (or nav) is handling the unlock
    if (!isPanelOpen() && startScreen && startScreen.style.display === 'none') {
      startScreen.style.display = '';
    }
    events.emit('controls:unlocked');
  });

  // Touch swipe camera look (mobile only)
  if ('ontouchstart' in window) {
    let lastTouchX = 0;
    let lastTouchY = 0;
    const LOOK_SENSITIVITY = 0.003;

    domElement.addEventListener('touchstart', (e) => {
      const t = e.changedTouches[0];
      // Only track right half of screen (clientX > 40% width)
      if (t.clientX > window.innerWidth * 0.4) {
        lastTouchX = t.clientX;
        lastTouchY = t.clientY;
      }
    }, { passive: true });

    domElement.addEventListener('touchmove', (e) => {
      const t = e.changedTouches[0];
      if (t.clientX <= window.innerWidth * 0.4) return;

      const dx = t.clientX - lastTouchX;
      const dy = t.clientY - lastTouchY;
      lastTouchX = t.clientX;
      lastTouchY = t.clientY;

      // Rotate camera
      camera.rotation.order = 'YXZ';
      camera.rotation.y -= dx * LOOK_SENSITIVITY;
      camera.rotation.x -= dy * LOOK_SENSITIVITY;
      // Clamp X rotation to ±PI/3
      camera.rotation.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, camera.rotation.x));
    }, { passive: true });
  }

  return controls;
}

export function getControls() {
  return controls;
}
