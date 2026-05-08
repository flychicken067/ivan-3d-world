import { events } from '../events.js';

const el = document.getElementById('zone-splash');
const codeEl = el ? el.querySelector('.zone-splash-code') : null;
const nameEl = el ? el.querySelector('.zone-splash-name') : null;
const timeEl = el ? el.querySelector('.zone-splash-time') : null;

let lastShownAt = 0;
let hideTimeout = null;

function formatTime(d) {
  let h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
}

events.on('zone:enter', ({ code, name }) => {
  if (!el || !codeEl || !nameEl) return;
  if (window.__tourActive) return;
  const now = Date.now();
  if (now - lastShownAt < 5000) return;
  lastShownAt = now;

  codeEl.textContent = code;
  nameEl.textContent = name;
  if (timeEl) timeEl.textContent = formatTime(new Date());
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
