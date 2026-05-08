import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';
import { COLORS, CAMERA } from './config.js';
import { createSky } from './world/sky.js';
import { createTerrain } from './world/terrain.js';
import { createVegetationInstanced } from './world/vegetation.js';
import { createPaths } from './world/paths.js';
import { createZones, getInteractiveMeshes, updateZones } from './world/zones.js';
import { createAtmosphere, updateAtmosphere } from './world/atmosphere.js';
import { initPostProcessing } from './postprocessing.js';
import { initCameraControls } from './controls/camera.js';
import { initMovement, updateMovement, initTouchControls } from './controls/movement.js';
import { setInteractiveMeshes, initRaycaster } from './utils/raycaster.js';
import { updateHud, getCurrentZone } from './ui/hud.js';
import { initMinimap, updateMinimap } from './ui/minimap.js';
import { initOverlay } from './ui/overlay.js';
import { initNav } from './ui/nav.js';
import { initTutorial } from './ui/tutorial.js';
import { initAudio, playZoneEnter } from './audio.js';
import { events } from './events.js';
import './tour.js';

const canvas = document.getElementById('world-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
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

// Post-processing pipeline (bloom, tone mapping, vignette)
const composer = initPostProcessing(renderer, scene, camera);

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

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  updateMovement(delta);

  // Tween updates (Task 15)
  TWEEN.update();

  // HUD zone indicator (Task 10)
  updateHud(camera.position.x, camera.position.z);

  // Minimap active zone highlight (Task 11)
  updateMinimap(getCurrentZone());

  // Visual upgrades — animations & atmosphere
  const elapsed = clock.elapsedTime;
  updateZones(zoneGroups, elapsed);
  updateAtmosphere(elapsed);

  composer.render();
}
animate();

export { scene, camera, renderer, zoneGroups, interactiveMeshes };
