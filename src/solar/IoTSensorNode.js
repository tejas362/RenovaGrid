import * as THREE from 'three';

export class IoTSensorNode {
    constructor() {
        this.group = new THREE.Group();
        this.group.name = "IOT_SENSOR_NODE";
        this.buildMesh();
    }

    buildMesh() {
        // IOT_SENSOR_BOX
        const boxGeo = new THREE.BoxGeometry(0.8, 1.2, 0.5);
        const boxMat = new THREE.MeshStandardMaterial({ 
            color: 0xe2e8f0, 
            roughness: 0.6, 
            metalness: 0.3 
        });
        const box = new THREE.Mesh(boxGeo, boxMat);
        box.name = "IOT_SENSOR_BOX";
        box.position.y = 0.6;
        box.castShadow = true;
        this.group.add(box);

        // Screen / Faceplate
        const screenGeo = new THREE.PlaneGeometry(0.6, 0.4);
        const screenMat = new THREE.MeshStandardMaterial({ 
            color: 0x0f172a, 
            roughness: 0.2,
            metalness: 0.8
        });
        const screen = new THREE.Mesh(screenGeo, screenMat);
        screen.position.set(0, 0.8, 0.251);
        this.group.add(screen);

        // IOT_STATUS_LED
        const ledGeo = new THREE.SphereGeometry(0.04, 8, 8);
        const ledMat = new THREE.MeshStandardMaterial({
            color: 0x22c55e,
            emissive: 0x22c55e,
            emissiveIntensity: 1.0
        });
        const led = new THREE.Mesh(ledGeo, ledMat);
        led.name = "IOT_STATUS_LED";
        led.position.set(0.2, 1.05, 0.25);
        this.group.add(led);

        // IOT_ANTENNA
        const antGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.4);
        const antMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
        const antenna = new THREE.Mesh(antGeo, antMat);
        antenna.name = "IOT_ANTENNA";
        antenna.position.set(-0.3, 1.4, 0);
        this.group.add(antenna);

        // Ports
        const portGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.1);
        const portMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
        
        const port1 = new THREE.Mesh(portGeo, portMat);
        port1.name = "IOT_PORT_01";
        port1.rotation.x = Math.PI / 2;
        port1.position.set(-0.2, 0.3, 0.25);
        this.group.add(port1);

        const port2 = new THREE.Mesh(portGeo, portMat);
        port2.name = "IOT_PORT_02";
        port2.rotation.x = Math.PI / 2;
        port2.position.set(0.2, 0.3, 0.25);
        this.group.add(port2);
    }
    
    getDataOutputPoint() {
        // Used in future section for connection to AI Energy Hub
        return this.group.position.clone();
    }

    update(time) {
        // Blink LED
        const led = this.group.getObjectByName("IOT_STATUS_LED");
        if (led) {
            led.material.emissiveIntensity = Math.sin(time * 5) > 0 ? 1.0 : 0.2;
        }
    }
}
