import { ZONES, CAMERA } from '../config.js';
import { getControls } from '../controls/camera.js';
import { startTourMaybeResume } from '../tour.js';
import { getVisitedZones } from '../visit-tracker.js';
import { events } from '../events.js';

const minimapEl = document.getElementById('minimap');
let flyRAF = null;

// Zone accent colors (mirrors src/world/zones.js ZONE_ACCENT)
const ZONE_DOT_COLOR = {
  WELCOME:     '#4a6a3a',
  PROJECTS:    '#6a4a2a',
  SOULPRINT:   '#8a7438',
  THEATER:     '#4a3a6a',
  LIBRARY:     '#6a3838',
  SOCIAL:      '#2a5c7a',
  COLLABORATE: '#7a3838',
};

export function initMinimap() {
  let html = '<div class="minimap-title">World Map</div>';
  ZONES.forEach(zone => {
    const color = ZONE_DOT_COLOR[zone.name] || '#8a9a7a';
    html += `<div class="minimap-item" data-zone="${zone.code}"><span class="mm-dot" style="background:${color}"></span><span class="mm-code">${zone.code}</span><span class="mm-name">${zone.label}</span></div>`;
  });
  html += '<div class="minimap-tour-btn" data-action="tour">Take the Tour</div>';
  minimapEl.innerHTML = html;

  minimapEl.addEventListener('click', (e) => {
    const tourBtn = e.target.closest('.minimap-tour-btn');
    if (tourBtn) {
      startTourMaybeResume();
      return;
    }
    const item = e.target.closest('.minimap-item');
    if (!item) return;
    const zone = ZONES.find(z => z.code === item.dataset.zone);
    if (!zone) return;
    const controls = getControls();
    if (!controls) return;

    const cam = controls.object;
    const targetX = zone.position.x;
    const targetY = CAMERA.height;
    const targetZ = zone.position.z + zone.radius + 3;

    // Cancel any in-progress fly
    if (flyRAF) cancelAnimationFrame(flyRAF);

    const startX = cam.position.x;
    const startY = cam.position.y;
    const startZ = cam.position.z;
    const duration = 1500;
    const startTime = performance.now();

    function tick(now) {
      const elapsed = now - startTime;
      const raw = Math.min(elapsed / duration, 1);

      // Cubic ease-in-out
      const t = raw < 0.5
        ? 4 * raw * raw * raw
        : 1 - Math.pow(-2 * raw + 2, 3) / 2;

      // Interpolate XZ linearly, Y with arc
      cam.position.x = startX + (targetX - startX) * t;
      cam.position.z = startZ + (targetZ - startZ) * t;

      // Base Y lerp + sine arc offset (peaks +5 at midpoint)
      const baseY = startY + (targetY - startY) * t;
      cam.position.y = baseY + Math.sin(raw * Math.PI) * 5;

      if (raw < 1) {
        flyRAF = requestAnimationFrame(tick);
      } else {
        cam.position.y = targetY;
        flyRAF = null;
      }
    }

    flyRAF = requestAnimationFrame(tick);
  });

  // Initial visited state + listen for updates
  refreshVisited();
  events.on('visit:update', refreshVisited);
}

function refreshVisited() {
  const visited = getVisitedZones();
  const items = minimapEl.querySelectorAll('.minimap-item');
  items.forEach(item => {
    item.classList.toggle('visited', visited.has(item.dataset.zone));
  });
}

/** True while camera fly animation is in progress */
export function isFlying() { return flyRAF !== null; }

export function updateMinimap(currentZoneCode) {
  const items = minimapEl.querySelectorAll('.minimap-item');
  items.forEach(item => {
    item.classList.toggle('active', item.dataset.zone === currentZoneCode);
  });
}
