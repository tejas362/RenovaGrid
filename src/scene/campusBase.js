import * as THREE from 'three';
import { CAMPUS_CONFIG } from '../config/campusData.js';

/**
 * Creates the miniature architectural campus base with beveled border plinth,
 * recessed ground plane, and zone ground foundations.
 * @param {THREE.Scene} scene
 * @returns {THREE.Group} Campus base group
 */
export function createCampusBase(scene) {
  const group = new THREE.Group();
  group.name = 'CampusBaseGroup';

  const { width, depth, height } = CAMPUS_CONFIG.base;

  // 1. Architectural Plinth Body (60 x 45 x 1)
  const plinthGeo = new THREE.BoxGeometry(width, height, depth);
  const plinthMat = new THREE.MeshStandardMaterial({
    color: CAMPUS_CONFIG.colors.plinth,
    roughness: 0.75,
    metalness: 0.08
  });
  const plinth = new THREE.Mesh(plinthGeo, plinthMat);
  plinth.position.set(0, height / 2, 0);
  plinth.receiveShadow = true;
  plinth.castShadow = true;
  group.add(plinth);

  // 2. Beveled Lower Base Step (adds subtle architectural plinth tier)
  const stepMargin = 1.2;
  const stepHeight = 0.2;
  const lowerPlinthGeo = new THREE.BoxGeometry(width + stepMargin, stepHeight, depth + stepMargin);
  const lowerPlinthMat = new THREE.MeshStandardMaterial({
    color: CAMPUS_CONFIG.colors.plinthBevel,
    roughness: 0.85,
    metalness: 0.05
  });
  const lowerPlinth = new THREE.Mesh(lowerPlinthGeo, lowerPlinthMat);
  lowerPlinth.position.set(0, stepHeight / 2, 0);
  lowerPlinth.receiveShadow = true;
  group.add(lowerPlinth);

  // 3. Raised Outer Perimeter Border / Retaining Curb (Miniature architectural model border)
  const curbThickness = 0.6;
  const curbHeight = 0.25;
  const curbMat = new THREE.MeshStandardMaterial({
    color: CAMPUS_CONFIG.colors.plinthBevel,
    roughness: 0.6,
    metalness: 0.1
  });

  // Top/Bottom border curbs (along X)
  const curbXGeo = new THREE.BoxGeometry(width, curbHeight, curbThickness);
  const curbNorth = new THREE.Mesh(curbXGeo, curbMat);
  curbNorth.position.set(0, height + curbHeight / 2, -depth / 2 + curbThickness / 2);
  curbNorth.receiveShadow = true;
  curbNorth.castShadow = true;
  group.add(curbNorth);

  const curbSouth = curbNorth.clone();
  curbSouth.position.z = depth / 2 - curbThickness / 2;
  group.add(curbSouth);

  // Left/Right border curbs (along Z)
  const curbZGeo = new THREE.BoxGeometry(curbThickness, curbHeight, depth - curbThickness * 2);
  const curbWest = new THREE.Mesh(curbZGeo, curbMat);
  curbWest.position.set(-width / 2 + curbThickness / 2, height + curbHeight / 2, 0);
  curbWest.receiveShadow = true;
  curbWest.castShadow = true;
  group.add(curbWest);

  const curbEast = curbWest.clone();
  curbEast.position.x = width / 2 - curbThickness / 2;
  group.add(curbEast);

  // 4. Recessed Campus Ground Surface (Soft architectural green lawn)
  const groundWidth = width - curbThickness * 2;
  const groundDepth = depth - curbThickness * 2;
  const groundGeo = new THREE.PlaneGeometry(groundWidth, groundDepth);
  const groundMat = new THREE.MeshStandardMaterial({
    color: CAMPUS_CONFIG.colors.ground,
    roughness: 0.95,
    metalness: 0.02
  });
  const groundMesh = new THREE.Mesh(groundGeo, groundMat);
  groundMesh.rotation.x = -Math.PI / 2;
  groundMesh.position.set(0, height + 0.005, 0);
  groundMesh.receiveShadow = true;
  group.add(groundMesh);

  // 5. Zone Ground Inlays (Distinct surface demarcation textures for each zone)
  const zonePlots = [
    // Solar zone gravel/tech plot
    { x: -18, z: -12, w: 20, d: 12, color: 0xe2e8f0 },
    // Academic courtyard paving
    { x: -17, z: 11, w: 15, d: 11, color: 0xede9fe },
    // Hostel courtyard paving
    { x: 17, z: 11, w: 15, d: 11, color: 0xfef3c7 },
    // AI Hub central plaza ring
    { x: 0, z: -1, w: 13, d: 11, color: 0xe0f2fe },
    // Utility compound plot
    { x: 18, z: -12, w: 11, d: 9, color: 0xf1f5f9 },
    // EV charging pad
    { x: 19, z: -1, w: 9.5, d: 7.5, color: 0xe0f2fe },
    // Grid boundary pad
    { x: 25.5, z: -18, w: 7.5, d: 6.5, color: 0xfee2e2 }
  ];

  zonePlots.forEach(plot => {
    const plotGeo = new THREE.PlaneGeometry(plot.w, plot.d);
    const plotMat = new THREE.MeshStandardMaterial({
      color: plot.color,
      roughness: 0.9,
      metalness: 0.05
    });
    const plotMesh = new THREE.Mesh(plotGeo, plotMat);
    plotMesh.rotation.x = -Math.PI / 2;
    plotMesh.position.set(plot.x, height + 0.01, plot.z);
    plotMesh.receiveShadow = true;
    group.add(plotMesh);
  });

  scene.add(group);
  return group;
}
