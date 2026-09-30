export class SolarForecastModel {
    constructor() {
        this.maxCapacity = 40; // 40 kW max
    }
    
    predict(horizonHours, currentHour, weatherForecast, historicalData) {
        const predictions = [];
        
        for (let i = 0; i < horizonHours; i++) {
            const h = (currentHour + i) % 24;
            const weatherNode = weatherForecast[i] || { condition: "SUNNY", cloudFactor: 1.0, temperature: 28 };
            
            let predictedPower = 0;
            let confidence = 0;
            
            // Base generation curve
            if (h > 6 && h < 18) {
                const solarFactor = Math.sin(((h - 6) / 12) * Math.PI);
                predictedPower = this.maxCapacity * solarFactor * weatherNode.cloudFactor * 0.8;
                
                // Add minor random variance to simulate reality
                predictedPower += (Math.random() - 0.5) * 1.5;
                if (predictedPower < 0) predictedPower = 0;
                
                // Confidence drops with horizon
                confidence = 95 - (i * 1.2);
                if (weatherNode.condition === "PARTLY_CLOUDY") confidence -= 5;
                if (weatherNode.condition === "CLOUDY") confidence -= 15;
                if (weatherNode.condition === "RAINY") confidence -= 25;
            } else {
                predictedPower = 0;
                confidence = 99; // Highly confident it's dark
            }
            
            predictions.push({
                timestamp: Date.now() + (i * 3600000),
                hour: h,
                predictedPower: predictedPower,
                confidence: Math.max(10, Math.min(100, confidence)),
                weather: weatherNode.condition,
                irradiance: predictedPower > 0 ? (predictedPower / (this.maxCapacity * 0.8)) * 1000 : 0
            });
        }
        
        return predictions;
    }
}

export class LoadForecastModel {
    constructor() {}
    
    predict(horizonHours, currentHour, currentLoadData, historicalData, isHighDemand, isLowDemand) {
        const predictions = [];
        
        // Find moving average base profile from history
        const profile = new Array(24).fill(0);
        const counts = new Array(24).fill(0);
        
        if (historicalData && historicalData.length > 0) {
            historicalData.forEach(entry => {
                profile[entry.hour] += entry.loadPower;
                counts[entry.hour]++;
            });
            for (let i = 0; i < 24; i++) {
                if (counts[i] > 0) profile[i] /= counts[i];
                else profile[i] = 15; // fallback
            }
        } else {
            // Fallback profile
            for (let i = 0; i < 24; i++) {
                if (i > 8 && i < 17) profile[i] = 35;
                else if (i >= 17 && i < 23) profile[i] = 25;
                else profile[i] = 12;
            }
        }
        
        for (let i = 0; i < horizonHours; i++) {
            const h = (currentHour + i) % 24;
            
            let basePrediction = profile[h];
            
            if (isHighDemand) basePrediction *= 1.3;
            if (isLowDemand) basePrediction *= 0.7;
            
            // Add noise
            basePrediction += (Math.random() - 0.5) * 3;
            
            // Approximate split
            const critical = basePrediction * 0.5;
            const flex = basePrediction * 0.3;
            const semiFlex = basePrediction * 0.2;
            
            predictions.push({
                timestamp: Date.now() + (i * 3600000),
                hour: h,
                predictedLoad: basePrediction,
                confidence: Math.max(40, 90 - (i * 1.5)), // decays over horizon
                criticalLoad: critical,
                flexibleLoad: flex,
                semiFlexibleLoad: semiFlex
            });
        }
        
        return predictions;
    }
}
