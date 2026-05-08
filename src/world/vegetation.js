import * as THREE from 'three';
import { COLORS, ZONES, WORLD } from '../config.js';

function createLowPolyTree(height) {
  const group = new THREE.Group();

  // Trunk
  const trunkGeo = new THREE.CylinderGeometry(0.15, 0.25, height * 0.35, 6);
  const trunkMat = new THREE.MeshLambertMaterial({ color: 0x8B5E3C, flatShading: true });
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.y = height * 0.175;
  trunk.castShadow = true;
  group.add(trunk);

  // 3 stacked cone foliage layers
  const foliageMat = new THREE.MeshLambertMaterial({ color: 0x4a8c4a, flatShading: true });
  const layers = [
    { radius: height * 0.38, h: height * 0.45, yOffset: height * 0.38 },
    { radius: height * 0.30, h: height * 0.40, yOffset: height * 0.62 },
    { radius: height * 0.20, h: height * 0.35, yOffset: height * 0.83 },
  ];

  layers.forEach(({ radius, h, yOffset }) => {
    const coneGeo = new THREE.ConeGeometry(radius, h, 7);
    const cone = new THREE.Mesh(coneGeo, foliageMat);
    cone.position.y = yOffset;
    cone.castShadow = true;
    group.add(cone);
  });

  return group;
}

function isNearZone(x, z, minDist = 12) {
  for (const zone of ZONES) {
    const dx = x - zone.position.x;
    const dz = z - zone.position.z;
    if (Math.sqrt(dx * dx + dz * dz) < minDist) return true;
  }
  return false;
}

export function createVegetation(scene) {
  const halfSize = WORLD.size / 2 - 10;
  let placed = 0;
  let attempts = 0;
  const maxAttempts = WORLD.treeCount * 20;

  while (placed < WORLD.treeCount && attempts < maxAttempts) {
    attempts++;
    const x = (Math.random() - 0.5) * halfSize * 2;
    const z = (Math.random() - 0.5) * halfSize * 2;

    if (isNearZone(x, z, 12)) continue;

    const height = 2.5 + Math.random() * 2.0; // 2.5 – 4.5
    const scale = 0.8 + Math.random() * 0.4;  // 0.8 – 1.2

    const tree = createLowPolyTree(height);
    tree.scale.setScalar(scale);
    tree.position.set(x, 0, z);
    // Slight random rotation for variety
    tree.rotation.y = Math.random() * Math.PI * 2;
    scene.add(tree);
    placed++;
  }
}
