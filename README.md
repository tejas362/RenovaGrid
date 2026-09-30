# Campus AI Energy Manager — 3D Prototype (Section 1)

**Smart India Hackathon (SIH) Prototype**  
**Section 1: Base + Campus Layout**

A high-performance interactive 3D digital twin of a smart university microgrid built with Three.js and Vite.

---

## 🏛️ What Was Built in Section 1

1. **Architectural Campus Base (60 × 45 × 1 units)**:
   - Modern architectural plinth model with beveled edge detailing.
   - Raised perimeter retaining curbs and recessed landscape lawn.
   - Distinct ground plot foundations for each zone.

2. **All 8 Functional Zones**:
   - ☀️ **Solar Generation Zone** (Rear-Left): 18 × 10m flat elevated platform with PV array mounting grid & sign (prepared for Section 2).
   - 🎓 **Academic Block** (Front-Left): 12 × 8 × 6m multi-story building placeholder with window arrays, entrance canopy, and sign plate.
   - 🏢 **Hostel Zone** (Front-Right): 12 × 8 × 7m residential complex placeholder with 4 floor tiers, entrance, and sign plate (prepared for smart loads).
   - ⚡ **AI Energy Hub** (Center): 10 × 8m raised centerpiece platform with tech pavilion, IoT communications mast, beacon, and designated edge compute / gateway expansion slots.
   - 🔋 **Battery Storage Zone** (Adjacent to AI Hub): 8 × 5m platform with safety curbs and 3 rack foundation slots (prepared for BESS in Section 3).
   - 🔧 **Utility Zone** (Rear-Right): Utilitarian building placeholder with roll-up service doors, rooftop louvers, and sign plate.
   - 🚗 **EV Charging Zone** (Near Utility): Dual-bay asphalt parking area with markings, wheel stops, and smart EV charger station pillar.
   - 🏭 **Grid Connection Zone** (Far Edge): Substation pad with transformer placeholder, cooling fins, high-voltage ceramic bushings, and reserved conduit trench leading to AI Energy Hub.

3. **Pathways & Circulation**:
   - Central north-south spine and east-west cross roads with curbs and pedestrian crossing zebra stripes.
   - Reserved underground electrical conduit connecting the Grid Substation directly to the central AI Energy Hub.

4. **Vegetation**:
   - 10 low-poly architectural trees (cylinder trunks + stylized low-poly canopies) framing the campus.

5. **Lighting & Visuals**:
   - Directional sunlight with soft PCF shadow mapping (`2048x2048`), hemisphere skylight, and rim fill.
   - ACESFilmic tone mapping for realistic architectural aesthetics.

6. **Floating 3D Labels & UI**:
   - CSS2DRenderer floating badges for all 8 zones with hover/active states.
   - Full pointer raycasting for hover highlight and click inspection.
   - Professional SIH Digital Twin HUD with zone specifications, phase roadmap, and camera preset shortcuts (Overview, AI Hub, Solar, Academic, Hostel, Utility).

---

## 🚀 How to Run

1. Open terminal in the project directory:
   ```bash
   cd "C:\Users\Jinanshi\.gemini\antigravity\scratch\campus-ai-energy-manager"
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open `http://localhost:5173` in any modern web browser.

---

## 📁 Code Organization

```
campus-ai-energy-manager/
├── index.html                  # HTML entry point with WebGL, CSS2D & HUD containers
├── package.json                # Dependencies: three, vite
├── vite.config.js              # Dev server & build configuration
├── src/
│   ├── main.js                 # initScene(), animate(), camera lerp, resize handling
│   ├── config/
│   │   └── campusData.js       # Central zone registry, dimensions, specs, future roadmap
│   ├── scene/
│   │   ├── campusBase.js       # createCampusBase(): 60x45 plinth, curbs, zone foundations
│   │   ├── buildings.js        # createAcademicBuilding(), createHostel()
│   │   ├── zones.js            # createSolarZone(), createEnergyHubZone(), createBatteryZone(), etc.
│   │   ├── pathways.js         # createPathways(): roads, zebra crossings, grid conduit
│   │   ├── vegetation.js       # createTrees(): 10 low-poly architectural trees
│   │   └── lighting.js         # createLighting(): sun DirectionalLight + soft shadows, hemi light
│   ├── ui/
│   │   ├── labels.js           # createLabels(): CSS2DRenderer floating badges
│   │   ├── interaction.js      # CampusInteractionManager: raycasting & hover/select
│   │   └── infoPanel.js        # CampusInfoPanel: HUD header, presets, inspection card
│   └── style.css               # Architectural digital twin styling
```
