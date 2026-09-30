import * as THREE from 'three';

export class SmartBatteryInteraction {
    constructor(camera, scene, domElement, smartBattery, ui, cameraController, onClickCallback) {
        this.camera = camera;
        this.scene = scene;
        this.domElement = domElement;
        this.smartBattery = smartBattery;
        this.ui = ui;
        this.cameraController = cameraController;
        this.onClickCallback = onClickCallback;
        
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
        
        const intersects = this.raycaster.intersectObjects([this.smartBattery.group], true);
        
        if (intersects.length > 0) {
            let object = intersects[0].object;
            let clickedName = object.name;
            
            // Traverse to find interactive component name
            let foundSpecial = false;
            let current = object;
            while(current && current !== this.smartBattery.group) {
                if (current.name.startsWith("BATTERY_MODULE_") || current.name.startsWith("BMS_")) {
                    clickedName = current.name;
                    foundSpecial = true;
                    break;
                }
                current = current.parent;
            }
            
            if (!foundSpecial) {
                clickedName = "SMART_BATTERY";
            }
            
            if (this.onClickCallback) this.onClickCallback();
            
            this.ui.show(clickedName);
            
            // Camera focus logic
            const targetPos = new THREE.Vector3();
            if (foundSpecial) {
                current.getWorldPosition(targetPos);
            } else {
                this.smartBattery.group.getWorldPosition(targetPos);
                targetPos.y += 1.5;
            }
            
            const camPos = targetPos.clone().add(new THREE.Vector3(0, 6, 12));
            
            if(this.cameraController && this.cameraController.focusOnObject) {
                this.cameraController.focusOnObject(camPos, targetPos);
            }
        }
    }
}
