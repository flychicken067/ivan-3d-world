// src/world/butterflies.js
// Ambient butterflies — Jordan Breton inspired.
// Each butterfly is a Group of two small triangle wings that flap on a hinge.
import * as THREE from 'three';

const BUTTERFLY_COUNT = 8;
const WORLD_BOUND = 100;
const WING_COLORS = [0xeed09a, 0xa090c8];

let butterflies = [];

function makeWingGeometry() {
  // Single triangle wing — 0.3 wide, 0.3 tall, hinge along the inner (X=0) edge.
  const geo = new THREE.BufferGeometry();
  const verts = new Float32Array([
    0,    0,    0,   // hinge bottom
    0.3,  0.05, 0,   // outer tip
    0.05, 0.3,  0,   // top near hinge
  ]);
  geo.setAttribute('position', new THREE.BufferAttribute(verts, 3));
  geo.computeVertexNormals();
  return geo;
}

export function createButterflies(scene) {
  butterflies = [];
  const wingGeo = makeWingGeometry();

  for (let i = 0; i < BUTTERFLY_COUNT; i++) {
    const color = WING_COLORS[i % WING_COLORS.length];
    const mat = new THREE.MeshBasicMaterial({
      color,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
    });

    const group = new THREE.Group();

    // Left wing — mirrored along X via scale.x = -1, hinge at origin.
    const leftWing = new THREE.Mesh(wingGeo, mat);
    leftWing.scale.x = -1;
    group.add(leftWing);

    // Right wing — hinge at origin.
    const rightWing = new THREE.Mesh(wingGeo, mat);
    group.add(rightWing);

    // Random initial position across world.
    group.position.set(
      (Math.random() - 0.5) * WORLD_BOUND * 1.6,
      1 + Math.random() * 2,
      (Math.random() - 0.5) * WORLD_BOUND * 1.6
    );

    scene.add(group);

    butterflies.push({
      group,
      leftWing,
      rightWing,
      // gentle drift velocity
      vx: (Math.random() - 0.5) * 0.6,
      vz: (Math.random() - 0.5) * 0.6,
      phase: Math.random() * Math.PI * 2,
      flapPhase: Math.random() * Math.PI * 2,
      bobBase: 1 + Math.random() * 2,
    });
  }
}

export function updateButterflies(time) {
  if (!butterflies.length) return;
  const flapAngle = Math.PI / 3; // ~60°

  for (let i = 0; i < butterflies.length; i++) {
    const b = butterflies[i];
    // Flap wings — 6Hz fast flutter.
    const flap = Math.sin(time * Math.PI * 2 * 6 + b.flapPhase) * flapAngle;
    // Right wing rotates around Y (inner edge); left wing mirrors.
    b.rightWing.rotation.y = -flap;
    b.leftWing.rotation.y = flap;

    // Irregular sinusoidal drift in XZ.
    const wobbleX = Math.sin(time * 0.7 + b.phase) * 0.015;
    const wobbleZ = Math.cos(time * 0.5 + b.phase * 1.3) * 0.015;
    b.group.position.x += b.vx * 0.016 + wobbleX;
    b.group.position.z += b.vz * 0.016 + wobbleZ;

    // Gentle Y bob.
    b.group.position.y = b.bobBase + Math.sin(time * 1.2 + b.phase) * 0.25;

    // Face direction of travel.
    b.group.rotation.y = Math.atan2(b.vx + wobbleX * 60, b.vz + wobbleZ * 60);

    // Reset when out of bounds.
    if (
      Math.abs(b.group.position.x) > WORLD_BOUND ||
      Math.abs(b.group.position.z) > WORLD_BOUND
    ) {
      b.group.position.x = (Math.random() - 0.5) * WORLD_BOUND * 1.6;
      b.group.position.z = (Math.random() - 0.5) * WORLD_BOUND * 1.6;
      b.vx = (Math.random() - 0.5) * 0.6;
      b.vz = (Math.random() - 0.5) * 0.6;
    }
  }
}
