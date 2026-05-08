import * as THREE from 'three';
import { COLORS, ZONES } from '../config.js';

const PATH_WIDTH = 3;
const PATH_Y = 0.05;

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
  const mat = new THREE.MeshLambertMaterial({ color: COLORS.pathColor, side: THREE.DoubleSide });
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

export function createPaths(scene) {
  CONNECTIONS.forEach(([i, j]) => {
    const from = ZONES[i].position;
    const to = ZONES[j].position;
    const segment = createPathSegment(from, to);
    scene.add(segment);
  });
}
