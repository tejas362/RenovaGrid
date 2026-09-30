export class BMSController {
    constructor(batteryController) {
        this.battery = batteryController;
        this.status = "NORMAL";
        this.protection = "NONE";
        
        // Temperatures for the 6 modules
        this.moduleTemperatures = [28.4, 29.1, 28.8, 30.2, 29.5, 28.9];
        // Individual SOCs for the 6 modules
        this.moduleSOCs = [74, 76, 72, 75, 73, 71];
    }
    
    update(deltaTime) {
        this.monitorTemperature(deltaTime);
        this.monitorVoltage();
        this.monitorCurrent();
        this.calculateSOC();
        this.checkProtection();
    }
    
    monitorTemperature(deltaTime) {
        // Slight fluctuation
        for (let i = 0; i < this.moduleTemperatures.length; i++) {
            this.moduleTemperatures[i] += (Math.random() - 0.5) * 0.1;
            
            if (this.battery.power > 0 || this.battery.power < 0) {
                // Heats up slightly when charging/discharging
                this.moduleTemperatures[i] += Math.abs(this.battery.power) * 0.001;
            } else {
                // Cools down towards ambient (25C)
                this.moduleTemperatures[i] += (25 - this.moduleTemperatures[i]) * 0.01;
            }
        }
        this.battery.temperature = this.moduleTemperatures.reduce((a,b) => a+b) / 6;
    }
    
    monitorVoltage() {
        // Simple voltage curve based on SOC
        const minV = 42.0;
        const maxV = 54.0;
        this.battery.voltage = minV + (maxV - minV) * (this.battery.soc / 100);
    }
    
    monitorCurrent() {
        if (this.battery.voltage > 0) {
            this.battery.current = (this.battery.power * 1000) / this.battery.voltage;
        } else {
            this.battery.current = 0;
        }
    }
    
    calculateSOC() {
        // Update module SOCs based on overall SOC target loosely
        const targetSOC = this.battery.soc;
        for (let i = 0; i < this.moduleSOCs.length; i++) {
            this.moduleSOCs[i] += (targetSOC - this.moduleSOCs[i]) * 0.05 + (Math.random() - 0.5) * 0.1;
        }
    }
    
    checkProtection() {
        let maxTemp = Math.max(...this.moduleTemperatures);
        if (maxTemp > 45) {
            this.status = "PROTECTION";
            this.protection = "OVER_TEMP";
            this.battery.status = "PROTECTION";
        } else if (this.battery.soc <= 5) {
            this.status = "PROTECTION";
            this.protection = "UNDER_VOLTAGE";
        } else if (this.battery.soc >= 98) {
            // Not strictly protection, but limit
            this.protection = "CHARGE_LIMIT";
            if (this.status !== "NORMAL") this.status = "NORMAL";
        } else {
            this.status = "NORMAL";
            this.protection = "NONE";
        }
    }
    
    getBMSData() {
        return {
            status: this.status,
            protection: this.protection,
            moduleTemperatures: [...this.moduleTemperatures],
            moduleSOCs: [...this.moduleSOCs]
        };
    }
}
