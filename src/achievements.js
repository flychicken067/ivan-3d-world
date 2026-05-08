// Achievement system — subtle, persistent, toast-based.
// Listens to events and unlocks 5 achievements stored in localStorage.

import { events } from './events.js';
import { getVisitedZones } from './visit-tracker.js';
import { ZONES } from './config.js';
import { showToast } from './ui/toast.js';

const STORAGE_KEY = 'ivan-world-achievements';

export const ACHIEVEMENTS = {
  'first-step':    { name: 'First step',    desc: 'Entered the world' },
  'wanderer':      { name: 'Wanderer',      desc: 'Visited all 7 zones' },
  'tour-guide':    { name: 'Tour guide',    desc: 'Completed the tour' },
  'night-owl':     { name: 'Night owl',     desc: 'Visited between 11pm and 5am' },
  'easter-hunter': { name: 'Easter hunter', desc: 'Found both easter eggs' },
};

export const ACHIEVEMENT_TOTAL = Object.keys(ACHIEVEMENTS).length;

let unlocked = new Set();

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    raw.split(',').map(s => s.trim()).filter(Boolean).forEach(id => unlocked.add(id));
  } catch (_) {}
}

function save() {
  try { localStorage.setItem(STORAGE_KEY, Array.from(unlocked).join(',')); } catch (_) {}
}

export function getUnlocked() { return new Set(unlocked); }

export function getUnlockedCount() { return unlocked.size; }

function showAchievementToast(id) {
  const meta = ACHIEVEMENTS[id];
  if (!meta) return;
  showToast(`ACHIEVEMENT — ${meta.name}`, { type: 'achievement', duration: 2500 });
}

export function unlock(id) {
  if (!ACHIEVEMENTS[id]) return false;
  if (unlocked.has(id)) return false;
  unlocked.add(id);
  save();
  showAchievementToast(id);
  events.emit('achievement:unlock', id);
  // Update settings badge if present
  updateBadge();
  return true;
}

function updateBadge() {
  const el = document.getElementById('achievement-badge');
  if (el) el.textContent = `Achievements: ${unlocked.size}/${ACHIEVEMENT_TOTAL}`;
}

// Easter egg counter — track distinct egg ids
const eggs = new Set();
function recordEgg(name) {
  eggs.add(name);
  if (eggs.size >= 2) unlock('easter-hunter');
}

export function initAchievements() {
  load();

  // 1. First step — entered the world (any zone enter, or just on init after start)
  // Award on first zone:enter to mean "they actually started moving in"
  const onFirst = () => {
    unlock('first-step');
  };
  events.on('zone:enter', onFirst);
  // Also award after a short delay if they've been around (covers EXPLORE FREELY)
  setTimeout(() => unlock('first-step'), 5000);

  // 2. Wanderer — all 7 visited
  const checkWanderer = () => {
    const v = getVisitedZones();
    const allCodes = ZONES.map(z => z.code);
    if (allCodes.every(c => v.has(c))) unlock('wanderer');
  };
  events.on('visit:update', checkWanderer);
  checkWanderer(); // in case they already visited all on a previous session

  // 3. Tour guide — completed tour
  events.on('tour:complete', () => unlock('tour-guide'));

  // 4. Night owl — current local time between 23:00 and 05:00
  const h = new Date().getHours();
  if (h >= 23 || h < 5) unlock('night-owl');

  // 5. Easter hunter — both easter eggs (credits + konami)
  events.on('easter:credits', () => recordEgg('credits'));
  events.on('easter:konami', () => recordEgg('konami'));

  // Initial badge sync
  updateBadge();
}
