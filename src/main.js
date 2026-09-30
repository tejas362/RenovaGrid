import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

// Modular Scene Builders
import { createLighting } from './scene/lighting.js';
import { createCampusBase } from './scene/campusBase.js';
import { createPathways } from './scene/pathways.js';
import { createTrees } from './scene/vegetation.js';
import { createAcademicBuilding, createHostel } from './scene/buildings.js';
import {
  createSolarZone,
  createEnergyHubZone,
  createBatteryZone,
  createUtilityZone,
  createEVZone,
  createGridZone
} from './scene/zones.js';

// UI and Interaction
import { createLabels } from './ui/labels.js';
import { CampusInteractionManager } from './ui/interaction.js';
import { CampusInfoPanel } from './ui/infoPanel.js';

// Solar Implementation
import { SolarArray } from './solar/SolarArray.js';
import { SolarUI } from './solar/SolarUI.js';
import { SolarCameraController } from './solar/CameraController.js';
import { SolarInteractionManager } from './solar/InteractionManager.js';

// AI Energy Hub Implementation (Section 3)
import { EnergyHub } from './hub/EnergyHub.js';
import { EnergyHubUI } from './hub/EnergyHubUI.js';
import { EnergyHubInteraction } from './hub/EnergyHubInteraction.js';

// Smart Battery Implementation (Section 4)
import { SmartBattery } from './battery/SmartBattery.js';
import { SmartBatteryUI } from './battery/SmartBatteryUI.js';
import { SmartBatteryInteraction } from './battery/SmartBatteryInteraction.js';

// Smart Loads Implementation (Section 5)
import { CampusLoadManager } from './loads/CampusLoadManager.js';
import { LoadMeshes } from './loads/LoadMeshes.js';
import { LoadUI } from './loads/LoadUI.js';
import { LoadInteraction } from './loads/LoadInteraction.js';

// AI Forecasting Implementation (Section 6)
import { WeatherForecastController } from './weather/WeatherForecastController.js';
import { AIForecastingEngine } from './ai/AIForecastingEngine.js';
import { ForecastPanel } from './ui/ForecastPanel.js';

// Energy Optimization Implementation (Section 7)
import { EnergyOptimizationEngine } from './optimization/EnergyOptimizationEngine.js';
import { OptimizationPanel } from './ui/OptimizationPanel.js';

// Global application state
let scene, camera, renderer, labelRenderer, controls;
let interactionManager, infoPanel;
let labelObjects = {};

// Solar global variables
let solarArray, solarUI, solarCameraController, solarInteractionManager;

// Hub global variables
let energyHub, energyHubUI, energyHubInteraction;

// Battery global variables
let smartBattery, smartBatteryUI, smartBatteryInteraction;

// Load global variables
let campusLoadManager, loadMeshes, loadUI, loadInteraction;

// AI global variables
let weatherController, aiForecastingEngine, forecastPanel;

// Optimization global variables
let energyOptimizationEngine, optimizationPanel;

// Camera transition state
let targetCamPos = null;
let targetCamLookAt = null;

let clock;

const CAMERA_PRESETS = {
  overview: { pos: new THREE.Vector3(42, 38, 44), target: new THREE.Vector3(0, 1, 0) },
  hub: { pos: new THREE.Vector3(0, 16, 20), target: new THREE.Vector3(0, 2.0, -1) },
  solar: { pos: new THREE.Vector3(-18, 18, 10), target: new THREE.Vector3(-18, 1, -12) },
  academic: { pos: new THREE.Vector3(-17, 18, 28), target: new THREE.Vector3(-17, 3, 11) },
  hostel: { pos: new THREE.Vector3(17, 18, 28), target: new THREE.Vector3(17, 3.5, 11) },
  utility: { pos: new THREE.Vector3(25, 18, 5), target: new THREE.Vector3(20, 1.5, -8) }
};

/**
 * Main initialization function. Sets up Three.js scene, camera, renderers, geometry, and UI.
 */
export function initScene() {
  const container = document.getElementById('canvas-container');
  const cssContainer = document.getElementById('css2d-container');
  const uiOverlay = document.getElementById('ui-overlay');
  
  clock = new THREE.Clock();

  // 1. Scene setup
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0f1d);
  scene.fog = new THREE.FogExp2(0x0a0f1d, 0.007);

  // 2. Camera setup - Isometric-style overview
  const aspect = window.innerWidth / window.innerHeight;
  camera = new THREE.PerspectiveCamera(45, aspect, 0.5, 300);
  camera.position.copy(CAMERA_PRESETS.overview.pos);

  // 3. WebGL Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  container.appendChild(renderer.domElement);

  // 4. CSS2D Renderer for 3D floating labels
  labelRenderer = new CSS2DRenderer();
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.domElement.style.position = 'absolute';
  labelRenderer.domElement.style.top = '0px';
  labelRenderer.domElement.style.pointerEvents = 'none';
  cssContainer.appendChild(labelRenderer.domElement);

  // 5. OrbitControls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.target.copy(CAMERA_PRESETS.overview.target);
  controls.minDistance = 15;
  controls.maxDistance = 130;
  controls.maxPolarAngle = Math.PI / 2 - 0.05; // Prevent camera clipping below campus base
  controls.update();

  // 6. Architectural Lighting
  createLighting(scene);

  // 7. Base and Layout Components (Modular functions as requested)
  createCampusBase(scene);
  createPathways(scene);
  createTrees(scene);

  // Buildings
  createAcademicBuilding(scene);
  createHostel(scene);

  // Zones
  createSolarZone(scene);
  createEnergyHubZone(scene);
  createBatteryZone(scene);
  createUtilityZone(scene);
  createEVZone(scene);
  createGridZone(scene);

  // 8. Info Panel & UI
  infoPanel = new CampusInfoPanel(uiOverlay, (presetKey) => {
    switchCameraPreset(presetKey);
  });

  // 9. Floating 3D Labels
  labelObjects = createLabels(scene, (zoneId) => {
    interactionManager.selectZone(zoneId);
  });

  // 10. Pointer Raycast Interaction Manager
  interactionManager = new CampusInteractionManager(
    camera,
    scene,
    renderer.domElement,
    labelObjects,
    (selectedZoneId) => {
      infoPanel.showZone(selectedZoneId);
      if (solarUI) solarUI.hide();
      if (energyHubUI) energyHubUI.hide();
      if (smartBatteryUI) smartBatteryUI.hide();
      if (loadUI) { loadUI.hide(); loadInteraction.hideHighlight(); }
      if (forecastPanel) forecastPanel.hide();
    },
    (hoveredZoneId) => {
      // Optional subtle hover callback
    }
  );

  // Window Resize Listener
  window.addEventListener('resize', onWindowResize);

  console.log('%c[Campus AI Energy Manager] Section 1 Base & Campus Layout Initialized Successfully!', 'color: #38bdf8; font-weight: bold; font-size: 14px;');

  // Start Animation Loop
  
  // Initialize Solar Implementation (Section 2)
  solarArray = new SolarArray(scene);
  solarCameraController = new SolarCameraController(camera, controls);
  solarUI = new SolarUI(solarArray, solarCameraController);
  solarInteractionManager = new SolarInteractionManager(camera, scene, renderer.domElement, solarArray, solarUI, solarCameraController, () => {
    if (infoPanel) infoPanel.hideZoneCard();
    if (energyHubUI) energyHubUI.hide();
    if (smartBatteryUI) smartBatteryUI.hide();
    if (loadUI) { loadUI.hide(); loadInteraction.hideHighlight(); }
    if (forecastPanel) forecastPanel.hide();
  });
  
  // Initialize AI Energy Hub (Section 3)
  energyHub = new EnergyHub(scene, solarArray.particleSystem);
  energyHubUI = new EnergyHubUI(energyHub, solarCameraController);
  energyHubInteraction = new EnergyHubInteraction(camera, scene, renderer.domElement, energyHub, energyHubUI, solarCameraController, () => {
    if (infoPanel) infoPanel.hideZoneCard();
    if (solarUI) solarUI.hide();
    if (smartBatteryUI) smartBatteryUI.hide();
    if (loadUI) { loadUI.hide(); loadInteraction.hideHighlight(); }
    if (forecastPanel) forecastPanel.hide();
  });
  
  // Initialize Smart Battery (Section 4)
  smartBattery = new SmartBattery(scene, energyHub, solarArray.particleSystem);
  
  const batteryGroup = scene.getObjectByName('BatteryZoneGroup');
  if (batteryGroup) {
      smartBattery.setPosition(new THREE.Vector3().copy(batteryGroup.position).add(new THREE.Vector3(0, 0.4, 0)));
  }

  smartBatteryUI = new SmartBatteryUI(smartBattery, solarCameraController);
  smartBatteryInteraction = new SmartBatteryInteraction(camera, scene, renderer.domElement, smartBattery, smartBatteryUI, solarCameraController, () => {
    if (infoPanel) infoPanel.hideZoneCard();
    if (solarUI) solarUI.hide();
    if (energyHubUI) energyHubUI.hide();
    if (loadUI) { loadUI.hide(); loadInteraction.hideHighlight(); }
    if (forecastPanel) forecastPanel.hide();
  });
  
  // Data connection from Solar IoT to AI Hub
  solarArray.onDataReachedIoT = () => {
      if (energyHub && solarArray.particleSystem) {
          const start = new THREE.Vector3();
          solarArray.sensorNode.group.getWorldPosition(start);
          start.y += 0.5;
          
          const end = energyHub.getSolarDataConnectionPoint();
          
          solarArray.particleSystem.createDataFlow(start, end, "sensor-data", () => {
              // When data reaches AI Hub, pulse status
              energyHub.controller.triggerProcessing();
          });
      }
  };

  // Initialize Smart Loads (Section 5)
  campusLoadManager = new CampusLoadManager(scene, energyHub);
  loadMeshes = new LoadMeshes(scene, campusLoadManager, solarArray.particleSystem, energyHub);
  
  loadUI = new LoadUI(campusLoadManager, solarCameraController);
  loadInteraction = new LoadInteraction(camera, scene, renderer.domElement, loadMeshes, loadUI, solarCameraController, () => {
      if (infoPanel) infoPanel.hideZoneCard();
      if (solarUI) solarUI.hide();
      if (energyHubUI) energyHubUI.hide();
      if (smartBatteryUI) smartBatteryUI.hide();
      if (forecastPanel) forecastPanel.hide();
  });

  // Initialize AI Forecasting Engine (Section 6)
  weatherController = new WeatherForecastController();
  aiForecastingEngine = new AIForecastingEngine(weatherController, campusLoadManager, solarArray, smartBattery);
  forecastPanel = new ForecastPanel(aiForecastingEngine, solarCameraController);
  
  window.showForecastPanel = () => {
      if (infoPanel) infoPanel.hideZoneCard();
      if (solarUI) solarUI.hide();
      if (energyHubUI) energyHubUI.hide();
      if (smartBatteryUI) smartBatteryUI.hide();
      if (loadUI) { loadUI.hide(); loadInteraction.hideHighlight(); }
      forecastPanel.show();
  };

  // Initialize Optimization Engine (Section 7)
  energyOptimizationEngine = new EnergyOptimizationEngine(solarArray.controller, campusLoadManager, smartBattery.controller, aiForecastingEngine);
  optimizationPanel = new OptimizationPanel(energyOptimizationEngine);
  optimizationPanel.onScenarioCallback = (scenario) => {
      console.log("Trigger scenario:", scenario);
      // For now, it just forces optimization update
      // A full scenario modifier can be added to Weather/Forecast controllers
      if (scenario === "EXCESS") {
          weatherController.weatherState = "SUNNY";
      } else if (scenario === "DEFICIT") {
          weatherController.weatherState = "CLOUDY";
      }
      energyOptimizationEngine.forceOptimize();
      optimizationPanel.update();
  };
  
  window.showOptimizationPanel = () => {
      if (infoPanel) infoPanel.hideZoneCard();
      if (solarUI) solarUI.hide();
      if (energyHubUI) energyHubUI.hide();
      if (smartBatteryUI) smartBatteryUI.hide();
      if (loadUI) { loadUI.hide(); loadInteraction.hideHighlight(); }
      if (forecastPanel) forecastPanel.hide();
      optimizationPanel.show();
  };

  // Hide the old placeholder core from Section 1
  const hubGroup = scene.getObjectByName('EnergyHubGroup');
  if (hubGroup) {
      hubGroup.children.forEach(child => {
          if (child.isMesh && child.geometry.type === 'BoxGeometry') {
              if (child.geometry.parameters.width === 4.2 || child.geometry.parameters.width === 4.28) {
                  child.visible = false;
              }
          }
          if (child.isMesh && child.geometry.type === 'CylinderGeometry') {
              child.visible = false;
          }
          if (child.isMesh && child.geometry.type === 'SphereGeometry') {
              child.visible = false;
          }
      });
  }

  animate();
}

/**
 * Smooth camera transition to specified viewpoint.
 */
function switchCameraPreset(presetKey) {
  const preset = CAMERA_PRESETS[presetKey];
  if (!preset) return;
  targetCamPos = preset.pos.clone();
  targetCamLookAt = preset.target.clone();
}

/**
 * Handle browser window resizing for responsive canvas.
 */
function onWindowResize() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  labelRenderer.setSize(width, height);
}

/**
 * Core animation loop.
 */
export function animate() {
  requestAnimationFrame(animate);

  // Smooth camera interpolation if transitioning
  if (targetCamPos && targetCamLookAt) {
    camera.position.lerp(targetCamPos, 0.05);
    controls.target.lerp(targetCamLookAt, 0.05);

    if (camera.position.distanceTo(targetCamPos) < 0.2 && controls.target.distanceTo(targetCamLookAt) < 0.2) {
      camera.position.copy(targetCamPos);
      controls.target.copy(targetCamLookAt);
      targetCamPos = null;
      targetCamLookAt = null;
    }
  }

  controls.update();

  if (solarArray) solarArray.update();
  if (solarCameraController) solarCameraController.update();
  if (solarUI) solarUI.update();
  
  if (energyHub) {
    const time = performance.now() / 1000;
    energyHub.update(time, solarArray ? solarArray.controller : null);
  }
  if (energyHubUI) energyHubUI.update();
  
  const dt = clock ? clock.getDelta() : 0.016;
  if (smartBattery) smartBattery.update(dt);
  if (smartBatteryUI) smartBatteryUI.update();
  
  if (campusLoadManager) campusLoadManager.update(dt);
  if (loadMeshes) loadMeshes.update(dt);
  if (loadUI) loadUI.update();
  
  if (weatherController) weatherController.update(dt);
  if (aiForecastingEngine) {
      aiForecastingEngine.update(dt);
      
      if (energyOptimizationEngine) {
          energyOptimizationEngine.update(dt);
          if (optimizationPanel) optimizationPanel.update();
      }
      
      if (energyHub) {
          energyHub.controller.updateForecastData(aiForecastingEngine.getForecastSummary());
          if (energyOptimizationEngine) {
              energyHub.controller.updateOptimizationData(energyOptimizationEngine.getOptimizationPlan());
              
              // Energy flow visualization
              if (Math.random() > 0.95 && solarArray && solarArray.particleSystem) {
                  const plan = energyOptimizationEngine.getOptimizationPlan();
                  const hubPos = energyHub.getSolarDataConnectionPoint();
                  
                  // Solar -> Hub
                  if (plan.solarAvailable > 0) {
                      solarArray.particleSystem.createDataFlow(
                          new THREE.Vector3(-18, 2, -12), hubPos, "power"
                      );
                  }
                  
                  // Battery charging/discharging
                  if (plan.batteryAction === "CHARGE") {
                      solarArray.particleSystem.createDataFlow(
                          hubPos, energyHub.getBatteryConnectionPoint(), "power"
                      );
                  } else if (plan.batteryAction === "DISCHARGE") {
                      solarArray.particleSystem.createDataFlow(
                          energyHub.getBatteryConnectionPoint(), hubPos, "power"
                      );
                  }
                  
                  // Grid usage
                  if (plan.gridPower > 0) {
                      solarArray.particleSystem.createDataFlow(
                          energyHub.getGridConnectionPoint(), hubPos, "telemetry" // Different color for grid
                      );
                  }
                  
                  // Hub -> Loads
                  if (plan.directSolar > 0 || plan.batteryAction === "DISCHARGE" || plan.gridPower > 0) {
                      solarArray.particleSystem.createDataFlow(
                          hubPos, energyHub.getLoadConnectionPoint(), "power"
                      );
                  }
              }
          }
      }
  }
  if (forecastPanel) forecastPanel.update();

  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
}

// Bootstrap on DOM loaded
window.addEventListener('DOMContentLoaded', () => {
  initScene();
});
