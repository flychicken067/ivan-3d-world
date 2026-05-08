// Generic toast notification utility.
// Top-center, fades in/out, max 3 stacked.
//
// Usage: showToast('Saved screenshot ✓', { type: 'success' });

const MAX_STACK = 3;
const DEFAULT_DURATION = 2500;
const STACK_OFFSET_PX = 48; // vertical gap between stacked toasts

let activeToasts = []; // newest first

function reflow(el) {
  // force reflow so the next class change animates
  // eslint-disable-next-line no-unused-expressions
  el.offsetHeight;
}

function reposition() {
  // Stack from the top: index 0 is topmost (most recent).
  for (let i = 0; i < activeToasts.length; i++) {
    const el = activeToasts[i];
    el.style.setProperty('--toast-stack-y', `${i * STACK_OFFSET_PX}px`);
  }
}

function buildToast(message, type) {
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.setAttribute('role', 'status');
  el.setAttribute('aria-live', 'polite');

  if (type === 'achievement') {
    // Match the legacy achievement-toast layout — caller passes a plain message,
    // but for achievement type we render a label+name split using "—" as sep.
    const parts = String(message).split(' — ');
    const label = parts.length > 1 ? parts[0] : 'NOTICE';
    const name = parts.length > 1 ? parts.slice(1).join(' — ') : message;
    el.innerHTML = `<span class="toast-check">✓</span><span class="toast-label">${label}</span><span class="toast-sep">—</span><span class="toast-name">${name}</span>`;
  } else {
    const icon = type === 'success' ? '✓' : '·';
    el.innerHTML = `<span class="toast-check">${icon}</span><span class="toast-name">${message}</span>`;
  }
  return el;
}

/**
 * Show a toast notification.
 * @param {string} message
 * @param {{ type?: 'info'|'success'|'achievement', duration?: number }} [opts]
 */
export function showToast(message, opts = {}) {
  const type = opts.type || 'info';
  const duration = typeof opts.duration === 'number' ? opts.duration : DEFAULT_DURATION;

  const el = buildToast(message, type);
  document.body.appendChild(el);

  // Newest at the front
  activeToasts.unshift(el);
  // Cap stack size — drop oldest immediately
  while (activeToasts.length > MAX_STACK) {
    const old = activeToasts.pop();
    if (old && old.parentNode) old.parentNode.removeChild(old);
  }
  reposition();

  reflow(el);
  requestAnimationFrame(() => el.classList.add('visible'));

  setTimeout(() => {
    el.classList.remove('visible');
    setTimeout(() => {
      const idx = activeToasts.indexOf(el);
      if (idx !== -1) activeToasts.splice(idx, 1);
      if (el.parentNode) el.parentNode.removeChild(el);
      reposition();
    }, 320);
  }, duration);

  return el;
}
