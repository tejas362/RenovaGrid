export class SmartBatteryUI {
    constructor(smartBattery, cameraController) {
        this.smartBattery = smartBattery;
        this.cameraController = cameraController;
        
        this.container = document.createElement('div');
        this.container.id = "battery-ui-container";
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
        
        this.selectedObject = null;
        this.lastUpdate = 0;
    }

    buildInfoPanel() {
        this.infoPanel = document.createElement('div');
        this.infoPanel.style.background = "rgba(15, 23, 42, 0.9)";
        this.infoPanel.style.border = "1px solid #22c55e";
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
        actions.style.flexWrap = "wrap";
        actions.style.gap = "10px";
        
        const styleBtn = (btn, color) => {
            btn.style.background = color;
            btn.style.color = "white";
            btn.style.border = "none";
            btn.style.padding = "8px 12px";
            btn.style.fontSize = "11px";
            btn.style.fontWeight = "bold";
            btn.style.cursor = "pointer";
            btn.style.borderRadius = "4px";
        };

        const expandBtn = document.createElement('button');
        expandBtn.innerText = "EXPAND BESS";
        styleBtn(expandBtn, "#3b82f6");
        expandBtn.onclick = () => {
            if (this.smartBattery.viewState === 'EXPANDED') {
                this.smartBattery.collapse();
                expandBtn.innerText = "EXPAND BESS";
            } else {
                this.smartBattery.expand();
                expandBtn.innerText = "COLLAPSE BESS";
            }
        };

        const chargeBtn = document.createElement('button');
        chargeBtn.innerText = "CHARGE";
        styleBtn(chargeBtn, "#10b981");
        chargeBtn.onclick = () => this.smartBattery.controller.startCharging(12.5);

        const dischargeBtn = document.createElement('button');
        dischargeBtn.innerText = "DISCHARGE";
        styleBtn(dischargeBtn, "#f59e0b");
        dischargeBtn.onclick = () => this.smartBattery.controller.startDischarging(12.5);

        const idleBtn = document.createElement('button');
        idleBtn.innerText = "IDLE";
        styleBtn(idleBtn, "#64748b");
        idleBtn.onclick = () => this.smartBattery.controller.setIdle();
        
        const resetBtn = document.createElement('button');
        resetBtn.innerText = "RESET VIEW";
        styleBtn(resetBtn, "#475569");
        resetBtn.onclick = () => {
            this.cameraController.resetView();
            this.hide();
        };
        
        actions.appendChild(expandBtn);
        actions.appendChild(chargeBtn);
        actions.appendChild(dischargeBtn);
        actions.appendChild(idleBtn);
        actions.appendChild(resetBtn);
        
        this.container.appendChild(actions);
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
        const ctrl = this.smartBattery.controller;
        const bmsData = ctrl.bms.getBMSData();
        
        if (this.selectedObject === "SMART_BATTERY" || this.selectedObject.startsWith("BATTERY_CABINET") || this.selectedObject.startsWith("BATTERY_DOOR")) {
            html = `
                <h2 style="margin:0 0 15px 0; font-size:18px; border-bottom:1px solid #334155; padding-bottom:10px;">SMART BATTERY</h2>
                
                <div style="margin-bottom: 15px;">
                    <div style="font-size:12px; color:#94a3b8; margin-bottom:4px;">BATTERY STATUS</div>
                    <div style="display:flex; justify-content:space-between; font-size:14px;"><span>SOC:</span> <strong>${ctrl.soc.toFixed(1)}%</strong></div>
                    <div style="display:flex; justify-content:space-between; font-size:14px;"><span>Voltage:</span> <strong>${ctrl.voltage.toFixed(1)} V</strong></div>
                    <div style="display:flex; justify-content:space-between; font-size:14px;"><span>Current:</span> <strong>${ctrl.current.toFixed(1)} A</strong></div>
                    <div style="display:flex; justify-content:space-between; font-size:14px;"><span>Power:</span> <strong>${ctrl.power.toFixed(2)} kW</strong></div>
                    <div style="display:flex; justify-content:space-between; font-size:14px;"><span>Temperature:</span> <strong>${ctrl.temperature.toFixed(1)}°C</strong></div>
                    <div style="display:flex; justify-content:space-between; font-size:14px;"><span>State:</span> <strong style="color:#22c55e">${ctrl.status}</strong></div>
                </div>

                <div style="margin-bottom: 15px;">
                    <div style="font-size:12px; color:#94a3b8; margin-bottom:4px;">BMS STATUS</div>
                    <div style="display:flex; justify-content:space-between; font-size:14px;"><span>BMS:</span> <strong style="color:#38bdf8">${bmsData.status}</strong></div>
                    <div style="display:flex; justify-content:space-between; font-size:14px;"><span>Protection:</span> <strong>${bmsData.protection}</strong></div>
                    <div style="display:flex; justify-content:space-between; font-size:14px;"><span>Cycle Count:</span> <strong>${ctrl.cycleCount}</strong></div>
                    <div style="display:flex; justify-content:space-between; font-size:14px;"><span>Health:</span> <strong>${ctrl.health}%</strong></div>
                </div>

                <div>
                    <div style="font-size:12px; color:#94a3b8; margin-bottom:4px;">ENERGY</div>
                    <div style="display:flex; justify-content:space-between; font-size:14px;"><span>Capacity:</span> <strong>${ctrl.capacity.toFixed(1)} kWh</strong></div>
                    <div style="display:flex; justify-content:space-between; font-size:14px;"><span>Remaining:</span> <strong>${ctrl.remainingEnergy.toFixed(1)} kWh</strong></div>
                </div>
            `;
        } else if (this.selectedObject.startsWith("BATTERY_MODULE_")) {
            const modIdStr = this.selectedObject.split('_').pop();
            const modIdx = parseInt(modIdStr) - 1;
            const mSoc = bmsData.moduleSOCs[modIdx] || 0;
            const mTemp = bmsData.moduleTemperatures[modIdx] || 0;
            
            html = `
                <h2 style="margin:0 0 15px 0; font-size:18px; border-bottom:1px solid #334155; padding-bottom:10px;">MODULE ${modIdStr}</h2>
                <div style="font-size:14px; line-height:1.6;">
                    <div style="display:flex; justify-content:space-between;"><span>SOC:</span> <strong>${mSoc.toFixed(1)}%</strong></div>
                    <div style="display:flex; justify-content:space-between;"><span>Voltage:</span> <strong>${ctrl.voltage.toFixed(1)} V</strong></div>
                    <div style="display:flex; justify-content:space-between;"><span>Temperature:</span> <strong>${mTemp.toFixed(1)}°C</strong></div>
                    <div style="display:flex; justify-content:space-between; margin-top:10px;"><span>Status:</span> <strong style="color:#22c55e">NORMAL</strong></div>
                    <div style="display:flex; justify-content:space-between;"><span>BMS:</span> <strong style="color:#38bdf8">CONNECTED</strong></div>
                </div>
            `;
        } else if (this.selectedObject.startsWith("BMS_")) {
            html = `
                <h2 style="margin:0 0 15px 0; font-size:18px; border-bottom:1px solid #334155; padding-bottom:10px;">BMS CONTROLLER</h2>
                <div style="font-size:14px; line-height:1.6;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:10px;"><span>Function:</span> <strong style="text-align:right;">Battery monitoring<br>and protection</strong></div>
                    <div style="color:#94a3b8; font-size:12px;">Monitoring:</div>
                    <div>- Voltage</div>
                    <div>- Current</div>
                    <div>- Temperature</div>
                    <div>- SOC</div>
                    <div style="display:flex; justify-content:space-between; margin-top:10px;"><span>Status:</span> <strong style="color:#22c55e">${bmsData.status}</strong></div>
                </div>
            `;
        } else {
             html = `
                <h2 style="margin:0 0 15px 0; font-size:18px; border-bottom:1px solid #334155; padding-bottom:10px;">${this.selectedObject.replace(/_/g, ' ')}</h2>
                <div style="font-size:14px; line-height:1.6;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:10px;"><span>System:</span> <strong>BESS</strong></div>
                </div>
            `;
        }
        
        this.infoPanel.innerHTML = html;
    }
}
