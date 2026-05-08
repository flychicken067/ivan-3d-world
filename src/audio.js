let ctx = null;
let masterGain = null;
let droneOsc = null;
let droneLfo = null;
let muted = false;
let initialized = false;

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
