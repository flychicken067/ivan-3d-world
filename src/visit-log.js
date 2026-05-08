// Time-based visit log — records each zone:enter with a timestamp.
// All client-side, persisted in localStorage. Last 50 entries kept.
//
// Data shape: Array<{ code: string, name: string, ts: number }>

import { events } from './events.js';
import { ZONES } from './config.js';

const STORAGE_KEY = 'ivan-world-visit-log';
const MAX_ENTRIES = 50;

let entries = [];
let initialized = false;

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      entries = parsed.filter(e => e && typeof e.code === 'string' && typeof e.ts === 'number');
    }
  } catch (_) { /* ignore */ }
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (_) { /* ignore */ }
}

function record(code, name) {
  if (!code) return;
  entries.push({ code, name: name || '', ts: Date.now() });
  if (entries.length > MAX_ENTRIES) {
    entries = entries.slice(entries.length - MAX_ENTRIES);
  }
  save();
}

export function initVisitLog() {
  if (initialized) return;
  initialized = true;
  load();
  events.on('zone:enter', (data) => {
    if (!data) return;
    if (typeof data === 'string') {
      record(data, '');
    } else {
      record(data.code, data.name);
    }
  });
}

/** Returns a copy of the visit log array (oldest -> newest). */
export function getVisitLog() {
  return entries.slice();
}

/** Returns the most-visited zone code, or null if no entries. */
export function getMostVisitedZone() {
  if (!entries.length) return null;
  const counts = new Map();
  for (const e of entries) {
    counts.set(e.code, (counts.get(e.code) || 0) + 1);
  }
  let topCode = null;
  let topCount = -1;
  for (const [code, count] of counts) {
    if (count > topCount) { topCount = count; topCode = code; }
  }
  return topCode;
}

/** Returns count of visits for a given zone code. */
export function getVisitCount(code) {
  let n = 0;
  for (const e of entries) if (e.code === code) n++;
  return n;
}

/** Returns the timestamp of the last visit, or null. */
export function getLastVisitTs() {
  if (!entries.length) return null;
  return entries[entries.length - 1].ts;
}

/** Resolve a zone code to its label (e.g. "Welcome"), fallback to the code. */
export function getZoneLabel(code) {
  const z = ZONES.find(z => z.code === code);
  return z ? z.label : code;
}
