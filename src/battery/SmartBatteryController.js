import { BMSController } from './BMSController.js';

export class SmartBatteryController {
    constructor() {
        this.batteryId = "BESS-01";
        this.soc = 72; // %
        this.voltage = 51.2; // V
        this.current = 0; // A
        this.power = 0; // kW (positive = charge, negative = discharge)
        this.temperature = 29; // C
        this.capacity = 50; // kWh
        this.remainingEnergy = (this.soc / 100) * this.capacity; // kWh
        this.maxChargePower = 15; // kW
        this.maxDischargePower = 15; // kW
        
        this.status = "IDLE"; // IDLE, CHARGING, DISCHARGING, FULL, LOW, PROTECTION, OFFLINE
        this.health = 98; // %
        this.cycleCount = 142;
        
        this.bms = new BMSController(this);
    }
    
    initialize() {
        // Setup initial state
        this.setIdle();
    }
    
    update(deltaTime) {
        if (this.status === "PROTECTION" || this.status === "OFFLINE") {
            this.power = 0;
        }
        
        // Update SOC based on power (power is kW, time is seconds, cap is kWh)
        // power * deltaTime (in hours) = energy in kWh
        // we speed up time for visual effect (e.g. 1 sec real = 1 min sim)
        const timeMultiplier = 60; // 60x speed
        const energyDelta = this.power * ((deltaTime * timeMultiplier) / 3600);
        
        this.remainingEnergy += energyDelta;
        
        if (this.remainingEnergy > this.capacity) this.remainingEnergy = this.capacity;
        if (this.remainingEnergy < 0) this.remainingEnergy = 0;
        
        this.soc = (this.remainingEnergy / this.capacity) * 100;
        
        // Update states
        if (this.status !== "PROTECTION") {
            if (this.soc >= 95 && this.power >= 0) {
                this.status = "FULL";
                this.power = 0;
            } else if (this.soc <= 20 && this.power <= 0) {
                this.status = "LOW";
                if (this.soc <= 5) this.power = 0;
            } else if (this.power > 0) {
                this.status = "CHARGING";
            } else if (this.power < 0) {
                this.status = "DISCHARGING";
            } else {
                this.status = "IDLE";
            }
        }
        
        // Let BMS monitor
        this.bms.update(deltaTime);
        this.bmsStatus = this.bms.status;
    }
    
    startCharging(power = 10) {
        if (this.status === "PROTECTION" || this.soc >= 98) return;
        this.power = Math.min(power, this.maxChargePower);
        this.status = "CHARGING";
    }
    
    startDischarging(power = 10) {
        if (this.status === "PROTECTION" || this.soc <= 5) return;
        this.power = -Math.min(power, this.maxDischargePower);
        this.status = "DISCHARGING";
    }
    
    setIdle() {
        this.power = 0;
        this.status = "IDLE";
    }
    
    getBatteryData() {
        return {
            batteryId: this.batteryId,
            soc: this.soc,
            voltage: this.voltage,
            current: this.current,
            power: this.power,
            temperature: this.temperature,
            capacity: this.capacity,
            remainingEnergy: this.remainingEnergy,
            maxChargePower: this.maxChargePower,
            maxDischargePower: this.maxDischargePower,
            health: this.health,
            cycleCount: this.cycleCount,
            status: this.status,
            bmsStatus: this.bmsStatus
        };
    }
}
