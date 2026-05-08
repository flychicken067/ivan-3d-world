import { events } from '../events.js';

const el = document.getElementById('zone-splash');
const codeEl = el ? el.querySelector('.zone-splash-code') : null;
const nameEl = el ? el.querySelector('.zone-splash-name') : null;

let lastShownAt = 0;
let hideTimeout = null;

events.on('zone:enter', ({ code, name }) => {
  if (!el || !codeEl || !nameEl) return;
  if (window.__tourActive) return;
  const now = Date.now();
  if (now - lastShownAt < 5000) return;
  lastShownAt = now;

  codeEl.textContent = code;
  nameEl.textContent = name;
  el.classList.remove('hidden');
  // restart animation
  el.classList.remove('show');
  // force reflow so animation restarts
  void el.offsetWidth;
  el.classList.add('show');

  clearTimeout(hideTimeout);
  hideTimeout = setTimeout(() => {
    el.classList.remove('show');
    el.classList.add('hidden');
  }, 1500);
});
