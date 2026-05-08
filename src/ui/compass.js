// Minimal compass — shows the direction the camera is facing.
// N (north) = -Z. Letters fade in/out based on yaw.

let compassEl = null;
let needleEl = null;

export function initCompass() {
  compassEl = document.getElementById('compass');
  if (!compassEl) return;
  needleEl = compassEl.querySelector('.compass-needle');
}

export function updateCompass(camera) {
  if (!needleEl || !camera) return;
  // Camera yaw — rotation around Y axis
  // PointerLockControls applies yaw to controls.object (the camera holder)
  const yaw = camera.rotation.y;
  // Convert radians → degrees, normalize 0-360
  const deg = ((yaw * 180 / Math.PI) % 360 + 360) % 360;
  // Rotate needle in opposite direction so N stays at top
  needleEl.style.transform = `rotate(${-deg}deg)`;
}
