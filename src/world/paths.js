import * as THREE from 'three';
import { COLORS, ZONES } from '../config.js';

const PATH_WIDTH = 2.5;
const PATH_Y = 0.08;

// Zone index connections
const CONNECTIONS = [
  [0, 1], [0, 2],
  [1, 3], [2, 3],
  [3, 4], [3, 5],
  [4, 6], [5, 6],
];

const PULSE_DURATION = 4.0; // seconds per traverse

function createPathSegment(from, to) {
  const dx = to.x - from.x;
  const dz = to.z - from.z;
  const length = Math.sqrt(dx * dx + dz * dz);
  const angle = Math.atan2(dx, dz);

  const geo = new THREE.PlaneGeometry(PATH_WIDTH, length);
  const mat = new THREE.MeshBasicMaterial({ color: 0xc9a96e, side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(geo, mat);

  mesh.rotation.x = -Math.PI / 2;
  mesh.rotation.z = angle;
  mesh.position.set(
    (from.x + to.x) / 2,
    PATH_Y,
    (from.z + to.z) / 2,
  );
  mesh.receiveShadow = true;

  return mesh;
}

// Track waypoint dots for pulsing animation
const waypointDots = [];

// Track traveling pulses — one per connection segment
const pulses = []; // { mesh, from:{x,z}, to:{x,z}, offset }

function createPulse(from, to, offset) {
  // Small bright sphere acting as a comet
  const geo = new THREE.SphereGeometry(0.32, 10, 10);
  const mat = new THREE.MeshBasicMaterial({
    color: 0xffe1a8, // brighter gold
    transparent: true,
    opacity: 0.9,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(from.x, PATH_Y + 0.15, from.z);
  return { mesh, from: { x: from.x, z: from.z }, to: { x: to.x, z: to.z }, offset };
}

export function createPaths(scene) {
  CONNECTIONS.forEach(([i, j], idx) => {
    const from = ZONES[i].position;
    const to = ZONES[j].position;
    const segment = createPathSegment(from, to);
    scene.add(segment);

    // Spawn a pulse for this segment with staggered start time
    const pulse = createPulse(from, to, (idx / CONNECTIONS.length) * PULSE_DURATION);
    scene.add(pulse.mesh);
    pulses.push(pulse);
  });

  // Gold waypoint dots — one per zone, slightly raised
  const dotGeo = new THREE.SphereGeometry(0.45, 14, 14);
  const dotMat = new THREE.MeshBasicMaterial({ color: 0xc9a96e });
  ZONES.forEach(zone => {
    const dot = new THREE.Mesh(dotGeo, dotMat);
    dot.position.set(zone.position.x, 0.25, zone.position.z);
    scene.add(dot);
    waypointDots.push(dot);
  });
}

export function setWaypointsVisible(visible) {
  for (let i = 0; i < waypointDots.length; i++) {
    waypointDots[i].visible = visible;
  }
  // Also hide pulses when waypoints are hidden — they belong to the path layer
  for (let i = 0; i < pulses.length; i++) {
    pulses[i].mesh.visible = visible;
  }
}

// Pulse the waypoint dots — subtle scale animation
export function updatePaths(time) {
  for (let i = 0; i < waypointDots.length; i++) {
    const s = 1 + Math.sin(time * 1.6 + i * 0.6) * 0.18;
    waypointDots[i].scale.set(s, s, s);
  }
  updatePulses(time);
}

// Move each pulse from the start to the end of its segment over PULSE_DURATION,
// then loop. Staggered start times via per-pulse offset.
export function updatePulses(time) {
  for (let i = 0; i < pulses.length; i++) {
    const p = pulses[i];
    const t = ((time + p.offset) % PULSE_DURATION) / PULSE_DURATION; // 0..1
    p.mesh.position.x = p.from.x + (p.to.x - p.from.x) * t;
    p.mesh.position.z = p.from.z + (p.to.z - p.from.z) * t;
    // Fade in/out at edges so the comet appears to spawn and dissipate
    const fade = Math.sin(t * Math.PI); // 0 at edges, 1 mid
    p.mesh.material.opacity = 0.25 + fade * 0.7;
    const s = 0.6 + fade * 0.6;
    p.mesh.scale.set(s, s, s);
  }
}
