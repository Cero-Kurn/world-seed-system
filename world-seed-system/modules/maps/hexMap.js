// Add landmass noise
function landNoise(q, r) {
  const n = Math.sin(q * 7.123 + r * 3.331) * 9999.1337;
  return n - Math.floor(n); // 0–1
}
// Generate N random tectonic plate centers
function generatePlateCenters(cols, rows, count = 6) {
  const plates = [];
  for (let i = 0; i < count; i++) {
    plates.push({
      id: i,
      q: Math.floor(Math.random() * cols),
      r: Math.floor(Math.random() * rows),
      type: Math.random() < 0.6 ? "continental" : "oceanic"
    });
  }
  return plates;
}
function assignPlates(hexes, plates, cols, rows) {
  for (let r = 0; r < rows; r++) {
    for (let q = 0; q < cols; q++) {
      let best = null;
      let bestDist = Infinity;

      for (const p of plates) {
        const dq = p.q - q;
        const dr = p.r - r;
        const dist = dq * dq + dr * dr;

        if (dist < bestDist) {
          bestDist = dist;
          best = p;
        }
      }

      hexes[r][q].plate = best.id;
      hexes[r][q].plateType = best.type;
    }
  }
}
function detectBoundaries(hexes, cols, rows) {
  for (let r = 0; r < rows; r++) {
    for (let q = 0; q < cols; q++) {
      const hex = hexes[r][q];
      const neighbors = getNeighbors(q, r, cols, rows);

      hex.boundary = "none";

      for (const n of neighbors) {
        const other = hexes[n.r][n.q];

        if (other.plate !== hex.plate) {
          // Simple rule: continental vs continental = mountains
          if (hex.plateType === "continental" && other.plateType === "continental") {
            hex.boundary = "convergent";
          }
          // oceanic vs continental = rift or trench
          else if (hex.plateType !== other.plateType) {
            hex.boundary = "divergent";
          }
          // fallback
          else {
            hex.boundary = "transform";
          }
        }
      }
    }
  }
}
function applyTectonics(hexes, cols, rows) {
  for (let r = 0; r < rows; r++) {
    for (let q = 0; q < cols; q++) {
      const hex = hexes[r][q];

      if (hex.boundary === "convergent") {
        // mountain uplift
        hex.elevationValue = Math.min(1, hex.elevationValue + 0.35);
      }

      if (hex.boundary === "divergent") {
        // rift valley
        hex.elevationValue = Math.max(0, hex.elevationValue - 0.25);
      }

      if (hex.boundary === "transform") {
        // rough terrain
        hex.elevationValue += (noise(q, r) - 0.5) * 0.1;
      }
    }
  }
}

// Simple deterministic noise based on q, r
function noise(q, r) {
  const n = Math.sin(q * 12.9898 + r * 78.233) * 43758.5453;
  return n - Math.floor(n); // 0–1
}

// Convert row index into a latitude value from -1 (south pole) to +1 (north pole)
function latitudeFromRow(r, rows) {
  return (r / (rows - 1)) * 2 - 1;
}

const HEX_COLORS = {
  "tropical rainforest": "#1b8a3d",
  "temperate forest": "#2e9c5d",
  "monsoon forest": "#3cb371",
  "wetlands": "#4cc9f0",
  "tundra": "#d8e3e7",
  "desert": "#e9c46a",
  "alpine": "#bfc0c0",
  "mixed": "#999999",
  "ocean": "#003f5c",
  "coast": "#2f4b7c",

};

const COAST_THRESHOLD = 0.42; // tweak for more/less land

// Axial hex directions (pointy-top)
const HEX_DIRS = [
  { q: +1, r: 0 },
  { q: +1, r: -1 },
  { q: 0, r: -1 },
  { q: -1, r: 0 },
  { q: -1, r: +1 },
  { q: 0, r: +1 }
];

function getNeighbors(q, r, cols, rows) {
  const neighbors = [];
  for (const d of HEX_DIRS) {
    const nq = q + d.q;
    const nr = r + d.r;
    if (nq >= 0 && nq < cols && nr >= 0 && nr < rows) {
      neighbors.push({ q: nq, r: nr });
    }
  }
  return neighbors;
}

// Classify elevation from 0–1 into terrain bands
function classifyElevation(e) {
  if (e < 0.25) return "ocean";
  if (e < COAST_THRESHOLD) return "coast";
  if (e < 0.6) return "plains";
  if (e < 0.8) return "hills";
  return "mountains";
}

// Biome picker with latitude + elevation
function pickBiome(lm, we, tr, hy, q, r, rows, elevationBand) {
  const climate = lm.primary.toLowerCase();
  const winds = we.primary.toLowerCase();
  const water = hy.primary.toLowerCase();
  const tect = tr.primary.toLowerCase();

  const n = noise(q + 100, r + 200); // separate noise channel
  const lat = latitudeFromRow(r, rows); // -1 to +1

  // --- BASE BIOME FROM LATITUDE ---
  let biome;

  // Polar caps
  if (lat > 0.75 || lat < -0.75) {
    biome = n < 0.5 ? "tundra" : "alpine";
  }
  // Subpolar
  else if (lat > 0.55 || lat < -0.55) {
    biome = n < 0.4 ? "tundra" : "temperate forest";
  }
  // Temperate
  else if (lat > 0.25 || lat < -0.25) {
    biome = n < 0.5 ? "temperate forest" : "mixed";
  }
  // Tropics
  else {
    biome = n < 0.6 ? "tropical rainforest" : "monsoon forest";
  }

  // --- CLIMATE MODIFIERS ---
  if (climate.includes("hot")) biome = "tropical rainforest";
  if (climate.includes("cold")) biome = "tundra";
  if (climate.includes("ice")) biome = "tundra";
  if (climate.includes("greenhouse")) biome = "tropical rainforest";

  // --- ELEVATION MODIFIERS ---
  if (elevationBand === "mountains") biome = "alpine";
  if (elevationBand === "hills" && biome === "temperate forest" && n > 0.5)
    biome = "mixed";
  if (elevationBand === "ocean") return "ocean";
  if (elevationBand === "coast") {
    // coastal wetlands or mangroves
    if (lat > -0.25 && lat < 0.25) return "wetlands";
    return "temperate forest";
  }

  // --- HYDROLOGY MODIFIERS ---
  if (water.includes("sparse") && elevationBand !== "ocean" && n > 0.4)
    biome = "desert";

  if (water.includes("wetland") && elevationBand !== "mountains" && n < 0.7)
    biome = "wetlands";

  if (water.includes("lake") && elevationBand === "coast" && n < 0.5)
    biome = "wetlands";

  // --- TECTONIC MODIFIERS ---
  if (tect.includes("mountain") && elevationBand === "mountains")
    biome = "alpine";

  if (tect.includes("rift") && elevationBand === "plains" && n > 0.6)
    biome = "desert";

  return biome;
}

function findDownhill(q, r, hexes, cols, rows) {
  const current = hexes[r][q];
  let lowest = current;
  let target = null;

  const neighbors = getNeighbors(q, r, cols, rows);

  for (const n of neighbors) {
    const neighbor = hexes[n.r][n.q];
    if (neighbor.elevationValue < lowest.elevationValue) {
      lowest = neighbor;
      target = neighbor;
    }
  }

  return target; // null if no lower neighbor
}

export function generateHexMap(decoded) {
  const { lm, we, tr, hy } = decoded;

  const cols = 16;
  const rows = 12;
  const hexes = [];

  // First pass: elevation + biome
  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let q = 0; q < cols; q++) {
      // elevation noise (0–1)
      const e = noise(q * 1.37, r * 2.11);
      // landmass noise (big shapes)
      const ln = landNoise(q * 0.7, r * 0.7);
      
      // blend elevation + landmass
      const blended = (e * 0.6) + (ln * 0.4);
      
      // determine land/sea
      let elevationBand;
      if (blended < COAST_THRESHOLD - 0.1) elevationBand = "ocean";
      else if (blended < COAST_THRESHOLD) elevationBand = "coast";
      else elevationBand = classifyElevation(e);


      const biome = pickBiome(lm, we, tr, hy, q, r, rows, elevationBand);

      row.push({
        q,
        r,
        biome,
        elevation: elevationBand,
        elevationValue: e,
        river: 0
      });
    }
    hexes.push(row);
  }

  // Second pass: river simulation
  for (let r = 0; r < rows; r++) {
    for (let q = 0; q < cols; q++) {
      const hex = hexes[r][q];

      // Only start rivers in hills/mountains
      if (hex.elevation === "hills" || hex.elevation === "mountains") {
        let current = hex;

        // Add initial flow
        current.river = (current.river || 0) + 1;

        // Follow downhill path
        while (true) {
          const next = findDownhill(current.q, current.r, hexes, cols, rows);
          if (!next) break; // no downhill path

          next.river = (next.river || 0) + 1;

          // Stop if we reach ocean or coast
          if (next.elevation === "ocean" || next.elevation === "coast") break;

          current = next;
        }
      }
    }
  }

  return { cols, rows, hexes };
}

export function renderHexMap(hexMap) {
  const canvas = document.getElementById("hexMapCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const { cols, rows, hexes } = hexMap;

  const size = 18; // hex radius
  const w = Math.sqrt(3) * size;
  const h = 2 * size * 0.75;

  canvas.width = cols * w + w;
  canvas.height = rows * h + h;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.lineWidth = 1;
  ctx.strokeStyle = "#222";

  // Draw hex biomes
  for (let r = 0; r < rows; r++) {
    for (let q = 0; q < cols; q++) {
      const hex = hexes[r][q];
      const biome = hex.biome;
      const color = HEX_COLORS[biome] || "#555";

      const x = q * w + (r % 2 ? w / 2 : 0) + w;
      const y = r * h + h;

      drawHex(ctx, x, y, size, color);
    }
  }

  // Draw rivers on top
  for (let r = 0; r < rows; r++) {
    for (let q = 0; q < cols; q++) {
      const hex = hexes[r][q];
      if (hex.river && hex.river > 1) {
        const x = q * w + (r % 2 ? w / 2 : 0) + w;
        const y = r * h + h;

        ctx.beginPath();
        ctx.fillStyle = hex.river > 3 ? "#1e90ff" : "#4cc9f0";
        ctx.arc(x, y, Math.min(4, hex.river), 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}

function drawHex(ctx, x, y, size, fill) {
  const angle = Math.PI / 3;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const px = x + size * Math.cos(angle * i);
    const py = y + size * Math.sin(angle * i);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.stroke();
}
