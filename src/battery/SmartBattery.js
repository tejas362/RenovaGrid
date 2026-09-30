import * as THREE from 'three';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { SmartBatteryController } from './SmartBatteryController.js';

export class SmartBattery {
    constructor(scene, energyHub, particleSystem) {
        this.scene = scene;
        this.energyHub = energyHub;
        this.particleSystem = particleSystem;
        this.controller = new SmartBatteryController();
        this.controller.initialize();
        
        this.group = new THREE.Group();
        this.group.name = "SMART_BATTERY";
        
        // ZONES.battery is at approx { x: 12, y: 0.5, z: 2 } or similar. Let's lookup exactly.
        // Based on zones.js, battery zone is placed at cfg.position.
        // We'll just position it at (10, 1.2, 5) or so. Let's make it easy to tweak.
        this.group.position.set(12, 1.0, 3);
        
        this.viewState = 'COLLAPSED';
        this.basePositions = new Map();
        
        this.buildCabinet();
        this.buildModules();
        this.buildBMS();
        this.buildVisualIndicators();
        
        this.scene.add(this.group);
        
        this.storeBasePositions();
    }
    
    setPosition(pos) {
        this.group.position.copy(pos);
    }

    buildCabinet() {
        const frameMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7, metalness: 0.4 });
        const panelMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.5, metalness: 0.2 });
        const darkMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });

        // Main Cabinet Body (Back and Sides)
        const cabGeo = new THREE.BoxGeometry(6, 3, 4);
        const cab = new THREE.Mesh(cabGeo, frameMat);
        cab.name = "BATTERY_CABINET";
        cab.position.set(0, 1.5, 0);
        this.group.add(cab);

        // Front Panel / Door
        const doorGeo = new THREE.BoxGeometry(5.8, 2.8, 0.2);
        const door = new THREE.Mesh(doorGeo, panelMat);
        door.name = "BATTERY_DOOR";
        door.position.set(0, 1.5, 2.05);
        this.group.add(door);

        // Vent on side
        const ventGeo = new THREE.BoxGeometry(0.1, 1.5, 2.0);
        const vent = new THREE.Mesh(ventGeo, darkMat);
        vent.name = "BATTERY_VENT";
        vent.position.set(-3.05, 1.5, 0);
        this.group.add(vent);

        // Base/Feet
        const base = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.2, 3.8), darkMat);
        base.position.set(0, 0.1, 0);
        this.group.add(base);
    }

    buildModules() {
        const modMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6 });
        const termPosMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.8 });
        const termNegMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, metalness: 0.8 });
        
        this.modules = [];
        
        for (let i = 0; i < 6; i++) {
            const modGroup = new THREE.Group();
            modGroup.name = `BATTERY_MODULE_0${i + 1}`;
            
            // Box
            const mBox = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.35, 2.5), modMat);
            modGroup.add(mBox);
            
            // Terminals
            const tPos = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.1), termPosMat);
            tPos.position.set(2.0, 0.2, 0.5);
            modGroup.add(tPos);
            
            const tNeg = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.1), termNegMat);
            tNeg.position.set(2.0, 0.2, -0.5);
            modGroup.add(tNeg);

            // Cells visualization (Simplified InstancedMesh)
            const cellGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.25, 8);
            const cellMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.5 });
            const cellMesh = new THREE.InstancedMesh(cellGeo, cellMat, 12);
            
            let dummy = new THREE.Object3D();
            let idx = 0;
            for(let cx = -1.5; cx <= 1.5; cx += 1.0) {
                for(let cz = -0.8; cz <= 0.8; cz += 0.8) {
                    if (idx >= 12) break;
                    dummy.position.set(cx, 0.05, cz);
                    dummy.updateMatrix();
                    cellMesh.setMatrixAt(idx++, dummy.matrix);
                }
            }
            modGroup.add(cellMesh);
            
            // Position in cabinet
            const yPos = 0.5 + (i * 0.45);
            modGroup.position.set(0, yPos, 0);
            
            this.group.add(modGroup);
            this.modules.push(modGroup);
        }
        
        // Busbars
        const busGeo = new THREE.BoxGeometry(0.1, 2.6, 0.2);
        
        this.busPos = new THREE.Mesh(busGeo, termPosMat);
        this.busPos.name = "BATTERY_BUS_POSITIVE";
        this.busPos.position.set(2.4, 1.7, 0.5);
        this.group.add(this.busPos);
        
        this.busNeg = new THREE.Mesh(busGeo, termNegMat);
        this.busNeg.name = "BATTERY_BUS_NEGATIVE";
        this.busNeg.position.set(2.4, 1.7, -0.5);
        this.group.add(this.busNeg);
    }

    buildBMS() {
        this.bmsGroup = new THREE.Group();
        this.bmsGroup.name = "BMS_SYSTEM";
        
        const bmsBox = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.6, 1.0), new THREE.MeshStandardMaterial({ color: 0x064e3b }));
        bmsBox.name = "BMS_CONTROLLER";
        this.bmsGroup.add(bmsBox);
        
        const disp = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.4), new THREE.MeshBasicMaterial({ color: 0x0ea5e9 }));
        disp.name = "BMS_DISPLAY";
        disp.position.set(0, 0, 0.51);
        this.bmsGroup.add(disp);
        
        // Sensors
        for(let i=1; i<=3; i++) {
            const sens = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.1), new THREE.MeshStandardMaterial({color: 0xfacc15}));
            sens.name = `BMS_SENSOR_0${i}`;
            sens.position.set(-0.8 + (i * 0.4), 0.35, 0);
            this.bmsGroup.add(sens);
        }
        
        this.bmsGroup.position.set(-1.0, 2.2, 0);
        this.group.add(this.bmsGroup);
    }

    buildVisualIndicators() {
        // Status Panel Canvas
        this.statusCanvas = document.createElement('canvas');
        this.statusCanvas.width = 256;
        this.statusCanvas.height = 512;
        this.statusCtx = this.statusCanvas.getContext('2d');
        this.statusTex = new THREE.CanvasTexture(this.statusCanvas);
        
        const panelGeo = new THREE.PlaneGeometry(1.0, 2.0);
        const panelMat = new THREE.MeshBasicMaterial({ map: this.statusTex });
        this.statusPanel = new THREE.Mesh(panelGeo, panelMat);
        this.statusPanel.name = "BATTERY_STATUS_PANEL";
        this.statusPanel.position.set(-1.5, 1.5, 2.16); // on door
        this.group.add(this.statusPanel);
        
        // Data Indicator CSS
        const div = document.createElement('div');
        div.style.background = 'rgba(15,23,42,0.8)';
        div.style.border = '1px solid #22c55e';
        div.style.color = '#fff';
        div.style.padding = '4px 8px';
        div.style.borderRadius = '4px';
        div.style.fontSize = '10px';
        div.style.fontFamily = 'monospace';
        div.style.pointerEvents = 'none';
        
        this.indicatorDiv = div;
        this.dataIndicator = new CSS2DObject(div);
        this.dataIndicator.position.set(0, 3.5, 0);
        this.group.add(this.dataIndicator);
    }

    storeBasePositions() {
        this.group.traverse(child => {
            if (child === this.group) return; // Prevent storing root group position
            if (child.isMesh || child.isGroup) {
                this.basePositions.set(child, child.position.clone());
            }
        });
    }

    updateSOCDisplay() {
        if (!this.statusCtx) return;
        const ctx = this.statusCtx;
        const w = this.statusCanvas.width;
        const h = this.statusCanvas.height;
        const ctrl = this.controller;
        
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, w, h);
        
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 24px monospace';
        ctx.fillText('SMART BATTERY', 10, 40);
        
        // SOC Bar
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 4;
        ctx.strokeRect(20, 80, w - 40, 40);
        
        ctx.fillStyle = ctrl.soc > 20 ? '#22c55e' : '#ef4444';
        ctx.fillRect(22, 82, (w - 44) * (ctrl.soc / 100), 36);
        
        ctx.fillStyle = '#f8fafc';
        ctx.font = '20px monospace';
        ctx.fillText(`SOC: ${ctrl.soc.toFixed(1)}%`, 20, 150);
        ctx.fillText(`PWR: ${ctrl.power.toFixed(1)} kW`, 20, 190);
        ctx.fillText(`TMP: ${ctrl.temperature.toFixed(1)}°C`, 20, 230);
        ctx.fillText(`BMS: ${ctrl.bmsStatus}`, 20, 270);
        
        ctx.fillStyle = ctrl.status === 'CHARGING' ? '#38bdf8' : (ctrl.status === 'DISCHARGING' ? '#f59e0b' : '#94a3b8');
        ctx.fillText(`[ ${ctrl.status} ]`, 20, 310);
        
        this.statusTex.needsUpdate = true;
        
        this.indicatorDiv.innerHTML = `BESS<br><span style="color:${ctx.fillStyle}">● ${ctrl.status}</span>`;
    }

    updateBatteryVisualState() {
        // Module colors based on SOC
        const bmsData = this.controller.bms.getBMSData();
        for (let i = 0; i < 6; i++) {
            const modSOC = bmsData.moduleSOCs[i];
            const mod = this.modules[i];
            // Access the mBox which is the first child
            if (mod.children[0] && mod.children[0].material) {
                if (modSOC < 20) mod.children[0].material.color.setHex(0x7f1d1d);
                else mod.children[0].material.color.setHex(0x0f172a);
            }
        }
    }

    expand() {
        this.viewState = 'EXPANDED';
        this.animateComponent("BATTERY_DOOR", new THREE.Vector3(0, 1.5, 4.0));
        this.animateComponent("BATTERY_STATUS_PANEL", new THREE.Vector3(-1.5, 1.5, 4.11));
        
        for (let i = 0; i < 6; i++) {
            this.animateComponent(`BATTERY_MODULE_0${i+1}`, new THREE.Vector3(0, 0.5 + (i*0.45), 2.5));
        }
        
        this.animateComponent("BMS_SYSTEM", new THREE.Vector3(-1.0, 2.2, 2.5));
        this.animateComponent("BATTERY_BUS_POSITIVE", new THREE.Vector3(3.5, 1.7, 0.5));
        this.animateComponent("BATTERY_BUS_NEGATIVE", new THREE.Vector3(3.5, 1.7, -0.5));
    }
    
    collapse() {
        this.viewState = 'COLLAPSED';
        this.group.traverse(child => {
            if (this.basePositions.has(child)) {
                child.userData.targetPos = this.basePositions.get(child);
            }
        });
    }

    animateComponent(name, targetLocalPos) {
        const obj = this.group.getObjectByName(name);
        if (obj) obj.userData.targetPos = targetLocalPos;
    }

    getInputConnectionPoint() { return new THREE.Vector3(0, 0, -2).add(this.group.position); }
    getOutputConnectionPoint() { return new THREE.Vector3(0, 0, -2).add(this.group.position); }

    update(deltaTime) {
        this.controller.update(deltaTime);
        this.updateSOCDisplay();
        this.updateBatteryVisualState();
        
        // Sync to hub telemetry
        if (this.energyHub) {
            this.energyHub.controller.updateBatteryData(this.controller.getBatteryData());
        }

        // Animate parts
        this.group.traverse(child => {
            if (child.userData.targetPos) {
                child.position.lerp(child.userData.targetPos, 0.1);
            }
        });

        // Generate data particles based on state
        if (Math.random() < 0.05) {
            if (this.controller.status === 'CHARGING') {
                const start = this.energyHub.getBatteryConnectionPoint();
                const end = this.getInputConnectionPoint();
                this.particleSystem.createDataFlow(start, end, "power");
            } else if (this.controller.status === 'DISCHARGING') {
                const start = this.getOutputConnectionPoint();
                const end = this.energyHub.getBatteryConnectionPoint();
                this.particleSystem.createDataFlow(start, end, "power");
            }
        }
    }
}
