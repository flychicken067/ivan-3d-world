// src/world/shadows.js
// Simple flat "ground shadow" discs beneath each zone building.
// Real shadows are disabled for performance; these dark circles fake the contact.

import * as THREE from 'three';
import { ZONES } from '../config.js';

export function createGroundShadows(scene) {
  const geo = new THREE.CircleGeometry(1, 32); // unit circle, scaled per zone
  const mat = new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.18,
    depthWrite: false,
  });

  ZONES.forEach((zone) => {
    const disc = new THREE.Mesh(geo, mat);
    disc.rotation.x = -Math.PI / 2; // lay flat on ground
    const r = (zone.radius || 12) / 2;
    disc.scale.set(r, r, 1);
    disc.position.set(zone.position.x, 0.02, zone.position.z);
    disc.renderOrder = -1;
    scene.add(disc);
  });
}
