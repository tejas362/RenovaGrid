import * as THREE from 'three';
import { ZONES, CAMPUS_CONFIG } from '../config/campusData.js';

/**
 * Creates a crisp high-resolution architectural facade sign using an offscreen canvas texture.
 */
function createFacadeSign(text, width, height, bgColor = '#1e293b', textColor = '#f8fafc', badge = '') {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  // Background plate
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Border frame
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 8;
  ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);

  // Small subtitle / badge
  if (badge) {
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(badge, canvas.width / 2, 40);
  }

  // Main text
  ctx.fillStyle = textColor;
  ctx.font = 'bold 44px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(text, canvas.width / 2, badge ? 88 : 74);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  const mat = new THREE.MeshStandardMaterial({
    map: texture,
    roughness: 0.4,
    metalness: 0.1
  });

  const geo = new THREE.BoxGeometry(width, height, 0.08);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true;
  return mesh;
}

/**
 * Creates the Academic Block building placeholder (12 x 8 x 6) on the front-left campus.
 * @param {THREE.Scene} scene
 * @returns {THREE.Group} Academic building group
 */
export function createAcademicBuilding(scene) {
  const group = new THREE.Group();
  group.name = 'AcademicBuilding';

  const cfg = ZONES.academic;
  const { width: w, depth: d, height: h } = cfg.dimensions;
  const { x: posX, y: baseY, z: posZ } = cfg.position;

  // Root position
  group.position.set(posX, baseY, posZ);

  // Reusable materials
  const wallMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.85,
    metalness: 0.05
  });

  const trimMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.6,
    metalness: 0.2
  });

  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    roughness: 0.15,
    metalness: 0.85,
    envMapIntensity: 1.0
  });

  const roofMat = new THREE.MeshStandardMaterial({
    color: 0x475569,
    roughness: 0.9,
    metalness: 0.05
  });

  // 1. Plinth / Foundation Slab
  const slabGeo = new THREE.BoxGeometry(w + 0.6, 0.25, d + 0.6);
  const slab = new THREE.Mesh(slabGeo, trimMat);
  slab.position.y = 0.125;
  slab.receiveShadow = true;
  group.add(slab);

  // 2. Main Structural Body
  const bodyH = h - 0.25;
  const bodyGeo = new THREE.BoxGeometry(w, bodyH, d);
  const body = new THREE.Mesh(bodyGeo, wallMat);
  body.position.y = 0.25 + bodyH / 2;
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  // 3. Flat Rooftop Parapet and Recessed Surface
  const parapetH = 0.4;
  const roofSurface = new THREE.Mesh(
    new THREE.BoxGeometry(w - 0.6, 0.1, d - 0.6),
    roofMat
  );
  roofSurface.position.y = h + 0.05;
  roofSurface.receiveShadow = true;
  group.add(roofSurface);

  // 4. Multi-level Architectural Window Ribbons (Front & Back Facades)
  const windowRows = 3;
  const windowCols = 5;
  const winW = 1.4;
  const winH = 0.85;
  const startY = 1.6;
  const rowSpacing = 1.4;
  const colSpacing = 2.1;

  for (let r = 0; r < windowRows; r++) {
    for (let c = 0; c < windowCols; c++) {
      const winX = (c - (windowCols - 1) / 2) * colSpacing;
      const winY = startY + r * rowSpacing;

      // Front Windows (+Z facade)
      const winGeo = new THREE.BoxGeometry(winW, winH, 0.12);
      const winFront = new THREE.Mesh(winGeo, glassMat);
      winFront.position.set(winX, winY, d / 2 + 0.02);
      winFront.castShadow = true;
      group.add(winFront);

      // Back Windows (-Z facade)
      const winBack = winFront.clone();
      winBack.position.z = -d / 2 - 0.02;
      group.add(winBack);
    }
  }

  // 5. Main Entrance Portal & Canopy (+Z face, facing pathways)
  const entranceW = 3.6;
  const entranceH = 1.6;
  const entranceGeo = new THREE.BoxGeometry(entranceW, entranceH, 0.2);
  const entranceMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.3,
    metalness: 0.5
  });
  const entrance = new THREE.Mesh(entranceGeo, entranceMat);
  entrance.position.set(0, 0.25 + entranceH / 2, d / 2 + 0.05);
  group.add(entrance);

  // Entrance Canopy Overhang
  const canopyGeo = new THREE.BoxGeometry(entranceW + 0.8, 0.15, 1.4);
  const canopy = new THREE.Mesh(canopyGeo, trimMat);
  canopy.position.set(0, 0.25 + entranceH + 0.1, d / 2 + 0.7);
  canopy.castShadow = true;
  group.add(canopy);

  // 6. Architectural Facade Sign: "ACADEMIC BLOCK"
  const sign = createFacadeSign('ACADEMIC BLOCK', 4.2, 1.1, '#0f172a', '#38bdf8', 'CAMPUS BLOCK A');
  sign.position.set(0, 0.25 + entranceH + 0.8, d / 2 + 0.1);
  group.add(sign);

  // Tag group for interaction
  group.userData = {
    zoneId: cfg.id,
    name: cfg.name,
    type: 'building',
    info: cfg
  };

  // Ensure all child meshes reference zoneId for raycasting
  group.traverse((child) => {
    if (child.isMesh) {
      child.userData.zoneId = cfg.id;
      child.userData.parentGroup = group;
    }
  });

  scene.add(group);
  return group;
}

/**
 * Creates the Hostel building placeholder (12 x 8 x 7) on the front-right campus.
 * Modular structure prepared for future smart loads (lights, fans, AC).
 * @param {THREE.Scene} scene
 * @returns {THREE.Group} Hostel group
 */
export function createHostel(scene) {
  const group = new THREE.Group();
  group.name = 'HostelBuilding';

  const cfg = ZONES.hostel;
  const { width: w, depth: d, height: h } = cfg.dimensions;
  const { x: posX, y: baseY, z: posZ } = cfg.position;

  group.position.set(posX, baseY, posZ);

  const wallMat = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9,
    roughness: 0.8,
    metalness: 0.05
  });

  const accentMat = new THREE.MeshStandardMaterial({
    color: 0x475569,
    roughness: 0.7,
    metalness: 0.15
  });

  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    roughness: 0.2,
    metalness: 0.7
  });

  const roofMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.9,
    metalness: 0.05
  });

  // 1. Base Slab
  const slabGeo = new THREE.BoxGeometry(w + 0.5, 0.25, d + 0.5);
  const slab = new THREE.Mesh(slabGeo, accentMat);
  slab.position.y = 0.125;
  slab.receiveShadow = true;
  group.add(slab);

  // 2. Main Structural Body (7 units high)
  const bodyH = h - 0.25;
  const bodyGeo = new THREE.BoxGeometry(w, bodyH, d);
  const body = new THREE.Mesh(bodyGeo, wallMat);
  body.position.y = 0.25 + bodyH / 2;
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  // 3. Central Vertical Architectural Divider Strip
  const stripGeo = new THREE.BoxGeometry(1.6, bodyH, 0.2);
  const strip = new THREE.Mesh(stripGeo, accentMat);
  strip.position.set(0, 0.25 + bodyH / 2, d / 2 + 0.05);
  group.add(strip);

  // 4. Residential Window Matrix (4 Floors)
  const floors = 4;
  const startY = 1.4;
  const floorSpacing = 1.35;
  const colOffsets = [-4.5, -2.6, 2.6, 4.5];

  for (let f = 0; f < floors; f++) {
    const floorY = startY + f * floorSpacing;
    colOffsets.forEach(cx => {
      // Front window (+Z)
      const winGeo = new THREE.BoxGeometry(1.2, 0.85, 0.1);
      const win = new THREE.Mesh(winGeo, glassMat);
      win.position.set(cx, floorY, d / 2 + 0.04);
      win.castShadow = true;
      group.add(win);

      // Back window (-Z)
      const winB = win.clone();
      winB.position.z = -d / 2 - 0.04;
      group.add(winB);
    });
  }

  // 5. Entrance Canopy & Steps
  const entranceH = 1.4;
  const entrance = new THREE.Mesh(
    new THREE.BoxGeometry(2.0, entranceH, 0.15),
    accentMat
  );
  entrance.position.set(0, 0.25 + entranceH / 2, d / 2 + 0.08);
  group.add(entrance);

  const canopy = new THREE.Mesh(
    new THREE.BoxGeometry(2.6, 0.15, 1.2),
    accentMat
  );
  canopy.position.set(0, 0.25 + entranceH + 0.1, d / 2 + 0.6);
  canopy.castShadow = true;
  group.add(canopy);

  // 6. Roof Parapet & Future Utility Platform (for future water tanks/fans)
  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(w - 0.4, 0.1, d - 0.4),
    roofMat
  );
  roof.position.y = h + 0.05;
  roof.receiveShadow = true;
  group.add(roof);

  // Future Tank / AC unit placeholders on roof
  const tankGeo = new THREE.CylinderGeometry(0.8, 0.8, 1.0, 16);
  const tank = new THREE.Mesh(tankGeo, accentMat);
  tank.position.set(-3.5, h + 0.55, -1.5);
  tank.castShadow = true;
  group.add(tank);

  // 7. Architectural Facade Sign: "HOSTEL"
  const sign = createFacadeSign('HOSTEL', 3.6, 0.9, '#1e293b', '#fbbf24', 'STUDENT HOUSING');
  sign.position.set(0, 0.25 + entranceH + 0.75, d / 2 + 0.1);
  group.add(sign);

  group.userData = {
    zoneId: cfg.id,
    name: cfg.name,
    type: 'building',
    info: cfg
  };

  group.traverse((child) => {
    if (child.isMesh) {
      child.userData.zoneId = cfg.id;
      child.userData.parentGroup = group;
    }
  });

  scene.add(group);
  return group;
}
