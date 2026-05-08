import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';
import { COLORS, CAMERA } from './config.js';
import { createSky, updateSky } from './world/sky.js';
import { createProximitySparkles, updateProximitySparkles } from './world/proximity-sparkles.js';
import { createTerrain } from './world/terrain.js';
import { createVegetationInstanced } from './world/vegetation.js';
import { createPaths, updatePaths } from './world/paths.js';
import { createZones, getInteractiveMeshes, updateZones } from './world/zones.js';
import { createAtmosphere, updateAtmosphere } from './world/atmosphere.js';
import { initPostProcessing } from './postprocessing.js';
import { initCameraControls } from './controls/camera.js';
import { initMovement, updateMovement, initTouchControls } from './controls/movement.js';
import { setInteractiveMeshes, initRaycaster, updateHover } from './utils/raycaster.js';
import { updateHud, getCurrentZone } from './ui/hud.js';
import { initMinimap, updateMinimap, isFlying as isMinimapFlying } from './ui/minimap.js';
import { initStartParallax } from './ui/start-parallax.js';
import { createCameraTrail, updateCameraTrail } from './world/camera-trail.js';
import { createDust, updateDust } from './world/dust.js';
import { initOverlay } from './ui/overlay.js';
import { initNav } from './ui/nav.js';
import { initTutorial } from './ui/tutorial.js';
import { initAudio, playZoneEnter } from './audio.js';
import { events } from './events.js';
import './tour.js';
import './ui/zone-splash.js';
import { setComposer, update as perfUpdate, usePostFx } from './perf.js';
import { initLoader } from './ui/loader.js';
import { initCompass, updateCompass } from './ui/compass.js';
import { initEasterEggs } from './easter-eggs.js';
import { initShortcuts } from './ui/shortcuts.js';
import { initSettings } from './ui/settings.js';
import { isPanelOpen, closePanel } from './ui/overlay.js';
import { isTourActive, stopTour } from './tour.js';
import { initHomeButton } from './ui/home-button.js';
import { createButterflies, updateButterflies } from './world/butterflies.js';
import { initShare } from './ui/share.js';
import { initIdleScreensaver } from './idle-screensaver.js';
import './visit-tracker.js';
import { initVisitLog } from './visit-log.js';
import { initAchievements } from './achievements.js';
import { showToast } from './ui/toast.js';
import { initStartClock } from './ui/start-clock.js';

// Auto-enable reduce-motion if the OS-level preference is set and the user
// has not explicitly chosen a value yet.
if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
  try {
    if (localStorage.getItem('ivan-world-pref-reduce-motion') === null
        && window.matchMedia
        && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      localStorage.setItem('ivan-world-pref-reduce-motion', '1');
    }
  } catch (_) { /* ignore */ }
}

const REDUCE_MOTION = typeof localStorage !== 'undefined'
  && localStorage.getItem('ivan-world-pref-reduce-motion') === '1';

// --- WebGL support detection ---
function isWebGLAvailable() {
  try {
    if (typeof window === 'undefined') return false;
    if (!window.WebGLRenderingContext) return false;
    const test = document.createElement('canvas');
    return !!(test.getContext('webgl') || test.getContext('experimental-webgl'));
  } catch (_) {
    return false;
  }
}

const canvas = document.getElementById('world-canvas');

if (!isWebGLAvailable()) {
  // Hide canvas and loader, show fallback
  if (canvas) canvas.style.display = 'none';
  const loader = document.getElementById('world-loader');
  if (loader) loader.style.display = 'none';
  const startScreen = document.getElementById('start-screen');
  if (startScreen) startScreen.style.display = 'none';
  const fallback = document.getElementById('webgl-fallback');
  if (fallback) fallback.classList.remove('hidden');
  throw new Error('WebGL not available — fallback shown.');
}

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(COLORS.bgDeep);
// shadowMap disabled — not needed for Low Poly flat-shading style, saves GPU

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(CAMERA.fov, window.innerWidth / window.innerHeight, CAMERA.near, CAMERA.far);
camera.position.set(CAMERA.startPosition.x, CAMERA.startPosition.y, CAMERA.startPosition.z);

// Lights
const ambient = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambient);
const directional = new THREE.DirectionalLight(0xffffff, 0.8);
directional.position.set(50, 80, 30);
// castShadow disabled for performance
scene.add(directional);

// Fog — atmospheric depth, hides world edges
scene.fog = new THREE.FogExp2(0xb8d4a8, 0.018);
renderer.setClearColor(0xb8d4a8); // match fog color for seamless horizon

// World
createSky(scene);
createTerrain(scene);
createVegetationInstanced(scene);
createPaths(scene);
const zoneGroups = createZones(scene);
const interactiveMeshes = getInteractiveMeshes(zoneGroups);
createAtmosphere(scene);
createProximitySparkles(scene);
if (!REDUCE_MOTION) createButterflies(scene);
if (!REDUCE_MOTION) createDust(scene);
createCameraTrail(scene);

// Dynamic sun — slowly rotate directional light along an arc.
// Y stays high (50–80), X swings -50..+50, ~120s for a full pass.
function updateSun(time) {
  const cycle = Math.sin(time / 60); // -1..1, ~120s period
  directional.position.x = cycle * 50;
  directional.position.y = 65 + Math.cos(time / 60) * 15; // 50..80
  directional.position.z = 30;
}

// Post-processing pipeline (bloom, tone mapping, vignette)
const composer = initPostProcessing(renderer, scene, camera);
setComposer(composer);

// Controls
initCameraControls(camera, document.body);
initMovement();
initTouchControls();

// Raycaster (Task 9)
setInteractiveMeshes(interactiveMeshes);
initRaycaster(camera);

// Minimap (Task 11)
initMinimap();

// Panel overlay (Task 12)
initOverlay();

// Nav overlay (Task 13)
initNav();

// Tutorial overlay (Task 14)
initTutorial();

// Loader, compass, easter eggs, shortcuts
initLoader();
initCompass();
initEasterEggs();
initShortcuts();
initSettings();
initHomeButton();
initIdleScreensaver();
initStartParallax();
initAchievements();
initVisitLog();

// ─── Consolidated ESC priority handler ─────────────────────────────────
// Runs in capture phase; the first action that fires also stops propagation
// so the legacy per-component ESC listeners don't double-handle. Priority:
//   1. Shortcuts overlay
//   2. Credits overlay
//   3. Zone panel
//   4. Tour (active)
//   5. Settings panel
//   6. Otherwise: do nothing
window.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  // Don't hijack ESC inside form fields
  const t = e.target;
  if (t && t.matches && t.matches('input, textarea, select')) return;

  const shortcuts = document.getElementById('shortcuts-overlay');
  if (shortcuts && !shortcuts.classList.contains('hidden')) {
    shortcuts.classList.add('hidden');
    e.stopPropagation();
    e.stopImmediatePropagation();
    return;
  }
  const credits = document.getElementById('credits-overlay');
  if (credits) {
    // Use the close button so easter-eggs.js can reset its internal state.
    const closeBtn = credits.querySelector('.credits-close');
    if (closeBtn) closeBtn.click(); else credits.remove();
    e.stopPropagation();
    e.stopImmediatePropagation();
    return;
  }
  if (isPanelOpen()) {
    closePanel();
    e.stopPropagation();
    e.stopImmediatePropagation();
    return;
  }
  if (isTourActive()) {
    stopTour();
    e.stopPropagation();
    e.stopImmediatePropagation();
    return;
  }
  const settings = document.getElementById('settings-panel');
  if (settings && !settings.classList.contains('hidden')) {
    settings.classList.add('hidden');
    e.stopPropagation();
    e.stopImmediatePropagation();
    return;
  }
  // Otherwise: do nothing
}, true);

// Inject "what's new" line into the start screen, above action buttons.
try {
  const startContent = document.querySelector('.start-content');
  const startActions = document.querySelector('.start-actions');
  if (startContent && startActions && !document.querySelector('.start-whats-new')) {
    const line = document.createElement('div');
    line.className = 'start-whats-new';
    line.textContent = "WHAT'S NEW · v0.7 — achievements, ambient sound, journey log";
    startContent.insertBefore(line, startActions);
  }
} catch (_) { /* ignore */ }

// Init the start-screen live clock (shown below the WHAT'S NEW line).
try { initStartClock(); } catch (_) { /* ignore */ }

// Total-time tracker: increment localStorage value each frame while the world
// is active (start screen dismissed). Capped per-tick to avoid huge jumps.
const TOTAL_TIME_KEY = 'ivan-world-total-time-ms';
let _totalTimeAccumMs = 0;
function isWorldActive() {
  const start = document.getElementById('start-screen');
  if (!start) return true;
  // Treat as active once start screen is hidden / faded out
  return start.classList.contains('hidden') || start.classList.contains('fade-out')
      || start.style.display === 'none';
}
function tickTotalTime(deltaSec) {
  if (!isWorldActive()) return;
  if (document.hidden) return;
  // Cap delta to 1s to avoid stalls inflating the count
  const dms = Math.min(1000, Math.max(0, deltaSec * 1000));
  _totalTimeAccumMs += dms;
  if (_totalTimeAccumMs >= 5000) {
    try {
      const cur = parseInt(localStorage.getItem(TOTAL_TIME_KEY) || '0', 10) || 0;
      localStorage.setItem(TOTAL_TIME_KEY, String(cur + Math.round(_totalTimeAccumMs)));
    } catch (_) {}
    _totalTimeAccumMs = 0;
  }
}

// Returning visitor detection — adjust start screen primary CTA text
try {
  const sessionCount = parseInt(localStorage.getItem('ivan-world-session-count') || '0', 10) || 0;
  const visitedRaw = localStorage.getItem('ivan-world-visited-zones') || '';
  const isReturning = sessionCount > 1 || visitedRaw.trim().length > 0;
  const tourBtn = document.getElementById('start-tour-btn');
  if (tourBtn && isReturning) {
    tourBtn.textContent = '▶ CONTINUE EXPLORING';
  }
  // Mark visited so future loads see it
  localStorage.setItem('ivan-world-visited', '1');
} catch (_) {}
initShare({
  canvas,
  render: () => {
    if (usePostFx) composer.render();
    else renderer.render(scene, camera);
  },
});

// Audio — init on first user click (browser autoplay policy)
document.addEventListener('click', function startAudio() {
  initAudio();
  document.removeEventListener('click', startAudio);
}, { once: true });

// Play zone-enter sound when zone changes
events.on('zone:enter', () => playZoneEnter());

// Resize handler
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});

// Render loop with delta time
const clock = new THREE.Clock();
let frameCount = 0;

function animate() {
  requestAnimationFrame(animate);
  frameCount++;
  const delta = clock.getDelta();
  tickTotalTime(delta);
  updateMovement(delta);

  // Tween updates (Task 15)
  TWEEN.update();

  // HUD zone indicator — every 3 frames
  if (frameCount % 3 === 0) {
    updateHud(camera.position.x, camera.position.z);
  }

  // Minimap active zone highlight — every 5 frames
  if (frameCount % 5 === 0) {
    updateMinimap(getCurrentZone());
  }

  // Visual upgrades — animations & atmosphere
  const elapsed = clock.elapsedTime;
  updateZones(zoneGroups, elapsed);
  updatePaths(elapsed);
  updateAtmosphere(elapsed);
  updateSun(elapsed);
  updateSky(elapsed);
  if (frameCount % 2 === 0) {
    updateProximitySparkles(camera, zoneGroups);
  }
  if (!REDUCE_MOTION) updateButterflies(elapsed);
  if (!REDUCE_MOTION) updateDust(elapsed);

  // Camera trail — active during tour or minimap fly
  const flying = (typeof window !== 'undefined' && window.__tourActive) || isMinimapFlying();
  updateCameraTrail(camera, flying, elapsed);

  // Hover detection on interactive meshes (center crosshair raycast)
  updateHover(camera);

  // Compass needle update — every 2 frames
  if (frameCount % 2 === 0) {
    updateCompass(camera);
  }

  // FPS-adaptive quality
  perfUpdate();

  if (usePostFx) {
    composer.render();
  } else {
    renderer.render(scene, camera);
  }
}
animate();

export { scene, camera, renderer, zoneGroups, interactiveMeshes };
