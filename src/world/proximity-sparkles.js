import * as THREE from 'three';

const SPARKLE_COUNT = 15;
const PROXIMITY_RADIUS = 8;
const FADE_SPEED = 2.5; // opacity per second

let points = null;
let material = null;
let basePositions = null; // Float32Array of base offsets per particle
let phases = null;        // per-particle animation phase
let currentZoneIndex = -1;
let targetOpacity = 0;
let lastTime = 0;

export function createProximitySparkles(scene) {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(SPARKLE_COUNT * 3);
  basePositions = new Float32Array(SPARKLE_COUNT * 3);
  phases = new Float32Array(SPARKLE_COUNT);

  for (let i = 0; i < SPARKLE_COUNT; i++) {
    // Random offset around zone center
    const angle = (i / SPARKLE_COUNT) * Math.PI * 2 + Math.random() * 0.5;
    const r = 1.5 + Math.random() * 2.5;
    basePositions[i * 3 + 0] = Math.cos(angle) * r;
    basePositions[i * 3 + 1] = Math.random() * 2;
    basePositions[i * 3 + 2] = Math.sin(angle) * r;
    phases[i] = Math.random() * Math.PI * 2;
  }
  positions.set(basePositions);
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  material = new THREE.PointsMaterial({
    color: 0xc9a96e,
    size: 0.25,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  });

  points = new THREE.Points(geometry, material);
  points.position.set(0, 0, 0);
  points.frustumCulled = false;
  scene.add(points);
  return points;
}

export function updateProximitySparkles(camera, zoneGroups) {
  if (!points || !zoneGroups || !zoneGroups.length) return;
  if (typeof localStorage !== 'undefined' && localStorage.getItem('ivan-world-pref-reduce-motion') === '1') {
    if (material) material.opacity = 0;
    return;
  }

  const now = performance.now() / 1000;
  const dt = lastTime === 0 ? 0 : Math.min(now - lastTime, 0.1);
  lastTime = now;

  // Find closest zone within proximity radius
  let closestIdx = -1;
  let closestDist = Infinity;
  zoneGroups.forEach((g, i) => {
    const dx = camera.position.x - g.position.x;
    const dz = camera.position.z - g.position.z;
    const d = Math.sqrt(dx * dx + dz * dz);
    if (d < closestDist) {
      closestDist = d;
      closestIdx = i;
    }
  });

  if (closestDist <= PROXIMITY_RADIUS) {
    if (closestIdx !== currentZoneIndex) {
      currentZoneIndex = closestIdx;
      const g = zoneGroups[closestIdx];
      points.position.set(g.position.x, 0, g.position.z);
    }
    targetOpacity = 0.85;
  } else {
    targetOpacity = 0;
  }

  // Fade
  const opDelta = FADE_SPEED * dt;
  if (material.opacity < targetOpacity) {
    material.opacity = Math.min(targetOpacity, material.opacity + opDelta);
  } else if (material.opacity > targetOpacity) {
    material.opacity = Math.max(targetOpacity, material.opacity - opDelta);
  }

  if (material.opacity <= 0.001) return;

  // Animate float-up & outward
  const pos = points.geometry.attributes.position.array;
  for (let i = 0; i < SPARKLE_COUNT; i++) {
    const phase = phases[i] + now * 0.6;
    const lifeY = (phase % (Math.PI * 2)) / (Math.PI * 2); // 0..1 cycle
    const bx = basePositions[i * 3 + 0];
    const bz = basePositions[i * 3 + 2];
    const outward = 1 + lifeY * 0.6;
    pos[i * 3 + 0] = bx * outward;
    pos[i * 3 + 1] = basePositions[i * 3 + 1] + lifeY * 3;
    pos[i * 3 + 2] = bz * outward;
  }
  points.geometry.attributes.position.needsUpdate = true;
}
