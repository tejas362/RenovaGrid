export const CAMPUS_CONFIG = {
  base: {
    width: 60,
    depth: 45,
    height: 1.0,
    curbHeight: 0.35,
    curbMargin: 0.8
  },
  colors: {
    plinth: 0xe2e8f0,         // Clean architectural off-white matte
    plinthBevel: 0xcbd5e1,    // Subtle darker bevel tone
    ground: 0xecfdf5,         // Soft muted sage/campus lawn
    pathway: 0x475569,        // Muted asphalt/slate paving
    pathwayCurb: 0x94a3b8,    // Pathway curb rim
    marking: 0xffffff,        // Road striping
    buildingBody: 0xf8fafc,   // Modern architectural concrete/plaster
    buildingAccent: 0x334155, // Dark slate trim/frames
    windowGlass: 0x38bdf8,    // Modern tinted architectural glass
    windowFrame: 0x1e293b,
    platform: 0xf1f5f9,       // Raised zone platforms
    platformBorder: 0x94a3b8,
    treeTrunk: 0x78350f,      // Low-poly architectural wood
    treeFoliageA: 0x22c55e,   // Fresh green
    treeFoliageB: 0x16a34a,   // Rich foliage green
    treeFoliageC: 0x15803d,   // Forest green
    gridTower: 0x64748b,
    evCharger: 0x0284c7,
    highlight: 0x38bdf8
  }
};

export const ZONES = {
  solar: {
    id: 'solar',
    name: 'Solar Generation Zone',
    label: 'SOLAR GENERATION',
    badge: 'PV ARRAY',
    position: { x: -18, y: 1.0, z: -12 },
    dimensions: { width: 18, depth: 10, height: 0.25 },
    category: 'Renewable Generation',
    phase: 'Section 2 (Next: Solar PV Arrays & MPPT Inverters)',
    specs: '18m × 10m flat elevation platform',
    description: 'Designated flat platform engineered to house high-density photovoltaic arrays, solar irradiance pyranometers, and multi-string inverter telemetry.',
    futureComponents: ['Photovoltaic Arrays (Section 2)', 'Solar Inverter Bank', 'Irradiance & Temp Sensors']
  },
  academic: {
    id: 'academic',
    name: 'Academic Block',
    label: 'ACADEMIC BLOCK',
    badge: 'LOAD CLUSTER 1',
    position: { x: -17, y: 1.0, z: 11 },
    dimensions: { width: 12, depth: 8, height: 6.0 },
    category: 'Institutional Load',
    phase: 'Section 4 (Smart Campus Loads & HVAC)',
    specs: '12m × 8m × 6m (Multi-story footprint)',
    description: 'Central academic complex with smart classroom lighting, faculty offices, and computer laboratory loads subject to timetable scheduling.',
    futureComponents: ['Lecture Hall Smart Lighting', 'Computer Lab Circuit Monitoring', 'Central HVAC Air Handling']
  },
  hostel: {
    id: 'hostel',
    name: 'Hostel Zone',
    label: 'HOSTEL',
    badge: 'LOAD CLUSTER 2',
    position: { x: 17, y: 1.0, z: 11 },
    dimensions: { width: 12, depth: 8, height: 7.0 },
    category: 'Residential Load',
    phase: 'Section 4 (Smart Residential Loads)',
    specs: '12m × 8m × 7m (Residential complex)',
    description: 'Student residential living quarters with high morning/evening peak demand. Ready for smart geysers, fan automation, and per-wing load shedding.',
    futureComponents: ['Smart Hot-water Geysers', 'Room Automation Controllers', 'Peak Demand Limiter']
  },
  hub: {
    id: 'hub',
    name: 'AI Energy Hub',
    label: 'AI ENERGY HUB',
    badge: 'CENTRAL BRAIN',
    position: { x: 0, y: 1.0, z: -1 },
    dimensions: { width: 10, depth: 8, height: 0.4 },
    category: 'Supervisory Control',
    phase: 'Section 5 (AI Engine & IoT Gateway)',
    specs: '10m × 8m raised centerpiece platform',
    description: 'The architectural centerpiece and digital brain of the campus. Houses edge computing units, IoT gateways, neural network microgrid dispatchers, and live telemetry hubs.',
    futureComponents: ['Raspberry Pi 5 / Edge AI Gateway', 'ESP32 Sensor Receiver Mesh', 'Live OLED Telemetry Displays', 'Bidirectional Energy Bus']
  },
  battery: {
    id: 'battery',
    name: 'Battery Storage Zone',
    label: 'BATTERY STORAGE',
    badge: 'BESS',
    position: { x: 9.5, y: 1.0, z: -1 },
    dimensions: { width: 8, depth: 5, height: 0.35 },
    category: 'Energy Storage',
    phase: 'Section 3 (Battery Logic & Telemetry)',
    specs: '8m × 5m reinforced containment slab',
    description: 'Dedicated Battery Energy Storage System (BESS) pad positioned directly adjacent to the AI Hub for minimized DC transmission losses.',
    futureComponents: ['LiFePO4 Modular Battery Racks', 'Active Battery Management System (BMS)', 'Bi-directional DC-AC Inverter']
  },
  utility: {
    id: 'utility',
    name: 'Utility Zone',
    label: 'UTILITY',
    badge: 'HEAVY UTILITIES',
    position: { x: 18, y: 1.0, z: -12 },
    dimensions: { width: 9, depth: 7, height: 4.2 },
    category: 'Essential Services',
    phase: 'Section 4 (Pumping & Water Infrastructure)',
    specs: '9m × 7m × 4.2m utility building',
    description: 'Houses critical high-power municipal loads including campus overhead water pumps, sewage treatment, and auxiliary diesel generator synchronization.',
    futureComponents: ['Overhead Water Tank Pump VFD', 'Auxiliary Generator Synchronizer', 'Campus Main Distribution Board']
  },
  ev: {
    id: 'ev',
    name: 'EV Charging Zone',
    label: 'EV CHARGING',
    badge: 'SMART MOBILITY',
    position: { x: 19, y: 1.0, z: -1 },
    dimensions: { width: 8, depth: 6, height: 0.15 },
    category: 'Dynamic Load',
    phase: 'Section 4 (Smart Charging & V2G)',
    specs: 'Dual-bay parking + Fast EV Charger pillar',
    description: 'Two designated electric vehicle charging bays equipped with an intelligent Level-2/DC fast charger capable of dynamic peak shaving and Vehicle-to-Grid (V2G).',
    futureComponents: ['Dual Type-2 Fast Charger', 'Vehicle Presence Inductive Loops', 'V2G Power Inverter']
  },
  grid: {
    id: 'grid',
    name: 'Grid Connection Zone',
    label: 'GRID',
    badge: 'UTILITY INTER-TIE',
    position: { x: 25.5, y: 1.0, z: -18 },
    dimensions: { width: 6.5, depth: 5.5, height: 3.5 },
    category: 'Grid Interface',
    phase: 'Section 3 (Net Metering & Grid Exchange)',
    specs: 'Substation pad + Reserved Hub Conduit',
    description: 'High-voltage grid step-down transformer and bi-directional net meter station, linked directly by underground conduit to the AI Energy Hub.',
    futureComponents: ['11kV / 415V Step-Down Transformer', 'Bi-Directional Smart Net Meter', 'Underground Power Busway to Hub']
  }
};
