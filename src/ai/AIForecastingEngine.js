import { SolarForecastModel, LoadForecastModel } from './ForecastModels.js';
import { MLForecastAdapter } from './MLForecastAdapter.js';
import { HistoricalDataGenerator } from './HistoricalDataGenerator.js';
import { ForecastMetrics } from './ForecastMetrics.js';

export class AIForecastingEngine {
    constructor(weatherController, loadManager, solarArray, smartBattery) {
        this.weatherController = weatherController;
        this.loadManager = loadManager;
        this.solarArray = solarArray;
        this.smartBattery = smartBattery;
        
        this.solarModel = new SolarForecastModel();
        this.loadModel = new LoadForecastModel();
        this.mlAdapter = new MLForecastAdapter();
        
        this.historyGen = new HistoricalDataGenerator();
        this.historicalData = this.historyGen.generateCombinedHistory(7); // 7 days demo
        
        this.modelMode = "DEMO";
        this.status = "IDLE";
        
        this.solarForecast = [];
        this.loadForecast = [];
        this.energyGap = 0;
        this.renewableAvailability = 0;
        
        this.isHighDemand = false;
        this.isLowDemand = false;
        
        this.lastRecalcTime = 0;
        
        // Initial forecast
        this.triggerForecast();
    }
    
    setScenario(scenario) {
        this.isHighDemand = false;
        this.isLowDemand = false;
        
        if (scenario === "HIGH_DEMAND") this.isHighDemand = true;
        if (scenario === "LOW_DEMAND") this.isLowDemand = true;
        
        this.weatherController.setScenario(scenario);
        this.triggerForecast();
    }
    
    triggerForecast() {
        this.status = "COLLECTING_DATA";
        setTimeout(() => {
            this.status = "FORECASTING";
            this.recalculate();
            setTimeout(() => {
                this.status = "READY";
            }, 500); // simulate compute time
        }, 300);
    }
    
    recalculate() {
        const currentHour = Math.floor(this.weatherController.timeOffset) % 24;
        const weatherNodes = this.weatherController.getForecast();
        
        this.solarForecast = this.solarModel.predict(24, currentHour, weatherNodes, this.historicalData);
        
        const currentLoad = this.loadManager ? this.loadManager.getTotalPower() : 0;
        this.loadForecast = this.loadModel.predict(24, currentHour, currentLoad, this.historicalData, this.isHighDemand, this.isLowDemand);
        
        // The battery data is queried here to prepare for Section 7 optimization
        if (this.smartBattery) {
            const batteryData = this.smartBattery.controller.getBatteryData();
            // In a real system, battery SOC limits affect the load shifting possibilities
            this.currentBatterySOC = batteryData.soc;
        }
        
        this.calculateMetrics();
    }
    
    calculateMetrics() {
        // Average for next 24h
        let totalSolar = 0;
        let totalLoad = 0;
        let solarConfSum = 0;
        let loadConfSum = 0;
        
        for (let i = 0; i < 24; i++) {
            totalSolar += this.solarForecast[i].predictedPower;
            totalLoad += this.loadForecast[i].predictedLoad;
            solarConfSum += this.solarForecast[i].confidence;
            loadConfSum += this.loadForecast[i].confidence;
        }
        
        this.avgSolarConfidence = solarConfSum / 24;
        this.avgLoadConfidence = loadConfSum / 24;
        
        this.energyGap = totalLoad - totalSolar;
        this.renewableAvailability = totalLoad > 0 ? (totalSolar / totalLoad) * 100 : 100;
        if (this.renewableAvailability > 100) this.renewableAvailability = 100;
        
        if (totalSolar > totalLoad) {
            this.surplusState = "SURPLUS_RENEWABLE";
            this.deficitState = "NORMAL";
        } else {
            this.surplusState = "NORMAL";
            this.deficitState = "ENERGY_DEFICIT";
        }
    }
    
    update(deltaTime) {
        this.lastRecalcTime += deltaTime;
        if (this.lastRecalcTime > 10) { // Recalculate every 10 sim seconds
            this.lastRecalcTime = 0;
            this.triggerForecast();
        }
    }
    
    getSolarForecast() { return this.solarForecast; }
    getLoadForecast() { return this.loadForecast; }
    getEnergyGap() { return this.energyGap; }
    getRenewableAvailability() { return this.renewableAvailability; }
    
    getForecastSummary() {
        return {
            solarForecast: this.solarForecast,
            loadForecast: this.loadForecast,
            renewableAvailability: this.renewableAvailability,
            energyGap: this.energyGap,
            surplus: this.surplusState,
            deficit: this.deficitState,
            confidence: (this.avgSolarConfidence + this.avgLoadConfidence) / 2
        };
    }
    
    getEvaluationMetrics() {
        // Mock actual vs predicted using history vs recent
        // We just return dummy metrics for the UI to show
        return {
            mae: 2.4,
            rmse: 3.1,
            mape: 8.2
        };
    }
}
