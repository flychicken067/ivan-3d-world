// src/world/dust.js
// Subtle dust motes drifting in slow circular paths in the air,
// concentrated near zone centers. Distinct from atmosphere.js (generic floats).
import * as THREE from 'three';
import { ZONES } from '../config.js';

const DUST_COUNT = 50;
let dust = null;
let centers = null;     // Float32Array per particle: center x, z
let radii = null;       // orbit radius
let phases = null;      // start phase
let speeds = null;      // angular speed
let yBase = null;       // base height

export function createDust(scene) {
  if (!ZONES || ZONES.length === 0) return null;

  const positions = new Float32Array(DUST_COUNT * 3);
  centers = new Float32Array(DUST_COUNT * 2);
  radii = new Float32Array(DUST_COUNT);
  phases = new Float32Array(DUST_COUNT);
  speeds = new Float32Array(DUST_COUNT);
  yBase = new Float32Array(DUST_COUNT);

  for (let i = 0; i < DUST_COUNT; i++) {
    const zone = ZONES[i % ZONES.length];
    centers[i * 2]     = zone.position.x + (Math.random() - 0.5) * 6;
    centers[i * 2 + 1] = zone.position.z + (Math.random() - 0.5) * 6;
    radii[i]   = 0.3 + Math.random() * 0.5;            // ~0.5 unit radius
    phases[i]  = Math.random() * Math.PI * 2;
    speeds[i]  = 0.2 + Math.random() * 0.3;            // slow
    yBase[i]   = 1.2 + Math.random() * 2.5;            // chest-to-head height

    positions[i * 3]     = centers[i * 2];
    positions[i * 3 + 1] = yBase[i];
    positions[i * 3 + 2] = centers[i * 2 + 1];
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const mat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.04,
    transparent: true,
    opacity: 0.15,
    depthWrite: false,
    sizeAttenuation: true,
  });

  dust = new THREE.Points(geo, mat);
  scene.add(dust);
  return dust;
}

export function updateDust(time) {
  if (!dust) return;
  if (typeof localStorage !== 'undefined' && localStorage.getItem('ivan-world-pref-reduce-motion') === '1') return;

  const positions = dust.geometry.attributes.position.array;
  for (let i = 0; i < DUST_COUNT; i++) {
    const angle = phases[i] + time * speeds[i];
    positions[i * 3]     = centers[i * 2]     + Math.cos(angle) * radii[i];
    positions[i * 3 + 2] = centers[i * 2 + 1] + Math.sin(angle) * radii[i];
    // Tiny vertical bob
    positions[i * 3 + 1] = yBase[i] + Math.sin(time * 0.4 + i) * 0.15;
  }
  dust.geometry.attributes.position.needsUpdate = true;
}
