import * as THREE from 'three';
import { COLORS, CAMERA } from './config.js';
import { createSky } from './world/sky.js';
import { createTerrain } from './world/terrain.js';
import { createVegetation } from './world/vegetation.js';
import { createPaths } from './world/paths.js';
import { createZones, getInteractiveMeshes } from './world/zones.js';
import { initCameraControls } from './controls/camera.js';
import { initMovement, updateMovement } from './controls/movement.js';

const canvas = document.getElementById('world-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(COLORS.bgDeep);
renderer.shadowMap.enabled = true;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(CAMERA.fov, window.innerWidth / window.innerHeight, CAMERA.near, CAMERA.far);
camera.position.set(CAMERA.startPosition.x, CAMERA.startPosition.y, CAMERA.startPosition.z);

// Lights
const ambient = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambient);
const directional = new THREE.DirectionalLight(0xffffff, 0.8);
directional.position.set(50, 80, 30);
directional.castShadow = true;
scene.add(directional);

// World
createSky(scene);
createTerrain(scene);
createVegetation(scene);
createPaths(scene);
const zoneGroups = createZones(scene);
const interactiveMeshes = getInteractiveMeshes(zoneGroups);

// Controls
initCameraControls(camera, document.body);
initMovement();

// Resize handler
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Render loop with delta time
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  updateMovement(delta);
  renderer.render(scene, camera);
}
animate();

export { scene, camera, renderer, zoneGroups, interactiveMeshes };
