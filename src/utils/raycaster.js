import * as THREE from 'three';
import { events } from '../events.js';

const raycaster = new THREE.Raycaster();
const center = new THREE.Vector2(0, 0);
let interactiveMeshes = [];

export function setInteractiveMeshes(meshes) { interactiveMeshes = meshes; }

export function initRaycaster(camera) {
  document.addEventListener('click', () => {
    if (!document.pointerLockElement) return;
    raycaster.setFromCamera(center, camera);
    const intersects = raycaster.intersectObjects(interactiveMeshes, false);
    if (intersects.length > 0) {
      const hit = intersects[0].object;
      const { zoneCode, zoneName } = hit.userData;
      if (zoneCode) events.emit('zone:click', { code: zoneCode, name: zoneName });
    }
  });
}
