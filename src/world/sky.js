import * as THREE from 'three';
import { COLORS } from '../config.js';

let skyMesh = null;
let skyMaterial = null;
const baseBottom = new THREE.Color();
const baseTop = new THREE.Color();
const tmpColor = new THREE.Color();

export function createSky(scene) {
  const vertexShader = /* glsl */`
    varying vec3 vWorldPosition;
    void main() {
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = /* glsl */`
    uniform vec3 topColor;
    uniform vec3 bottomColor;
    uniform float radius;
    varying vec3 vWorldPosition;
    void main() {
      float h = clamp((vWorldPosition.y + radius) / (2.0 * radius), 0.0, 1.0);
      gl_FragColor = vec4(mix(bottomColor, topColor, h), 1.0);
    }
  `;

  const geometry = new THREE.SphereGeometry(250, 32, 32);

  const material = new THREE.ShaderMaterial({
    uniforms: {
      topColor:    { value: new THREE.Color(COLORS.skyTop) },
      bottomColor: { value: new THREE.Color(COLORS.skyBottom) },
      radius:      { value: 250.0 },
    },
    vertexShader,
    fragmentShader,
    side: THREE.BackSide,
    depthWrite: false,
  });

  skyMesh = new THREE.Mesh(geometry, material);
  skyMaterial = material;
  baseBottom.set(COLORS.skyBottom);
  baseTop.set(COLORS.skyTop);
  scene.add(skyMesh);
  return skyMesh;
}

export function getSky() {
  return skyMesh;
}

/**
 * Subtly tint the sky based on time-of-day cycle.
 * Uses Math.sin(time / 60) to drive the cycle (~120s full pass).
 * Warmer at "sunset" edges, cooler at noon.
 */
export function updateSky(time) {
  if (!skyMaterial) return;
  if (typeof localStorage !== 'undefined' && localStorage.getItem('ivan-world-pref-reduce-motion') === '1') return;
  const cycle = Math.sin(time / 60); // -1..1
  // Warm tint at edges (|cycle|->1), cool at center (cycle=0)
  const warmth = 1 - Math.abs(cycle); // 1 at noon, 0 at sunset
  // bottom color: blend between warm orange-ish and cool baseline
  tmpColor.copy(baseBottom);
  // Sunset shift: nudge toward orange (R+, G slight-, B-)
  const sunsetMix = Math.abs(cycle) * 0.18;
  tmpColor.r = Math.min(1, baseBottom.r + sunsetMix * 0.4);
  tmpColor.g = baseBottom.g + sunsetMix * 0.05;
  tmpColor.b = Math.max(0, baseBottom.b - sunsetMix * 0.15);
  // Noon cool tint (subtle)
  tmpColor.b = Math.min(1, tmpColor.b + warmth * 0.04);
  skyMaterial.uniforms.bottomColor.value.copy(tmpColor);

  // Top color subtle shift
  tmpColor.copy(baseTop);
  tmpColor.r = Math.min(1, baseTop.r + sunsetMix * 0.15);
  tmpColor.b = Math.max(0, baseTop.b - sunsetMix * 0.05);
  skyMaterial.uniforms.topColor.value.copy(tmpColor);
}
