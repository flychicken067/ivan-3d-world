// FPS-based dynamic quality control
// Samples frame times over a rolling 60-frame window. Disables post-fx
// when avg FPS < 30 for 3s; re-enables when avg FPS > 50 for 3s.

const WINDOW = 60;
const frameTimes = [];
let lastT = performance.now();

let lowSince = 0;
let highSince = 0;
let composerRef = null;

export let usePostFx = true;

export function setComposer(composer) { composerRef = composer; }

export function update() {
  const now = performance.now();
  const dt = now - lastT;
  lastT = now;
  frameTimes.push(dt);
  if (frameTimes.length > WINDOW) frameTimes.shift();
  if (frameTimes.length < WINDOW) return;

  const avgMs = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
  const fps = 1000 / avgMs;

  if (usePostFx) {
    if (fps < 30) {
      if (!lowSince) lowSince = now;
      if (now - lowSince > 3000) {
        usePostFx = false;
        lowSince = 0;
        highSince = 0;
      }
    } else {
      lowSince = 0;
    }
  } else {
    if (fps > 50) {
      if (!highSince) highSince = now;
      if (now - highSince > 3000) {
        usePostFx = true;
        highSince = 0;
        lowSince = 0;
      }
    } else {
      highSince = 0;
    }
  }
}

export function isPostFxEnabled() { return usePostFx; }
