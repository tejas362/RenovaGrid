export class HistoricalDataGenerator {
    constructor() {}
    
    generateCombinedHistory(days) {
        const history = [];
        
        for (let d = 0; d < days; d++) {
            for (let h = 0; h < 24; h++) {
                // Generate Solar
                let solar = 0;
                let irradiance = 0;
                let weather = "NIGHT";
                
                if (h > 6 && h < 18) {
                    weather = Math.random() > 0.2 ? "SUNNY" : "CLOUDY";
                    const peakIrradiance = 950;
                    // Bell curve approx
                    const solarFactor = Math.sin(((h - 6) / 12) * Math.PI);
                    irradiance = peakIrradiance * solarFactor * (weather === "SUNNY" ? 1.0 : 0.4);
                    // Add noise
                    irradiance += (Math.random() - 0.5) * 50;
                    
                    const maxCapacity = 40; // 40kW system
                    solar = maxCapacity * (irradiance / 1000) * 0.8; // 80% efficiency
                    if (solar < 0) solar = 0;
                }
                
                // Generate Load
                let baseLoad = 12; // base night load
                if (h > 8 && h < 17) {
                    baseLoad = 35; // academic hours
                } else if (h >= 17 && h < 23) {
                    baseLoad = 25; // evening hostel load
                }
                
                // Add EV charging random spikes (e.g., morning and evening)
                if ((h >= 9 && h <= 11) || (h >= 18 && h <= 20)) {
                    if (Math.random() > 0.5) baseLoad += 7.2;
                }
                
                // Add random noise
                let loadPower = baseLoad + (Math.random() - 0.5) * 4;
                
                let temperature = 20 + 8 * Math.sin(((h - 8) / 24) * Math.PI * 2) + (Math.random() - 0.5) * 2;

                history.push({
                    day: d,
                    hour: h,
                    solarPower: solar,
                    loadPower: loadPower,
                    irradiance: irradiance,
                    temperature: temperature,
                    weather: weather
                });
            }
        }
        
        return history;
    }
}
