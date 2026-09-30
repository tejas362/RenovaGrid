export class CampusLoadController {
    constructor(id, name, type, priority, flexibility) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.priority = priority; // HIGH, MEDIUM, LOW
        this.flexibility = flexibility; // CRITICAL, SEMI_FLEXIBLE, FLEXIBLE
        
        this.power = 0; // kW
        this.voltage = 230; // V
        this.current = 0; // A
        this.energyToday = 0; // kWh
        this.status = "OFF";
        this.controllable = true;
    }
    
    update(deltaTime) {
        if (this.status === "ON" || this.status === "ACTIVE" || this.status === "RUNNING" || this.status === "CHARGING") {
            // Integrate power to energy
            this.energyToday += this.power * (deltaTime * 60 / 3600); // Simulated time speedup
            this.current = (this.power * 1000) / this.voltage;
        } else {
            this.power = 0;
            this.current = 0;
        }
    }
    
    getLoadData() {
        return {
            id: this.id,
            name: this.name,
            type: this.type,
            power: this.power,
            voltage: this.voltage,
            current: this.current,
            energyToday: this.energyToday,
            status: this.status,
            priority: this.priority,
            flexibility: this.flexibility,
            controllable: this.controllable
        };
    }
    
    setPowerLimit(value) {}
    setSchedule(startTime, endTime) {}
    pause() {}
    resume() {}
}

export class SmartACController extends CampusLoadController {
    constructor() {
        super("AC_01", "Smart AC", "HVAC", "MEDIUM", "FLEXIBLE");
        this.temperature = 27;
        this.setpoint = 24;
        this.mode = "OFF"; // COOLING, IDLE, OFF
        this.fanSpeed = 60;
        this.basePower = 3.2;
    }
    
    turnOn() {
        this.status = "ON";
        this.setMode("COOLING");
    }
    
    turnOff() {
        this.status = "OFF";
        this.setMode("OFF");
    }
    
    setTemperature(value) { this.setpoint = value; }
    setFanSpeed(value) { this.fanSpeed = value; }
    
    setMode(mode) {
        this.mode = mode;
        if (mode === "COOLING") {
            this.status = "ON";
            this.power = this.basePower * (this.fanSpeed / 100);
        } else if (mode === "IDLE") {
            this.status = "ON";
            this.power = 0.2; // Fan only
        } else {
            this.status = "OFF";
            this.power = 0;
        }
    }
    
    update(deltaTime) {
        if (this.mode === "COOLING") {
            if (this.temperature > this.setpoint) {
                this.temperature -= 0.05; // Simulate cooling
            } else {
                this.setMode("IDLE");
            }
        } else if (this.mode === "IDLE" || this.mode === "OFF") {
            if (this.temperature < 29) {
                this.temperature += 0.02; // Room heating up
            } else if (this.mode === "IDLE") {
                this.setMode("COOLING"); // Auto restart
            }
        }
        
        super.update(deltaTime);
    }
    
    getLoadData() {
        const data = super.getLoadData();
        data.temperature = this.temperature;
        data.setpoint = this.setpoint;
        data.mode = this.mode;
        data.fanSpeed = this.fanSpeed;
        return data;
    }
}

export class WaterPumpController extends CampusLoadController {
    constructor() {
        super("PUMP_01", "Water Pump", "UTILITY", "HIGH", "SEMI_FLEXIBLE");
        this.flowRate = 120; // L/min
        this.tankLevel = 62; // %
        this.runtime = 0; // hours
        this.basePower = 4.5;
    }
    
    start() {
        this.status = "RUNNING";
        this.power = this.basePower;
    }
    
    stop() {
        this.status = "STOPPED";
        this.power = 0;
    }
    
    setFlowRate(value) {
        this.flowRate = value;
    }
    
    update(deltaTime) {
        if (this.status === "RUNNING") {
            this.runtime += deltaTime / 3600;
            this.tankLevel += 0.1; // simulate filling
            if (this.tankLevel >= 100) {
                this.tankLevel = 100;
                this.stop();
            }
        } else {
            this.tankLevel -= 0.05; // simulate usage
            if (this.tankLevel <= 20) {
                this.start(); // Auto start
            }
        }
        super.update(deltaTime);
    }
    
    getLoadData() {
        const data = super.getLoadData();
        data.flowRate = this.flowRate;
        data.tankLevel = this.tankLevel;
        data.runtime = this.runtime;
        return data;
    }
}

export class StreetLightController extends CampusLoadController {
    constructor(id) {
        super(id, "Smart Street Light", "LIGHTING", "HIGH", "CRITICAL");
        this.brightness = 75;
        this.mode = "AUTO"; // AUTO, ON, OFF
        this.basePower = 0.08;
        this.power = this.basePower * (this.brightness / 100);
        this.status = "ON";
    }
    
    turnOn() {
        this.status = "ON";
        this.mode = "ON";
        this.power = this.basePower * (this.brightness / 100);
    }
    
    turnOff() {
        this.status = "OFF";
        this.mode = "OFF";
        this.power = 0;
    }
    
    setBrightness(value) {
        this.brightness = value;
        if (this.status === "ON") {
            this.power = this.basePower * (this.brightness / 100);
        }
    }
    
    setMode(mode) {
        this.mode = mode;
        if (mode === "AUTO") {
            this.turnOn(); // Simulate night
        } else if (mode === "ON") {
            this.turnOn();
        } else {
            this.turnOff();
        }
    }
    
    getLoadData() {
        const data = super.getLoadData();
        data.brightness = this.brightness;
        data.mode = this.mode;
        return data;
    }
}

export class EVChargerController extends CampusLoadController {
    constructor() {
        super("EV_01", "EV Charger", "TRANSPORT", "LOW", "FLEXIBLE");
        this.batterySOC = 42;
        this.batteryCapacity = 60;
        this.chargingPower = 7.2;
        this.targetSOC = 90;
        this.status = "CHARGING";
        this.power = this.chargingPower;
    }
    
    startCharging() {
        if (this.batterySOC < this.targetSOC) {
            this.status = "CHARGING";
            this.power = this.chargingPower;
        }
    }
    
    stopCharging() {
        this.status = "PAUSED";
        this.power = 0;
    }
    
    setChargingPower(value) {
        this.chargingPower = value;
        if (this.status === "CHARGING") {
            this.power = this.chargingPower;
        }
    }
    
    setTargetSOC(value) {
        this.targetSOC = value;
    }
    
    update(deltaTime) {
        if (this.status === "CHARGING") {
            const timeMult = 60;
            const energyAdded = this.power * ((deltaTime * timeMult) / 3600);
            this.batterySOC += (energyAdded / this.batteryCapacity) * 100;
            
            if (this.batterySOC >= this.targetSOC) {
                this.batterySOC = this.targetSOC;
                this.status = "COMPLETE";
                this.power = 0;
            }
        }
        super.update(deltaTime);
    }
    
    getLoadData() {
        const data = super.getLoadData();
        data.batterySOC = this.batterySOC;
        data.chargingPower = this.chargingPower;
        data.targetSOC = this.targetSOC;
        data.batteryCapacity = this.batteryCapacity;
        return data;
    }
}

export class BuildingLoadController extends CampusLoadController {
    constructor(id, name, type, priority, flex, basePower, occupancy) {
        super(id, name, type, priority, flex);
        this.basePower = basePower;
        this.occupancy = occupancy;
        this.status = "ACTIVE";
        this.power = basePower;
        this.energyToday = basePower * 4; // Mock start value
    }
    
    update(deltaTime) {
        // Slight fluctuation
        if (this.status === "ACTIVE") {
            this.power = this.basePower + (Math.random() - 0.5) * 1.5;
        }
        super.update(deltaTime);
    }
    
    getLoadData() {
        const data = super.getLoadData();
        data.occupancy = this.occupancy;
        return data;
    }
}
