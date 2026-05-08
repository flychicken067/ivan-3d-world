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

  // Ambient drone: low-frequency oscillator with LFO modulation
  droneOsc = ctx.createOscillator();
  droneOsc.type = 'sine';
  droneOsc.frequency.value = 55; // A1, deep hum

  const droneGain = ctx.createGain();
  droneGain.gain.value = 0.06; // very quiet

  // LFO for gentle volume modulation
  droneLfo = ctx.createOscillator();
  droneLfo.type = 'sine';
  droneLfo.frequency.value = 0.15; // slow breathing

  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 0.02; // subtle modulation depth

  droneLfo.connect(lfoGain);
  lfoGain.connect(droneGain.gain);

  droneOsc.connect(droneGain);
  droneGain.connect(masterGain);

  droneOsc.start();
  droneLfo.start();

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
  osc.frequency.value = 440;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.12, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

  osc.connect(gain);
  gain.connect(masterGain);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.2);
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
