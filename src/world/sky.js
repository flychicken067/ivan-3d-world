import * as THREE from 'three';
import { COLORS } from '../config.js';

let skyMesh = null;

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
  scene.add(skyMesh);
  return skyMesh;
}

export function getSky() {
  return skyMesh;
}
