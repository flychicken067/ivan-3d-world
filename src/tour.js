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
const RESUME_KEY = 'ivan-world-tour-last-zone';

let active = false;
let startIndex = 0;
let currentRAF = null;
let currentTimeout = null;
let narrationEl = null;
let progressEl = null;
let zoneNameEl = null;
let textEl = null;
let stopBtn = null;
let skipBtn = null;
let skipResolve = null; // resolves the wait() promise early
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
  skipBtn = narrationEl.querySelector('.tour-skip');
  if (stopBtn) {
    stopBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      stopTour();
    });
  }
  if (skipBtn) {
    skipBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      skipToNext();
    });
  }
}

function skipToNext() {
  if (currentTimeout) {
    clearTimeout(currentTimeout);
    currentTimeout = null;
  }
  if (skipResolve) {
    const r = skipResolve;
    skipResolve = null;
    r();
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
    skipResolve = resolve;
    currentTimeout = setTimeout(() => {
      currentTimeout = null;
      skipResolve = null;
      resolve();
    }, ms);
  });
}

async function runTour() {
  const total = ZONES.length;
  for (let i = startIndex; i < total; i++) {
    if (!active) return;
    const zone = ZONES[i];
    // Save current zone as last viewed (for resume)
    try { localStorage.setItem(RESUME_KEY, String(i)); } catch (e) {}
    showNarration(zone, i, total);
    await flyTo(zone);
    if (!active) return;
    await wait(PAUSE_DURATION);
    if (!active) return;
  }
  // Tour completed normally — clear resume marker
  try { localStorage.removeItem(RESUME_KEY); } catch (e) {}
  stopTour();
}

export function startTour(fromIndex = 0) {
  if (active) return;
  active = true;
  startIndex = Math.max(0, Math.min(fromIndex, ZONES.length - 1));
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

let toastEl = null;

function dismissToast() {
  if (toastEl && toastEl.parentNode) {
    toastEl.parentNode.removeChild(toastEl);
  }
  toastEl = null;
}

/**
 * Start tour, but if there's a saved last-zone from a previous interrupted
 * tour, show a small toast with [Resume] / [Start over] buttons.
 */
export function startTourMaybeResume() {
  if (active) return;
  let savedIdx = -1;
  try {
    const raw = localStorage.getItem(RESUME_KEY);
    if (raw !== null) savedIdx = parseInt(raw, 10);
  } catch (e) {}

  if (!Number.isFinite(savedIdx) || savedIdx <= 0 || savedIdx >= ZONES.length) {
    // No valid resume point → start from 0
    try { localStorage.removeItem(RESUME_KEY); } catch (e) {}
    startTour(0);
    return;
  }

  // Already showing a toast? bail
  if (toastEl) return;

  const zone = ZONES[savedIdx];
  toastEl = document.createElement('div');
  toastEl.className = 'tour-resume-toast';
  toastEl.innerHTML = `
    <div class="tour-resume-text">Resume tour from zone ${zone.code} — ${zone.label}?</div>
    <div class="tour-resume-buttons">
      <button class="tour-resume-btn resume">Resume</button>
      <button class="tour-resume-btn start-over">Start over</button>
    </div>
  `;
  document.body.appendChild(toastEl);

  toastEl.querySelector('.resume').addEventListener('click', (e) => {
    e.stopPropagation();
    dismissToast();
    startTour(savedIdx);
  });
  toastEl.querySelector('.start-over').addEventListener('click', (e) => {
    e.stopPropagation();
    try { localStorage.removeItem(RESUME_KEY); } catch (err) {}
    dismissToast();
    startTour(0);
  });
}
