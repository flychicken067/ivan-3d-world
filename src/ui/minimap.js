import * as TWEEN from '@tweenjs/tween.js';
import { ZONES, CAMERA } from '../config.js';
import { getControls } from '../controls/camera.js';

const minimapEl = document.getElementById('minimap');
let flyTween = null;

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
    if (!controls) return;

    const cam = controls.getObject();
    const targetX = zone.position.x;
    const targetY = CAMERA.height;
    const targetZ = zone.position.z + zone.radius + 3;

    // Stop any existing fly animation
    if (flyTween) flyTween.stop();

    const originY = cam.position.y;
    const coords = { x: cam.position.x, y: cam.position.y, z: cam.position.z, progress: 0 };

    flyTween = new TWEEN.Tween(coords)
      .to({ x: targetX, y: targetY, z: targetZ, progress: 1 }, 1500)
      .easing(TWEEN.Easing.Cubic.InOut)
      .onUpdate((obj) => {
        // Arc: add a sine-based Y offset that peaks at midpoint (+5 units)
        const arcOffset = Math.sin(obj.progress * Math.PI) * 5;
        cam.position.x = obj.x;
        cam.position.y = obj.y + arcOffset;
        cam.position.z = obj.z;
      })
      .onComplete(() => {
        cam.position.y = targetY;
        flyTween = null;
      })
      .start();
  });
}

export function updateMinimap(currentZoneCode) {
  const items = minimapEl.querySelectorAll('.minimap-item');
  items.forEach(item => {
    item.classList.toggle('active', item.dataset.zone === currentZoneCode);
  });
}
