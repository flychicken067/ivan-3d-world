import { events } from '../events.js';

const STORAGE_KEY = 'ivan-world-visited';
const tutorialEl = document.getElementById('tutorial');

let dismissed = false;
let dismissTimer = null;
let autoTimer = null;
let handlerAttached = false;

function dismiss() {
  if (dismissed) return;
  dismissed = true;

  clearTimeout(dismissTimer);
  clearTimeout(autoTimer);

  tutorialEl.classList.add('hidden');
  localStorage.setItem(STORAGE_KEY, '1');
}

function showTutorial() {
  tutorialEl.innerHTML = `
    <div class="tutorial-keys">WASD Move · Mouse Look · Click Interact</div>
    <div class="tutorial-dismiss">Press any key to dismiss</div>
  `;
  tutorialEl.classList.remove('hidden');

  // Auto-dismiss after 8 seconds
  autoTimer = setTimeout(() => dismiss(), 8000);

  // Allow keydown dismiss after 500ms to avoid immediate trigger
  dismissTimer = setTimeout(() => {
    if (!handlerAttached) {
      handlerAttached = true;
      document.addEventListener('keydown', dismiss, { once: true });
    }
  }, 500);
}

export function initTutorial() {
  // Skip if already visited
  if (localStorage.getItem(STORAGE_KEY)) return;

  // Show on first pointer lock (only once)
  function onFirstLock() {
    events.off('controls:locked', onFirstLock);
    showTutorial();
  }

  events.on('controls:locked', onFirstLock);
}
