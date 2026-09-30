import { ZONES } from '../config/campusData.js';

/**
 * Manages the SIH Digital Twin UI Overlay, camera preset buttons, and zone inspection card.
 */
export class CampusInfoPanel {
  constructor(container, onCameraPreset) {
    this.container = container;
    this.onCameraPreset = onCameraPreset;
    this.currentZoneId = null;

    this.renderLayout();
    this.bindEvents();
  }

  renderLayout() {
    this.container.innerHTML = `
      <!-- Top Brand Bar -->
      <header class="hud-header">
        <div class="brand-badge">
          <span class="status-dot pulse"></span>
          <span class="brand-org">SIH 2024–2026 PROTOTYPE</span>
        </div>
        <h1 class="brand-title">Campus AI Energy Manager</h1>
        <p class="brand-subtitle">Section 1: Architectural Base & Microgrid Campus Layout</p>
      </header>

      <!-- Camera Preset Controls -->
      <div class="hud-camera-controls">
        <span class="ctrl-label">PRESETS</span>
        <button class="cam-btn active" data-view="overview">Default View</button>
        <button class="cam-btn" data-view="hub">AI Hub</button>
        <button class="cam-btn" data-view="solar">Solar Zone</button>
        <button class="cam-btn" data-view="academic">Academic</button>
        <button class="cam-btn" data-view="hostel">Hostel</button>
        <button class="cam-btn" data-view="utility">Utility & EV</button>
      </div>

      <!-- Zone Information Card -->
      <aside id="zone-panel" class="zone-card hidden">
        <button id="close-zone-panel" class="zone-close-btn" aria-label="Close">&times;</button>
        <div class="zone-card-header">
          <span id="zone-category-badge" class="cat-badge">CATEGORY</span>
          <h2 id="zone-title" class="zone-title">Zone Name</h2>
          <span id="zone-specs" class="zone-specs">0m × 0m</span>
        </div>

        <div class="zone-phase-alert">
          <span class="phase-icon">⚡</span>
          <span id="zone-phase-text" class="phase-text">Phase Status</span>
        </div>

        <p id="zone-description" class="zone-description"></p>

        <div class="zone-future-section">
          <h4 class="future-heading">Future Integrations (Roadmap):</h4>
          <ul id="zone-future-list" class="future-list"></ul>
        </div>
      </aside>

      <!-- Bottom Guidance Bar -->
      <footer class="hud-footer">
        <div class="footer-tip">
          <span class="tip-key">Left Drag</span> Orbit &bull;
          <span class="tip-key">Right Drag</span> Pan &bull;
          <span class="tip-key">Scroll</span> Zoom &bull;
          <span class="tip-key">Click Zone</span> Inspect Details
        </div>
        <div class="footer-version">
          Engine: Three.js WebGL &bull; Procedural Geometry &bull; CSS2D
        </div>
      </footer>
    `;

    this.panelEl = document.getElementById('zone-panel');
    this.titleEl = document.getElementById('zone-title');
    this.catEl = document.getElementById('zone-category-badge');
    this.specsEl = document.getElementById('zone-specs');
    this.phaseEl = document.getElementById('zone-phase-text');
    this.descEl = document.getElementById('zone-description');
    this.futureListEl = document.getElementById('zone-future-list');
  }

  bindEvents() {
    // Camera preset buttons
    const camBtns = this.container.querySelectorAll('.cam-btn');
    camBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        camBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const view = btn.getAttribute('data-view');
        if (this.onCameraPreset) {
          this.onCameraPreset(view);
        }
      });
    });

    // Close button on card
    document.getElementById('close-zone-panel')?.addEventListener('click', () => {
      this.hideZoneCard();
    });
  }

  showZone(zoneId) {
    const data = ZONES[zoneId];
    if (!data) return;

    this.currentZoneId = zoneId;
    this.titleEl.textContent = data.name;
    this.catEl.textContent = data.category.toUpperCase();
    this.specsEl.textContent = data.specs;
    this.phaseEl.textContent = data.phase;
    this.descEl.textContent = data.description;

    this.futureListEl.innerHTML = '';
    data.futureComponents.forEach(comp => {
      const li = document.createElement('li');
      li.className = 'future-item';
      li.innerHTML = `<span class="check-bullet">&bull;</span> ${comp}`;
      this.futureListEl.appendChild(li);
    });

    this.panelEl.classList.remove('hidden');
    this.panelEl.classList.add('visible');
  }

  hideZoneCard() {
    this.panelEl.classList.remove('visible');
    this.panelEl.classList.add('hidden');
    this.currentZoneId = null;
  }
}
