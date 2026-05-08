import * as THREE from 'three';
import { COLORS, WORLD } from '../config.js';

let terrainMesh = null;

export function createTerrain(scene) {
  const geometry = new THREE.PlaneGeometry(WORLD.size, WORLD.size, 40, 40);

  // Rotate to lie flat
  geometry.applyMatrix4(new THREE.Matrix4().makeRotationX(-Math.PI / 2));

  const positionAttr = geometry.attributes.position;
  const vertexCount = positionAttr.count;

  // Vertex displacement — Low Poly feel
  for (let i = 0; i < vertexCount; i++) {
    const y = positionAttr.getY(i);
    // Only displace non-edge vertices to avoid seam gaps (optional guard)
    positionAttr.setY(i, y + (Math.random() * 0.4 - 0.2));
  }
  positionAttr.needsUpdate = true;
  geometry.computeVertexNormals();

  // Vertex colors: blend ground and groundAlt with random factor 0-0.3
  const colorBase = new THREE.Color(COLORS.ground);
  const colorAlt  = new THREE.Color(COLORS.groundAlt);
  const colors = new Float32Array(vertexCount * 3);

  for (let i = 0; i < vertexCount; i++) {
    const t = Math.random() * 0.3;
    const c = colorBase.clone().lerp(colorAlt, t);
    colors[i * 3]     = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }

  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.MeshLambertMaterial({
    vertexColors: true,
    flatShading: true,
  });

  terrainMesh = new THREE.Mesh(geometry, material);
  terrainMesh.receiveShadow = true;
  scene.add(terrainMesh);
  return terrainMesh;
}

export function getTerrain() {
  return terrainMesh;
}
