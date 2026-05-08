import { ZONES, CAMERA } from '../config.js';
import { getControls } from '../controls/camera.js';

const minimapEl = document.getElementById('minimap');

export function initMinimap() {
  let html = '<div class="minimap-title">World Map</div>';
  ZONES.forEach(zone => {
    html += `<div class="minimap-item" data-zone="${zone.code}"><span class="mm-code">${zone.code}</span><span class="mm-name">${zone.label}</span></div>`;
  });
  minimapEl.innerHTML = html;

  minimapEl.addEventListener('click', (e) => {
    const item = e.target.closest('.minimap-item');
    if (!item) return;
    const zone = ZONES.find(z => z.code === item.dataset.zone);
    if (!zone) return;
    const controls = getControls();
    if (controls) {
      const cam = controls.getObject();
      cam.position.set(zone.position.x, CAMERA.height, zone.position.z + zone.radius + 3);
    }
  });
}

export function updateMinimap(currentZoneCode) {
  const items = minimapEl.querySelectorAll('.minimap-item');
  items.forEach(item => {
    item.classList.toggle('active', item.dataset.zone === currentZoneCode);
  });
}
