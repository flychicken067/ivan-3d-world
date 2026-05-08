import { ZONES } from '../config.js';
import { getControls } from '../controls/camera.js';
import { isPanelOpen } from './overlay.js';

const navOverlay = document.getElementById('nav-overlay');
let navOpen = false;

function buildNavHTML() {
  const links = ZONES
    .filter(z => z.code !== '01')
    .map(z => `<button class="nav-link" data-zone="${z.code}">${z.name}</button>`)
    .join('');
  return `<div class="nav-links">${links}</div>`;
}

function openNav() {
  navOverlay.innerHTML = buildNavHTML();
  navOverlay.classList.remove('hidden');
  navOpen = true;

  // Unlock pointer so mouse cursor is usable in the nav
  const controls = getControls();
  if (controls && document.pointerLockElement) {
    controls.unlock();
  }

  // Wire nav link clicks
  navOverlay.querySelectorAll('.nav-link').forEach(btn => {
    btn.addEventListener('click', () => {
      const code = btn.dataset.zone;
      const zone = ZONES.find(z => z.code === code);
      if (!zone) return;
      teleportTo(zone);
    });
  });
}

function closeNav() {
  navOverlay.classList.add('hidden');
  navOpen = false;
}

function teleportTo(zone) {
  const controls = getControls();
  if (!controls) return;

  // Move the camera to the zone entrance (in front of the zone)
  const cam = controls.object;
  cam.position.x = zone.position.x;
  cam.position.z = zone.position.z + zone.radius + 3;

  closeNav();

  // Re-lock pointer to resume world navigation
  controls.lock();
}

export function initNav() {
  navOverlay.innerHTML = buildNavHTML();

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    e.preventDefault();

    if (navOpen) {
      closeNav();
      // Re-lock pointer
      const controls = getControls();
      if (controls && !document.pointerLockElement) {
        controls.lock();
      }
      return;
    }

    // Don't open nav if a panel is already open
    if (isPanelOpen()) return;

    openNav();
  });
}
