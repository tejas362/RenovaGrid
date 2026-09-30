export class OptimizationPanel {
    constructor(optimizationEngine) {
        this.engine = optimizationEngine;
        
        this.container = document.createElement('div');
        this.container.id = "optimization-panel";
        this.container.style.position = "absolute";
        this.container.style.top = "140px";
        this.container.style.left = "350px"; // Next to SolarUI or Hub UI
        this.container.style.display = "none";
        this.container.style.flexDirection = "column";
        this.container.style.gap = "15px";
        this.container.style.pointerEvents = "auto";
        this.container.style.zIndex = "1000";
        this.container.style.background = "rgba(15, 23, 42, 0.9)";
        this.container.style.border = "1px solid #10b981";
        this.container.style.borderRadius = "8px";
        this.container.style.padding = "20px";
        this.container.style.color = "#f8fafc";
        this.container.style.fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
        this.container.style.minWidth = "400px";
        this.container.style.boxShadow = "0 8px 16px rgba(0,0,0,0.6)";
        
        document.body.appendChild(this.container);
        
        this.buildLayout();
    }
    
    buildLayout() {
        this.container.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #334155; padding-bottom:10px; margin-bottom:10px;">
                <h3 style="margin:0; font-size:16px; color:#10b981; letter-spacing:1px;">ENERGY OPTIMIZATION</h3>
                <button id="opt-close-btn" style="background:none; border:none; color:#94a3b8; font-size:20px; cursor:pointer;">&times;</button>
            </div>
            
            <div id="opt-content" style="display:flex; flex-direction:column; gap:10px;">
                <!-- Content will be populated by update() -->
            </div>
            
            <div style="margin-top:10px; border-top:1px solid #334155; padding-top:10px;">
                <div style="font-size:12px; color:#94a3b8; margin-bottom:5px;">SCENARIOS</div>
                <div style="display:flex; flex-wrap:wrap; gap:5px;">
                    <button class="scen-btn" data-scenario="NORMAL">Normal</button>
                    <button class="scen-btn" data-scenario="EXCESS">Excess Solar</button>
                    <button class="scen-btn" data-scenario="DEFICIT">Energy Deficit</button>
                    <button class="scen-btn" data-scenario="LOW_BAT">Low Battery</button>
                </div>
            </div>
        `;
        
        // Scenario Buttons styles
        const buttons = this.container.querySelectorAll('.scen-btn');
        buttons.forEach(btn => {
            btn.style.background = "#1e293b";
            btn.style.border = "1px solid #334155";
            btn.style.color = "#cbd5e1";
            btn.style.padding = "4px 8px";
            btn.style.borderRadius = "4px";
            btn.style.fontSize = "11px";
            btn.style.cursor = "pointer";
            
            btn.addEventListener('mouseenter', () => { btn.style.background = "#334155"; });
            btn.addEventListener('mouseleave', () => { btn.style.background = "#1e293b"; });
            
            btn.addEventListener('click', (e) => {
                if (this.onScenarioCallback) {
                    this.onScenarioCallback(e.target.dataset.scenario);
                }
            });
        });
        
        this.container.querySelector('#opt-close-btn').addEventListener('click', () => {
            this.hide();
        });
        
        this.contentDiv = this.container.querySelector('#opt-content');
    }
    
    update() {
        if (!this.engine || this.container.style.display === "none") return;
        
        const plan = this.engine.getOptimizationPlan();
        
        let batteryColor = plan.batteryAction.includes("CHARGE") ? "#10b981" : (plan.batteryAction.includes("DISCHARGE") ? "#f59e0b" : "#94a3b8");
        let balanceColor = plan.energyBalance > 0 ? "#10b981" : (plan.energyBalance < 0 ? "#ef4444" : "#94a3b8");
        
        this.contentDiv.innerHTML = `
            <div style="font-size:14px; font-weight:bold; color:#f8fafc; margin-bottom:5px;">
                STATUS: <span style="color:#38bdf8">${this.engine.getStatus()}</span>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:14px; margin-bottom:2px;">
                <span>MODE:</span> <strong style="color:${balanceColor}">${plan.mode}</strong>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:14px; margin-bottom:2px;">
                <span>SOLAR:</span> <strong>${plan.solarAvailable.toFixed(1)} kW</strong>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:14px; margin-bottom:2px;">
                <span>LOAD:</span> <strong>${plan.predictedLoad.toFixed(1)} kW</strong>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:14px; margin-bottom:2px;">
                <span>ENERGY BALANCE:</span> <strong style="color:${balanceColor}">${plan.energyBalance > 0 ? '+' : ''}${plan.energyBalance.toFixed(1)} kW</strong>
            </div>
            
            <hr style="border:0; border-top:1px dashed #334155; margin:5px 0;">
            
            <div style="display:flex; justify-content:space-between; font-size:14px; margin-bottom:2px;">
                <span>BATTERY:</span> <strong style="color:${batteryColor}">${plan.batteryAction} ${plan.batteryPower > 0 ? plan.batteryPower.toFixed(1) + ' kW' : ''}</strong>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:14px; margin-bottom:2px;">
                <span>GRID:</span> <strong style="color:#ef4444">${plan.gridPower.toFixed(1)} kW</strong>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:14px; margin-bottom:2px;">
                <span>CURTAILMENT:</span> <strong style="color:#f59e0b">${plan.curtailedPower.toFixed(1)} kW</strong>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:14px; margin-bottom:2px;">
                <span>RENEWABLE UTILIZATION:</span> <strong style="color:#10b981">${plan.renewableUtilization.toFixed(1)}%</strong>
            </div>
            
            <div style="margin-top:10px; padding:10px; background:rgba(30, 41, 59, 0.5); border-radius:6px; border-left:3px solid #38bdf8;">
                <div style="font-size:11px; color:#38bdf8; font-weight:bold; margin-bottom:4px;">WHY THIS DECISION?</div>
                <div style="font-size:12px; color:#cbd5e1; line-height:1.4;">
                    ${plan.explanation}
                </div>
            </div>
        `;
    }
    
    show() {
        this.container.style.display = "flex";
        this.update();
    }
    
    hide() {
        this.container.style.display = "none";
    }
}
