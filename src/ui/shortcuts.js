// Keyboard shortcuts overlay — press '?' or '/' to toggle.

const SHORTCUTS = [
  { keys: ['W', 'A', 'S', 'D'], desc: 'Move' },
  { keys: ['Mouse'], desc: 'Look around' },
  { keys: ['Click'], desc: 'Interact with zone' },
  { keys: ['Tab'], desc: 'Toggle navigation menu' },
  { keys: ['Esc'], desc: 'Close menus / stop tour' },
  { keys: ['?'], desc: 'Show / hide this help' },
];

const SECRET_HINT = 'There are easter eggs hidden in the world. Look up.';

let overlayEl = null;

function buildOverlay() {
  const el = document.createElement('div');
  el.id = 'shortcuts-overlay';
  el.className = 'shortcuts-overlay hidden';

  const rows = SHORTCUTS.map(s => {
    const keysHtml = s.keys.map(k => `<kbd class="shortcut-key">${k}</kbd>`).join('<span class="shortcut-plus">+</span>');
    return `<div class="shortcut-row"><div class="shortcut-keys">${keysHtml}</div><div class="shortcut-desc">${s.desc}</div></div>`;
  }).join('');

  el.innerHTML = `
    <div class="shortcuts-card">
      <div class="shortcuts-eyebrow">KEYBOARD SHORTCUTS</div>
      <h3 class="shortcuts-title">Quick controls</h3>
      <div class="shortcuts-list">${rows}</div>
      <div class="shortcuts-hint">${SECRET_HINT}</div>
      <button class="shortcuts-close">CLOSE</button>
    </div>
  `;

  document.body.appendChild(el);
  el.querySelector('.shortcuts-close').addEventListener('click', () => hide());
  el.addEventListener('click', (e) => {
    if (e.target === el) hide();
  });
  return el;
}

function show() {
  if (!overlayEl) overlayEl = buildOverlay();
  overlayEl.classList.remove('hidden');
}

function hide() {
  if (overlayEl) overlayEl.classList.add('hidden');
}

function toggle() {
  if (!overlayEl || overlayEl.classList.contains('hidden')) show();
  else hide();
}

export function initShortcuts() {
  window.addEventListener('keydown', (e) => {
    // '?' on most keyboards is shift+/, also check '/'
    if (e.key === '?' || (e.key === '/' && !e.target.matches('input, textarea'))) {
      e.preventDefault();
      toggle();
    }
    if (e.key === 'Escape' && overlayEl && !overlayEl.classList.contains('hidden')) {
      hide();
    }
  });
}
