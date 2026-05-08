import * as THREE from 'three';
import { ZONES } from '../config.js';
import { getHoveredMesh } from '../utils/raycaster.js';

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

// Track welcome zone orbs for animation
const welcomeOrbs = [];

// Track soulprint incense flames for flicker animation
const soulprintFlames = [];

// Track library books for hover-lift animation
const libraryBooks = [];

// Color names for the 5 library books — must match bookColors order below
const LIBRARY_BOOK_NAMES = ['red', 'blue', 'green', 'gold', 'purple'];
export function getLibraryBookName(index) {
  return LIBRARY_BOOK_NAMES[index] || '';
}

/** WELCOME — large sign board on two posts + portrait frame + floating orbs */
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

  // Portrait frame — dark frame above the sign (banner-style)
  const frameOuter = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.6, 0.25), mat(0x2a1f15));
  frameOuter.position.set(0, 6.0, 0.15);
  frameOuter.castShadow = true;
  group.add(frameOuter);

  // Cream interior (procedural placeholder for portrait/avatar)
  const frameInner = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.2, 0.1), mat(0xefe7d3));
  frameInner.position.set(0, 6.0, 0.32);
  group.add(frameInner);

  // 3 floating gold orbs — "60 days, 6 products, 1 book"
  const orbMat = new THREE.MeshLambertMaterial({
    color: 0xc9a96e,
    emissive: 0xc9a96e,
    emissiveIntensity: 0.6,
    flatShading: true,
  });
  const orbConfigs = [
    { radius: 3.2, height: 4.5, phase: 0,                size: 0.22 },
    { radius: 3.6, height: 5.2, phase: (Math.PI * 2) / 3, size: 0.22 },
    { radius: 3.4, height: 3.8, phase: (Math.PI * 4) / 3, size: 0.22 },
  ];
  orbConfigs.forEach(cfg => {
    const orb = new THREE.Mesh(new THREE.SphereGeometry(cfg.size, 12, 12), orbMat);
    orb.userData.orbConfig = cfg;
    orb.position.set(Math.cos(cfg.phase) * cfg.radius, cfg.height, Math.sin(cfg.phase) * cfg.radius);
    group.add(orb);
    welcomeOrbs.push(orb);
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

  // Stone tablet in the center — interactive
  const tablet = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.4, 0.3), mat(0x6b5640));
  tablet.position.set(0, 0.9, 0);
  tablet.userData = { zoneCode: zone.code, zoneName: zone.name, interactive: true };
  tablet.castShadow = true;
  group.add(tablet);

  // 4 incense holder posts at corners with flickering flames
  const flameMat = new THREE.MeshLambertMaterial({
    color: 0xffaa33,
    emissive: 0xffaa33,
    emissiveIntensity: 0.9,
    flatShading: true,
  });
  [[-2, -2], [2, -2], [-2, 2], [2, 2]].forEach(([x, z]) => {
    const holder = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.5, 6), mat(0x4a3a2a));
    holder.position.set(x, 0.45, z);
    holder.castShadow = true;
    group.add(holder);

    const flame = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.22, 6), flameMat);
    flame.position.set(x, 0.82, z);
    group.add(flame);
    soulprintFlames.push(flame);
  });

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

  // Screen — emissive glow base, brighter on hover
  const screenMat = new THREE.MeshLambertMaterial({
    color: 0x111111,
    emissive: 0x222222,
    emissiveIntensity: 1.0,
    flatShading: true,
  });
  const screen = new THREE.Mesh(new THREE.BoxGeometry(5, 3, 0.15), screenMat);
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

  // Spotlight cone — translucent yellow pointing down at the screen
  const spotMat = new THREE.MeshBasicMaterial({
    color: 0xffe5a0,
    transparent: true,
    opacity: 0.18,
    depthWrite: false,
  });
  const spot = new THREE.Mesh(new THREE.ConeGeometry(1.4, 4.0, 16, 1, true), spotMat);
  spot.position.set(3, 6.0, 0);
  spot.rotation.x = Math.PI; // point downward
  group.add(spot);

  // 2 small tree decorations near the tent
  const trunkMat = mat(0x5a3a20);
  const leafMat = mat(0x4a6a3a);
  [[-5.5, 1.2], [-1.5, -2.5]].forEach(([tx, tz]) => {
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 1.2, 6), trunkMat);
    trunk.position.set(tx, 0.6, tz);
    trunk.castShadow = true;
    group.add(trunk);

    const leaves = new THREE.Mesh(new THREE.ConeGeometry(0.7, 1.6, 7), leafMat);
    leaves.position.set(tx, 1.7, tz);
    leaves.castShadow = true;
    group.add(leaves);
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

  // Colored book boxes on top — interactive, individually trackable via bookIndex
  const bookColors = [0xc84040, 0x4080c8, 0x40c870, 0xc8a840, 0x9040c8];
  bookColors.forEach((color, i) => {
    const book = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.7, 0.8), mat(color));
    const baseY = 3.35;
    book.position.set(-2 + i * 1.0, baseY, 0);
    book.userData = {
      zoneCode: zone.code,
      zoneName: zone.name,
      interactive: true,
      bookIndex: i,
      baseY,
      liftT: 0, // 0..1 lift progress
    };
    book.castShadow = true;
    group.add(book);
    libraryBooks.push(book);
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

// Animate zone buildings — gentle floating bob + welcome orbs orbit/bob
export function updateZones(zoneGroups, time) {
  const reduceMotion = typeof localStorage !== 'undefined' && localStorage.getItem('ivan-world-pref-reduce-motion') === '1';
  zoneGroups.forEach((group, i) => {
    if (reduceMotion) {
      group.position.y = 0;
      return;
    }
    // Each zone bobs at slightly different phase
    const phase = i * 1.2;
    group.position.y = Math.sin(time * 0.5 + phase) * 0.15;
  });

  // Soulprint incense flames — random flicker scale
  soulprintFlames.forEach((flame, idx) => {
    if (reduceMotion) {
      flame.scale.set(1, 1, 1);
      return;
    }
    const f = 0.85 + Math.sin(time * 12 + idx * 1.7) * 0.1 + Math.random() * 0.08;
    flame.scale.set(f, f, f);
  });

  // Library books — lift the currently hovered book gently up by 0.2 units
  const hovered = getHoveredMesh && getHoveredMesh();
  for (let i = 0; i < libraryBooks.length; i++) {
    const book = libraryBooks[i];
    const ud = book.userData;
    const target = (book === hovered) ? 1 : 0;
    // Lerp liftT toward target
    ud.liftT += (target - ud.liftT) * 0.15;
    book.position.y = ud.baseY + ud.liftT * 0.2;
  }

  // Welcome orbs — slowly rotate around sign center + bob vertically
  welcomeOrbs.forEach(orb => {
    const cfg = orb.userData.orbConfig;
    if (!cfg) return;
    const angle = cfg.phase + time * 0.3;
    orb.position.x = Math.cos(angle) * cfg.radius;
    orb.position.z = Math.sin(angle) * cfg.radius;
    orb.position.y = cfg.height + Math.sin(time * 1.2 + cfg.phase) * 0.25;
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
