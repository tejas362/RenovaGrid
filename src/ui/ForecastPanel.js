export class ForecastPanel {
    constructor(aiEngine, cameraController) {
        this.aiEngine = aiEngine;
        this.cameraController = cameraController;
        
        this.container = document.createElement('div');
        this.container.id = "ai-forecast-container";
        this.container.style.position = "absolute";
        this.container.style.top = "140px";
        this.container.style.right = "20px";
        this.container.style.display = "none";
        this.container.style.flexDirection = "column";
        this.container.style.gap = "15px";
        this.container.style.pointerEvents = "auto";
        this.container.style.zIndex = "1000";
        this.container.style.maxHeight = "calc(100vh - 160px)";
        this.container.style.overflowY = "auto";
        
        document.body.appendChild(this.container);
        
        this.buildPanel();
        this.lastUpdate = 0;
    }

    buildPanel() {
        this.mainCard = document.createElement('div');
        this.mainCard.style.background = "rgba(15, 23, 42, 0.95)";
        this.mainCard.style.border = "1px solid #8b5cf6";
        this.mainCard.style.borderRadius = "8px";
        this.mainCard.style.padding = "20px";
        this.mainCard.style.color = "#f8fafc";
        this.mainCard.style.fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
        this.mainCard.style.minWidth = "380px";
        this.mainCard.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.5)";
        
        this.container.appendChild(this.mainCard);
    }

    show() {
        this.container.style.display = "flex";
        this.updateUI();
    }
    
    hide() {
        this.container.style.display = "none";
    }

    update() {
        if (this.container.style.display !== "none") {
            const now = Date.now();
            if (now - this.lastUpdate > 1000) {
                this.updateUI();
                this.lastUpdate = now;
            }
        }
    }

    styleBtn(btn, color) {
        btn.style.background = color;
        btn.style.color = "white";
        btn.style.border = "none";
        btn.style.padding = "6px 10px";
        btn.style.fontSize = "10px";
        btn.style.fontWeight = "bold";
        btn.style.cursor = "pointer";
        btn.style.borderRadius = "4px";
        btn.style.flex = "1";
        btn.style.textAlign = "center";
    }

    updateUI() {
        const summary = this.aiEngine.getForecastSummary();
        const metrics = this.aiEngine.getEvaluationMetrics();
        const weather = this.aiEngine.weatherController.getCurrentWeather();
        
        let solarMax = 0, loadMax = 0;
        let solarNextHr = summary.solarForecast[0]?.predictedPower || 0;
        let loadNextHr = summary.loadForecast[0]?.predictedLoad || 0;
        
        summary.solarForecast.forEach(s => { if (s.predictedPower > solarMax) solarMax = s.predictedPower; });
        summary.loadForecast.forEach(l => { if (l.predictedLoad > loadMax) loadMax = l.predictedLoad; });
        
        this.mainCard.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; border-bottom:1px solid #334155; padding-bottom:10px;">
                <h2 style="margin:0; font-size:18px; color:#c4b5fd;">AI FORECAST ENGINE</h2>
                <div style="font-size:12px; font-weight:bold; color:${this.aiEngine.status === 'READY' ? '#22c55e' : '#f59e0b'};">${this.aiEngine.status}</div>
            </div>
            
            <div style="display:flex; gap:10px; margin-bottom:15px;">
                <div style="flex:1; background:#1e293b; padding:10px; border-radius:6px;">
                    <div style="font-size:11px; color:#94a3b8; margin-bottom:4px;">Model Mode</div>
                    <div style="font-size:14px; font-weight:bold; color:#8b5cf6;">DEMO FORECAST</div>
                </div>
                <div style="flex:1; background:#1e293b; padding:10px; border-radius:6px;">
                    <div style="font-size:11px; color:#94a3b8; margin-bottom:4px;">Horizon</div>
                    <div style="font-size:14px; font-weight:bold;">24 HOURS</div>
                </div>
            </div>

            <div style="margin-bottom: 20px;">
                <div style="font-size:12px; color:#94a3b8; margin-bottom:8px; font-weight:bold;">PREDICTIONS (NEXT 24H)</div>
                <div style="display:flex; justify-content:space-between; font-size:14px; margin-bottom:4px;"><span>Solar Next Hour:</span> <strong style="color:#facc15">${solarNextHr.toFixed(1)} kW</strong></div>
                <div style="display:flex; justify-content:space-between; font-size:14px; margin-bottom:4px;"><span>Solar Peak:</span> <strong style="color:#facc15">${solarMax.toFixed(1)} kW</strong></div>
                <div style="display:flex; justify-content:space-between; font-size:14px; margin-bottom:4px;"><span>Expected Load:</span> <strong style="color:#ef4444">${loadNextHr.toFixed(1)} kW</strong></div>
                <div style="display:flex; justify-content:space-between; font-size:14px; margin-bottom:4px;"><span>Expected Peak Load:</span> <strong style="color:#ef4444">${loadMax.toFixed(1)} kW</strong></div>
                
                <div style="display:flex; justify-content:space-between; font-size:14px; margin-top:10px; padding-top:10px; border-top:1px dashed #334155;">
                    <span>Forecast Confidence:</span> <strong style="color:#38bdf8">${summary.confidence.toFixed(1)}%</strong>
                </div>
                <div style="display:flex; justify-content:space-between; font-size:14px; margin-bottom:4px;">
                    <span>Renewable Coverage:</span> <strong style="color:#22c55e">${summary.renewableAvailability.toFixed(1)}%</strong>
                </div>
                <div style="display:flex; justify-content:space-between; font-size:14px; margin-bottom:4px;">
                    <span>Energy Gap:</span> <strong style="color:${summary.energyGap > 0 ? '#ef4444' : '#22c55e'}">${summary.energyGap.toFixed(1)} kW</strong>
                </div>
                <div style="display:flex; justify-content:space-between; font-size:14px; margin-bottom:4px;">
                    <span>System State:</span> <strong style="color:${summary.surplus === 'SURPLUS_RENEWABLE' ? '#22c55e' : '#f59e0b'}">${summary.surplus === 'SURPLUS_RENEWABLE' ? 'RENEWABLE SURPLUS' : 'ENERGY DEFICIT'}</strong>
                </div>
            </div>

            <div style="margin-bottom: 15px;">
                <div style="font-size:12px; color:#94a3b8; margin-bottom:8px; font-weight:bold;">24H FORECAST CHART</div>
                <canvas id="forecast-chart" width="340" height="120" style="background:#0f172a; border-radius:4px;"></canvas>
            </div>
            
            <div style="margin-bottom: 20px;">
                <div style="font-size:12px; color:#94a3b8; margin-bottom:8px; font-weight:bold;">SCENARIO CONTROLS</div>
                <div style="display:flex; flex-wrap:wrap; gap:5px;" id="scenario-btns"></div>
            </div>
            
            <div style="background:#1e293b; padding:12px; border-radius:6px; margin-bottom: 15px;">
                <div style="font-size:12px; color:#94a3b8; margin-bottom:8px; font-weight:bold;">WHY THIS FORECAST?</div>
                <div style="font-size:12px; color:#cbd5e1; line-height:1.5;">
                    <strong>Solar uses:</strong> Time of day, historical gen, irradiance, weather, cloud factor.<br>
                    <strong>Load uses:</strong> Campus schedule, historical consumption, occupancy, flex loads.<br>
                    <strong>Current Weather:</strong> ${weather.condition} (${weather.temperature}°C)
                </div>
            </div>

            <div style="display:flex; justify-content:space-between; gap:10px;">
                <div style="flex:1; font-size:11px; color:#94a3b8;">Demo MAE:<br><strong style="color:#fff">${metrics.mae} kW</strong></div>
                <div style="flex:1; font-size:11px; color:#94a3b8;">Demo MAPE:<br><strong style="color:#fff">${metrics.mape}%</strong></div>
            </div>
        `;
        
        // Render Chart
        this.renderChart(summary);
        
        // Bind scenario buttons
        const btnContainer = this.mainCard.querySelector('#scenario-btns');
        const scenarios = ["NORMAL", "CLOUDY", "HIGH_DEMAND", "LOW_DEMAND", "RAINY", "EXCESS_SOLAR"];
        scenarios.forEach(scen => {
            const btn = document.createElement('button');
            btn.innerText = scen.replace('_', ' ');
            this.styleBtn(btn, "#475569");
            btn.onclick = () => {
                this.aiEngine.setScenario(scen);
                this.updateUI();
            };
            btnContainer.appendChild(btn);
        });
        
        const closeBtn = document.createElement('button');
        closeBtn.innerText = "CLOSE FORECAST";
        closeBtn.style.marginTop = "15px";
        closeBtn.style.width = "100%";
        this.styleBtn(closeBtn, "#8b5cf6");
        closeBtn.onclick = () => {
            if(this.cameraController) this.cameraController.resetView();
            this.hide();
        };
        this.mainCard.appendChild(closeBtn);
    }
    
    renderChart(summary) {
        const canvas = this.mainCard.querySelector('#forecast-chart');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;
        
        ctx.clearRect(0, 0, w, h);
        
        // Find global max for scaling
        let maxVal = 10;
        summary.solarForecast.forEach(s => maxVal = Math.max(maxVal, s.predictedPower));
        summary.loadForecast.forEach(l => maxVal = Math.max(maxVal, l.predictedLoad));
        
        maxVal *= 1.2; // padding
        
        const padX = 10;
        const padY = 10;
        const drawW = w - padX * 2;
        const drawH = h - padY * 2;
        
        // Draw grid
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padX, h - padY); ctx.lineTo(w - padX, h - padY);
        ctx.moveTo(padX, padY); ctx.lineTo(padX, h - padY);
        ctx.stroke();
        
        const drawLine = (data, valueKey, color) => {
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            for (let i = 0; i < 24; i++) {
                const val = data[i][valueKey];
                const x = padX + (i / 23) * drawW;
                const y = (h - padY) - (val / maxVal) * drawH;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
        };
        
        drawLine(summary.loadForecast, 'predictedLoad', '#ef4444');
        drawLine(summary.solarForecast, 'predictedPower', '#facc15');
    }
}
