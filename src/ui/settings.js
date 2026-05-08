// Settings panel — gear icon top-right, toggles for accessibility prefs.
// All prefs persisted to localStorage with key prefix "ivan-world-pref-".

import { setWaypointsVisible } from '../world/paths.js';
import { setAmbientPad } from '../audio.js';

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

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    panel.classList.toggle('hidden');
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
