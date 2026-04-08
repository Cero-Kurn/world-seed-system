// --- IMPORT MODULES ---

// Seed engine
import { generateRandomSeed } from "./modules/seed/seedGenerator.js";
import { decodeSeed } from "./modules/seed/seedDecoder.js";
import { generateWorldSummary } from "./modules/seed/worldSummary.js";

// World-scale summaries
import { generateContinentSummary } from "./modules/world/continentSummary.js";
import { generateClimateBiomeSummary } from "./modules/world/climateBiomeSummary.js";
import { generateHexMap, renderHexMap } from "./modules/maps/hexMap.js";

// Regions
import { generateRegions } from "./modules/regions/regionGenerator.js";

// Heatmap
import { generateBiomeHeatmap, renderBiomeHeatmap } from "./modules/maps/biomeHeatmap.js";


// --- UI ELEMENTS ---
const seedInput = document.getElementById("seedInput");
const btnGenerate = document.getElementById("btnGenerate");
const btnDecode = document.getElementById("btnDecode");


// --- RENDER FUNCTIONS ---

function renderDecoded(decoded, seedStr) {
  const container = document.getElementById("decodedOutput");

  const block = (item) => `
    <div class="card" style="background:#111; margin:0;">
      <div class="label">${item.label}</div>
      <div><strong>Code:</strong> ${item.code}</div>
      <div><strong>Primary:</strong> ${item.primary}</div>
      <div><strong>Twist:</strong> ${item.twist}</div>
    </div>
  `;

  container.innerHTML = `
    <p><span class="label">Seed:</span> ${seedStr}</p>
    <div class="grid">
      ${block(decoded.cc)}
      ${block(decoded.lm)}
      ${block(decoded.we)}
      ${block(decoded.tr)}
      ${block(decoded.hy)}
      ${block(decoded.sf)}
    </div>
  `;
}

function renderRegions(regions) {
  const container = document.getElementById("regionSummary");

  container.innerHTML = regions.map(r => `
    <div class="card" style="background:#111; margin:0;">
      <div class="label">${r.name}</div>
      <p><strong>Biome:</strong> ${r.biome}</p>
      <p><strong>Elevation:</strong> ${r.elevation}</p>
      <p><strong>Moisture:</strong> ${r.moisture}</p>
      <p><strong>Feature:</strong> ${r.feature}</p>
      <p>${r.description}</p>
    </div>
  `).join("");
}


// --- MAIN ACTIONS ---

function processSeed(seed) {
  let decoded;

  try {
    decoded = decodeSeed(seed);
  } catch (err) {
    alert("Invalid seed format.");
    return;
  }

  // Render decoded seed
  renderDecoded(decoded, seed);

  // World summary
  document.getElementById("worldSummary").innerHTML =
    generateWorldSummary(decoded);

  // Continent summary
  document.getElementById("continentSummary").innerHTML =
    generateContinentSummary(decoded);

  // Climate & biome summary
  document.getElementById("climateBiomeSummary").innerHTML =
    generateClimateBiomeSummary(decoded);

  // Regions
  const regions = generateRegions(decoded);
  renderRegions(regions);

  // Heatmap
  const heatmap = generateBiomeHeatmap(decoded);
  renderBiomeHeatmap(heatmap);

  // Hex map
  const hexMap = generateHexMap(decoded);
  renderHexMap(hexMap);

}


// --- BUTTON HANDLERS ---

btnGenerate.addEventListener("click", () => {
  const seed = generateRandomSeed();
  seedInput.value = seed;
  processSeed(seed);
});

btnDecode.addEventListener("click", () => {
  const seed = seedInput.value.trim();
  if (!seed) return alert("Enter a seed first.");
  processSeed(seed);
});
