// Quick "go home" button — teleports back to Welcome zone start position.
import { CAMERA, ZONES } from '../config.js';
import { getControls } from '../controls/camera.js';

export function initHomeButton() {
  const btn = document.getElementById('home-btn');
  if (!btn) return;

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const controls = getControls();
    if (!controls) return;
    const cam = controls.object;

    // Animate back to start position
    const startX = cam.position.x;
    const startY = cam.position.y;
    const startZ = cam.position.z;
    const targetX = CAMERA.startPosition.x;
    const targetY = CAMERA.height;
    const targetZ = CAMERA.startPosition.z;
    const startTime = performance.now();
    const duration = 1200;

    function tick(now) {
      const elapsed = now - startTime;
      const raw = Math.min(elapsed / duration, 1);
      const t = raw < 0.5 ? 4 * raw * raw * raw : 1 - Math.pow(-2 * raw + 2, 3) / 2;

      cam.position.x = startX + (targetX - startX) * t;
      cam.position.z = startZ + (targetZ - startZ) * t;
      cam.position.y = (startY + (targetY - startY) * t) + Math.sin(raw * Math.PI) * 4;

      if (raw < 1) {
        requestAnimationFrame(tick);
      } else {
        cam.position.y = targetY;
      }
    }
    requestAnimationFrame(tick);
  });
}
