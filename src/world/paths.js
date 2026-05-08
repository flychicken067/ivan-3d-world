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

export function createPaths(scene) {
  CONNECTIONS.forEach(([i, j]) => {
    const from = ZONES[i].position;
    const to = ZONES[j].position;
    const segment = createPathSegment(from, to);
    scene.add(segment);
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
}

// Pulse the waypoint dots — subtle scale animation
export function updatePaths(time) {
  for (let i = 0; i < waypointDots.length; i++) {
    const s = 1 + Math.sin(time * 1.6 + i * 0.6) * 0.18;
    waypointDots[i].scale.set(s, s, s);
  }
}
