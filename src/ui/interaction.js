import * as THREE from 'three';
import { ZONES } from '../config/campusData.js';

/**
 * Manages pointer raycasting, subtle hover highlight, cursor updates, and click selection.
 */
export class CampusInteractionManager {
  constructor(camera, scene, domElement, labelObjects, onSelectZone, onHoverZone) {
    this.camera = camera;
    this.scene = scene;
    this.domElement = domElement;
    this.labelObjects = labelObjects;
    this.onSelectZone = onSelectZone;
    this.onHoverZone = onHoverZone;

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2(-999, -999);

    this.hoveredZoneId = null;
    this.selectedZoneId = null;
    this.originalEmissives = new Map(); // mesh -> { hex, intensity }

    this.interactiveMeshes = [];
    this.collectInteractiveMeshes();

    this.bindEvents();
  }

  collectInteractiveMeshes() {
    this.interactiveMeshes = [];
    this.scene.traverse((obj) => {
      if (obj.isMesh && obj.userData && obj.userData.zoneId) {
        this.interactiveMeshes.push(obj);
        // Cache original emissive state
        if (obj.material && obj.material.emissive) {
          this.originalEmissives.set(obj, {
            color: obj.material.emissive.getHex(),
            intensity: obj.material.emissiveIntensity || 0
          });
        }
      }
    });
  }

  bindEvents() {
    this.domElement.addEventListener('pointermove', (e) => this.onPointerMove(e));
    this.domElement.addEventListener('pointerdown', (e) => this.onPointerDown(e));
  }

  onPointerMove(e) {
    const rect = this.domElement.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    this.updateHover(e.clientX, e.clientY);
  }

  updateHover(screenX, screenY) {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.interactiveMeshes, false);

    let hitZoneId = null;
    if (intersects.length > 0) {
      hitZoneId = intersects[0].object.userData.zoneId;
    }

    if (hitZoneId !== this.hoveredZoneId) {
      // Un-highlight previous
      if (this.hoveredZoneId) {
        this.setZoneHighlight(this.hoveredZoneId, false);
        if (this.labelObjects[this.hoveredZoneId]?.domElement) {
          this.labelObjects[this.hoveredZoneId].domElement.classList.remove('badge-hovered');
        }
      }

      this.hoveredZoneId = hitZoneId;

      // Apply new highlight
      if (this.hoveredZoneId) {
        this.setZoneHighlight(this.hoveredZoneId, true);
        this.domElement.style.cursor = 'pointer';
        if (this.labelObjects[this.hoveredZoneId]?.domElement) {
          this.labelObjects[this.hoveredZoneId].domElement.classList.add('badge-hovered');
        }
      } else {
        this.domElement.style.cursor = 'default';
      }

      if (this.onHoverZone) {
        this.onHoverZone(this.hoveredZoneId, screenX, screenY);
      }
    }
  }

  onPointerDown(e) {
    // Only handle primary left-click
    if (e.button !== 0) return;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.interactiveMeshes, false);

    if (intersects.length > 0) {
      const zoneId = intersects[0].object.userData.zoneId;
      this.selectZone(zoneId);
    }
  }

  selectZone(zoneId) {
    // Remove previous active state
    if (this.selectedZoneId && this.labelObjects[this.selectedZoneId]?.domElement) {
      this.labelObjects[this.selectedZoneId].domElement.classList.remove('badge-active');
    }

    this.selectedZoneId = zoneId;

    if (zoneId) {
      const zoneData = ZONES[zoneId];
      console.log(`[Campus AI Energy Manager] Selected Zone: %c${zoneData?.name || zoneId}`, 'color: #38bdf8; font-weight: bold;');
      console.table({
        ID: zoneData?.id,
        Name: zoneData?.name,
        Category: zoneData?.category,
        Phase: zoneData?.phase,
        Specs: zoneData?.specs
      });

      if (this.labelObjects[zoneId]?.domElement) {
        this.labelObjects[zoneId].domElement.classList.add('badge-active');
      }

      if (this.onSelectZone) {
        this.onSelectZone(zoneId);
      }
    }
  }

  setZoneHighlight(zoneId, isHighlighted) {
    this.interactiveMeshes.forEach(mesh => {
      if (mesh.userData.zoneId === zoneId && mesh.material && mesh.material.emissive) {
        const orig = this.originalEmissives.get(mesh) || { color: 0x000000, intensity: 0 };
        if (isHighlighted) {
          mesh.material.emissive.setHex(0x0284c7);
          mesh.material.emissiveIntensity = 0.35;
        } else {
          mesh.material.emissive.setHex(orig.color);
          mesh.material.emissiveIntensity = orig.intensity;
        }
      }
    });
  }
}
