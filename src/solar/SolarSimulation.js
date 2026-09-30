export class SolarSimulation {
    constructor() {
        this.time = "12:00";
        this.weather = "SUNNY";
        this.baseIrradiance = 1000;
        this.temperature = 25;
        this.timeOffsets = {
            "08:00": 0.4,
            "10:00": 0.8,
            "12:00": 1.0,
            "14:00": 0.9,
            "16:00": 0.5,
            "18:00": 0.1,
            "20:00": 0.0,
            "NIGHT": 0.0
        };
        this.weatherMultipliers = {
            "SUNNY": 1.0,
            "PARTLY_CLOUDY": 0.65,
            "CLOUDY": 0.30,
            "NIGHT": 0.0
        };
    }

    setWeather(weather) {
        this.weather = weather;
        if (weather === "NIGHT") {
            this.time = "NIGHT";
        } else if (this.time === "NIGHT") {
            this.time = "12:00";
        }
    }

    setTime(time) {
        this.time = time;
    }

    getIrradiance() {
        const timeOffset = this.timeOffsets[this.time] !== undefined ? this.timeOffsets[this.time] : 1.0;
        const weatherMult = this.weatherMultipliers[this.weather] !== undefined ? this.weatherMultipliers[this.weather] : 1.0;
        
        // Add a tiny bit of random noise for realism
        const noise = (Math.random() - 0.5) * 20; 
        
        let irradiance = this.baseIrradiance * timeOffset * weatherMult + noise;
        if (irradiance < 0 || this.weather === "NIGHT" || this.time === "NIGHT") irradiance = 0;
        
        return Math.min(Math.max(irradiance, 0), 1200);
    }
    
    getTemperature() {
        // Simple temperature curve
        const baseTemp = 20;
        const timeOffset = this.timeOffsets[this.time] !== undefined ? this.timeOffsets[this.time] : 0;
        const weatherOffset = this.weather === 'SUNNY' ? 5 : (this.weather === 'PARTLY_CLOUDY' ? 2 : 0);
        return baseTemp + (timeOffset * 10) + weatherOffset + (Math.random() * 2 - 1);
    }
}
