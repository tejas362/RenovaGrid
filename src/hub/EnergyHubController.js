export class EnergyHubController {
    constructor() {
        this.solarData = {
            totalPower: 0,
            totalVoltage: 0,
            totalCurrent: 0,
            averageIrradiance: 0,
            averageTemperature: 0,
            status: "OFFLINE"
        };
        
        this.weatherData = {};
        this.loadData = { power: 2.8 }; // Mock placeholder
        this.batteryData = { soc: 72 }; // Mock placeholder
        this.forecastData = null;
        
        this.status = "ONLINE"; // OFFLINE, STARTING, ONLINE, PROCESSING, ALERT
        this.lastProcessTime = 0;
        this.isProcessing = false;
    }

    updateSolarData(data) {
        if (!data) return;
        this.solarData = data;
    }

    updateWeatherData(data) {
        this.weatherData = data;
    }

    updateLoadData(data) {
        this.loadData = data; // { totalPower: X, ... }
    }

    updateBatteryData(data) {
        this.batteryData = data;
    }
    
    updateForecastData(data) {
        this.forecastData = data;
    }
    
    updateOptimizationData(data) {
        this.optimizationData = data;
    }
    
    triggerProcessing() {
        this.status = "PROCESSING";
        this.isProcessing = true;
        this.lastProcessTime = Date.now();
    }

    update() {
        if (this.isProcessing && Date.now() - this.lastProcessTime > 1500) {
            this.status = "ONLINE";
            this.isProcessing = false;
        }
        
        // Handle IDLE state based on solar
        if (!this.isProcessing) {
            if (this.solarData.averageIrradiance < 10) {
                this.status = "IDLE";
            } else {
                this.status = "ONLINE";
            }
        }
    }
}
