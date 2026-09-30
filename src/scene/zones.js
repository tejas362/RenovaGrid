import * as THREE from 'three';
import { ZONES, CAMPUS_CONFIG } from '../config/campusData.js';

/**
 * Creates an architectural pedestal placard sign with canvas texture.
 */
function createPlacardSign(title, subtitle, width = 2.4, height = 1.0) {
  const group = new THREE.Group();

  // Post / Stanchion
  const postGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.1, 8);
  const postMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.3 });
  const post = new THREE.Mesh(postGeo, postMat);
  post.position.y = 0.55;
  post.castShadow = true;
  group.add(post);

  // Sign Plate Canvas
  const canvas = document.createElement('canvas');
  canvas.width = 384;
  canvas.height = 160;
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Border
  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 6;
  ctx.strokeRect(3, 3, canvas.width - 6, canvas.height - 6);

  // Title
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 36px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(title, canvas.width / 2, 65);

  // Subtitle
  if (subtitle) {
    ctx.fillStyle = '#38bdf8';
    ctx.font = '22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(subtitle, canvas.width / 2, 115);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  const plateMat = new THREE.MeshStandardMaterial({
    map: texture,
    roughness: 0.3,
    metalness: 0.2
  });

  const plateGeo = new THREE.BoxGeometry(width, height, 0.06);
  const plate = new THREE.Mesh(plateGeo, plateMat);
  plate.position.set(0, 1.1 + height / 2, 0);
  plate.rotation.x = -0.2; // slight upward tilt for camera readability
  plate.castShadow = true;
  group.add(plate);

  return group;
}

/**
 * 7. SOLAR ZONE: Flat empty platform (18 x 10 units) reserved for Section 2.
 */
export function createSolarZone(scene) {
  const cfg = ZONES.solar;
  const group = new THREE.Group();
  group.name = 'SolarZoneGroup';
  group.position.set(cfg.position.x, cfg.position.y, cfg.position.z);

  const { width: w, depth: d, height: h } = cfg.dimensions;

  // Platform slab
  const slabGeo = new THREE.BoxGeometry(w, h, d);
  const slabMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    roughness: 0.85,
    metalness: 0.05
  });
  const slab = new THREE.Mesh(slabGeo, slabMat);
  slab.position.y = h / 2;
  slab.receiveShadow = true;
  slab.castShadow = true;
  group.add(slab);

  // Raised boundary border
  const borderGeo = new THREE.BoxGeometry(w + 0.3, 0.1, d + 0.3);
  const borderMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.7 });
  const border = new THREE.Mesh(borderGeo, borderMat);
  border.position.y = 0.05;
  border.receiveShadow = true;
  group.add(border);

  // Surface mounting guide grid (illustrates planned PV array positions without placing panels)
  const gridHelper = new THREE.GridHelper(Math.max(w, d) - 2, 8, 0x0284c7, 0xcbd5e1);
  gridHelper.position.set(0, h + 0.01, 0);
  gridHelper.scale.set(w / Math.max(w, d), 1, d / Math.max(w, d));
  group.add(gridHelper);

  // Small Sign
  const sign = createPlacardSign('SOLAR GENERATION', 'RESERVED - SECTION 2', 3.4, 1.1);
  sign.position.set(0, h, d / 2 + 0.8);
  group.add(sign);

  group.userData = { zoneId: cfg.id, name: cfg.name, type: 'zone', info: cfg };
  group.traverse(c => { if (c.isMesh) { c.userData.zoneId = cfg.id; c.userData.parentGroup = group; } });
  scene.add(group);
  return group;
}

/**
 * 8. AI ENERGY HUB ZONE: Centerpiece raised platform (10 x 8 units) with central core.
 */
export function createEnergyHubZone(scene) {
  const cfg = ZONES.hub;
  const group = new THREE.Group();
  group.name = 'EnergyHubGroup';
  group.position.set(cfg.position.x, cfg.position.y, cfg.position.z);

  const { width: w, depth: d, height: h } = cfg.dimensions;

  // 1. Raised Centerpiece Platform
  const platGeo = new THREE.BoxGeometry(w, h, d);
  const platMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a, // Premium slate / digital tech foundation
    roughness: 0.5,
    metalness: 0.3
  });
  const plat = new THREE.Mesh(platGeo, platMat);
  plat.position.y = h / 2;
  plat.receiveShadow = true;
  plat.castShadow = true;
  group.add(plat);

  // Platform chamfer rim
  const rimGeo = new THREE.BoxGeometry(w + 0.4, 0.15, d + 0.4);
  const rimMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4, metalness: 0.6 });
  const rim = new THREE.Mesh(rimGeo, rimMat);
  rim.position.y = 0.075;
  rim.receiveShadow = true;
  group.add(rim);

  // 2. Centerpiece Hub Structure (Placeholder core building)
  const coreW = 4.2;
  const coreD = 3.4;
  const coreH = 2.8;

  // Hub glass/metal pavilion enclosure
  const coreGeo = new THREE.BoxGeometry(coreW, coreH, coreD);
  const coreMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.3,
    metalness: 0.7
  });
  const core = new THREE.Mesh(coreGeo, coreMat);
  core.position.set(0, h + coreH / 2, 0);
  core.castShadow = true;
  core.receiveShadow = true;
  group.add(core);

  // Glass observation bands around core
  const glassBandGeo = new THREE.BoxGeometry(coreW + 0.08, 0.9, coreD + 0.08);
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    roughness: 0.1,
    metalness: 0.9,
    transparent: true,
    opacity: 0.85
  });
  const glassBand = new THREE.Mesh(glassBandGeo, glassMat);
  glassBand.position.set(0, h + coreH / 2, 0);
  group.add(glassBand);

  // Hub Rooftop Communications Mast / IoT Antenna
  const mastGeo = new THREE.CylinderGeometry(0.05, 0.1, 1.8, 8);
  const mastMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });
  const mast = new THREE.Mesh(mastGeo, mastMat);
  mast.position.set(0, h + coreH + 0.9, 0);
  mast.castShadow = true;
  group.add(mast);

  // Antenna top beacon
  const beaconGeo = new THREE.SphereGeometry(0.16, 16, 16);
  const beaconMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.5,
    roughness: 0.2
  });
  const beacon = new THREE.Mesh(beaconGeo, beaconMat);
  beacon.position.set(0, h + coreH + 1.8, 0);
  group.add(beacon);

  // 3. Marked Surrounding Zones on Platform (Clearance for Pi, ESP32, Gateway, Bus)
  const slotMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6 });
  const slots = [
    { x: -3.0, z: 0, label: 'IoT GATEWAY' },
    { x: 3.0, z: 0, label: 'EDGE COMPUTE' },
    { x: 0, z: -2.3, label: 'BUS DISTRIBUTION' }
  ];

  slots.forEach(s => {
    const pad = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.06, 1.8), slotMat);
    pad.position.set(s.x, h + 0.03, s.z);
    pad.receiveShadow = true;
    group.add(pad);
  });

  // Sign
  const sign = createPlacardSign('AI ENERGY HUB', 'CENTRAL DISPATCH', 3.2, 1.0);
  sign.position.set(0, h, d / 2 + 0.8);
  group.add(sign);

  group.userData = { zoneId: cfg.id, name: cfg.name, type: 'zone', info: cfg };
  group.traverse(c => { if (c.isMesh) { c.userData.zoneId = cfg.id; c.userData.parentGroup = group; } });
  scene.add(group);
  return group;
}

/**
 * 9. BATTERY ZONE: Small raised platform (8 x 5 units) beside the AI Hub.
 */
export function createBatteryZone(scene) {
  const cfg = ZONES.battery;
  const group = new THREE.Group();
  group.name = 'BatteryZoneGroup';
  group.position.set(cfg.position.x, cfg.position.y, cfg.position.z);

  const { width: w, depth: d, height: h } = cfg.dimensions;

  // Raised platform
  const platGeo = new THREE.BoxGeometry(w, h, d);
  const platMat = new THREE.MeshStandardMaterial({
    color: 0x064e3b, // Deep industrial green foundation
    roughness: 0.7,
    metalness: 0.2
  });
  const plat = new THREE.Mesh(platGeo, platMat);
  plat.position.y = h / 2;
  plat.receiveShadow = true;
  plat.castShadow = true;
  group.add(plat);

  // Platform safety curb
  const curbGeo = new THREE.BoxGeometry(w + 0.3, 0.12, d + 0.3);
  const curbMat = new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.5 });
  const curb = new THREE.Mesh(curbGeo, curbMat);
  curb.position.y = 0.06;
  group.add(curb);

  // Bay demarcations for Section 3 battery racks (3 rack foundation slots)
  const rackSlotMat = new THREE.MeshStandardMaterial({ color: 0x047857, roughness: 0.6 });
  for (let i = -1; i <= 1; i++) {
    const slot = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.05, 3.2), rackSlotMat);
    slot.position.set(i * 2.3, h + 0.03, 0);
    slot.receiveShadow = true;
    group.add(slot);
  }

  // Sign
  const sign = createPlacardSign('BATTERY STORAGE', 'BESS RESERVED', 3.0, 0.95);
  sign.position.set(0, h, d / 2 + 0.7);
  group.add(sign);

  group.userData = { zoneId: cfg.id, name: cfg.name, type: 'zone', info: cfg };
  group.traverse(c => { if (c.isMesh) { c.userData.zoneId = cfg.id; c.userData.parentGroup = group; } });
  scene.add(group);
  return group;
}

/**
 * 10. UTILITY ZONE: Back-right side utility building placeholder.
 */
export function createUtilityZone(scene) {
  const cfg = ZONES.utility;
  const group = new THREE.Group();
  group.name = 'UtilityZoneGroup';
  group.position.set(cfg.position.x, cfg.position.y, cfg.position.z);

  const { width: w, depth: d, height: h } = cfg.dimensions;

  // 1. Concrete Compound Pad
  const padGeo = new THREE.BoxGeometry(w + 1.2, 0.2, d + 1.2);
  const padMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.8 });
  const pad = new THREE.Mesh(padGeo, padMat);
  pad.position.y = 0.1;
  pad.receiveShadow = true;
  group.add(pad);

  // 2. Utility Building Main Body
  const bldgW = w - 1.2;
  const bldgD = d - 1.2;
  const bldgH = h - 0.2;
  const bldgGeo = new THREE.BoxGeometry(bldgW, bldgH, bldgD);
  const bldgMat = new THREE.MeshStandardMaterial({
    color: 0x64748b, // Industrial utilitarian steel-gray
    roughness: 0.75,
    metalness: 0.2
  });
  const bldg = new THREE.Mesh(bldgGeo, bldgMat);
  bldg.position.set(0, 0.2 + bldgH / 2, 0);
  bldg.castShadow = true;
  bldg.receiveShadow = true;
  group.add(bldg);

  // 3. Roll-up Equipment Service Doors (South facade)
  const doorGeo = new THREE.BoxGeometry(2.4, 2.2, 0.1);
  const doorMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.4,
    metalness: 0.5
  });
  const door1 = new THREE.Mesh(doorGeo, doorMat);
  door1.position.set(-1.6, 0.2 + 1.1, bldgD / 2 + 0.06);
  group.add(door1);

  const door2 = door1.clone();
  door2.position.x = 1.6;
  group.add(door2);

  // 4. Roof Ventilation Louver Equipment
  const ventGeo = new THREE.BoxGeometry(2.0, 0.7, 1.4);
  const ventMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.6, roughness: 0.4 });
  const vent = new THREE.Mesh(ventGeo, ventMat);
  vent.position.set(0, h + 0.35, 0);
  vent.castShadow = true;
  group.add(vent);

  // Sign
  const sign = createPlacardSign('UTILITY', 'WATER & SERVICES', 2.5, 0.9);
  sign.position.set(0, 0.2, d / 2 + 0.9);
  group.add(sign);

  group.userData = { zoneId: cfg.id, name: cfg.name, type: 'zone', info: cfg };
  group.traverse(c => { if (c.isMesh) { c.userData.zoneId = cfg.id; c.userData.parentGroup = group; } });
  scene.add(group);
  return group;
}

/**
 * 11. EV CHARGING ZONE: 2 parking spaces + 1 placeholder EV charger.
 */
export function createEVZone(scene) {
  const cfg = ZONES.ev;
  const group = new THREE.Group();
  group.name = 'EVChargingGroup';
  group.position.set(cfg.position.x, cfg.position.y, cfg.position.z);

  const { width: w, depth: d, height: h } = cfg.dimensions;

  // 1. Asphalt Parking Pad
  const padGeo = new THREE.BoxGeometry(w, h, d);
  const padMat = new THREE.MeshStandardMaterial({
    color: 0x334155, // Dark asphalt
    roughness: 0.9,
    metalness: 0.05
  });
  const pad = new THREE.Mesh(padGeo, padMat);
  pad.position.y = h / 2;
  pad.receiveShadow = true;
  group.add(pad);

  // 2. White Painted Parking Lines (2 Spaces)
  const lineMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
  const bayW = 3.2;
  const bayD = 5.0;

  // Boundary lines for 2 bays
  const lines = [-bayW, 0, bayW];
  lines.forEach(lx => {
    const lineGeo = new THREE.PlaneGeometry(0.12, bayD);
    const line = new THREE.Mesh(lineGeo, lineMat);
    line.rotation.x = -Math.PI / 2;
    line.position.set(lx, h + 0.01, 0.2);
    line.receiveShadow = true;
    group.add(line);
  });

  // Wheel stops for each bay
  const stopMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.5 });
  [-bayW / 2, bayW / 2].forEach(bx => {
    const stopGeo = new THREE.BoxGeometry(2.0, 0.15, 0.25);
    const stop = new THREE.Mesh(stopGeo, stopMat);
    stop.position.set(bx, h + 0.075, -bayD / 2 + 0.6);
    stop.castShadow = true;
    group.add(stop);
  });

  // 3. EV Charger Station Pillar Placeholder
  const chargerPillarGeo = new THREE.BoxGeometry(0.7, 1.8, 0.5);
  const chargerMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7, // EV Electric Blue
    roughness: 0.3,
    metalness: 0.5
  });
  const charger = new THREE.Mesh(chargerPillarGeo, chargerMat);
  charger.position.set(0, h + 0.9, -bayD / 2 - 0.2);
  charger.castShadow = true;
  group.add(charger);

  // Charger display screen
  const screenGeo = new THREE.BoxGeometry(0.5, 0.45, 0.05);
  const screenMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0369a1,
    emissiveIntensity: 0.4,
    roughness: 0.2
  });
  const screen = new THREE.Mesh(screenGeo, screenMat);
  screen.position.set(0, h + 1.25, -bayD / 2 + 0.04);
  group.add(screen);

  // Sign
  const sign = createPlacardSign('EV CHARGING', '2 BAY SMART V2G', 2.8, 0.9);
  sign.position.set(-bayW - 0.5, 0, 0);
  sign.rotation.y = Math.PI / 2;
  group.add(sign);

  group.userData = { zoneId: cfg.id, name: cfg.name, type: 'zone', info: cfg };
  group.traverse(c => { if (c.isMesh) { c.userData.zoneId = cfg.id; c.userData.parentGroup = group; } });
  scene.add(group);
  return group;
}

/**
 * 12. GRID CONNECTION ZONE: Substation placeholder at far edge with connection to Hub.
 */
export function createGridZone(scene) {
  const cfg = ZONES.grid;
  const group = new THREE.Group();
  group.name = 'GridZoneGroup';
  group.position.set(cfg.position.x, cfg.position.y, cfg.position.z);

  const { width: w, depth: d, height: h } = cfg.dimensions;

  // 1. Concrete Substation Foundation Pad
  const padGeo = new THREE.BoxGeometry(w, 0.3, d);
  const padMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.85 });
  const pad = new THREE.Mesh(padGeo, padMat);
  pad.position.y = 0.15;
  pad.receiveShadow = true;
  group.add(pad);

  // 2. Transformer Core Block Placeholder
  const transGeo = new THREE.BoxGeometry(3.2, 2.2, 2.4);
  const transMat = new THREE.MeshStandardMaterial({
    color: 0x475569,
    roughness: 0.6,
    metalness: 0.4
  });
  const transformer = new THREE.Mesh(transGeo, transMat);
  transformer.position.set(0, 0.3 + 1.1, 0);
  transformer.castShadow = true;
  transformer.receiveShadow = true;
  group.add(transformer);

  // Cooling fins on transformer
  const finMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 });
  for (let i = -1.2; i <= 1.2; i += 0.4) {
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.8, 2.6), finMat);
    fin.position.set(i, 0.3 + 1.1, 0);
    transformer.add(fin);
  }

  // High-Voltage Bushing Insulators on top
  const bushingGeo = new THREE.CylinderGeometry(0.1, 0.15, 0.9, 12);
  const bushingMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.3 }); // Ceramic brown
  [-0.8, 0, 0.8].forEach(bx => {
    const bushing = new THREE.Mesh(bushingGeo, bushingMat);
    bushing.position.set(bx, 0.3 + 2.2 + 0.45, 0);
    bushing.castShadow = true;
    group.add(bushing);
  });

  // 3. Grid Metering Terminal Enclosure (Where connection to AI Hub originates)
  const meterBox = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 1.4, 0.8),
    new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.5, metalness: 0.2 })
  );
  meterBox.position.set(-1.8, 0.3 + 0.7, 1.4);
  meterBox.castShadow = true;
  group.add(meterBox);

  // Sign
  const sign = createPlacardSign('GRID', '11kV SUBSTATION', 2.4, 0.85);
  sign.position.set(0, 0.3, d / 2 + 0.6);
  group.add(sign);

  group.userData = { zoneId: cfg.id, name: cfg.name, type: 'zone', info: cfg };
  group.traverse(c => { if (c.isMesh) { c.userData.zoneId = cfg.id; c.userData.parentGroup = group; } });
  scene.add(group);
  return group;
}
