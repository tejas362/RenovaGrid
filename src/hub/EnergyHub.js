import * as THREE from 'three';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { EnergyHubController } from './EnergyHubController.js';

export class EnergyHub {
    constructor(scene, dataParticleSystem) {
        this.scene = scene;
        this.dataParticleSystem = dataParticleSystem;
        this.controller = new EnergyHubController();
        
        this.group = new THREE.Group();
        this.group.name = "AI_ENERGY_HUB";
        
        // Position at center of campus on existing platform
        this.group.position.set(0, 1.2, -1);
        
        this.viewState = 'COLLAPSED'; // COLLAPSED, EXPANDED, EXPLODED
        this.basePositions = new Map();
        
        this.buildEnclosure();
        this.buildInternalComponents();
        this.buildInternalCables();
        this.buildVisualIndicators();
        
        this.scene.add(this.group);
        
        // Setup visual indicator UI
        this.createDataStreamIndicator();
        
        // Store base positions for animation
        this.group.traverse(child => {
            if (child === this.group) return; // Prevent storing root group position
            if (child.isMesh || child.isGroup) {
                this.basePositions.set(child, child.position.clone());
            }
        });
    }

    buildEnclosure() {
        // Enclosure Frame
        const frameGeo = new THREE.BoxGeometry(4.0, 2.6, 2.4);
        // Using edges geometry for a frame look, or just a solid box with materials.
        // Let's create a solid box that represents the metal back and frame
        const frameMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.3 });
        const frame = new THREE.Mesh(frameGeo, frameMat);
        frame.name = "AI_HUB_FRAME";
        frame.position.y = 1.3;
        // Make it essentially the back wall and floor
        frame.scale.set(1, 1, 0.1);
        frame.position.z = -1.15;
        this.group.add(frame);
        
        const floorGeo = new THREE.BoxGeometry(4.0, 0.1, 2.4);
        const floor = new THREE.Mesh(floorGeo, frameMat);
        floor.position.set(0, 0.05, 0);
        this.group.add(floor);

        // Glass Panels
        const glassMat = new THREE.MeshStandardMaterial({
            color: 0x38bdf8,
            transparent: true,
            opacity: 0.2,
            roughness: 0.1,
            metalness: 0.9,
            side: THREE.DoubleSide
        });

        const glassFront = new THREE.Mesh(new THREE.PlaneGeometry(4.0, 2.6), glassMat);
        glassFront.name = "AI_HUB_GLASS_FRONT";
        glassFront.position.set(0, 1.3, 1.2);
        this.group.add(glassFront);

        const glassLeft = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 2.6), glassMat);
        glassLeft.name = "AI_HUB_GLASS_LEFT";
        glassLeft.rotation.y = -Math.PI / 2;
        glassLeft.position.set(-2.0, 1.3, 0);
        this.group.add(glassLeft);

        const glassRight = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 2.6), glassMat);
        glassRight.name = "AI_HUB_GLASS_RIGHT";
        glassRight.rotation.y = Math.PI / 2;
        glassRight.position.set(2.0, 1.3, 0);
        this.group.add(glassRight);

        const glassTop = new THREE.Mesh(new THREE.PlaneGeometry(4.0, 2.4), glassMat);
        glassTop.name = "AI_HUB_GLASS_TOP";
        glassTop.rotation.x = -Math.PI / 2;
        glassTop.position.set(0, 2.6, 0);
        this.group.add(glassTop);
        
        // Door frame indicator
        const door = new THREE.Mesh(new THREE.BoxGeometry(3.8, 2.4, 0.05), new THREE.MeshStandardMaterial({color: 0x94a3b8, transparent:true, opacity: 0.4}));
        door.name = "AI_HUB_DOOR";
        door.position.set(0, 1.3, 1.25);
        this.group.add(door);
    }

    buildInternalComponents() {
        const pcbMat = new THREE.MeshStandardMaterial({ color: 0x064e3b, roughness: 0.8 }); // Green PCB
        const chipMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 }); // Black chip
        const plasticMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.6 }); // White plastic
        const metalMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 });
        
        // RPI_CONTROLLER
        const rpiGroup = new THREE.Group();
        rpiGroup.name = "RPI_CONTROLLER";
        const rpiBoard = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.05, 0.5), pcbMat);
        const rpiCpu = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.08, 0.2), chipMat);
        rpiCpu.position.set(0, 0.04, 0);
        const rpiPorts = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.15, 0.3), metalMat);
        rpiPorts.position.set(0.35, 0.08, 0);
        rpiGroup.add(rpiBoard, rpiCpu, rpiPorts);
        rpiGroup.position.set(-1.0, 1.8, -0.6);
        rpiGroup.rotation.x = Math.PI/2;
        this.group.add(rpiGroup);

        // ESP32_CONTROLLER
        const espGroup = new THREE.Group();
        espGroup.name = "ESP32_CONTROLLER";
        const espBoard = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.05, 0.3), pcbMat);
        const espChip = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.08, 0.15), metalMat); // Shield
        espChip.position.set(-0.1, 0.04, 0);
        espGroup.add(espBoard, espChip);
        espGroup.position.set(0.5, 1.8, -0.6);
        espGroup.rotation.x = Math.PI/2;
        this.group.add(espGroup);

        // IOT_GATEWAY
        const gatewayGroup = new THREE.Group();
        gatewayGroup.name = "IOT_GATEWAY";
        const gwBox = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.8, 0.3), plasticMat);
        const gwAnt = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.3), metalMat);
        gwAnt.position.set(0, 0.5, 0);
        gatewayGroup.add(gwBox, gwAnt);
        gatewayGroup.position.set(-1.0, 0.8, -0.6);
        this.group.add(gatewayGroup);

        // ENERGY_METER
        const meterGroup = new THREE.Group();
        meterGroup.name = "ENERGY_METER";
        const meterBox = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.6, 0.4), new THREE.MeshStandardMaterial({color: 0x334155}));
        const meterScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.3), new THREE.MeshBasicMaterial({color: 0x0ea5e9}));
        meterScreen.position.set(0, 0, 0.21);
        meterGroup.add(meterBox, meterScreen);
        meterGroup.position.set(0.5, 0.8, -0.6);
        this.group.add(meterGroup);

        // CONTROL_UNIT
        const cuGroup = new THREE.Group();
        cuGroup.name = "CONTROL_UNIT";
        const cuBox = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.5, 0.5), metalMat);
        cuGroup.add(cuBox);
        cuGroup.position.set(0, 0.3, 0);
        this.group.add(cuGroup);

        // AI_HUB_DISPLAY
        const displayGroup = new THREE.Group();
        displayGroup.name = "AI_HUB_DISPLAY";
        const dispBox = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.8, 0.1), chipMat);
        
        this.displayCanvas = document.createElement('canvas');
        this.displayCanvas.width = 512;
        this.displayCanvas.height = 256;
        this.displayCtx = this.displayCanvas.getContext('2d');
        this.displayTexture = new THREE.CanvasTexture(this.displayCanvas);
        
        const dispScreen = new THREE.Mesh(
            new THREE.PlaneGeometry(1.1, 0.7), 
            new THREE.MeshBasicMaterial({map: this.displayTexture})
        );
        dispScreen.position.set(0, 0, 0.06);
        displayGroup.add(dispBox, dispScreen);
        displayGroup.position.set(0, 1.6, 1.15); // Mounted on front inside
        this.group.add(displayGroup);
    }

    buildInternalCables() {
        const mat = new THREE.LineBasicMaterial({ color: 0xef4444, linewidth: 2 });
        const createCable = (p1, p2) => {
            const points = [
                p1,
                new THREE.Vector3(p1.x, p2.y, p1.z),
                p2
            ];
            const curve = new THREE.CatmullRomCurve3(points);
            const geo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(10));
            const line = new THREE.Line(geo, mat);
            this.group.add(line);
            return line;
        };

        createCable(new THREE.Vector3(-1.0, 1.8, -0.6), new THREE.Vector3(0.5, 1.8, -0.6)); // RPI to ESP32
        createCable(new THREE.Vector3(0.5, 1.8, -0.6), new THREE.Vector3(-1.0, 0.8, -0.6)); // ESP32 to Gateway
        createCable(new THREE.Vector3(-1.0, 0.8, -0.6), new THREE.Vector3(0.5, 0.8, -0.6)); // Gateway to Meter
        createCable(new THREE.Vector3(-1.0, 1.8, -0.6), new THREE.Vector3(-0.5, 0.3, 0));   // RPI to Control Unit
        createCable(new THREE.Vector3(0.5, 0.8, -0.6), new THREE.Vector3(0.5, 0.3, 0));     // Meter to Control Unit
    }

    buildVisualIndicators() {
        const ledGeo = new THREE.SphereGeometry(0.05, 8, 8);
        
        const createLED = (name, color, pos) => {
            const mat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 1 });
            const led = new THREE.Mesh(ledGeo, mat);
            led.name = name;
            led.position.copy(pos);
            this.group.add(led);
            return led;
        };

        this.sysLed = createLED("SYSTEM_STATUS_LED", 0x22c55e, new THREE.Vector3(-0.8, 2.4, -1.0));
        this.netLed = createLED("NETWORK_STATUS_LED", 0x38bdf8, new THREE.Vector3(-0.6, 2.4, -1.0));
        this.aiLed = createLED("AI_STATUS_LED", 0xa855f7, new THREE.Vector3(-0.4, 2.4, -1.0));
        
        // AI Processing indicator
        this.aiPulseMat = new THREE.MeshBasicMaterial({ color: 0xa855f7, transparent: true, opacity: 0.5 });
        this.aiPulse = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.02, 8, 24), this.aiPulseMat);
        this.aiPulse.position.set(0, 1.6, -1.0); // behind display
        this.group.add(this.aiPulse);
    }

    createDataStreamIndicator() {
        const div = document.createElement('div');
        div.className = 'hub-data-indicator';
        div.style.background = 'rgba(15,23,42,0.8)';
        div.style.border = '1px solid #38bdf8';
        div.style.color = '#fff';
        div.style.padding = '4px 8px';
        div.style.borderRadius = '4px';
        div.style.fontSize = '10px';
        div.style.fontFamily = 'monospace';
        div.style.pointerEvents = 'none';
        
        this.dataIndicatorDiv = div;
        this.dataIndicator = new CSS2DObject(div);
        this.dataIndicator.position.set(0, 3.2, 0);
        this.group.add(this.dataIndicator);
        
        this.updateIndicatorText();
    }

    updateIndicatorText() {
        let statusColor = '#22c55e'; // green connected
        let text = 'CONNECTED';
        
        if (this.controller.status === 'PROCESSING') {
            statusColor = '#38bdf8';
            text = 'RECEIVING';
        } else if (this.controller.status === 'IDLE') {
            statusColor = '#94a3b8';
            text = 'IDLE';
        }
        
        this.dataIndicatorDiv.innerHTML = `DATA STREAM<br><span style="color:${statusColor}">● ${text}</span>`;
    }

    renderScreen() {
        if (!this.displayCtx) return;
        
        const ctx = this.displayCtx;
        const width = this.displayCanvas.width;
        const height = this.displayCanvas.height;
        const ctrl = this.controller;
        
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, width, height);
        
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 24px monospace';
        ctx.fillText('AI ENERGY MANAGER', 20, 30);
        
        ctx.fillStyle = '#f8fafc';
        ctx.font = '20px monospace';
        ctx.fillText(`SOLAR:   ${ctrl.solarData.totalPower.toFixed(2)} kW`, 20, 70);
        ctx.fillText(`LOAD:    ${ctrl.loadData.totalPower ? ctrl.loadData.totalPower.toFixed(2) : (ctrl.loadData.power || 0).toFixed(2)} kW`, 20, 100);
        ctx.fillText(`BATTERY: ${ctrl.batteryData.soc.toFixed(0)}%`, 20, 130);
        
        ctx.fillStyle = ctrl.status === 'ONLINE' || ctrl.status === 'PROCESSING' ? '#22c55e' : (ctrl.status === 'IDLE' ? '#94a3b8' : '#fbbf24');
        ctx.fillText(`SYSTEM:  ${ctrl.status}`, 20, 160);
        
        let aiStr = ctrl.optimizationData ? ctrl.optimizationData.status || "OPTIMIZING" : "ANALYZING";
        ctx.fillStyle = '#10b981';
        ctx.fillText(`AI:      ${aiStr}`, 20, 190);
        
        if (ctrl.optimizationData) {
            ctx.fillStyle = '#f59e0b';
            ctx.font = '16px monospace';
            ctx.fillText(`MODE: ${ctrl.optimizationData.mode}`, 20, 220);
            ctx.fillText(`RENEWABLE: ${ctrl.optimizationData.renewableUtilization.toFixed(1)}%`, 250, 220);
            ctx.fillText(`GRID: ${ctrl.optimizationData.gridPower.toFixed(1)} kW`, 20, 245);
        }
        
        this.displayTexture.needsUpdate = true;
    }

    // Reserved connection points
    getBatteryConnectionPoint() { return new THREE.Vector3(2, 0, 0).add(this.group.position); }
    getLoadConnectionPoint() { return new THREE.Vector3(-2, 0, 0).add(this.group.position); }
    getGridConnectionPoint() { return new THREE.Vector3(0, 0, -2).add(this.group.position); }
    getSolarDataConnectionPoint() { return new THREE.Vector3(0, 2.5, 0).add(this.group.position); }

    expandHub() {
        this.viewState = 'EXPANDED';
        this.animateComponent("AI_HUB_GLASS_FRONT", new THREE.Vector3(0, 1.3, 2.0));
        this.animateComponent("AI_HUB_DOOR", new THREE.Vector3(0, 1.3, 2.1));
    }
    
    explodeHub() {
        this.viewState = 'EXPLODED';
        this.animateComponent("AI_HUB_GLASS_FRONT", new THREE.Vector3(0, 1.3, 3.0));
        this.animateComponent("AI_HUB_DOOR", new THREE.Vector3(0, 1.3, 3.1));
        this.animateComponent("AI_HUB_GLASS_LEFT", new THREE.Vector3(-3.0, 1.3, 0));
        this.animateComponent("AI_HUB_GLASS_RIGHT", new THREE.Vector3(3.0, 1.3, 0));
        this.animateComponent("AI_HUB_GLASS_TOP", new THREE.Vector3(0, 3.6, 0));
        
        this.animateComponent("RPI_CONTROLLER", new THREE.Vector3(-1.0, 2.5, -0.6));
        this.animateComponent("ESP32_CONTROLLER", new THREE.Vector3(1.5, 1.8, -0.6));
        this.animateComponent("IOT_GATEWAY", new THREE.Vector3(-2.0, 0.8, -0.6));
        this.animateComponent("ENERGY_METER", new THREE.Vector3(0.5, 1.5, -0.6));
        this.animateComponent("CONTROL_UNIT", new THREE.Vector3(0, -0.5, 0));
        this.animateComponent("AI_HUB_DISPLAY", new THREE.Vector3(0, 1.6, 2.5));
    }

    collapseHub() {
        this.viewState = 'COLLAPSED';
        // Revert all components to base positions
        this.group.traverse(child => {
            if (this.basePositions.has(child)) {
                // In a real scenario we'd use lerp/animation, here we set directly for now, 
                // but we will lerp in update()
                child.userData.targetPos = this.basePositions.get(child);
            }
        });
    }

    animateComponent(name, targetLocalPos) {
        const obj = this.group.getObjectByName(name);
        if (obj) {
            obj.userData.targetPos = targetLocalPos;
        }
    }

    update(time, solarArrayController) {
        // Sync data
        if (solarArrayController) {
            this.controller.updateSolarData({
                totalPower: solarArrayController.getTotalPower(),
                totalVoltage: solarArrayController.getTotalVoltage(),
                totalCurrent: solarArrayController.getTotalCurrent(),
                averageIrradiance: solarArrayController.getAverageIrradiance(),
                averageTemperature: solarArrayController.getAverageTemperature(),
                status: solarArrayController.getStatus()
            });
        }
        
        this.controller.update();
        this.updateIndicatorText();
        this.renderScreen();

        // AI pulse animation
        if (this.controller.status === 'PROCESSING') {
            this.aiPulse.scale.setScalar(1 + Math.sin(time * 10) * 0.2);
            this.aiPulseMat.opacity = 0.8;
            this.aiLed.material.emissiveIntensity = 1.0;
        } else {
            this.aiPulse.scale.setScalar(1);
            this.aiPulseMat.opacity = 0.2;
            this.aiLed.material.emissiveIntensity = 0.3;
        }
        
        // System LED blink
        this.sysLed.material.emissiveIntensity = (time % 2 < 1) ? 1.0 : 0.5;

        // Animate positions for explode/expand
        this.group.traverse(child => {
            if (child.userData.targetPos) {
                child.position.lerp(child.userData.targetPos, 0.1);
            }
        });
    }
}
