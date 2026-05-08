import { ZONES, CAMERA } from './config.js';
import { getControls } from './controls/camera.js';
import { markAllVisited } from './visit-tracker.js';
import { playTourComplete } from './audio.js';
import { events } from './events.js';
import { burstConfetti } from './ui/confetti.js';

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
let prevBtn = null;
let skipResolve = null; // resolves the wait() promise early
let currentIndex = 0;
let prevRequested = false;
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
  prevBtn = narrationEl.querySelector('.tour-prev');
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
  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      prevToZone();
    });
  }
}

export function prevToZone() {
  if (!active) return;
  if (currentIndex <= 0) return;
  prevRequested = true;
  // Break out of current wait/fly so the loop can restart at the previous zone
  skipToNext();
}

function skipToNext() {
  completeTypewriter();
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

let typewriterTimer = null;

function isReduceMotion() {
  try {
    return localStorage.getItem('ivan-world-pref-reduce-motion') === '1';
  } catch (_) { return false; }
}

function completeTypewriter() {
  if (typewriterTimer) {
    clearInterval(typewriterTimer);
    typewriterTimer = null;
  }
  if (textEl && textEl.dataset.fullText !== undefined) {
    textEl.textContent = textEl.dataset.fullText;
  }
}

function showNarration(zone, index, total) {
  ensureDom();
  if (!narrationEl) return;
  narrationEl.classList.remove('hidden');
  if (progressEl) progressEl.textContent = `${index + 1}/${total}`;
  if (zoneNameEl) zoneNameEl.textContent = zone.name;
  const fullText = NARRATION[zone.code] || '';
  if (!textEl) return;
  textEl.dataset.fullText = fullText;
  // Cancel any in-flight typewriter from a previous zone
  if (typewriterTimer) { clearInterval(typewriterTimer); typewriterTimer = null; }
  if (isReduceMotion() || !fullText) {
    textEl.textContent = fullText;
    return;
  }
  // Typewriter: ~30ms per char
  textEl.textContent = '';
  let i = 0;
  typewriterTimer = setInterval(() => {
    i++;
    textEl.textContent = fullText.slice(0, i);
    if (i >= fullText.length) {
      clearInterval(typewriterTimer);
      typewriterTimer = null;
    }
  }, 30);
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
    const canvasEl = document.getElementById('world-canvas');
    if (canvasEl) canvasEl.classList.add('chromatic');
    const startX = cam.position.x;
    const startY = cam.position.y;
    const startZ = cam.position.z;
    const targetX = zone.position.x;
    const targetY = CAMERA.height;
    const targetZ = zone.position.z + zone.radius + 3;
    // Capture starting rotation and reset target — face toward zone (negative Z direction)
    const startRotY = cam.rotation.y;
    const startRotX = cam.rotation.x;
    cam.rotation.order = 'YXZ';
    const targetRotY = 0; // facing -Z (toward zone)
    const targetRotX = 0; // level
    const startTime = performance.now();

    function tick(now) {
      if (!active) {
        if (canvasEl) canvasEl.classList.remove('chromatic');
        resolve();
        return;
      }
      const elapsed = now - startTime;
      const raw = Math.min(elapsed / FLY_DURATION, 1);
      const t = raw < 0.5
        ? 4 * raw * raw * raw
        : 1 - Math.pow(-2 * raw + 2, 3) / 2;

      // Lerp rotation back to a neutral facing
      cam.rotation.y = startRotY + (targetRotY - startRotY) * t;
      cam.rotation.x = startRotX + (targetRotX - startRotX) * t;
      cam.position.x = startX + (targetX - startX) * t;
      cam.position.z = startZ + (targetZ - startZ) * t;
      const baseY = startY + (targetY - startY) * t;
      cam.position.y = baseY + Math.sin(raw * Math.PI) * 6;

      if (raw < 1) {
        currentRAF = requestAnimationFrame(tick);
      } else {
        cam.position.y = targetY;
        currentRAF = null;
        if (canvasEl) canvasEl.classList.remove('chromatic');
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
  let i = startIndex;
  while (i < total) {
    if (!active) return;
    currentIndex = i;
    const zone = ZONES[i];
    // Save current zone as last viewed (for resume)
    try { localStorage.setItem(RESUME_KEY, String(i)); } catch (e) {}
    showNarration(zone, i, total);
    await flyTo(zone);
    if (!active) return;
    if (prevRequested) {
      prevRequested = false;
      i = Math.max(0, i - 1);
      continue;
    }
    await wait(PAUSE_DURATION);
    if (!active) return;
    if (prevRequested) {
      prevRequested = false;
      i = Math.max(0, i - 1);
      continue;
    }
    i++;
  }
  // Tour completed normally — clear resume marker
  try { localStorage.removeItem(RESUME_KEY); } catch (e) {}
  // Mark all zones as visited
  try { markAllVisited(); } catch (e) {}

  // Celebration arpeggio
  try { playTourComplete(); } catch (e) {}
  try { events.emit('tour:complete'); } catch (e) {}

  // Brief confetti burst from the bottom-center of the tour narration.
  try {
    const narration = document.getElementById('tour-narration');
    let ox = window.innerWidth / 2;
    let oy = window.innerHeight - 80;
    if (narration) {
      const r = narration.getBoundingClientRect();
      ox = r.left + r.width / 2;
      oy = r.bottom;
    }
    burstConfetti(ox, oy);
  } catch (e) {}

  // Celebration message — brief pause showing "Tour complete"
  if (textEl && progressEl && zoneNameEl) {
    progressEl.textContent = '✓';
    zoneNameEl.textContent = 'TOUR COMPLETE';
    textEl.textContent = 'Now explore freely. Click any zone to learn more, or press ? for shortcuts.';
  }
  // Wait 4s then close, but allow user to dismiss
  await wait(4000);
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
  if (typewriterTimer) { clearInterval(typewriterTimer); typewriterTimer = null; }

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
