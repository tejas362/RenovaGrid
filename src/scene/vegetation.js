import * as THREE from 'three';
import { CAMPUS_CONFIG } from '../config/campusData.js';

/**
 * Creates 10 low-poly architectural model trees around campus greenspaces and paths.
 * Simple procedural geometry: cylinder trunk + faceted foliage.
 * @param {THREE.Scene} scene
 * @returns {THREE.Group} Trees group
 */
export function createTrees(scene) {
  const group = new THREE.Group();
  group.name = 'CampusVegetationGroup';

  const baseY = CAMPUS_CONFIG.base.height; // 1.0

  const trunkGeo = new THREE.CylinderGeometry(0.1, 0.18, 1.3, 7);
  const trunkMat = new THREE.MeshStandardMaterial({
    color: CAMPUS_CONFIG.colors.treeTrunk,
    roughness: 0.9,
    metalness: 0.05
  });

  const foliageMats = [
    new THREE.MeshStandardMaterial({ color: CAMPUS_CONFIG.colors.treeFoliageA, roughness: 0.85, flatShading: true }),
    new THREE.MeshStandardMaterial({ color: CAMPUS_CONFIG.colors.treeFoliageB, roughness: 0.85, flatShading: true }),
    new THREE.MeshStandardMaterial({ color: CAMPUS_CONFIG.colors.treeFoliageC, roughness: 0.85, flatShading: true })
  ];

  // Helper to build a single architectural low-poly tree
  function createLowPolyTree(x, z, scale = 1.0, foliageVariant = 0) {
    const tree = new THREE.Group();
    tree.position.set(x, baseY, z);

    // Trunk
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 0.65 * scale;
    trunk.scale.set(scale, scale, scale);
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    tree.add(trunk);

    const fMat = foliageMats[foliageVariant % foliageMats.length];

    if (foliageVariant % 2 === 0) {
      // 2-tier low-poly cone tree
      const lowerCone = new THREE.Mesh(new THREE.ConeGeometry(1.1 * scale, 1.5 * scale, 7), fMat);
      lowerCone.position.y = (1.2 + 0.6) * scale;
      lowerCone.castShadow = true;
      lowerCone.receiveShadow = true;
      tree.add(lowerCone);

      const upperCone = new THREE.Mesh(new THREE.ConeGeometry(0.85 * scale, 1.3 * scale, 7), fMat);
      upperCone.position.y = (1.8 + 0.65) * scale;
      upperCone.castShadow = true;
      upperCone.receiveShadow = true;
      tree.add(upperCone);
    } else {
      // Stylized faceted low-poly sphere canopy
      const canopy = new THREE.Mesh(new THREE.DodecahedronGeometry(1.2 * scale, 1), fMat);
      canopy.position.y = (1.6 + 0.4) * scale;
      canopy.castShadow = true;
      canopy.receiveShadow = true;
      tree.add(canopy);
    }

    return tree;
  }

  // Exact 10 positions carefully spaced to frame campus without blocking solar/hub infrastructure
  const treePlacements = [
    // South Entrance Gate pairs
    { x: -3.2, z: 18.5, scale: 1.0, var: 0 },
    { x:  3.2, z: 18.5, scale: 0.95, var: 1 },

    // Central Lawn buffers
    { x: -3.5, z: 5.5, scale: 0.9, var: 2 },
    { x:  3.5, z: 5.5, scale: 0.95, var: 0 },

    // Academic Block perimeter greens
    { x: -25.5, z: 7.0, scale: 1.1, var: 1 },
    { x: -25.0, z: 16.0, scale: 1.05, var: 2 },

    // Hostel Zone perimeter greens
    { x:  25.5, z: 7.0, scale: 1.1, var: 0 },
    { x:  25.0, z: 16.0, scale: 1.0, var: 1 },

    // Rear boundary foliage
    { x: -4.0, z: -17.5, scale: 1.0, var: 2 },
    { x:  4.0, z: -17.5, scale: 1.05, var: 0 }
  ];

  treePlacements.forEach(pos => {
    group.add(createLowPolyTree(pos.x, pos.z, pos.scale, pos.var));
  });

  scene.add(group);
  return group;
}
