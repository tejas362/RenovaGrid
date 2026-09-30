import * as THREE from 'three';

export class SolarPanel {
    constructor(id) {
        this.id = id;
        this.group = new THREE.Group();
        this.group.name = id;
        
        this.width = 5.0;
        this.depth = 3.0;
        this.thickness = 0.15;
        
        this.ratedPower = 3.4; // kW
        
        this.data = {
            voltage: 0,
            current: 0,
            irradiance: 0,
            temperature: 0,
            power: 0,
            status: "OFFLINE"
        };
        
        this.buildMesh();
    }

    buildMesh() {
        // PANEL_SURFACE
        const surfaceGeo = new THREE.BoxGeometry(this.width - 0.2, this.thickness - 0.02, this.depth - 0.2);
        const surfaceMat = new THREE.MeshStandardMaterial({ 
            color: 0x111928, 
            roughness: 0.1, 
            metalness: 0.8 
        });
        const surface = new THREE.Mesh(surfaceGeo, surfaceMat);
        surface.name = this.id.replace('SOLAR_PANEL', 'PANEL_SURFACE');
        surface.position.y = this.thickness / 2;
        this.group.add(surface);

        // PANEL_FRAME
        const frameGeo = new THREE.BoxGeometry(this.width, this.thickness, this.depth);
        const frameMat = new THREE.MeshStandardMaterial({
            color: 0x94a3b8, // metallic
            roughness: 0.4,
            metalness: 0.7
        });
        const frame = new THREE.Mesh(frameGeo, frameMat);
        frame.name = this.id.replace('SOLAR_PANEL', 'PANEL_FRAME');
        frame.position.y = this.thickness / 2;
        // Make the frame hollow by using simple box and scale or multiple boxes. 
        // A simple trick is to draw the frame slightly larger and place the surface slightly higher.
        this.group.add(frame);
        
        // Re-adjust surface to sit slightly above frame
        surface.position.y = this.thickness / 2 + 0.02;
        
        // PANEL_CELLS (subtle grid using canvas texture)
        const cellCanvas = document.createElement('canvas');
        cellCanvas.width = 512;
        cellCanvas.height = 256;
        const ctx = cellCanvas.getContext('2d');
        
        ctx.fillStyle = '#0f172a'; // dark blue base
        ctx.fillRect(0, 0, cellCanvas.width, cellCanvas.height);
        
        ctx.strokeStyle = '#cbd5e1'; // silver grid lines
        ctx.lineWidth = 2;
        
        const cols = 10;
        const rows = 6;
        const cellW = cellCanvas.width / cols;
        const cellH = cellCanvas.height / rows;
        
        ctx.beginPath();
        for (let i = 0; i <= cols; i++) {
            ctx.moveTo(i * cellW, 0);
            ctx.lineTo(i * cellW, cellCanvas.height);
        }
        for (let j = 0; j <= rows; j++) {
            ctx.moveTo(0, j * cellH);
            ctx.lineTo(cellCanvas.width, j * cellH);
        }
        ctx.stroke();

        const cellTexture = new THREE.CanvasTexture(cellCanvas);
        cellTexture.wrapS = THREE.RepeatWrapping;
        cellTexture.wrapT = THREE.RepeatWrapping;
        cellTexture.repeat.set(1, 1);
        
        const cellMat = new THREE.MeshStandardMaterial({
            map: cellTexture,
            roughness: 0.2,
            metalness: 0.5,
            transparent: true,
            opacity: 0.85
        });
        
        const cellsGeo = new THREE.PlaneGeometry(this.width - 0.25, this.depth - 0.25);
        const cells = new THREE.Mesh(cellsGeo, cellMat);
        cells.rotation.x = -Math.PI / 2;
        cells.position.y = this.thickness + 0.025; // just above surface
        cells.name = this.id.replace('SOLAR_PANEL', 'PANEL_CELLS');
        this.group.add(cells);
        
        this.group.castShadow = true;
        this.group.receiveShadow = true;
        surface.castShadow = true;
        frame.castShadow = true;
    }

    updateData(irradiance, temp) {
        this.data.irradiance = irradiance;
        this.data.temperature = temp;
        
        if (irradiance < 10) {
            this.data.status = "OFFLINE";
            this.data.power = 0;
            this.data.voltage = 0;
            this.data.current = 0;
        } else {
            // simplified power calculation
            const powerRatio = irradiance / 1000;
            const tempDerating = 1 - Math.max(0, (temp - 25) * 0.004); // lose 0.4% per degree above 25C
            
            this.data.power = this.ratedPower * powerRatio * tempDerating;
            this.data.voltage = 38.4 + (Math.random() - 0.5); // stays relatively constant
            this.data.current = (this.data.power * 1000) / this.data.voltage;
            
            if (powerRatio < 0.3) {
                this.data.status = "LOW_OUTPUT";
            } else {
                this.data.status = "ACTIVE";
            }
        }
        
        // Update visual status (e.g. emissive color of cells)
        const cellMesh = this.group.getObjectByName(this.id.replace('SOLAR_PANEL', 'PANEL_CELLS'));
        if (cellMesh && cellMesh.material) {
            if (this.data.status === "ACTIVE") {
                cellMesh.material.emissive.setHex(0x0284c7);
                cellMesh.material.emissiveIntensity = 0.1;
            } else if (this.data.status === "LOW_OUTPUT") {
                cellMesh.material.emissive.setHex(0x0284c7);
                cellMesh.material.emissiveIntensity = 0.02;
            } else {
                cellMesh.material.emissive.setHex(0x000000);
            }
        }
    }
}
