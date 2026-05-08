import * as THREE from 'three';
import { ZONES } from '../config.js';

// ─── Zone accent palette — each zone gets a distinct primary color ────────────
// Cohesive Editorial Green family, each shifted to convey zone identity
const ZONE_ACCENT = {
  WELCOME:     0x4a6a3a,  // forest green — home base
  PROJECTS:    0x6a4a2a,  // warm terracotta — building/craft
  SOULPRINT:   0x8a7438,  // antique gold — ancient wisdom
  THEATER:     0x4a3a6a,  // deep purple — stage/performance
  LIBRARY:     0x6a3838,  // burgundy — books/depth
  SOCIAL:      0x2a5c7a,  // teal — connection/water
  COLLABORATE: 0x7a3838,  // crimson — energy/action
};

// ─── Material helpers ─────────────────────────────────────────────────────────
function mat(color, flat = true) {
  return new THREE.MeshLambertMaterial({ color, flatShading: flat });
}

// ─── Zone builders ────────────────────────────────────────────────────────────

/** WELCOME — large sign board on two posts */
function buildWelcome(zone) {
  const group = new THREE.Group();

  // Sign face — forest green (home base)
  const sign = new THREE.Mesh(new THREE.BoxGeometry(4, 3, 0.5), mat(ZONE_ACCENT.WELCOME));
  sign.position.set(0, 3.5, 0);
  sign.userData = { zoneCode: zone.code, zoneName: zone.name, interactive: true };
  sign.castShadow = true;
  group.add(sign);

  // Two posts
  [-1.5, 1.5].forEach(x => {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 3.5, 6), mat(0x8B5E3C));
    post.position.set(x, 1.75, 0);
    post.castShadow = true;
    group.add(post);
  });

  return group;
}

/** PROJECTS — 3 angled display boards with posts */
function buildProjects(zone) {
  const group = new THREE.Group();

  const offsets = [-4, 0, 4];
  offsets.forEach((x, i) => {
    const board = new THREE.Mesh(new THREE.BoxGeometry(3, 2, 0.3), mat(ZONE_ACCENT.PROJECTS));
    board.position.set(x, 3, 0);
    board.rotation.y = (i - 1) * 0.3;
    board.userData = { zoneCode: zone.code, zoneName: zone.name, interactive: true };
    board.castShadow = true;
    group.add(board);

    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 3, 6), mat(0x8B5E3C));
    post.position.set(x, 1.5, 0);
    post.castShadow = true;
    group.add(post);
  });

  return group;
}

/** SOULPRINT — pavilion with 4 pillars + cone roof */
function buildSoulprint(zone) {
  const group = new THREE.Group();

  // 4 pillars
  [[-2, -2], [2, -2], [-2, 2], [2, 2]].forEach(([x, z]) => {
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 4, 8), mat(0xc8b896));
    pillar.position.set(x, 2, z);
    pillar.castShadow = true;
    group.add(pillar);
  });

  // Cone roof — antique gold (ancient wisdom)
  const roof = new THREE.Mesh(new THREE.ConeGeometry(3.5, 2, 8), mat(ZONE_ACCENT.SOULPRINT));
  roof.position.set(0, 5.2, 0);
  roof.userData = { zoneCode: zone.code, zoneName: zone.name, interactive: true };
  roof.castShadow = true;
  group.add(roof);

  // Floor platform
  const floor = new THREE.Mesh(new THREE.BoxGeometry(5, 0.2, 5), mat(0xb0a080));
  floor.position.set(0, 0.1, 0);
  floor.receiveShadow = true;
  group.add(floor);

  return group;
}

/** THEATER — cone tent + flat screen */
function buildTheater(zone) {
  const group = new THREE.Group();

  // Tent — deep purple (stage)
  const tent = new THREE.Mesh(new THREE.ConeGeometry(3, 4, 7), mat(ZONE_ACCENT.THEATER));
  tent.position.set(-3, 2, 0);
  tent.userData = { zoneCode: zone.code, zoneName: zone.name, interactive: true };
  tent.castShadow = true;
  group.add(tent);

  // Screen
  const screen = new THREE.Mesh(new THREE.BoxGeometry(5, 3, 0.15), mat(0x111111));
  screen.position.set(3, 2.5, 0);
  screen.userData = { zoneCode: zone.code, zoneName: zone.name, interactive: true };
  screen.castShadow = true;
  group.add(screen);

  // Screen legs
  [1, 5].forEach(x => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.5, 6), mat(0x555555));
    leg.position.set(x, 1.25, 0);
    group.add(leg);
  });

  return group;
}

/** LIBRARY — bookshelf box + small colored book boxes on top */
function buildLibrary(zone) {
  const group = new THREE.Group();

  // Main shelf unit — burgundy (depth/books)
  const shelf = new THREE.Mesh(new THREE.BoxGeometry(5, 3, 1), mat(ZONE_ACCENT.LIBRARY));
  shelf.position.set(0, 1.5, 0);
  shelf.userData = { zoneCode: zone.code, zoneName: zone.name, interactive: true };
  shelf.castShadow = true;
  group.add(shelf);

  // Dividers
  [-1.5, 0, 1.5].forEach(x => {
    const div = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2.8, 0.9), mat(0x6b4423));
    div.position.set(x, 1.5, 0);
    group.add(div);
  });

  // Colored book boxes on top
  const bookColors = [0xc84040, 0x4080c8, 0x40c870, 0xc8a840, 0x9040c8];
  bookColors.forEach((color, i) => {
    const book = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.7, 0.8), mat(color));
    book.position.set(-2 + i * 1.0, 3.35, 0);
    book.userData = { zoneCode: zone.code, zoneName: zone.name, interactive: true };
    book.castShadow = true;
    group.add(book);
  });

  return group;
}

/** SOCIAL — cylinder pole + 4 direction sign boxes */
function buildSocial(zone) {
  const group = new THREE.Group();

  // Central pole — teal accent (connection/water)
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 5, 8), mat(ZONE_ACCENT.SOCIAL));
  pole.position.set(0, 2.5, 0);
  pole.castShadow = true;
  group.add(pole);

  // 4 directional signs at different heights
  const directions = [
    { x: 1.5, z: 0,    y: 4.5, rot: 0 },
    { x: -1.5, z: 0,   y: 3.8, rot: Math.PI },
    { x: 0,    z: 1.5, y: 3.1, rot: Math.PI / 2 },
    { x: 0,    z: -1.5,y: 2.4, rot: -Math.PI / 2 },
  ];

  directions.forEach(({ x, z, y, rot }) => {
    const sign = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.5, 0.2), mat(ZONE_ACCENT.SOCIAL));
    sign.position.set(x, y, z);
    sign.rotation.y = rot;
    sign.userData = { zoneCode: zone.code, zoneName: zone.name, interactive: true };
    sign.castShadow = true;
    group.add(sign);
  });

  return group;
}

/** HIRE — counter box + overhead sign */
function buildHire(zone) {
  const group = new THREE.Group();

  // Counter — crimson (collaborate energy)
  const counter = new THREE.Mesh(new THREE.BoxGeometry(4, 1.2, 1.5), mat(ZONE_ACCENT.COLLABORATE));
  counter.position.set(0, 0.6, 0);
  counter.userData = { zoneCode: zone.code, zoneName: zone.name, interactive: true };
  counter.castShadow = true;
  group.add(counter);

  // Counter top
  const top = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.1, 1.7), mat(0x5c5c8a));
  top.position.set(0, 1.25, 0);
  group.add(top);

  // Two support posts for overhead sign
  [-1.8, 1.8].forEach(x => {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 3.5, 6), mat(0x555570));
    post.position.set(x, 1.75, -0.5);
    post.castShadow = true;
    group.add(post);
  });

  // Overhead sign — deeper crimson
  const overSign = new THREE.Mesh(new THREE.BoxGeometry(4, 1, 0.2), mat(0x5c2a2a));
  overSign.position.set(0, 3.8, -0.5);
  overSign.userData = { zoneCode: zone.code, zoneName: zone.name, interactive: true };
  overSign.castShadow = true;
  group.add(overSign);

  return group;
}

// ─── Builder map ──────────────────────────────────────────────────────────────
const BUILDERS = {
  WELCOME:   buildWelcome,
  PROJECTS:  buildProjects,
  SOULPRINT: buildSoulprint,
  THEATER:   buildTheater,
  LIBRARY:   buildLibrary,
  SOCIAL:    buildSocial,
  COLLABORATE: buildHire,
};

// ─── Public API ───────────────────────────────────────────────────────────────

export function createZones(scene) {
  const groups = [];

  ZONES.forEach(zone => {
    const builder = BUILDERS[zone.name];
    if (!builder) return;

    const group = builder(zone);
    group.position.set(zone.position.x, 0, zone.position.z);
    scene.add(group);
    groups.push(group);
  });

  return groups;
}

// Animate zone buildings — gentle floating bob
export function updateZones(zoneGroups, time) {
  zoneGroups.forEach((group, i) => {
    // Each zone bobs at slightly different phase
    const phase = i * 1.2;
    group.position.y = Math.sin(time * 0.5 + phase) * 0.15;
  });
}

export function getInteractiveMeshes(zoneGroups) {
  const meshes = [];
  zoneGroups.forEach(group => {
    group.traverse(obj => {
      if (obj.isMesh && obj.userData.interactive === true) {
        meshes.push(obj);
      }
    });
  });
  return meshes;
}
