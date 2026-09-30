export class LoadUI {
    constructor(loadManager, cameraController) {
        this.loadManager = loadManager;
        this.cameraController = cameraController;
        
        this.container = document.createElement('div');
        this.container.id = "load-ui-container";
        this.container.style.position = "absolute";
        this.container.style.top = "140px";
        this.container.style.right = "20px";
        this.container.style.display = "none";
        this.container.style.flexDirection = "column";
        this.container.style.gap = "15px";
        this.container.style.pointerEvents = "auto";
        this.container.style.zIndex = "1000";
        
        document.body.appendChild(this.container);
        
        this.buildInfoPanel();
        this.buildActionPanel();
        this.buildTotalLoadHUD();
        
        this.selectedObject = null;
        this.selectedModel = null;
        this.lastUpdate = 0;
    }

    buildTotalLoadHUD() {
        this.totalLoadPanel = document.createElement('div');
        this.totalLoadPanel.id = "total-load-panel";
        this.totalLoadPanel.style.position = "absolute";
        this.totalLoadPanel.style.top = "90px";
        this.totalLoadPanel.style.right = "20px";
        this.totalLoadPanel.style.background = "rgba(15, 23, 42, 0.8)";
        this.totalLoadPanel.style.border = "1px solid #ef4444";
        this.totalLoadPanel.style.borderRadius = "8px";
        this.totalLoadPanel.style.padding = "15px";
        this.totalLoadPanel.style.color = "#f8fafc";
        this.totalLoadPanel.style.fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
        this.totalLoadPanel.style.minWidth = "200px";
        this.totalLoadPanel.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.5)";
        this.totalLoadPanel.style.zIndex = "900";
        this.totalLoadPanel.style.pointerEvents = "none";
        
        document.body.appendChild(this.totalLoadPanel);
        this.updateTotalLoadHUD();
    }
    
    updateTotalLoadHUD() {
        if (!this.totalLoadPanel) return;
        const total = this.loadManager.getTotalPower();
        const critical = this.loadManager.getCriticalLoad();
        const semi = this.loadManager.getSemiFlexibleLoad();
        const flex = this.loadManager.getFlexibleLoad();
        
        this.totalLoadPanel.innerHTML = `
            <div style="font-size:12px; color:#94a3b8; margin-bottom:8px; font-weight:bold;">CAMPUS LOAD</div>
            <div style="display:flex; justify-content:space-between; font-size:16px; margin-bottom:10px;"><span>Total:</span> <strong>${total.toFixed(1)} kW</strong></div>
            <div style="display:flex; justify-content:space-between; font-size:12px; color:#ef4444;"><span>Critical:</span> <span>${critical.toFixed(1)} kW</span></div>
            <div style="display:flex; justify-content:space-between; font-size:12px; color:#f59e0b;"><span>Semi-Flexible:</span> <span>${semi.toFixed(1)} kW</span></div>
            <div style="display:flex; justify-content:space-between; font-size:12px; color:#22c55e;"><span>Flexible:</span> <span>${flex.toFixed(1)} kW</span></div>
        `;
    }

    buildInfoPanel() {
        this.infoPanel = document.createElement('div');
        this.infoPanel.style.background = "rgba(15, 23, 42, 0.9)";
        this.infoPanel.style.border = "1px solid #38bdf8";
        this.infoPanel.style.borderRadius = "8px";
        this.infoPanel.style.padding = "20px";
        this.infoPanel.style.color = "#f8fafc";
        this.infoPanel.style.fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
        this.infoPanel.style.minWidth = "300px";
        this.infoPanel.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.5)";
        this.container.appendChild(this.infoPanel);
    }

    buildActionPanel() {
        this.actions = document.createElement('div');
        this.actions.style.display = "flex";
        this.actions.style.flexWrap = "wrap";
        this.actions.style.gap = "10px";
        this.container.appendChild(this.actions);
    }

    styleBtn(btn, color) {
        btn.style.background = color;
        btn.style.color = "white";
        btn.style.border = "none";
        btn.style.padding = "8px 12px";
        btn.style.fontSize = "11px";
        btn.style.fontWeight = "bold";
        btn.style.cursor = "pointer";
        btn.style.borderRadius = "4px";
    }

    show(objectName) {
        this.selectedObject = objectName;
        this.container.style.display = "flex";
        
        // Find corresponding model
        if (objectName === "AcademicBuilding" || objectName === "ACADEMIC_LOAD_METER") {
            this.selectedModel = this.loadManager.academicLoad;
        } else if (objectName === "HostelBuilding" || objectName === "HOSTEL_LOAD_METER") {
            this.selectedModel = this.loadManager.hostelLoad;
        } else if (objectName.startsWith("SMART_AC") || objectName.startsWith("AC_")) {
            this.selectedModel = this.loadManager.smartAC;
        } else if (objectName.startsWith("WATER_PUMP") || objectName.startsWith("PUMP_")) {
            this.selectedModel = this.loadManager.waterPump;
        } else if (objectName.startsWith("EV")) {
            this.selectedModel = this.loadManager.evCharger;
        } else if (objectName.startsWith("SMART_STREET_LIGHT") || objectName === "STREET_LIGHT_CONTROLLER") {
            // Pick a street light
            this.selectedModel = this.loadManager.streetLights[0];
        } else {
            this.selectedModel = null;
        }
        
        this.buildContextActions();
        this.updateUI();
    }
    
    hide() {
        this.selectedObject = null;
        this.selectedModel = null;
        this.container.style.display = "none";
    }

    buildContextActions() {
        this.actions.innerHTML = '';
        
        if (this.selectedModel) {
            // Building level controls
            if (this.selectedModel.type === "BUILDING") {
                const normalBtn = document.createElement('button');
                normalBtn.innerText = "NORMAL LOAD";
                this.styleBtn(normalBtn, "#3b82f6");
                normalBtn.onclick = () => this.selectedModel.setNormalLoad();
                
                const peakBtn = document.createElement('button');
                peakBtn.innerText = "FORCE PEAK LOAD";
                this.styleBtn(peakBtn, "#ef4444");
                peakBtn.onclick = () => this.selectedModel.setPeakLoad();
                
                this.actions.appendChild(normalBtn);
                this.actions.appendChild(peakBtn);
            }
            
            // Appliance controls
            if (this.selectedModel.id === "AC_01") {
                const onBtn = document.createElement('button');
                onBtn.innerText = "AC ON";
                this.styleBtn(onBtn, "#22c55e");
                onBtn.onclick = () => this.selectedModel.turnOn();
                
                const offBtn = document.createElement('button');
                offBtn.innerText = "AC OFF";
                this.styleBtn(offBtn, "#ef4444");
                offBtn.onclick = () => this.selectedModel.turnOff();
                
                this.actions.appendChild(onBtn);
                this.actions.appendChild(offBtn);
            } else if (this.selectedModel.id === "PUMP_01") {
                const startBtn = document.createElement('button');
                startBtn.innerText = "PUMP START";
                this.styleBtn(startBtn, "#3b82f6");
                startBtn.onclick = () => this.selectedModel.start();
                
                const stopBtn = document.createElement('button');
                stopBtn.innerText = "PUMP STOP";
                this.styleBtn(stopBtn, "#ef4444");
                stopBtn.onclick = () => this.selectedModel.stop();
                
                this.actions.appendChild(startBtn);
                this.actions.appendChild(stopBtn);
            } else if (this.selectedModel.id === "EV_01") {
                const chargeBtn = document.createElement('button');
                chargeBtn.innerText = "EV START";
                this.styleBtn(chargeBtn, "#10b981");
                chargeBtn.onclick = () => this.selectedModel.startCharging();
                
                const pauseBtn = document.createElement('button');
                pauseBtn.innerText = "EV PAUSE";
                this.styleBtn(pauseBtn, "#f59e0b");
                pauseBtn.onclick = () => this.selectedModel.stopCharging();
                
                this.actions.appendChild(chargeBtn);
                this.actions.appendChild(pauseBtn);
            } else if (this.selectedModel.type === "LIGHTING") {
                const autoBtn = document.createElement('button');
                autoBtn.innerText = "AUTO";
                this.styleBtn(autoBtn, "#6366f1");
                autoBtn.onclick = () => this.selectedModel.setMode("AUTO");
                
                const offBtn = document.createElement('button');
                offBtn.innerText = "OFF";
                this.styleBtn(offBtn, "#ef4444");
                offBtn.onclick = () => this.selectedModel.setMode("OFF");
                
                this.actions.appendChild(autoBtn);
                this.actions.appendChild(offBtn);
            }
        }
        
        const resetBtn = document.createElement('button');
        resetBtn.innerText = "RESET VIEW";
        this.styleBtn(resetBtn, "#475569");
        resetBtn.onclick = () => {
            this.cameraController.resetView();
            this.hide();
        };
        this.actions.appendChild(resetBtn);
    }

    update() {
        if (this.container.style.display !== "none") {
            const now = Date.now();
            if (now - this.lastUpdate > 500) {
                this.updateUI();
                this.lastUpdate = now;
            }
        }
        
        // Always update total load HUD regardless of selection
        const now2 = Date.now();
        if (!this.lastTotalUpdate || now2 - this.lastTotalUpdate > 1000) {
            this.updateTotalLoadHUD();
            this.lastTotalUpdate = now2;
        }
    }

    updateUI() {
        if (!this.selectedModel) return;
        
        const data = this.selectedModel.getLoadData();
        
        let customHtml = '';
        if (data.type === "HVAC") {
            customHtml = `
                <div style="display:flex; justify-content:space-between; font-size:14px;"><span>Temperature:</span> <strong>${data.temperature.toFixed(1)}°C</strong></div>
                <div style="display:flex; justify-content:space-between; font-size:14px;"><span>Setpoint:</span> <strong>${data.setpoint.toFixed(1)}°C</strong></div>
                <div style="display:flex; justify-content:space-between; font-size:14px;"><span>Mode:</span> <strong>${data.mode}</strong></div>
                <div style="display:flex; justify-content:space-between; font-size:14px;"><span>Fan:</span> <strong>${data.fanSpeed}%</strong></div>
            `;
        } else if (data.type === "UTILITY") {
            customHtml = `
                <div style="display:flex; justify-content:space-between; font-size:14px;"><span>Flow:</span> <strong>${data.flowRate} L/min</strong></div>
                <div style="display:flex; justify-content:space-between; font-size:14px;"><span>Tank:</span> <strong>${data.tankLevel.toFixed(1)}%</strong></div>
                <div style="display:flex; justify-content:space-between; font-size:14px;"><span>Runtime:</span> <strong>${data.runtime.toFixed(1)} h</strong></div>
            `;
        } else if (data.type === "TRANSPORT") {
            customHtml = `
                <div style="display:flex; justify-content:space-between; font-size:14px;"><span>Battery SOC:</span> <strong>${data.batterySOC.toFixed(1)}%</strong></div>
                <div style="display:flex; justify-content:space-between; font-size:14px;"><span>Target SOC:</span> <strong>${data.targetSOC}%</strong></div>
                <div style="display:flex; justify-content:space-between; font-size:14px;"><span>Charging Power:</span> <strong>${data.chargingPower} kW</strong></div>
            `;
        } else if (data.type === "LIGHTING") {
            customHtml = `
                <div style="display:flex; justify-content:space-between; font-size:14px;"><span>Brightness:</span> <strong>${data.brightness}%</strong></div>
                <div style="display:flex; justify-content:space-between; font-size:14px;"><span>Mode:</span> <strong>${data.mode}</strong></div>
            `;
        } else if (data.type === "BUILDING") {
             customHtml = `
                <div style="display:flex; justify-content:space-between; font-size:14px;"><span>Occupancy:</span> <strong>${data.occupancy}</strong></div>
                <div style="display:flex; justify-content:space-between; font-size:14px;"><span>Energy Today:</span> <strong>${data.energyToday.toFixed(1)} kWh</strong></div>
                <div style="display:flex; justify-content:space-between; font-size:14px;"><span>Load Type:</span> <strong>${data.flexibility}</strong></div>
            `;
        }
        
        let flexColor = data.flexibility === 'CRITICAL' ? '#ef4444' : (data.flexibility === 'FLEXIBLE' ? '#22c55e' : '#f59e0b');
        
        const html = `
            <h2 style="margin:0 0 15px 0; font-size:18px; border-bottom:1px solid #334155; padding-bottom:10px; text-transform:uppercase;">${data.name}</h2>
            
            <div style="margin-bottom: 15px;">
                <div style="display:flex; justify-content:space-between; font-size:14px;"><span>Power:</span> <strong>${data.power.toFixed(2)} kW</strong></div>
                ${data.voltage ? `<div style="display:flex; justify-content:space-between; font-size:14px;"><span>Voltage:</span> <strong>${data.voltage} V</strong></div>` : ''}
                ${data.current ? `<div style="display:flex; justify-content:space-between; font-size:14px;"><span>Current:</span> <strong>${data.current.toFixed(1)} A</strong></div>` : ''}
            </div>

            <div style="margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #334155;">
                ${customHtml}
            </div>

            <div>
                <div style="display:flex; justify-content:space-between; font-size:14px;"><span>Status:</span> <strong style="color:${data.status === 'OFF' || data.status === 'STOPPED' || data.status === 'PAUSED' ? '#94a3b8' : '#22c55e'}">${data.status}</strong></div>
                <div style="display:flex; justify-content:space-between; font-size:14px;"><span>Flexibility:</span> <strong style="color:${flexColor}">${data.flexibility}</strong></div>
                <div style="display:flex; justify-content:space-between; font-size:14px;"><span>Priority:</span> <strong>${data.priority}</strong></div>
            </div>
        `;
        
        this.infoPanel.innerHTML = html;
    }
}
