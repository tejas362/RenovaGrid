export class EnergyOptimizationEngine {
    constructor(solarController, loadManager, batteryController, forecastEngine) {
        this.solar = solarController;
        this.loads = loadManager;
        this.battery = batteryController;
        this.forecast = forecastEngine;
        
        this.mode = "IDLE";
        this.status = "IDLE";
        this.updateInterval = 5.0; // run optimization every 5 seconds
        this.timeSinceLastUpdate = this.updateInterval;
        
        this.plan = {
            timestamp: 0,
            mode: "NORMAL",
            solarAvailable: 0,
            predictedLoad: 0,
            energyBalance: 0,
            directSolar: 0,
            batteryAction: "HOLD",
            batteryPower: 0,
            flexibleLoadActions: [],
            criticalLoad: 0,
            gridPower: 0,
            curtailedPower: 0,
            renewableUtilization: 0,
            explanation: "System is initializing."
        };
        
        // Settings constraints
        this.MIN_SOC = 20;
        this.MAX_SOC = 95;
    }
    
    update(deltaTime) {
        this.timeSinceLastUpdate += deltaTime;
        if (this.timeSinceLastUpdate >= this.updateInterval) {
            this.timeSinceLastUpdate = 0;
            this.optimize();
        }
    }
    
    forceOptimize() {
        this.timeSinceLastUpdate = 0;
        this.optimize();
    }
    
    optimize() {
        this.status = "ANALYZING";
        
        // 1. Gather current state & predictions
        const currentSolar = this.solar ? this.solar.getTotalPower() : 0;
        const currentLoad = this.loads ? this.loads.getTotalPower() : 0;
        
        let nextHourSolar = currentSolar;
        let nextHourLoad = currentLoad;
        
        if (this.forecast) {
            const forecastSummary = this.forecast.getForecastSummary();
            nextHourSolar = forecastSummary.nextHour ? forecastSummary.nextHour.solar : currentSolar;
            nextHourLoad = forecastSummary.nextHour ? forecastSummary.nextHour.load : currentLoad;
        }
        
        // Weight current vs predicted (simple deterministic approach)
        const predictedSolar = currentSolar * 0.7 + nextHourSolar * 0.3;
        const predictedLoad = currentLoad * 0.7 + nextHourLoad * 0.3;
        
        const energyBalance = predictedSolar - predictedLoad;
        
        let bmsState = { status: "NORMAL", soc: 50, maxChargePower: 15, maxDischargePower: 15 };
        if (this.battery && typeof this.battery.getBatteryData === 'function') {
            bmsState = this.battery.getBatteryData();
        }
        
        this.plan.solarAvailable = predictedSolar;
        this.plan.predictedLoad = predictedLoad;
        this.plan.energyBalance = energyBalance;
        
        this.status = "OPTIMIZING";
        
        if (energyBalance > 0.1) {
            this.optimizeSurplus(energyBalance, bmsState, predictedSolar, predictedLoad);
        } else if (energyBalance < -0.1) {
            this.optimizeDeficit(Math.abs(energyBalance), bmsState, predictedSolar, predictedLoad);
        } else {
            // Perfectly balanced (rare)
            this.plan.mode = "NORMAL";
            this.plan.directSolar = predictedLoad;
            this.plan.criticalLoad = this.loads ? this.loads.getCriticalLoad() : 0;
            this.plan.batteryAction = "HOLD";
            this.plan.batteryPower = 0;
            this.plan.gridPower = 0;
            this.plan.curtailedPower = 0;
            this.plan.flexibleLoadActions = this.scheduleFlexibleLoads("MAINTAIN");
        }
        
        this.plan.renewableUtilization = this.calculateRenewableUtilization();
        this.plan.explanation = this.generateExplanation();
        this.plan.timestamp = Date.now();
        
        this.status = "CONSTRAINT_CHECK";
        if (this.validateOptimizationPlan()) {
            this.status = "PLAN_READY";
        } else {
            this.status = "ERROR";
        }
    }
    
    optimizeSurplus(surplus, bmsState, predictedSolar, predictedLoad) {
        this.plan.mode = "SURPLUS_RENEWABLE";
        this.plan.directSolar = predictedLoad;
        this.plan.criticalLoad = this.loads ? this.loads.getCriticalLoad() : 0;
        
        let remainingSurplus = surplus;
        
        // 1. Battery Charging
        let chargePower = 0;
        if (bmsState.status === "NORMAL" && bmsState.soc < this.MAX_SOC) {
            chargePower = Math.min(remainingSurplus, bmsState.maxChargePower);
            
            // Limit charging if SOC is near max to preserve battery life
            if (bmsState.soc > 90) {
                chargePower = Math.min(chargePower, bmsState.maxChargePower * 0.5);
            }
            
            this.plan.batteryAction = "CHARGE";
            this.plan.batteryPower = chargePower;
            remainingSurplus -= chargePower;
        } else {
            this.plan.batteryAction = bmsState.status === "NORMAL" ? "HOLD (FULL)" : "HOLD (PROTECT)";
            this.plan.batteryPower = 0;
            if (bmsState.soc >= this.MAX_SOC) this.plan.mode = "BATTERY_FULL";
        }
        
        // 2. Flexible Loads
        let flexLoadShifted = 0;
        if (remainingSurplus > 1) { // more than 1kW left
            this.plan.flexibleLoadActions = this.scheduleFlexibleLoads("INCREASE");
            // Estimate power shifted (dummy deterministic calculation)
            flexLoadShifted = Math.min(remainingSurplus, this.loads ? this.loads.getFlexibleLoad() * 0.5 : 0);
            remainingSurplus -= flexLoadShifted;
        } else {
            this.plan.flexibleLoadActions = this.scheduleFlexibleLoads("MAINTAIN");
        }
        
        // 3. Curtailment / Grid Export
        this.plan.gridPower = 0;
        this.plan.curtailedPower = Math.max(0, remainingSurplus);
        
        if (this.plan.curtailedPower > 0) {
            this.plan.mode = "CURTAILMENT";
        }
    }
    
    optimizeDeficit(deficit, bmsState, predictedSolar, predictedLoad) {
        let remainingDeficit = deficit;
        this.plan.directSolar = predictedSolar;
        this.plan.criticalLoad = this.loads ? this.loads.getCriticalLoad() : 0;
        
        // 1. Battery Discharging
        let dischargePower = 0;
        if (bmsState.status === "NORMAL" && bmsState.soc > this.MIN_SOC) {
            dischargePower = Math.min(remainingDeficit, bmsState.maxDischargePower);
            
            // Conserve battery if SOC is low and not all load is critical
            if (bmsState.soc < 30 && this.plan.criticalLoad < dischargePower) {
                // only cover critical load with battery when very low
                dischargePower = Math.min(dischargePower, this.plan.criticalLoad);
            }
            
            this.plan.batteryAction = "DISCHARGE";
            this.plan.batteryPower = dischargePower;
            remainingDeficit -= dischargePower;
            this.plan.mode = "ENERGY_DEFICIT";
        } else {
            this.plan.batteryAction = bmsState.status === "NORMAL" ? "HOLD (LOW SOC)" : "HOLD (PROTECT)";
            this.plan.batteryPower = 0;
            this.plan.mode = "LOW_BATTERY";
        }
        
        // 2. Flexible Load Reduction
        let flexLoadReduced = 0;
        if (remainingDeficit > 0) {
            this.plan.flexibleLoadActions = this.scheduleFlexibleLoads("DECREASE");
            // Estimate load shed/shift
            flexLoadReduced = Math.min(remainingDeficit, this.loads ? this.loads.getFlexibleLoad() * 0.8 : 0);
            remainingDeficit -= flexLoadReduced;
            
            if (this.plan.criticalLoad > (predictedSolar + dischargePower) && remainingDeficit > 5) {
                this.plan.mode = "HIGH_DEMAND";
            }
        } else {
            this.plan.flexibleLoadActions = this.scheduleFlexibleLoads("MAINTAIN");
        }
        
        // 3. Grid Power
        this.plan.gridPower = Math.max(0, remainingDeficit);
        this.plan.curtailedPower = 0;
    }
    
    scheduleFlexibleLoads(direction) {
        const actions = [];
        if (direction === "INCREASE") {
            actions.push({ target: "EV_CHARGING", action: "RUN_NOW", priority: "HIGH" });
            actions.push({ target: "WATER_PUMP", action: "RUN_NOW", priority: "MEDIUM" });
            actions.push({ target: "SMART_AC", action: "NORMAL", priority: "LOW" });
        } else if (direction === "DECREASE") {
            actions.push({ target: "EV_CHARGING", action: "SHIFT_LATER", priority: "HIGH" });
            actions.push({ target: "WATER_PUMP", action: "SHIFT_LATER", priority: "MEDIUM" });
            actions.push({ target: "SMART_AC", action: "REDUCE", priority: "HIGH" });
        } else {
            actions.push({ target: "EV_CHARGING", action: "MAINTAIN", priority: "NORMAL" });
            actions.push({ target: "WATER_PUMP", action: "MAINTAIN", priority: "NORMAL" });
            actions.push({ target: "SMART_AC", action: "MAINTAIN", priority: "NORMAL" });
        }
        return actions;
    }
    
    calculateRenewableUtilization() {
        if (this.plan.solarAvailable <= 0) return 100;
        const usedSolar = this.plan.solarAvailable - this.plan.curtailedPower;
        return (usedSolar / this.plan.solarAvailable) * 100;
    }
    
    validateOptimizationPlan() {
        if (this.plan.gridPower < 0) return false;
        if (this.plan.curtailedPower < 0) return false;
        if (this.plan.batteryPower < 0) return false;
        if (this.plan.solarAvailable < 0) return false;
        if (this.plan.predictedLoad < 0) return false;
        return true; 
    }
    
    generateExplanation() {
        let exp = "";
        
        if (this.plan.energyBalance > 0.1) {
            exp += "Solar generation exceeds demand. ";
            if (this.plan.batteryAction === "CHARGE") {
                exp += `Excess energy (${this.plan.batteryPower.toFixed(1)} kW) is directed to battery storage. `;
            } else {
                exp += `Battery charging limited due to SOC. `;
            }
            if (this.plan.flexibleLoadActions.length > 0 && this.plan.flexibleLoadActions[0].action === "RUN_NOW") {
                exp += "Flexible loads (e.g. EV) scheduled to utilize surplus. ";
            }
            if (this.plan.curtailedPower > 0) {
                exp += `${this.plan.curtailedPower.toFixed(1)} kW curtailed/exported.`;
            }
        } else if (this.plan.energyBalance < -0.1) {
            exp += "Demand exceeds solar generation. ";
            exp += `Critical loads (${this.plan.criticalLoad.toFixed(1)} kW) are protected. `;
            if (this.plan.batteryAction === "DISCHARGE") {
                exp += `Battery is discharging (${this.plan.batteryPower.toFixed(1)} kW) to cover deficit. `;
            } else {
                exp += "Battery discharge restricted (SOC limits). ";
            }
            if (this.plan.flexibleLoadActions.length > 0 && this.plan.flexibleLoadActions[0].action === "SHIFT_LATER") {
                exp += "Flexible loads shifted to reduce strain. ";
            }
            if (this.plan.gridPower > 0) {
                exp += `Grid import (${this.plan.gridPower.toFixed(1)} kW) required.`;
            }
        } else {
            exp += "Supply and demand are balanced. System maintaining current state.";
        }
        
        return exp;
    }
    
    getOptimizationPlan() {
        return this.plan;
    }
    
    getStatus() {
        return this.status;
    }
}
