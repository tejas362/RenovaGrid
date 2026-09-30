import * as THREE from 'three';

export class SolarCameraController {
    constructor(camera, controls) {
        this.camera = camera;
        this.controls = controls;
        
        this.isTransitioning = false;
        this.targetCamPos = new THREE.Vector3();
        this.targetCamLookAt = new THREE.Vector3();
        
        // Save base overview view (common view)
        this.basePos = new THREE.Vector3(42, 38, 44);
        this.baseLookAt = new THREE.Vector3(0, 1, 0);
        
        // If user manually pans/zooms, cancel any active animation transition
        if (this.controls) {
            this.controls.addEventListener('start', () => {
                this.isTransitioning = false;
            });
        }
    }
    
    focusOnObject(camPos, lookAtPos) {
        const finalCamPos = camPos.clone();
        const finalLookAt = lookAtPos.clone();
        
        if (window.innerWidth <= 768) {
            // On mobile, UI panels take up the bottom half of the screen.
            // Shift the camera target downward significantly so the 3D model appears higher up.
            finalLookAt.y -= 6.0; 
            
            // Zoom out more to compensate for the narrow portrait aspect ratio
            finalCamPos.y += 4.0;
            finalCamPos.z += 12.0;
        }
        
        this.targetCamPos.copy(finalCamPos);
        this.targetCamLookAt.copy(finalLookAt);
        this.isTransitioning = true;
    }
    
    resetView() {
        this.targetCamPos.copy(this.basePos);
        this.targetCamLookAt.copy(this.baseLookAt);
        this.isTransitioning = true;
    }
    
    update() {
        if (this.isTransitioning) {
            this.camera.position.lerp(this.targetCamPos, 0.05);
            this.controls.target.lerp(this.targetCamLookAt, 0.05);
            
            if (this.camera.position.distanceTo(this.targetCamPos) < 0.2 && 
                this.controls.target.distanceTo(this.targetCamLookAt) < 0.2) {
                this.camera.position.copy(this.targetCamPos);
                this.controls.target.copy(this.targetCamLookAt);
                this.isTransitioning = false;
            }
        }
    }
}
