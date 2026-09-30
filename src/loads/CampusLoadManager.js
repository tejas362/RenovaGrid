import { SmartACController, WaterPumpController, StreetLightController, EVChargerController, BuildingLoadController } from './LoadModels.js';

export class CampusLoadManager {
    constructor(scene, energyHub) {
        this.scene = scene;
        this.energyHub = energyHub;
        
        this.loads = [];
        this.totalPower = 0;
        this.totalEnergyToday = 0;
        this.criticalLoad = 0;
        this.flexibleLoad = 0;
        this.semiFlexibleLoad = 0;
        
        this.initLoads();
    }
    
    initLoads() {
        this.academicLoad = new BuildingLoadController("ACADEMIC_01", "Academic Building", "BUILDING", "HIGH", "SEMI_FLEXIBLE", 18.5, 68);
        this.hostelLoad = new BuildingLoadController("HOSTEL_01", "Hostel", "BUILDING", "HIGH", "SEMI_FLEXIBLE", 12.8, 82);
        
        this.smartAC = new SmartACController();
        this.waterPump = new WaterPumpController();
        this.evCharger = new EVChargerController();
        
        this.streetLights = [];
        for (let i=0; i<6; i++) {
            this.streetLights.push(new StreetLightController(`LIGHT_0${i+1}`));
        }
        
        this.addLoad(this.academicLoad);
        this.addLoad(this.hostelLoad);
        this.addLoad(this.smartAC);
        this.addLoad(this.waterPump);
        this.addLoad(this.evCharger);
        this.streetLights.forEach(l => this.addLoad(l));
    }
    
    addLoad(load) {
        this.loads.push(load);
    }
    
    removeLoad(load) {
        this.loads = this.loads.filter(l => l.id !== load.id);
    }
    
    update(deltaTime) {
        this.totalPower = 0;
        this.criticalLoad = 0;
        this.flexibleLoad = 0;
        this.semiFlexibleLoad = 0;
        
        this.loads.forEach(load => {
            load.update(deltaTime);
            this.totalPower += load.power;
            
            if (load.flexibility === "CRITICAL") {
                this.criticalLoad += load.power;
            } else if (load.flexibility === "SEMI_FLEXIBLE") {
                this.semiFlexibleLoad += load.power;
            } else if (load.flexibility === "FLEXIBLE") {
                this.flexibleLoad += load.power;
            }
        });
        
        // Sync to AI Energy Hub
        if (this.energyHub) {
            this.energyHub.controller.updateLoadData({
                totalPower: this.totalPower,
                criticalLoad: this.criticalLoad,
                flexibleLoad: this.flexibleLoad,
                semiFlexibleLoad: this.semiFlexibleLoad,
                details: this.getAllLoadData()
            });
        }
    }
    
    getTotalPower() { return this.totalPower; }
    getCriticalLoad() { return this.criticalLoad; }
    getFlexibleLoad() { return this.flexibleLoad; }
    getSemiFlexibleLoad() { return this.semiFlexibleLoad; }
    
    getAllLoadData() {
        return this.loads.map(l => l.getLoadData());
    }
}
