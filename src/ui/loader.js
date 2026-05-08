// Lightweight visual loader — shows a progress bar before the start screen reveals.
// We don't actually load assets (everything is procedural), but Three.js compiles
// shaders + post-processing the first frame, so we give the user visual feedback.

const STEPS = [
  'Initializing world',
  'Generating terrain',
  'Planting vegetation',
  'Building zones',
  'Compositing atmosphere',
  'Ready',
];

export function initLoader() {
  const loaderEl = document.getElementById('world-loader');
  if (!loaderEl) return;

  const fillEl = loaderEl.querySelector('.loader-fill');
  const labelEl = loaderEl.querySelector('.loader-label');

  let step = 0;
  const total = STEPS.length;

  function tick() {
    if (step >= total) {
      loaderEl.classList.add('fade-out');
      setTimeout(() => loaderEl.remove(), 400);
      return;
    }
    const pct = ((step + 1) / total) * 100;
    if (fillEl) fillEl.style.width = `${pct}%`;
    if (labelEl) labelEl.textContent = STEPS[step];
    step++;
    setTimeout(tick, 220 + Math.random() * 120);
  }

  // Slight delay so users see the loader at all
  setTimeout(tick, 100);
}
