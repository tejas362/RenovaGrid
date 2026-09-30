import * as THREE from 'three';

export class EnergyHubInteraction {
    constructor(camera, scene, domElement, energyHub, ui, cameraController, onClickCallback) {
        this.camera = camera;
        this.scene = scene;
        this.domElement = domElement;
        this.energyHub = energyHub;
        this.ui = ui;
        this.cameraController = cameraController;
        this.onClickCallback = onClickCallback; // Used to hide other panels
        
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
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        // Intersect against AI Energy Hub
        const intersects = this.raycaster.intersectObjects([this.energyHub.group], true);
        
        if (intersects.length > 0) {
            let object = intersects[0].object;
            let clickedName = object.name;
            
            // Filter to interesting names, else default to hub
            const interactiveComponents = [
                "RPI_CONTROLLER", "ESP32_CONTROLLER", "IOT_GATEWAY", 
                "ENERGY_METER", "CONTROL_UNIT", "AI_HUB_DISPLAY"
            ];
            
            // Traverse up to see if it belongs to an interactive component
            let foundSpecial = false;
            let current = object;
            while(current && current !== this.energyHub.group) {
                if (interactiveComponents.includes(current.name)) {
                    clickedName = current.name;
                    foundSpecial = true;
                    break;
                }
                current = current.parent;
            }
            
            if (!foundSpecial) {
                clickedName = "AI_ENERGY_HUB";
            }
            
            if (this.onClickCallback) this.onClickCallback();
            
            this.ui.show(clickedName);
            
            const targetPos = new THREE.Vector3();
            this.energyHub.group.getWorldPosition(targetPos);
            
            // Target slightly above ground
            targetPos.y += 1.5;
            
            const camPos = targetPos.clone().add(new THREE.Vector3(0, 8, 14));
            
            // The cameraController in this case is the existing SolarCameraController 
            // since they share similar orbit/focus behavior, but we might just call it AppCameraController.
            if(this.cameraController && this.cameraController.focusOnObject) {
                this.cameraController.focusOnObject(camPos, targetPos);
            }
        }
    }
}
