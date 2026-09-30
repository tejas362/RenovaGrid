import * as THREE from 'three';

export class LoadMeshes {
    constructor(scene, loadManager, particleSystem, energyHub) {
        this.scene = scene;
        this.loadManager = loadManager;
        this.particleSystem = particleSystem;
        this.energyHub = energyHub;
        
        this.interactables = [];
        
        this.buildMeters();
        this.buildSmartAC();
        this.buildWaterPump();
        this.buildStreetLights();
        this.buildEVCharger();
        
        this.hubPos = new THREE.Vector3(0, 2, -1);
    }
    
    buildMeters() {
        const meterGeo = new THREE.BoxGeometry(0.6, 0.8, 0.2);
        const meterMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
        const screenMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
        
        // Find existing buildings
        const academicGroup = this.scene.getObjectByName('AcademicBuilding');
        if (academicGroup) {
            const meterGroup = new THREE.Group();
            meterGroup.name = "ACADEMIC_LOAD_METER";
            const m = new THREE.Mesh(meterGeo, meterMat);
            const s = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.4), screenMat);
            s.position.set(0, 0, 0.11);
            meterGroup.add(m, s);
            // Place near entrance
            meterGroup.position.set(2, 1, 4.2);
            academicGroup.add(meterGroup);
            this.interactables.push(academicGroup); // Whole building clickable
        }
        
        const hostelGroup = this.scene.getObjectByName('HostelBuilding');
        if (hostelGroup) {
            const meterGroup = new THREE.Group();
            meterGroup.name = "HOSTEL_LOAD_METER";
            const m = new THREE.Mesh(meterGeo, meterMat);
            const s = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.4), screenMat);
            s.position.set(0, 0, 0.11);
            meterGroup.add(m, s);
            meterGroup.position.set(1.5, 1, 4.2);
            hostelGroup.add(meterGroup);
            this.interactables.push(hostelGroup);
        }
    }
    
    buildSmartAC() {
        this.acGroup = new THREE.Group();
        this.acGroup.name = "SMART_AC_UNIT";
        this.acGroup.position.set(-18, 0.5, 20); // Near academic building
        
        const outdoorGeo = new THREE.BoxGeometry(1.2, 1.0, 0.6);
        const acMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0 });
        const outdoor = new THREE.Mesh(outdoorGeo, acMat);
        outdoor.name = "AC_OUTDOOR_UNIT";
        this.acGroup.add(outdoor);
        
        const fanGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.1, 16);
        const fanMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
        const fan = new THREE.Mesh(fanGeo, fanMat);
        fan.rotation.x = Math.PI / 2;
        fan.position.set(0, 0, 0.31);
        this.acGroup.add(fan);
        
        this.scene.add(this.acGroup);
        this.interactables.push(this.acGroup);
    }
    
    buildWaterPump() {
        this.pumpGroup = new THREE.Group();
        this.pumpGroup.name = "WATER_PUMP";
        this.pumpGroup.position.set(24, 0.5, 4); // Utility zone
        
        const motorGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.8, 16);
        const motorMat = new THREE.MeshStandardMaterial({ color: 0x0369a1 });
        const motor = new THREE.Mesh(motorGeo, motorMat);
        motor.name = "PUMP_MOTOR";
        motor.rotation.z = Math.PI / 2;
        this.pumpGroup.add(motor);
        
        const ctrlGeo = new THREE.BoxGeometry(0.4, 0.6, 0.3);
        const ctrlMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8 });
        const ctrl = new THREE.Mesh(ctrlGeo, ctrlMat);
        ctrl.name = "PUMP_CONTROLLER";
        ctrl.position.set(0, 0.5, 0);
        this.pumpGroup.add(ctrl);
        
        this.scene.add(this.pumpGroup);
        this.interactables.push(this.pumpGroup);
    }
    
    buildStreetLights() {
        this.lightsGroup = new THREE.Group();
        
        const postGeo = new THREE.CylinderGeometry(0.05, 0.05, 3.5, 8);
        const postMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
        
        const headGeo = new THREE.BoxGeometry(0.8, 0.1, 0.3);
        const lightMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
        
        // Positions along pathways
        const positions = [
            [-8, 0, 10], [8, 0, 10], [-8, 0, -5], [8, 0, -5], [0, 0, 20], [20, 0, -2]
        ];
        
        this.lightMeshes = [];
        
        positions.forEach((pos, i) => {
            const group = new THREE.Group();
            group.name = "SMART_STREET_LIGHT";
            group.userData.lightIndex = i;
            
            const post = new THREE.Mesh(postGeo, postMat);
            post.position.y = 1.75;
            
            const head = new THREE.Mesh(headGeo, postMat);
            head.position.set(0.2, 3.5, 0);
            
            const bulb = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.2), lightMat);
            bulb.rotation.x = Math.PI / 2;
            bulb.position.set(0.2, 3.44, 0);
            
            const ctrl = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.3, 0.1), new THREE.MeshStandardMaterial({color: 0x0284c7}));
            ctrl.name = "STREET_LIGHT_CONTROLLER";
            ctrl.position.set(0, 1.0, 0.06);
            
            group.add(post, head, bulb, ctrl);
            group.position.set(pos[0], 0, pos[1]);
            
            this.lightsGroup.add(group);
            this.interactables.push(group);
            this.lightMeshes.push({group, bulb});
        });
        
        this.scene.add(this.lightsGroup);
    }
    
    buildEVCharger() {
        this.evGroup = new THREE.Group();
        this.evGroup.position.set(-20, 0, -18); // EV Zone
        
        const chargerGroup = new THREE.Group();
        chargerGroup.name = "EV_CHARGER";
        
        const chargerGeo = new THREE.BoxGeometry(0.6, 1.8, 0.4);
        const chargerMat = new THREE.MeshStandardMaterial({ color: 0x0f172a });
        const cBody = new THREE.Mesh(chargerGeo, chargerMat);
        cBody.position.y = 0.9;
        
        const screenGeo = new THREE.PlaneGeometry(0.4, 0.3);
        const screenMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
        const cScreen = new THREE.Mesh(screenGeo, screenMat);
        cScreen.name = "EV_CHARGER_CONTROLLER";
        cScreen.position.set(0, 1.4, 0.21);
        
        chargerGroup.add(cBody, cScreen);
        this.evGroup.add(chargerGroup);
        
        const ev = new THREE.Group();
        ev.name = "EV";
        const carBodyGeo = new THREE.BoxGeometry(2.0, 0.6, 4.2);
        const carBodyMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0 });
        const car = new THREE.Mesh(carBodyGeo, carBodyMat);
        car.position.set(2, 0.4, 0);
        
        const cabinGeo = new THREE.BoxGeometry(1.6, 0.5, 2.0);
        const cabinMat = new THREE.MeshStandardMaterial({ color: 0x0f172a });
        const cabin = new THREE.Mesh(cabinGeo, cabinMat);
        cabin.position.set(2, 0.9, -0.2);
        
        ev.add(car, cabin);
        this.evGroup.add(ev);
        
        this.scene.add(this.evGroup);
        this.interactables.push(chargerGroup);
        this.interactables.push(ev);
    }

    update(deltaTime) {
        // Update visual states based on models
        
        // Lights
        for (let i = 0; i < 6; i++) {
            const lc = this.loadManager.streetLights[i];
            const mesh = this.lightMeshes[i];
            if (lc.status === "ON") {
                mesh.bulb.material.color.setHex(0xfef08a);
            } else {
                mesh.bulb.material.color.setHex(0x334155);
            }
        }
        
        // Random telemetry particles from loads to Hub
        if (Math.random() < 0.08) {
            this.emitParticleFromLoad();
        }
    }
    
    emitParticleFromLoad() {
        if (!this.particleSystem) return;
        
        const loads = [
            this.scene.getObjectByName("ACADEMIC_LOAD_METER"),
            this.scene.getObjectByName("HOSTEL_LOAD_METER"),
            this.acGroup,
            this.pumpGroup,
            this.evGroup
        ].filter(Boolean);
        
        if (loads.length > 0) {
            const load = loads[Math.floor(Math.random() * loads.length)];
            const start = new THREE.Vector3();
            load.getWorldPosition(start);
            start.y += 1.0;
            
            const end = this.hubPos.clone();
            
            // Send telemetry particle (blue color)
            this.particleSystem.createDataFlow(start, end, "telemetry");
        }
    }
}
