// Lightweight DOM confetti burst — gold particles, gravity, fade.
// Pure CSS (no canvas, no 3D) so the 3D scene stays focused.

const GOLD_PALETTE = ['#f5c542', '#ffd966', '#e0a82e', '#ffe9a8'];

function ensureContainer() {
  let c = document.getElementById('confetti-layer');
  if (!c) {
    c = document.createElement('div');
    c.id = 'confetti-layer';
    Object.assign(c.style, {
      position: 'fixed',
      inset: '0',
      pointerEvents: 'none',
      overflow: 'hidden',
      zIndex: '9999',
    });
    document.body.appendChild(c);
  }
  return c;
}

/**
 * Burst confetti from (originX, originY) — viewport pixels.
 * 30 small gold squares, randomized velocity upward + outward,
 * gravity pulls them down, full fade over 1.5s.
 */
export function burstConfetti(originX, originY) {
  const container = ensureContainer();
  const N = 30;
  const DURATION = 1500;
  const GRAVITY = 1400; // px/s^2

  const startTs = performance.now();
  const particles = [];

  for (let i = 0; i < N; i++) {
    const el = document.createElement('div');
    const size = 5 + Math.random() * 4;
    const color = GOLD_PALETTE[i % GOLD_PALETTE.length];
    Object.assign(el.style, {
      position: 'absolute',
      left: `${originX}px`,
      top: `${originY}px`,
      width: `${size}px`,
      height: `${size * (0.5 + Math.random() * 0.7)}px`,
      backgroundColor: color,
      borderRadius: Math.random() < 0.3 ? '50%' : '1px',
      transform: 'translate(-50%, -50%)',
      willChange: 'transform, opacity',
      opacity: '1',
      boxShadow: `0 0 4px ${color}`,
    });
    container.appendChild(el);

    // Random velocity — upward bias, outward spread.
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.9;
    const speed = 280 + Math.random() * 320;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;
    const rotSpeed = (Math.random() - 0.5) * 720;

    particles.push({ el, vx, vy, rot: Math.random() * 360, rotSpeed });
  }

  function frame(now) {
    const t = (now - startTs) / 1000; // seconds
    const lifeFrac = (now - startTs) / DURATION;
    if (lifeFrac >= 1) {
      particles.forEach(p => p.el.remove());
      return;
    }
    const opacity = Math.max(0, 1 - lifeFrac);
    particles.forEach(p => {
      const dx = p.vx * t;
      const dy = p.vy * t + 0.5 * GRAVITY * t * t;
      const rot = p.rot + p.rotSpeed * t;
      p.el.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) rotate(${rot}deg)`;
      p.el.style.opacity = String(opacity);
    });
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
