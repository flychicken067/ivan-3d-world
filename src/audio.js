let ctx = null;
let masterGain = null;
let droneOsc = null;
let droneLfo = null;
let muted = false;
let initialized = false;

// Ambient pad — 3 sine pads forming a major chord, very faint
const padNodes = []; // {osc, gain, lfo, lfoGain}
let padOn = false;

const toggleBtn = document.getElementById('audio-toggle');

/**
 * Initialize Web Audio context and start ambient drone.
 * Must be called from a user gesture (click) to satisfy browser autoplay policy.
 */
export function initAudio() {
  if (initialized) return;
  initialized = true;

  ctx = new (window.AudioContext || window.webkitAudioContext)();
  masterGain = ctx.createGain();
  masterGain.gain.value = 1.0;
  masterGain.connect(ctx.destination);

  // No ambient drone — too noisy. Only event-driven sounds (click, zone enter)

  // Apply persisted ambient pad pref (default off)
  try {
    const want = localStorage.getItem('ivan-world-pref-ambient-pad') === '1';
    if (want) setAmbientPad(true);
  } catch (_) {}

  // Wire up toggle button
  if (toggleBtn) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMute();
    });
  }
}

/**
 * Short click feedback blip: 200ms sine at 440Hz
 */
export function playClick() {
  if (!ctx || muted) return;
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.value = 880; // higher = more "click", less "tone"

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.05, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

  osc.connect(gain);
  gain.connect(masterGain);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.1);
}

/**
 * Zone enter: ascending tone sweep 330 -> 660Hz over 300ms
 */
export function playZoneEnter() {
  if (!ctx || muted) return;
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(330, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.3);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.1, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

  osc.connect(gain);
  gain.connect(masterGain);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.35);
}

/**
 * Subtle hover blip — much softer than click, used when crosshair enters
 * an interactive mesh.
 */
export function playHover() {
  if (!ctx || muted) return;
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.value = 1320; // higher = softer "tick"

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.018, ctx.currentTime); // very quiet
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

  osc.connect(gain);
  gain.connect(masterGain);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.06);
}

/**
 * Tour completion chord — 3-note rising arpeggio
 */
export function playTourComplete() {
  if (!ctx || muted) return;
  const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;
    const gain = ctx.createGain();
    const t = ctx.currentTime + i * 0.12;
    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(t);
    osc.stop(t + 0.5);
  });
}

/**
 * Enable/disable subtle ambient pad layer (3 sine pads, very faint).
 * Default OFF. Each pad is gain ~0.015 with slow LFO modulation.
 */
export function setAmbientPad(on) {
  if (!ctx) {
    // remember intent so caller can re-call after initAudio
    padOn = !!on;
    return;
  }
  if (on && !padNodes.length) {
    const freqs = [220, 277.18, 329.63]; // A3, C#4, E4 (A major triad)
    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = f;
      const gain = ctx.createGain();
      gain.gain.value = 0; // ramp in
      // Slow LFO modulating the gain for movement
      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 0.05 + i * 0.013; // very slow, slightly different per pad
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.005; // tiny modulation depth
      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start();
      lfo.start();
      // Fade in
      gain.gain.setTargetAtTime(0.015, ctx.currentTime, 1.5);
      padNodes.push({ osc, gain, lfo, lfoGain });
    });
    padOn = true;
  } else if (!on && padNodes.length) {
    // Fade out then stop
    const t = ctx.currentTime;
    padNodes.forEach(n => {
      try { n.gain.gain.setTargetAtTime(0, t, 0.5); } catch (_) {}
    });
    const nodes = padNodes.splice(0, padNodes.length);
    setTimeout(() => {
      nodes.forEach(n => {
        try { n.osc.stop(); } catch (_) {}
        try { n.lfo.stop(); } catch (_) {}
      });
    }, 2000);
    padOn = false;
  }
}

export function isAmbientPadOn() { return padOn; }

/**
 * Toggle mute/unmute
 */
export function toggleMute() {
  if (!ctx) return;
  muted = !muted;
  masterGain.gain.setTargetAtTime(muted ? 0 : 1.0, ctx.currentTime, 0.05);
  if (toggleBtn) {
    toggleBtn.textContent = muted ? 'SOUND OFF' : 'SOUND ON';
  }
}
