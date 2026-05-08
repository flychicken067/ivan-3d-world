// src/world/camera-trail.js
// Smoke/comet trail behind the camera during fly animations.
import * as THREE from 'three';

const POOL_SIZE = 30;
const LIFETIME = 0.8; // seconds

let points = null;
let positions = null;
let opacities = null; // CPU-side per-particle: lifetime [0..1] (1 = fresh, 0 = dead)
let velocities = null; // Float32Array, 3 floats per particle
let material = null;
let nextIndex = 0;
let lastUpdateTime = -1;

export function createCameraTrail(scene) {
  positions = new Float32Array(POOL_SIZE * 3);
  velocities = new Float32Array(POOL_SIZE * 3);
  opacities = new Float32Array(POOL_SIZE);

  // Initialize all particles as dead, hidden far away
  for (let i = 0; i < POOL_SIZE; i++) {
    positions[i * 3] = 0;
    positions[i * 3 + 1] = -9999;
    positions[i * 3 + 2] = 0;
    opacities[i] = 0;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  material = new THREE.PointsMaterial({
    color: 0xc9a96e,
    size: 0.18,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  });

  points = new THREE.Points(geo, material);
  points.frustumCulled = false;
  scene.add(points);
  return points;
}

export function updateCameraTrail(camera, isFlying, time) {
  if (!points) return;

  const dt = lastUpdateTime < 0 ? 0.016 : Math.max(0, Math.min(0.1, time - lastUpdateTime));
  lastUpdateTime = time;

  // Spawn new particle when flying
  if (isFlying) {
    const i = nextIndex;
    positions[i * 3]     = camera.position.x;
    positions[i * 3 + 1] = camera.position.y;
    positions[i * 3 + 2] = camera.position.z;
    velocities[i * 3]     = (Math.random() - 0.5) * 0.4;
    velocities[i * 3 + 1] = 0.2 + Math.random() * 0.3; // slight upward drift
    velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.4;
    opacities[i] = 1;
    nextIndex = (nextIndex + 1) % POOL_SIZE;
  }

  // Update all live particles
  let anyAlive = false;
  let avgOpacity = 0;
  let liveCount = 0;
  for (let i = 0; i < POOL_SIZE; i++) {
    if (opacities[i] <= 0) continue;
    opacities[i] -= dt / LIFETIME;
    if (opacities[i] <= 0) {
      opacities[i] = 0;
      positions[i * 3 + 1] = -9999;
      continue;
    }
    positions[i * 3]     += velocities[i * 3] * dt;
    positions[i * 3 + 1] += velocities[i * 3 + 1] * dt;
    positions[i * 3 + 2] += velocities[i * 3 + 2] * dt;
    anyAlive = true;
    avgOpacity += opacities[i];
    liveCount++;
  }

  // Drive material opacity from average particle opacity (cheap fade)
  if (anyAlive) {
    material.opacity = (avgOpacity / liveCount) * 0.9;
  } else {
    material.opacity = 0;
  }

  points.geometry.attributes.position.needsUpdate = true;
}
