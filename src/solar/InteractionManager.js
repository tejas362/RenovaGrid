import * as THREE from 'three';

export class SolarInteractionManager {
    constructor(camera, scene, domElement, solarArray, ui, cameraController, onSolarClick) {
        this.camera = camera;
        this.scene = scene;
        this.domElement = domElement;
        this.solarArray = solarArray;
        this.ui = ui;
        this.cameraController = cameraController;
        this.onSolarClick = onSolarClick;
        
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        this.initEvents();
    }
    
    initEvents() {
        let downX = 0, downY = 0;
        this.domElement.addEventListener('pointerdown', (e) => {
            downX = e.clientX;
            downY = e.clientY;
        });
        this.domElement.addEventListener('pointerup', (e) => {
            if (Math.abs(e.clientX - downX) < 10 && Math.abs(e.clientY - downY) < 10) {
                this.onClick(e);
            }
        });
    }
    
    onClick(event) {
        // Calculate mouse position in normalized device coordinates (-1 to +1)
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        // Intersect against solar array group
        const intersects = this.raycaster.intersectObjects([this.solarArray.group], true);
        
        if (intersects.length > 0) {
            let object = intersects[0].object;
            let clickedName = null;
            let targetMesh = null;
            
            // Traverse up to find if a panel or array was clicked
            while (object) {
                if (object.name && object.name.startsWith('SOLAR_PANEL_')) {
                    clickedName = object.name;
                    targetMesh = object;
                    break;
                }
                object = object.parent;
            }
            
            if (clickedName) {
                if (this.onSolarClick) this.onSolarClick();
                this.ui.show(clickedName);
                
                // Focus camera on panel
                const targetPos = new THREE.Vector3();
                targetMesh.getWorldPosition(targetPos);
                
                // Calculate an offset position for camera
                const camPos = targetPos.clone().add(new THREE.Vector3(-10, 8, 12));
                
                this.cameraController.focusOnObject(camPos, targetPos);
            } else {
                if (this.onSolarClick) this.onSolarClick();
                // Clicked support structure or array base
                this.ui.show('SOLAR_ARRAY');
                
                const targetPos = new THREE.Vector3();
                this.solarArray.group.getWorldPosition(targetPos);
                const camPos = targetPos.clone().add(new THREE.Vector3(-10, 10, 15));
                
                this.cameraController.focusOnObject(camPos, targetPos);
            }
        }
    }
}
