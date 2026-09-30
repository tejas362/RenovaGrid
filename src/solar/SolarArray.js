import * as THREE from 'three';
import { SolarPanel } from './SolarPanel.js';
import { IoTSensorNode } from './IoTSensorNode.js';
import { SolarSimulation } from './SolarSimulation.js';
import { DataFlowParticleSystem } from './DataFlowParticleSystem.js';

export class SolarArrayController {
    constructor(panels) {
        this.panels = panels;
    }
    
    update(environment) {
        this.panels.forEach(panel => {
            panel.updateData(environment.getIrradiance(), environment.getTemperature());
        });
    }

    getTotalPower() {
        return this.panels.reduce((sum, p) => sum + p.data.power, 0);
    }
    
    getTotalVoltage() {
        // typically strings are in series, but let's just show an average or sum
        return this.panels.reduce((sum, p) => sum + p.data.voltage, 0);
    }
    
    getTotalCurrent() {
        return this.panels.reduce((sum, p) => sum + p.data.current, 0) / (this.panels.length || 1); // average
    }

    getAverageIrradiance() {
        return this.panels.reduce((sum, p) => sum + p.data.irradiance, 0) / (this.panels.length || 1);
    }

    getAverageTemperature() {
        return this.panels.reduce((sum, p) => sum + p.data.temperature, 0) / (this.panels.length || 1);
    }

    getStatus() {
        const active = this.panels.filter(p => p.data.status === "ACTIVE").length;
        if (active > 0) return "ACTIVE";
        if (this.getTotalPower() > 0) return "LOW_OUTPUT";
        return "OFFLINE";
    }

    getPanelData(id) {
        const panel = this.panels.find(p => p.id === id);
        return panel ? panel.data : null;
    }
}

export class SolarArray {
    constructor(scene) {
        this.scene = scene;
        this.group = new THREE.Group();
        this.group.name = "SOLAR_ARRAY";
        this.group.position.set(-18, 1.25, -12); // Positioned at Solar Generation Zone
        
        this.panels = [];
        this.sensorNode = new IoTSensorNode();
        
        this.simulation = new SolarSimulation();
        this.controller = new SolarArrayController(this.panels);
        this.particleSystem = new DataFlowParticleSystem(scene);
        
        this.isExpanded = false;
        
        this.buildStructure();
        this.buildPanels();
        this.buildSensors();
        this.buildCables();
        
        // Position IoT node
        this.sensorNode.group.position.set(4, 0, 3);
        this.group.add(this.sensorNode.group);
        
        this.scene.add(this.group);
        
        this.clock = new THREE.Clock();
    }
    
    buildStructure() {
        const supportGroup = new THREE.Group();
        supportGroup.name = "SOLAR_SUPPORT";
        
        const mat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.5, metalness: 0.8 });
        
        // Base plates
        const baseGeo = new THREE.BoxGeometry(0.4, 0.1, 0.4);
        const baseGroup = new THREE.Group();
        baseGroup.name = "SOLAR_BASE";
        
        // Vertical columns
        const colGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.2);
        
        // Horizontal rails
        const railGeo = new THREE.BoxGeometry(11, 0.1, 0.1);
        const railGroup = new THREE.Group();
        railGroup.name = "SOLAR_RAILS";
        
        const colPositions = [
            [-3, 0, -1], [3, 0, -1],
            [-3, 0, 2], [3, 0, 2]
        ];
        
        colPositions.forEach(pos => {
            const base = new THREE.Mesh(baseGeo, mat);
            base.position.set(pos[0], 0.05, pos[1]);
            base.castShadow = true;
            base.receiveShadow = true;
            baseGroup.add(base);
            
            const col = new THREE.Mesh(colGeo, mat);
            col.position.set(pos[0], 0.6, pos[1]);
            col.castShadow = true;
            col.receiveShadow = true;
            supportGroup.add(col);
        });
        
        // Tilt beam
        const tiltBeamGeo = new THREE.BoxGeometry(0.1, 0.1, 3.5);
        [-3, 3].forEach(x => {
            const beam = new THREE.Mesh(tiltBeamGeo, mat);
            beam.position.set(x, 1.2, 0.5);
            beam.rotation.x = Math.PI / 8; // 22.5 deg tilt
            beam.castShadow = true;
            beam.receiveShadow = true;
            supportGroup.add(beam);
        });
        
        // Horizontal rails across the tilted beams
        [-0.8, 1.8].forEach(zOffset => {
            const rail = new THREE.Mesh(railGeo, mat);
            rail.position.set(0, 1.2 + Math.tan(Math.PI / 8) * (0.5 - zOffset), zOffset);
            rail.rotation.x = Math.PI / 8;
            rail.castShadow = true;
            rail.receiveShadow = true;
            railGroup.add(rail);
        });
        
        supportGroup.add(baseGroup);
        supportGroup.add(railGroup);
        this.group.add(supportGroup);
    }
    
    buildPanels() {
        const positions = [
            [-2.8, -0.6], [2.8, -0.6],
            [-2.8, 2.6], [2.8, 2.6]
        ];
        
        for (let i = 0; i < 4; i++) {
            const id = `SOLAR_PANEL_0${i + 1}`;
            const panel = new SolarPanel(id);
            
            panel.basePosition = new THREE.Vector3(positions[i][0], 1.5 - (positions[i][1] - 0.5) * Math.tan(Math.PI / 8), positions[i][1]);
            
            panel.group.position.copy(panel.basePosition);
            panel.group.rotation.x = Math.PI / 8; // Match rail tilt
            
            this.panels.push(panel);
            this.group.add(panel.group);
        }
    }
    
    buildSensors() {
        const createSensor = (name, color, pos) => {
            const geo = new THREE.BoxGeometry(0.2, 0.2, 0.2);
            const mat = new THREE.MeshStandardMaterial({ color });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.name = name;
            mesh.position.copy(pos);
            this.group.add(mesh);
        };
        
        // Attach sensors to support structure near panels
        createSensor("VOLTAGE_SENSOR", 0xef4444, new THREE.Vector3(-3.2, 1.1, -1));
        createSensor("CURRENT_SENSOR", 0xf59e0b, new THREE.Vector3(-3.2, 1.1, 2));
        createSensor("IRRADIANCE_SENSOR", 0x3b82f6, new THREE.Vector3(3.2, 1.1, -1));
        createSensor("TEMPERATURE_SENSOR", 0x10b981, new THREE.Vector3(3.2, 1.1, 2));
    }
    
    buildCables() {
        // Draw splines from each panel to the IoT node
        const material = new THREE.LineBasicMaterial({ color: 0x1e293b, linewidth: 2 });
        const iotPos = new THREE.Vector3(4, 0.3, 3);
        
        this.panels.forEach(panel => {
            const panelPos = panel.basePosition.clone();
            panelPos.y -= 0.2; // Underside of panel
            
            const points = [];
            points.push(panelPos);
            points.push(new THREE.Vector3(panelPos.x, 0.1, panelPos.z));
            points.push(new THREE.Vector3(iotPos.x, 0.1, panelPos.z));
            points.push(iotPos);
            
            const curve = new THREE.CatmullRomCurve3(points);
            const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(20));
            const splineObject = new THREE.Line(geometry, material);
            this.group.add(splineObject);
        });
    }

    expandArray() {
        this.isExpanded = true;
    }
    
    collapseArray() {
        this.isExpanded = false;
    }

    getOutputPoint() {
        return new THREE.Vector3(0, 0, 0); // To be connected to AI hub
    }

    update() {
        const dt = this.clock.getDelta();
        const time = this.clock.getElapsedTime();
        
        // 1. Update simulation logic
        this.controller.update(this.simulation);
        
        // 2. Animate panels expansion
        const targetOffset = this.isExpanded ? 0.8 : 0;
        this.panels.forEach((panel, i) => {
            const dirX = panel.basePosition.x < 0 ? -1 : 1;
            const dirZ = panel.basePosition.z < 0 ? -1 : 1;
            
            const targetPos = panel.basePosition.clone().add(new THREE.Vector3(dirX * targetOffset, 0, dirZ * targetOffset));
            panel.group.position.lerp(targetPos, 0.1);
        });
        
        // 3. IoT node LED blink
        this.sensorNode.update(time);
        
        // 4. Data particles (spawn randomly based on power)
        if (Math.random() < 0.05 && this.simulation.getIrradiance() > 10) {
            const randomPanel = this.panels[Math.floor(Math.random() * this.panels.length)];
            const start = new THREE.Vector3();
            randomPanel.group.getWorldPosition(start);
            
            const end = new THREE.Vector3();
            this.sensorNode.group.getWorldPosition(end);
            end.y += 0.5; // middle of the box
            
            this.particleSystem.createDataFlow(start, end, "default", () => {
                if (this.onDataReachedIoT) this.onDataReachedIoT();
            });
        }
        
        this.particleSystem.update();
    }
}
