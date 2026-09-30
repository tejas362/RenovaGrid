import * as THREE from 'three';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { ZONES } from '../config/campusData.js';

/**
 * Creates floating 3D CSS2D badges for all 8 campus zones.
 * @param {THREE.Scene} scene
 * @param {Function} onSelectZone - Callback when user clicks a label
 * @returns {object} Dictionary of label objects
 */
export function createLabels(scene, onSelectZone) {
  const labelObjects = {};

  // Custom vertical offsets so labels hover neatly above their respective geometry
  const yOffsets = {
    solar: 2.6,
    academic: 7.8,
    hostel: 8.8,
    hub: 6.2,
    battery: 2.8,
    utility: 5.6,
    ev: 3.6,
    grid: 5.2
  };

  const icons = {
    solar: '☀️',
    academic: '🎓',
    hostel: '🏢',
    hub: '⚡',
    battery: '🔋',
    utility: '🔧',
    ev: '🚗',
    grid: '🏭'
  };

  Object.values(ZONES).forEach(zone => {
    const div = document.createElement('div');
    div.className = `campus-3d-badge badge-${zone.id}`;
    div.setAttribute('data-zone-id', zone.id);

    div.innerHTML = `
      <div class="badge-content">
        <span class="badge-icon">${icons[zone.id] || '📍'}</span>
        <span class="badge-title">${zone.label}</span>
      </div>
      <div class="badge-pin"></div>
    `;

    // Pointer handler on label pill for reliable mobile taps
    let downX = 0, downY = 0;
    div.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      downX = e.clientX;
      downY = e.clientY;
    });
    
    div.addEventListener('pointerup', (e) => {
      e.stopPropagation();
      if (Math.abs(e.clientX - downX) < 10 && Math.abs(e.clientY - downY) < 10) {
        if (onSelectZone) {
          onSelectZone(zone.id);
        }
      }
    });

    const labelObj = new CSS2DObject(div);
    const posY = (zone.position.y || 1.0) + (yOffsets[zone.id] || 3.0);
    labelObj.position.set(zone.position.x, posY, zone.position.z);

    scene.add(labelObj);
    labelObjects[zone.id] = { labelObj, domElement: div };
  });

  return labelObjects;
}
