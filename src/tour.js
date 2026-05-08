import { ZONES, CAMERA } from './config.js';
import { getControls } from './controls/camera.js';

const NARRATION = {
  '01': '01 / WELCOME — The Builder Who Ships. Six products, forty thousand words, one book — all built in sixty days.',
  '02': '02 / PROJECTS — THEPAI. AI video generation for TikTok commerce. From highlight clips to AI-generated product videos.',
  '03': '03 / SOULPRINT — Conversational Bazi Bot. RAG-powered Chinese astrology grounded in classical texts, not internet noise.',
  '04': '04 / THEATER — Articles & Videos. WeChat essays and curated playlists from the building journey.',
  '05': '05 / LIBRARY — Understanding Large Models. From Karpathy notes to a full AI primer — 8 chapters, v17 epub.',
  '06': '06 / SOCIAL — Find Me. X, Xiaohongshu, Weibo, GitHub — wherever you prefer.',
  '07': "07 / COLLABORATE — Let's Build Together. Open to AI builder collaborations, consulting, and shared experiments.",
};

const FLY_DURATION = 2500;
const PAUSE_DURATION = 4000;

let active = false;
let currentRAF = null;
let currentTimeout = null;
let narrationEl = null;
let progressEl = null;
let zoneNameEl = null;
let textEl = null;
let stopBtn = null;
let escListener = null;
let canvasListener = null;

function ensureDom() {
  if (narrationEl) return;
  narrationEl = document.getElementById('tour-narration');
  if (!narrationEl) return;
  progressEl = narrationEl.querySelector('.tour-step');
  zoneNameEl = narrationEl.querySelector('.tour-zone-name');
  textEl = narrationEl.querySelector('.tour-text');
  stopBtn = narrationEl.querySelector('.tour-stop');
  if (stopBtn) {
    stopBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      stopTour();
    });
  }
}

function showNarration(zone, index, total) {
  ensureDom();
  if (!narrationEl) return;
  narrationEl.classList.remove('hidden');
  if (progressEl) progressEl.textContent = `${index + 1}/${total}`;
  if (zoneNameEl) zoneNameEl.textContent = zone.name;
  if (textEl) textEl.textContent = NARRATION[zone.code] || '';
}

function hideNarration() {
  ensureDom();
  if (narrationEl) narrationEl.classList.add('hidden');
}

function flyTo(zone) {
  return new Promise((resolve) => {
    const controls = getControls();
    if (!controls) { resolve(); return; }
    const cam = controls.object;
    const startX = cam.position.x;
    const startY = cam.position.y;
    const startZ = cam.position.z;
    const targetX = zone.position.x;
    const targetY = CAMERA.height;
    const targetZ = zone.position.z + zone.radius + 3;
    const startTime = performance.now();

    function tick(now) {
      if (!active) { resolve(); return; }
      const elapsed = now - startTime;
      const raw = Math.min(elapsed / FLY_DURATION, 1);
      const t = raw < 0.5
        ? 4 * raw * raw * raw
        : 1 - Math.pow(-2 * raw + 2, 3) / 2;

      cam.position.x = startX + (targetX - startX) * t;
      cam.position.z = startZ + (targetZ - startZ) * t;
      const baseY = startY + (targetY - startY) * t;
      cam.position.y = baseY + Math.sin(raw * Math.PI) * 6;

      if (raw < 1) {
        currentRAF = requestAnimationFrame(tick);
      } else {
        cam.position.y = targetY;
        currentRAF = null;
        resolve();
      }
    }
    currentRAF = requestAnimationFrame(tick);
  });
}

function wait(ms) {
  return new Promise((resolve) => {
    currentTimeout = setTimeout(() => {
      currentTimeout = null;
      resolve();
    }, ms);
  });
}

async function runTour() {
  const total = ZONES.length;
  for (let i = 0; i < total; i++) {
    if (!active) return;
    const zone = ZONES[i];
    showNarration(zone, i, total);
    await flyTo(zone);
    if (!active) return;
    await wait(PAUSE_DURATION);
    if (!active) return;
  }
  stopTour();
}

export function startTour() {
  if (active) return;
  active = true;
  window.__tourActive = true;

  // Try to release pointer lock so user can see UI
  const controls = getControls();
  if (controls && controls.isLocked) {
    try { controls.unlock(); } catch (e) {}
  }

  ensureDom();

  escListener = (e) => {
    if (e.key === 'Escape') stopTour();
  };
  window.addEventListener('keydown', escListener);

  canvasListener = () => stopTour();
  const canvas = document.getElementById('world-canvas');
  if (canvas) {
    // delay attach so the click that started the tour doesn't immediately stop it
    setTimeout(() => {
      if (active && canvas) canvas.addEventListener('click', canvasListener, { once: true });
    }, 300);
  }

  runTour();
}

export function stopTour() {
  if (!active) return;
  active = false;
  window.__tourActive = false;

  if (currentRAF) { cancelAnimationFrame(currentRAF); currentRAF = null; }
  if (currentTimeout) { clearTimeout(currentTimeout); currentTimeout = null; }

  if (escListener) {
    window.removeEventListener('keydown', escListener);
    escListener = null;
  }
  if (canvasListener) {
    const canvas = document.getElementById('world-canvas');
    if (canvas) canvas.removeEventListener('click', canvasListener);
    canvasListener = null;
  }

  hideNarration();
}

export function isTourActive() {
  return active;
}
