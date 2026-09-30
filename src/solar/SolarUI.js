export class SolarUI {
    constructor(solarArray, cameraController) {
        this.solarArray = solarArray;
        this.cameraController = cameraController;
        
        this.container = document.createElement('div');
        this.container.id = "solar-ui-container";
        this.container.style.position = "absolute";
        this.container.style.top = "140px";
        this.container.style.left = "20px";
        this.container.style.display = "none";
        this.container.style.flexDirection = "column";
        this.container.style.gap = "15px";
        this.container.style.pointerEvents = "auto";
        this.container.style.zIndex = "1000";
        
        document.body.appendChild(this.container);
        
        this.buildInfoPanel();
        this.buildControlPanel();
        this.buildActionPanel();
        
        this.selectedObject = null;
    }

    buildInfoPanel() {
        this.infoPanel = document.createElement('div');
        this.infoPanel.style.background = "rgba(15, 23, 42, 0.9)";
        this.infoPanel.style.border = "1px solid #38bdf8";
        this.infoPanel.style.borderRadius = "8px";
        this.infoPanel.style.padding = "20px";
        this.infoPanel.style.color = "#f8fafc";
        this.infoPanel.style.fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
        this.infoPanel.style.minWidth = "250px";
        this.infoPanel.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.5)";
        
        this.container.appendChild(this.infoPanel);
    }

    buildControlPanel() {
        const controls = document.createElement('div');
        controls.style.background = "rgba(30, 41, 59, 0.9)";
        controls.style.border = "1px solid #475569";
        controls.style.borderRadius = "8px";
        controls.style.padding = "15px";
        controls.style.color = "#f8fafc";
        controls.style.fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
        
        const title = document.createElement('div');
        title.innerText = "SIMULATION CONTROLS";
        title.style.fontSize = "12px";
        title.style.fontWeight = "bold";
        title.style.marginBottom = "10px";
        title.style.color = "#94a3b8";
        controls.appendChild(title);
        
        const buttons = [
            { label: 'SUNNY', val: 'SUNNY' },
            { label: 'PARTLY CLOUDY', val: 'PARTLY_CLOUDY' },
            { label: 'CLOUDY', val: 'CLOUDY' },
            { label: 'NIGHT', val: 'NIGHT' }
        ];
        
        const btnContainer = document.createElement('div');
        btnContainer.style.display = "flex";
        btnContainer.style.flexWrap = "wrap";
        btnContainer.style.gap = "5px";
        
        buttons.forEach(b => {
            const btn = document.createElement('button');
            btn.innerText = b.label;
            btn.style.background = "#334155";
            btn.style.color = "white";
            btn.style.border = "none";
            btn.style.padding = "5px 10px";
            btn.style.fontSize = "11px";
            btn.style.cursor = "pointer";
            btn.style.borderRadius = "4px";
            
            btn.onclick = () => {
                this.solarArray.simulation.setWeather(b.val);
                this.updateUI();
            };
            btnContainer.appendChild(btn);
        });
        
        controls.appendChild(btnContainer);
        this.container.appendChild(controls);
    }

    buildActionPanel() {
        const actions = document.createElement('div');
        actions.style.display = "flex";
        actions.style.gap = "10px";
        
        const expandBtn = document.createElement('button');
        expandBtn.innerText = "EXPAND ARRAY";
        this.styleActionBtn(expandBtn);
        expandBtn.onclick = () => {
            if (this.solarArray.isExpanded) {
                this.solarArray.collapseArray();
                expandBtn.innerText = "EXPAND ARRAY";
            } else {
                this.solarArray.expandArray();
                expandBtn.innerText = "COLLAPSE ARRAY";
            }
        };
        actions.appendChild(expandBtn);
        
        const resetViewBtn = document.createElement('button');
        resetViewBtn.innerText = "RESET VIEW";
        this.styleActionBtn(resetViewBtn);
        resetViewBtn.onclick = () => {
            this.cameraController.resetView();
            this.hide();
        };
        actions.appendChild(resetViewBtn);
        
        this.container.appendChild(actions);
    }
    
    styleActionBtn(btn) {
        btn.style.background = "#0284c7";
        btn.style.color = "white";
        btn.style.border = "none";
        btn.style.padding = "8px 12px";
        btn.style.fontSize = "12px";
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
        // limit update rate
        if (this.container.style.display !== "none") {
            const now = Date.now();
            if (!this.lastUpdate || now - this.lastUpdate > 500) {
                this.updateUI();
                this.lastUpdate = now;
            }
        }
    }

    updateUI() {
        if (!this.selectedObject) return;
        
        let html = '';
        
        if (this.selectedObject === "SOLAR_ARRAY") {
            const power = this.solarArray.controller.getTotalPower().toFixed(2);
            const irr = this.solarArray.controller.getAverageIrradiance().toFixed(0);
            const temp = this.solarArray.controller.getAverageTemperature().toFixed(1);
            const status = this.solarArray.controller.getStatus();
            
            html = `
                <h2 style="margin:0 0 15px 0; font-size:18px; border-bottom:1px solid #334155; padding-bottom:10px;">SOLAR ARRAY</h2>
                <div style="font-size:14px; line-height:1.6;">
                    <div style="display:flex; justify-content:space-between;"><span>Panels:</span> <strong>4</strong></div>
                    <div style="display:flex; justify-content:space-between;"><span>Total Power:</span> <strong>${power} kW</strong></div>
                    <div style="display:flex; justify-content:space-between;"><span>Avg Irradiance:</span> <strong>${irr} W/m²</strong></div>
                    <div style="display:flex; justify-content:space-between;"><span>Avg Temperature:</span> <strong>${temp}°C</strong></div>
                    <div style="display:flex; justify-content:space-between;"><span>Status:</span> <strong style="color:${status === 'ACTIVE' ? '#22c55e' : '#fbbf24'}">${status}</strong></div>
                </div>
            `;
        } else if (this.selectedObject.startsWith("SOLAR_PANEL")) {
            const data = this.solarArray.controller.getPanelData(this.selectedObject);
            if (data) {
                html = `
                    <h2 style="margin:0 0 15px 0; font-size:18px; border-bottom:1px solid #334155; padding-bottom:10px;">${this.selectedObject.replace('_', ' ')}</h2>
                    <div style="font-size:14px; line-height:1.6;">
                        <div style="display:flex; justify-content:space-between;"><span>Power:</span> <strong>${data.power.toFixed(2)} kW</strong></div>
                        <div style="display:flex; justify-content:space-between;"><span>Voltage:</span> <strong>${data.voltage.toFixed(1)} V</strong></div>
                        <div style="display:flex; justify-content:space-between;"><span>Current:</span> <strong>${data.current.toFixed(1)} A</strong></div>
                        <div style="display:flex; justify-content:space-between;"><span>Irradiance:</span> <strong>${data.irradiance.toFixed(0)} W/m²</strong></div>
                        <div style="display:flex; justify-content:space-between;"><span>Temperature:</span> <strong>${data.temperature.toFixed(1)}°C</strong></div>
                        <div style="display:flex; justify-content:space-between;"><span>Status:</span> <strong style="color:${data.status === 'ACTIVE' ? '#22c55e' : '#fbbf24'}">${data.status}</strong></div>
                    </div>
                `;
            }
        }
        
        // Add common footer
        const sim = this.solarArray.simulation;
        html += `
            <div style="margin-top:15px; padding-top:10px; border-top:1px solid #334155; font-size:12px; color:#94a3b8;">
                Weather: ${sim.weather.replace('_', ' ')} | Time: ${sim.time}
            </div>
        `;
        
        this.infoPanel.innerHTML = html;
    }
}
