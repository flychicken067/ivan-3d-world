import * as THREE from 'three';
import { events } from '../events.js';
import { playClick } from '../audio.js';

const raycaster = new THREE.Raycaster();
const center = new THREE.Vector2(0, 0);
let interactiveMeshes = [];
let currentlyHovered = null;
const HOVER_COLOR = new THREE.Color(0xc9a96e);
const ZERO_COLOR = new THREE.Color(0x000000);

export function setInteractiveMeshes(meshes) { interactiveMeshes = meshes; }

export function getHoveredMesh() { return currentlyHovered; }

function applyHover(mesh) {
  const mat = mesh && mesh.material;
  if (!mat || !('emissive' in mat)) return;
  if (mesh.userData._origEmissive === undefined) {
    mesh.userData._origEmissive = mat.emissive.getHex();
    mesh.userData._origEmissiveIntensity = ('emissiveIntensity' in mat) ? mat.emissiveIntensity : 1;
  }
  mat.emissive.copy(HOVER_COLOR);
  if ('emissiveIntensity' in mat) mat.emissiveIntensity = 0.4;
}

function clearHover(mesh) {
  const mat = mesh && mesh.material;
  if (!mat || !('emissive' in mat)) return;
  const origHex = mesh.userData._origEmissive;
  if (origHex !== undefined) {
    mat.emissive.setHex(origHex);
    if ('emissiveIntensity' in mat) mat.emissiveIntensity = mesh.userData._origEmissiveIntensity ?? 0;
  } else {
    mat.emissive.copy(ZERO_COLOR);
    if ('emissiveIntensity' in mat) mat.emissiveIntensity = 0;
  }
}

export function updateHover(camera) {
  raycaster.setFromCamera(center, camera);
  const intersects = raycaster.intersectObjects(interactiveMeshes, false);
  const hit = intersects.length > 0 ? intersects[0].object : null;
  if (hit !== currentlyHovered) {
    if (currentlyHovered) clearHover(currentlyHovered);
    if (hit) applyHover(hit);
    currentlyHovered = hit;
    const crosshair = document.querySelector('.crosshair');
    if (crosshair) crosshair.classList.toggle('hover-interactive', !!hit);
  }
}

export function initRaycaster(camera) {
  document.addEventListener('click', () => {
    if (!document.pointerLockElement) return;
    raycaster.setFromCamera(center, camera);
    const intersects = raycaster.intersectObjects(interactiveMeshes, false);
    if (intersects.length > 0) {
      const hit = intersects[0].object;
      const { zoneCode, zoneName } = hit.userData;
      if (zoneCode) {
        playClick();
        events.emit('zone:click', { code: zoneCode, name: zoneName });
      }
    }
  });
}
