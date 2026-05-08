// Tracks which zones the user has visited (entered).
// Persisted in localStorage as comma-separated zone codes.
import { events } from './events.js';
import { ZONES } from './config.js';

const STORAGE_KEY = 'ivan-world-visited-zones';
let visited = new Set();

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    raw.split(',').map(s => s.trim()).filter(Boolean).forEach(c => visited.add(c));
  } catch (_) { /* ignore */ }
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, Array.from(visited).join(','));
  } catch (_) { /* ignore */ }
}

load();

events.on('zone:enter', (data) => {
  // data may be a code string or an object — handle both
  const code = typeof data === 'string' ? data : (data && (data.code || data.zoneCode));
  if (!code) return;
  if (visited.has(code)) return;
  visited.add(code);
  save();
  events.emit('visit:update', code);
});

export function getVisitedZones() {
  return new Set(visited);
}

/** Mark all known zone codes as visited (e.g. after tour completion) */
export function markAllVisited() {
  ZONES.forEach(z => visited.add(z.code));
  save();
  events.emit('visit:update', null);
}

export function isVisited(code) {
  return visited.has(code);
}
