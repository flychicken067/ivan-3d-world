// Settings panel — gear icon top-right, toggles for accessibility prefs.
// All prefs persisted to localStorage with key prefix "ivan-world-pref-".

import { setWaypointsVisible } from '../world/paths.js';
import { setAmbientPad } from '../audio.js';
import {
  getMostVisitedZone,
  getVisitCount,
  getLastVisitTs,
  getZoneLabel,
  getVisitLog,
} from '../visit-log.js';

const TOTAL_TIME_KEY = 'ivan-world-total-time-ms';

function formatRelativeTime(ts) {
  if (!ts) return '—';
  const diff = Date.now() - ts;
  if (diff < 60_000) return 'just now';
  const m = Math.floor(diff / 60_000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function formatDuration(ms) {
  if (!ms || ms < 1000) return '< 1m';
  const totalMin = Math.floor(ms / 60_000);
  if (totalMin < 1) return '< 1m';
  if (totalMin < 60) return `~${totalMin}m`;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return m === 0 ? `~${h}h` : `~${h}h ${m}m`;
}

function readTotalTimeMs() {
  try {
    const v = parseInt(localStorage.getItem(TOTAL_TIME_KEY) || '0', 10);
    return Number.isFinite(v) ? v : 0;
  } catch (_) { return 0; }
}

function renderJourneySummary() {
  const el = document.getElementById('journey-summary');
  if (!el) return;
  const log = getVisitLog();
  if (!log.length) {
    el.innerHTML = '<span class="journey-row journey-empty">Your journey starts here.</span>';
    return;
  }
  const top = getMostVisitedZone();
  const topLabel = top ? getZoneLabel(top) : '—';
  const topCount = top ? getVisitCount(top) : 0;
  const last = formatRelativeTime(getLastVisitTs());
  const total = formatDuration(readTotalTimeMs());
  el.innerHTML = [
    `<span class="journey-row">Most visited: <strong>${topLabel}</strong> (${topCount}x)</span>`,
    `<span class="journey-row">Last visit: ${last}</span>`,
    `<span class="journey-row">Total time: ${total}</span>`,
  ].join('');
}

const PREFS = {
  'reduce-motion': { key: 'ivan-world-pref-reduce-motion', default: false },
  'show-compass':  { key: 'ivan-world-pref-show-compass', default: true },
  'show-waypoints':{ key: 'ivan-world-pref-show-waypoints', default: true },
  'ambient-pad':   { key: 'ivan-world-pref-ambient-pad',   default: false },
};

function getPref(name) {
  const cfg = PREFS[name];
  if (!cfg) return false;
  const v = localStorage.getItem(cfg.key);
  if (v === null) return cfg.default;
  return v === '1';
}

function setPref(name, value) {
  const cfg = PREFS[name];
  if (!cfg) return;
  localStorage.setItem(cfg.key, value ? '1' : '0');
}

function applyCompassPref(visible) {
  const compass = document.getElementById('compass');
  if (compass) compass.style.display = visible ? '' : 'none';
}

function applyWaypointsPref(visible) {
  setWaypointsVisible(visible);
}

export function initSettings() {
  const btn = document.getElementById('settings-toggle');
  const panel = document.getElementById('settings-panel');
  const cbReduce = document.getElementById('pref-reduce-motion');
  const cbCompass = document.getElementById('pref-show-compass');
  const cbWaypoints = document.getElementById('pref-show-waypoints');
  const cbAmbient = document.getElementById('pref-ambient-pad');
  if (!btn || !panel) return;

  // Load initial values
  if (cbReduce) cbReduce.checked = getPref('reduce-motion');
  if (cbCompass) cbCompass.checked = getPref('show-compass');
  if (cbWaypoints) cbWaypoints.checked = getPref('show-waypoints');
  if (cbAmbient) cbAmbient.checked = getPref('ambient-pad');

  // Apply on init
  applyCompassPref(getPref('show-compass'));
  applyWaypointsPref(getPref('show-waypoints'));

  // Inject journey summary container if missing
  if (!document.getElementById('journey-summary')) {
    const wrap = document.createElement('div');
    wrap.id = 'journey-summary';
    wrap.className = 'settings-row journey-summary';
    panel.appendChild(wrap);
  }

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const wasHidden = panel.classList.contains('hidden');
    panel.classList.toggle('hidden');
    // Re-render on open
    if (wasHidden) renderJourneySummary();
  });

  // Click-outside to close
  document.addEventListener('click', (e) => {
    if (panel.classList.contains('hidden')) return;
    if (panel.contains(e.target) || btn.contains(e.target)) return;
    panel.classList.add('hidden');
  });

  if (cbReduce) cbReduce.addEventListener('change', () => {
    setPref('reduce-motion', cbReduce.checked);
  });
  if (cbCompass) cbCompass.addEventListener('change', () => {
    setPref('show-compass', cbCompass.checked);
    applyCompassPref(cbCompass.checked);
  });
  if (cbWaypoints) cbWaypoints.addEventListener('change', () => {
    setPref('show-waypoints', cbWaypoints.checked);
    applyWaypointsPref(cbWaypoints.checked);
  });
  if (cbAmbient) cbAmbient.addEventListener('change', () => {
    setPref('ambient-pad', cbAmbient.checked);
    try { setAmbientPad(cbAmbient.checked); } catch (_) {}
  });
}
