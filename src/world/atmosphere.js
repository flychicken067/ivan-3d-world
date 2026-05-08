// src/world/atmosphere.js
import * as THREE from 'three';

let particles = null;
const PARTICLE_COUNT = 150;

export function createAtmosphere(scene) {
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const sizes = new Float32Array(PARTICLE_COUNT);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 80;     // x: spread around center
    positions[i * 3 + 1] = Math.random() * 8 + 0.5;     // y: 0.5 to 8.5 height
    positions[i * 3 + 2] = (Math.random() - 0.5) * 80;  // z: spread around center
    sizes[i] = Math.random() * 2 + 1;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const mat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.08,
    transparent: true,
    opacity: 0.35,
    depthWrite: false,
    sizeAttenuation: true,
  });

  particles = new THREE.Points(geo, mat);
  scene.add(particles);
  return particles;
}

export function updateAtmosphere(time) {
  if (!particles) return;
  if (typeof localStorage !== 'undefined' && localStorage.getItem('ivan-world-pref-reduce-motion') === '1') return;

  const positions = particles.geometry.attributes.position.array;

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    // Slow upward drift
    positions[i * 3 + 1] += 0.003;

    // Gentle horizontal sway
    positions[i * 3] += Math.sin(time + i * 0.5) * 0.002;

    // Reset particles that float too high
    if (positions[i * 3 + 1] > 10) {
      positions[i * 3 + 1] = 0.5;
      positions[i * 3] = (Math.random() - 0.5) * 80;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 80;
    }
  }

  particles.geometry.attributes.position.needsUpdate = true;
}
