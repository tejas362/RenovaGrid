import * as THREE from 'three';
import { CAMPUS_CONFIG } from '../config/campusData.js';

/**
 * Creates the campus road and pedestrian pathway network connecting all zones.
 * Includes the reserved underground/surface conduit trench from Grid to AI Energy Hub.
 * @param {THREE.Scene} scene
 * @returns {THREE.Group} Pathway group
 */
export function createPathways(scene) {
  const group = new THREE.Group();
  group.name = 'PathwaysGroup';

  const baseY = CAMPUS_CONFIG.base.height; // 1.0
  const roadY = baseY + 0.02; // slightly elevated above lawn

  const pathMat = new THREE.MeshStandardMaterial({
    color: CAMPUS_CONFIG.colors.pathway,
    roughness: 0.85,
    metalness: 0.05
  });

  const curbMat = new THREE.MeshStandardMaterial({
    color: CAMPUS_CONFIG.colors.pathwayCurb,
    roughness: 0.7,
    metalness: 0.1
  });

  const markingMat = new THREE.MeshStandardMaterial({
    color: CAMPUS_CONFIG.colors.marking,
    roughness: 0.6,
    metalness: 0.05
  });

  const conduitMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b, // Amber / industrial reserved conduit
    roughness: 0.6,
    metalness: 0.2
  });

  // Helper to create a pathway segment with optional side curbs
  function createRoadSegment(x, z, w, d, withCurbs = true) {
    const roadGeo = new THREE.BoxGeometry(w, 0.03, d);
    const roadMesh = new THREE.Mesh(roadGeo, pathMat);
    roadMesh.position.set(x, roadY, z);
    roadMesh.receiveShadow = true;
    group.add(roadMesh);

    if (withCurbs) {
      const curbThick = 0.12;
      const curbH = 0.045;
      if (w >= d) {
        // Horizontal road (along X), curbs on North & South
        const cGeo = new THREE.BoxGeometry(w, curbH, curbThick);
        const cN = new THREE.Mesh(cGeo, curbMat);
        cN.position.set(x, roadY + curbH / 2, z - d / 2 + curbThick / 2);
        cN.receiveShadow = true;
        group.add(cN);

        const cS = cN.clone();
        cS.position.z = z + d / 2 - curbThick / 2;
        group.add(cS);
      } else {
        // Vertical road (along Z), curbs on West & East
        const cGeo = new THREE.BoxGeometry(curbThick, curbH, d);
        const cW = new THREE.Mesh(cGeo, curbMat);
        cW.position.set(x - w / 2 + curbThick / 2, roadY + curbH / 2, z);
        cW.receiveShadow = true;
        group.add(cW);

        const cE = cW.clone();
        cE.position.x = x + w / 2 - curbThick / 2;
        group.add(cE);
      }
    }
    return roadMesh;
  }

  // 1. Main Central Arterial Spine (North-South through campus)
  // From southern entrance (Z = 21) up to Hub south plaza (Z = 4)
  createRoadSegment(0, 12.5, 3.2, 17, true);

  // Northern extension from Hub north plaza (Z = -6) to rear perimeter (Z = -18)
  createRoadSegment(0, -12, 3.0, 12, true);

  // 2. Front Cross Boulevard (connecting Academic Block to Hostel across main spine)
  // Academic at X = -17 to Hostel at X = 17 at Z = 11
  createRoadSegment(-8.5, 11, 14, 2.6, true);  // West branch to Academic
  createRoadSegment(8.5, 11, 14, 2.6, true);   // East branch to Hostel

  // Pedestrian zebra stripes at the Central intersection (X: 0, Z: 11)
  for (let i = -1.0; i <= 1.0; i += 0.5) {
    const stripeGeo = new THREE.PlaneGeometry(0.2, 2.0);
    const stripe = new THREE.Mesh(stripeGeo, markingMat);
    stripe.rotation.x = -Math.PI / 2;
    stripe.position.set(i, roadY + 0.02, 11);
    stripe.receiveShadow = true;
    group.add(stripe);
  }

  // 3. Solar Walkway (West branch from spine to Solar Generation Platform at Z = -12)
  createRoadSegment(-9, -12, 15, 2.2, true);

  // 4. Utility Pathway (East branch from spine to Utility Compound at Z = -12)
  createRoadSegment(9, -12, 15, 2.2, true);

  // 5. EV Charging Access Way (East branch towards EV charging at Z = -1)
  createRoadSegment(10, -1, 10, 2.6, true);

  // 6. Reserved Grid-to-Hub Electrical Conduit / Energy Busway
  // Path from Grid (25.5, -18) to East Corridor (18, -18) then toward Hub (6, -1)
  const conduitPoints = [
    new THREE.Vector3(25.5, roadY + 0.015, -18),
    new THREE.Vector3(18, roadY + 0.015, -18),
    new THREE.Vector3(18, roadY + 0.015, -6),
    new THREE.Vector3(5.5, roadY + 0.015, -1)
  ];

  for (let i = 0; i < conduitPoints.length - 1; i++) {
    const p1 = conduitPoints[i];
    const p2 = conduitPoints[i + 1];
    const dist = p1.distanceTo(p2);
    const dir = new THREE.Vector3().subVectors(p2, p1).normalize();
    const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);

    const trenchGeo = new THREE.BoxGeometry(
      Math.abs(dir.x) > 0.5 ? dist : 0.6,
      0.02,
      Math.abs(dir.z) > 0.5 ? dist : 0.6
    );
    const trench = new THREE.Mesh(trenchGeo, conduitMat);
    trench.position.set(mid.x, mid.y, mid.z);
    trench.receiveShadow = true;
    group.add(trench);
  }

  scene.add(group);
  return group;
}
