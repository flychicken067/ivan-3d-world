import { ZONES } from '../config.js';

const hudEl = document.getElementById('hud-zone');
let currentZone = null;
let fadeTimeout = null;

export function updateHud(playerX, playerZ) {
  let insideZone = null;
  for (const zone of ZONES) {
    const dx = playerX - zone.position.x;
    const dz = playerZ - zone.position.z;
    if (Math.sqrt(dx * dx + dz * dz) < zone.radius) { insideZone = zone; break; }
  }
  if (insideZone && insideZone.code !== currentZone) {
    currentZone = insideZone.code;
    hudEl.textContent = `${insideZone.code} · ${insideZone.name}`;
    hudEl.classList.add('visible');
    clearTimeout(fadeTimeout);
    fadeTimeout = setTimeout(() => hudEl.classList.remove('visible'), 3000);
  } else if (!insideZone && currentZone) {
    currentZone = null;
    hudEl.classList.remove('visible');
  }
}

export function getCurrentZone() { return currentZone; }
