import * as THREE from 'three';

export class LoadInteraction {
    constructor(camera, scene, domElement, loadMeshes, ui, cameraController, onClickCallback) {
        this.camera = camera;
        this.scene = scene;
        this.domElement = domElement;
        this.loadMeshes = loadMeshes;
        this.ui = ui;
        this.cameraController = cameraController;
        this.onClickCallback = onClickCallback;
        
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        this.initEvents();
        
        this.highlightMesh = new THREE.Mesh(
            new THREE.BoxGeometry(1, 1, 1),
            new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true, transparent: true, opacity: 0.5 })
        );
        this.highlightMesh.visible = false;
        this.scene.add(this.highlightMesh);
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
        
        const intersects = this.raycaster.intersectObjects(this.loadMeshes.interactables, true);
        
        if (intersects.length > 0) {
            let object = intersects[0].object;
            let group = this.findInteractableGroup(object);
            
            if (group) {
                if (this.onClickCallback) this.onClickCallback();
                
                this.ui.show(group.name);
                this.highlightGroup(group);
                
                const targetPos = new THREE.Vector3();
                group.getWorldPosition(targetPos);
                
                // Adjust target pos for buildings
                if (group.name === "AcademicBuilding" || group.name === "HostelBuilding") {
                    targetPos.y += 3;
                } else {
                    targetPos.y += 1;
                }
                
                const camPos = targetPos.clone().add(new THREE.Vector3(12, 10, 16));
                
                if (this.cameraController && this.cameraController.focusOnObject) {
                    this.cameraController.focusOnObject(camPos, targetPos);
                }
            }
        }
    }
    
    findInteractableGroup(object) {
        let current = object;
        while (current) {
            if (this.loadMeshes.interactables.includes(current)) {
                return current;
            }
            // Some objects like meter groups are children of buildings
            if (current.name === "ACADEMIC_LOAD_METER" || current.name === "HOSTEL_LOAD_METER") {
                return current;
            }
            current = current.parent;
        }
        return null;
    }
    
    highlightGroup(group) {
        const box = new THREE.Box3().setFromObject(group);
        const center = new THREE.Vector3();
        const size = new THREE.Vector3();
        box.getCenter(center);
        box.getSize(size);
        
        this.highlightMesh.position.copy(center);
        this.highlightMesh.scale.copy(size).addScalar(0.2);
        this.highlightMesh.visible = true;
    }
    
    hideHighlight() {
        this.highlightMesh.visible = false;
    }
}
