// Idle screensaver — if user does nothing for IDLE_THRESHOLD ms while in the
// world (not in start screen, not in tour, not in panel), kick off the tour.
// Cancels immediately on any user input.

import { startTour, isTourActive } from './tour.js';
import { isPanelOpen } from './ui/overlay.js';

const IDLE_THRESHOLD = 60000; // 60 seconds
const STORAGE_KEY = 'ivan-world-pref-no-screensaver';

let lastActivity = performance.now();
let checkInterval = null;

function isUserActive() {
  // Don't kick in if start screen still up
  const startScreen = document.getElementById('start-screen');
  if (startScreen && startScreen.style.display !== 'none') return true;

  // Don't kick in during tour, panel, or nav
  if (isTourActive()) return true;
  if (isPanelOpen()) return true;
  const navOverlay = document.getElementById('nav-overlay');
  if (navOverlay && !navOverlay.classList.contains('hidden')) return true;

  return false;
}

function resetIdle() {
  lastActivity = performance.now();
}

function checkIdle() {
  if (localStorage.getItem(STORAGE_KEY) === '1') return; // user opted out
  if (isUserActive()) {
    resetIdle();
    return;
  }
  const idleFor = performance.now() - lastActivity;
  if (idleFor > IDLE_THRESHOLD) {
    resetIdle();
    startTour();
  }
}

export function initIdleScreensaver() {
  // Track all activity
  ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'].forEach(ev => {
    window.addEventListener(ev, resetIdle, { passive: true });
  });
  // Pointer lock change (means user re-engaged)
  document.addEventListener('pointerlockchange', resetIdle);

  checkInterval = setInterval(checkIdle, 5000);
}

export function disableIdleScreensaver() {
  localStorage.setItem(STORAGE_KEY, '1');
  if (checkInterval) clearInterval(checkInterval);
}
