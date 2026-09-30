import * as THREE from 'three';

/**
 * Creates professional architectural model lighting with soft sunlight shadows.
 * @param {THREE.Scene} scene
 * @returns {object} Light references
 */
export function createLighting(scene) {
  // 1. Natural Hemisphere Light for soft ambient skylight and ground bounce
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0xe2e8f0, 0.7);
  hemiLight.position.set(0, 50, 0);
  scene.add(hemiLight);

  // 2. Primary Directional Sunlight with soft architectural shadows
  const sunLight = new THREE.DirectionalLight(0xfffaed, 1.4);
  sunLight.position.set(35, 48, 28);
  sunLight.castShadow = true;

  // Optimize shadow camera for the 60x45 campus footprint
  sunLight.shadow.mapSize.width = 2048;
  sunLight.shadow.mapSize.height = 2048;
  sunLight.shadow.camera.near = 10;
  sunLight.shadow.camera.far = 140;

  const dX = 36;
  const dZ = 28;
  sunLight.shadow.camera.left = -dX;
  sunLight.shadow.camera.right = dX;
  sunLight.shadow.camera.top = dZ;
  sunLight.shadow.camera.bottom = -dZ;
  sunLight.shadow.bias = -0.0003;
  sunLight.shadow.normalBias = 0.02;

  scene.add(sunLight);

  // 3. Subtle directional rim / fill light from opposite quadrant for crisp architectural edges
  const fillLight = new THREE.DirectionalLight(0xbae6fd, 0.35);
  fillLight.position.set(-30, 25, -25);
  scene.add(fillLight);

  return { hemiLight, sunLight, fillLight };
}
