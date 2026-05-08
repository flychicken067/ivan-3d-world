// src/ui/start-parallax.js
// Subtle mouse parallax on the start screen — title and tagline drift
// in opposite directions for a depth illusion.

const MAX_OFFSET = 8; // px
const LERP = 0.08;

export function initStartParallax() {
  const startScreen = document.getElementById('start-screen');
  if (!startScreen) return;
  const title = startScreen.querySelector('.display-title');
  const tagline = startScreen.querySelector('.start-tagline');
  if (!title && !tagline) return;

  // Skip on touch devices / reduced motion
  if (typeof window !== 'undefined' && window.matchMedia) {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  }
  if (typeof localStorage !== 'undefined' && localStorage.getItem('ivan-world-pref-reduce-motion') === '1') return;

  let targetX = 0, targetY = 0;
  let curX = 0, curY = 0;
  let rafId = null;
  let active = true;

  startScreen.addEventListener('mousemove', (e) => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    targetX = (e.clientX / w) * 2 - 1; // -1..1
    targetY = (e.clientY / h) * 2 - 1;
  });

  startScreen.addEventListener('mouseleave', () => {
    targetX = 0;
    targetY = 0;
  });

  function tick() {
    curX += (targetX - curX) * LERP;
    curY += (targetY - curY) * LERP;

    if (title) {
      title.style.transform = `translate3d(${(-curX * MAX_OFFSET).toFixed(2)}px, ${(-curY * MAX_OFFSET).toFixed(2)}px, 0)`;
    }
    if (tagline) {
      tagline.style.transform = `translate3d(${(curX * MAX_OFFSET).toFixed(2)}px, ${(curY * MAX_OFFSET).toFixed(2)}px, 0)`;
    }

    // Stop animating when start screen is hidden
    if (startScreen.style.display === 'none' || startScreen.classList.contains('fade-out')) {
      active = false;
    }
    if (active) rafId = requestAnimationFrame(tick);
  }
  rafId = requestAnimationFrame(tick);
}
