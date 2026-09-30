export class WeatherForecastController {
    constructor() {
        this.currentCondition = "SUNNY";
        this.temperature = 28;
        this.irradiance = 850;
        this.cloudFactor = 1.0;
        this.humidity = 45;
        this.windSpeed = 12;
        
        this.forecast = []; // 24-hour array
        this.timeOffset = 0;
        this.generateForecast();
    }
    
    setScenario(scenario) {
        if (scenario === "NORMAL" || scenario === "EXCESS_SOLAR") this.currentCondition = "SUNNY";
        else if (scenario === "CLOUDY") this.currentCondition = "CLOUDY";
        else if (scenario === "RAINY") this.currentCondition = "RAINY";
        else this.currentCondition = "SUNNY"; // High/Low demand still sunny default
        
        this.generateForecast();
    }
    
    generateForecast() {
        this.forecast = [];
        const baseTemp = this.currentCondition === "SUNNY" ? 28 : (this.currentCondition === "CLOUDY" ? 24 : 22);
        
        for (let i = 0; i < 24; i++) {
            // Rough diurnal curve
            const hourOffset = (i + this.timeOffset) % 24;
            let temp = baseTemp - 4 * Math.cos((hourOffset - 15) * Math.PI / 12);
            
            let condition = this.currentCondition;
            let cFactor = 1.0;
            
            if (this.currentCondition === "SUNNY") {
                if (Math.random() < 0.1) { condition = "PARTLY_CLOUDY"; cFactor = 0.8; }
            } else if (this.currentCondition === "CLOUDY") {
                cFactor = 0.5 + Math.random() * 0.1;
                if (Math.random() < 0.2) condition = "RAINY";
            } else if (this.currentCondition === "RAINY") {
                cFactor = 0.3 + Math.random() * 0.1;
            }
            
            if (hourOffset < 6 || hourOffset > 18) {
                condition = "NIGHT";
                cFactor = 0;
            }
            
            this.forecast.push({
                hour: hourOffset,
                condition: condition,
                temperature: temp,
                cloudFactor: cFactor
            });
        }
    }
    
    update(deltaTime) {
        // Step time slowly
        this.timeOffset += (deltaTime / 3600); // 1 hr per 3600s of sim time
    }
    
    getCurrentWeather() {
        return {
            condition: this.currentCondition,
            temperature: this.temperature,
            irradiance: this.irradiance,
            cloudFactor: this.cloudFactor,
            humidity: this.humidity,
            windSpeed: this.windSpeed
        };
    }
    
    getForecast() {
        return this.forecast;
    }
}
