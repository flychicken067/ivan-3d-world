// Hidden interactions — Trey Hollinger style.
// Click the sky 7 times within 10 seconds → reveal credits.

let skyClickCount = 0;
let skyClickResetTimer = null;
let creditsShown = false;

const CREDITS_HTML = `
  <div class="credits-overlay" id="credits-overlay">
    <div class="credits-card">
      <div class="credits-eyebrow">CREDITS</div>
      <h2 class="credits-title">Built in 60 days.</h2>
      <p class="credits-body">
        Three.js for the world.<br>
        Claude Code for the building.<br>
        Coffee, walking, and a lot of doubts.
      </p>
      <div class="credits-meta">
        <span>v0.2 · 2026</span>
        <span>by Ivan</span>
      </div>
      <button class="credits-close">CLOSE</button>
    </div>
  </div>
`;

function showCredits() {
  if (creditsShown) return;
  creditsShown = true;
  const wrapper = document.createElement('div');
  wrapper.innerHTML = CREDITS_HTML;
  document.body.appendChild(wrapper.firstElementChild);

  const overlay = document.getElementById('credits-overlay');
  const close = () => {
    overlay?.remove();
    creditsShown = false;
  };
  overlay.querySelector('.credits-close').addEventListener('click', close);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });
}

export function initEasterEggs() {
  const canvas = document.getElementById('world-canvas');
  if (!canvas) return;

  // Track clicks that hit the sky (no zone hit). We piggyback on raycaster events
  // by listening to all canvas clicks and checking if a panel/zone was opened.
  // Simpler: just count any canvas click when not pointer-locked (means user is
  // clicking through the start screen / nav modes).
  canvas.addEventListener('click', (e) => {
    // Only count clicks when looking up (no zone interaction)
    // Simple heuristic: if click happened in the upper third of the screen
    if (e.clientY > window.innerHeight / 3) return;

    skyClickCount++;
    clearTimeout(skyClickResetTimer);
    skyClickResetTimer = setTimeout(() => {
      skyClickCount = 0;
    }, 10000);

    if (skyClickCount >= 7) {
      skyClickCount = 0;
      showCredits();
    }
  });
}
