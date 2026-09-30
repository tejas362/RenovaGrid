export class EnergyHubUI {
    constructor(energyHub, cameraController) {
        this.energyHub = energyHub;
        this.cameraController = cameraController;
        
        this.container = document.createElement('div');
        this.container.id = "hub-ui-container";
        this.container.style.position = "absolute";
        this.container.style.top = "140px"; // Align with Solar UI
        this.container.style.right = "20px";
        this.container.style.display = "none";
        this.container.style.flexDirection = "column";
        this.container.style.gap = "15px";
        this.container.style.pointerEvents = "auto";
        this.container.style.zIndex = "1000";
        
        document.body.appendChild(this.container);
        
        this.buildInfoPanel();
        this.buildActionPanel();
        
        this.selectedObject = null;
        this.lastUpdate = 0;
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
        const actions = document.createElement('div');
        actions.style.display = "flex";
        actions.style.gap = "10px";
        
        const expandBtn = document.createElement('button');
        expandBtn.innerText = "EXPAND HUB";
        this.styleActionBtn(expandBtn);
        
        const explodeBtn = document.createElement('button');
        explodeBtn.innerText = "EXPLODE HUB";
        this.styleActionBtn(explodeBtn);
        
        expandBtn.onclick = () => {
            if (this.energyHub.viewState === 'EXPANDED') {
                this.energyHub.collapseHub();
                expandBtn.innerText = "EXPAND HUB";
                explodeBtn.innerText = "EXPLODE HUB";
            } else {
                this.energyHub.expandHub();
                expandBtn.innerText = "COLLAPSE HUB";
                explodeBtn.innerText = "EXPLODE HUB";
            }
        };
        
        explodeBtn.onclick = () => {
            if (this.energyHub.viewState === 'EXPLODED') {
                this.energyHub.collapseHub();
                expandBtn.innerText = "EXPAND HUB";
                explodeBtn.innerText = "EXPLODE HUB";
            } else {
                this.energyHub.explodeHub();
                expandBtn.innerText = "EXPAND HUB";
                explodeBtn.innerText = "COLLAPSE HUB";
            }
        };
        
        actions.appendChild(expandBtn);
        actions.appendChild(explodeBtn);
        
        const resetViewBtn = document.createElement('button');
        resetViewBtn.innerText = "RESET VIEW";
        this.styleActionBtn(resetViewBtn);
        resetViewBtn.onclick = () => {
            this.cameraController.resetView();
            this.hide();
        };
        actions.appendChild(resetViewBtn);
        
        const forecastBtn = document.createElement('button');
        forecastBtn.innerText = "AI FORECAST";
        this.styleActionBtn(forecastBtn);
        forecastBtn.style.background = "#8b5cf6"; // purple
        forecastBtn.onclick = () => {
            if (window.showForecastPanel) window.showForecastPanel();
        };
        actions.appendChild(forecastBtn);
        
        const optBtn = document.createElement('button');
        optBtn.innerText = "OPTIMIZATION PLAN";
        this.styleActionBtn(optBtn);
        optBtn.style.background = "#10b981"; // green
        optBtn.onclick = () => {
            if (window.showOptimizationPanel) window.showOptimizationPanel();
        };
        actions.appendChild(optBtn);
        
        this.container.appendChild(actions);
    }
    
    styleActionBtn(btn) {
        btn.style.background = "#0284c7";
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
        this.updateUI();
    }
    
    hide() {
        this.selectedObject = null;
        this.container.style.display = "none";
    }

    update() {
        if (this.container.style.display !== "none") {
            const now = Date.now();
            if (now - this.lastUpdate > 500) {
                this.updateUI();
                this.lastUpdate = now;
            }
        }
    }

    updateUI() {
        if (!this.selectedObject) return;
        
        let html = '';
        const ctrl = this.energyHub.controller;
        
        if (this.selectedObject === "AI_ENERGY_HUB" || this.selectedObject.startsWith("AI_HUB_")) {
            html = `
                <h2 style="margin:0 0 15px 0; font-size:18px; border-bottom:1px solid #334155; padding-bottom:10px;">AI ENERGY HUB</h2>
                
                <div style="margin-bottom: 15px;">
                    <div style="font-size:12px; color:#94a3b8; margin-bottom:4px;">SYSTEM STATUS</div>
                    <strong style="color:${ctrl.status === 'ONLINE' || ctrl.status === 'PROCESSING' ? '#22c55e' : (ctrl.status === 'IDLE' ? '#94a3b8' : '#fbbf24')}">${ctrl.status}</strong>
                </div>
                
                <div style="margin-bottom: 15px;">
                    <div style="font-size:12px; color:#94a3b8; margin-bottom:4px;">INPUT DATA</div>
                    <div style="display:flex; justify-content:space-between; font-size:14px;"><span>Solar Power:</span> <strong>${ctrl.solarData.totalPower.toFixed(2)} kW</strong></div>
                    <div style="display:flex; justify-content:space-between; font-size:14px;"><span>Voltage:</span> <strong>${ctrl.solarData.totalVoltage.toFixed(1)} V</strong></div>
                    <div style="display:flex; justify-content:space-between; font-size:14px;"><span>Current:</span> <strong>${ctrl.solarData.totalCurrent.toFixed(1)} A</strong></div>
                    <div style="display:flex; justify-content:space-between; font-size:14px;"><span>Irradiance:</span> <strong>${ctrl.solarData.averageIrradiance.toFixed(0)} W/m²</strong></div>
                    <div style="display:flex; justify-content:space-between; font-size:14px;"><span>Temperature:</span> <strong>${ctrl.solarData.averageTemperature.toFixed(1)}°C</strong></div>
                </div>

                <div style="margin-bottom: 15px;">
                    <div style="font-size:12px; color:#94a3b8; margin-bottom:4px;">EDGE COMPUTING</div>
                    <div style="display:flex; justify-content:space-between; font-size:14px;"><span>Raspberry Pi:</span> <strong style="color:#22c55e">ONLINE</strong></div>
                </div>

                <div style="margin-bottom: 15px;">
                    <div style="font-size:12px; color:#94a3b8; margin-bottom:4px;">IoT CONTROLLER</div>
                    <div style="display:flex; justify-content:space-between; font-size:14px;"><span>ESP32:</span> <strong style="color:#22c55e">CONNECTED</strong></div>
                </div>

                <div style="margin-bottom: 15px;">
                    <div style="font-size:12px; color:#94a3b8; margin-bottom:4px;">COMMUNICATION</div>
                    <div style="display:flex; justify-content:space-between; font-size:14px;"><span>IoT Gateway:</span> <strong style="color:#22c55e">CONNECTED</strong></div>
                </div>

                <div>
                    <div style="font-size:12px; color:#94a3b8; margin-bottom:4px;">AI ENGINE</div>
                    <div style="display:flex; justify-content:space-between; font-size:14px;"><span>Status:</span> <strong style="color:#38bdf8">${ctrl.optimizationData ? ctrl.optimizationData.mode : (ctrl.status === 'PROCESSING' ? 'PROCESSING' : 'READY')}</strong></div>
                    ${ctrl.optimizationData ? `<div style="display:flex; justify-content:space-between; font-size:14px; margin-top:5px;"><span>Action:</span> <strong style="color:#10b981">${ctrl.optimizationData.batteryAction}</strong></div>` : ''}
                </div>
            `;
        } else {
            // Internal component clicked
            const compTitle = this.selectedObject.replace('_', ' ');
            let role = "";
            let dataHtml = "";
            
            if (this.selectedObject === "RPI_CONTROLLER") {
                role = "Local data processing";
                dataHtml = `<div style="display:flex; justify-content:space-between;"><span>Status:</span> <strong style="color:#22c55e">ONLINE</strong></div>`;
            } else if (this.selectedObject === "ESP32_CONTROLLER") {
                role = "Sensor acquisition";
                dataHtml = `<div style="display:flex; justify-content:space-between;"><span>Status:</span> <strong style="color:#22c55e">CONNECTED</strong></div>`;
            } else if (this.selectedObject === "IOT_GATEWAY") {
                role = "Sensor communication";
                dataHtml = `<div style="display:flex; justify-content:space-between;"><span>Status:</span> <strong style="color:#22c55e">CONNECTED</strong></div>`;
            } else if (this.selectedObject === "ENERGY_METER") {
                role = "Telemetry";
                dataHtml = `
                    <div style="display:flex; justify-content:space-between;"><span>Power:</span> <strong>${ctrl.solarData.totalPower.toFixed(2)} kW</strong></div>
                    <div style="display:flex; justify-content:space-between;"><span>Status:</span> <strong style="color:#22c55e">ACTIVE</strong></div>
                `;
            } else if (this.selectedObject === "CONTROL_UNIT") {
                role = "Load & Battery Switching";
                dataHtml = `<div style="display:flex; justify-content:space-between;"><span>Status:</span> <strong style="color:#38bdf8">READY</strong></div>`;
            } else if (this.selectedObject === "AI_HUB_DISPLAY") {
                 role = "Local HMI";
                 dataHtml = `<div style="display:flex; justify-content:space-between;"><span>Status:</span> <strong style="color:#22c55e">ACTIVE</strong></div>`;
            }
            
            html = `
                <h2 style="margin:0 0 15px 0; font-size:18px; border-bottom:1px solid #334155; padding-bottom:10px;">${compTitle}</h2>
                <div style="font-size:14px; line-height:1.6;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:10px;"><span>Role:</span> <strong>${role}</strong></div>
                    ${dataHtml}
                </div>
            `;
        }
        
        this.infoPanel.innerHTML = html;
    }
}
