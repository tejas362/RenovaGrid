import * as THREE from 'three';

export class DataFlowParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
        
        // Geometry and material for particles
        this.particleGeo = new THREE.SphereGeometry(0.08, 4, 4);
        this.particleMat = new THREE.MeshBasicMaterial({ 
            color: 0x38bdf8,
            transparent: true,
            opacity: 0.8
        });
    }

    createDataFlow(sourceVec, targetVec, type = "default", onComplete = null) {
        const particle = new THREE.Mesh(this.particleGeo, this.particleMat);
        particle.position.copy(sourceVec);
        
        if (type === "sensor-data") {
            particle.material = new THREE.MeshBasicMaterial({ color: 0x22c55e, transparent: true, opacity: 0.8 });
        } else if (type === "power") {
            particle.material = new THREE.MeshBasicMaterial({ color: 0xfacc15, transparent: true, opacity: 0.9 });
            particle.scale.set(1.5, 1.5, 1.5);
        } else if (type === "telemetry") {
            particle.material = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.8 });
            particle.scale.set(0.8, 0.8, 0.8);
        }
        
        this.scene.add(particle);
        
        this.particles.push({
            mesh: particle,
            start: sourceVec.clone(),
            end: targetVec.clone(),
            progress: 0,
            speed: 0.01 + Math.random() * 0.01,
            onComplete: onComplete
        });
    }

    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.progress += p.speed;
            
            if (p.progress >= 1.0) {
                if (p.onComplete) p.onComplete();
                this.scene.remove(p.mesh);
                this.particles.splice(i, 1);
            } else {
                // simple linear interpolation for particles
                p.mesh.position.lerpVectors(p.start, p.end, p.progress);
                // add slight arc
                const arcHeight = Math.sin(p.progress * Math.PI) * 0.5;
                p.mesh.position.y += arcHeight;
            }
        }
    }
}
