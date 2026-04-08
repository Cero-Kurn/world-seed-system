// -----------------------------
// Noise Functions
// -----------------------------

// Simple deterministic noise based on q, r
function noise(q, r) {
  const n = Math.sin(q * 12.9898 + r * 78.233) * 43758.5453;
  return n - Math.floor(n);
}

// Landmass noise (big continental shapes)
function landNoise(q, r) {
  const n = Math.sin(q * 7.123 + r * 3.331) * 9999.1337;
  return n - Math.floor(n);
}

// Convert row index into a latitude value from -1 (south pole) to +1 (north pole)
function latitudeFromRow(r, rows) {
  return (r / (rows - 1)) * 2 - 1;
}

// -----------------------------
// Constants
// -----------------------------

const COAST_THRESHOLD = 0.42;

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
  "lake": "#4cc9f0",
  "inland sea": "#2f7fc1"
};

// -----------------------------
// Hex Grid Helpers
// -----------------------------

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
  // Offset neighbor logic (for pointy-top, odd-r)
  const parity = r & 1;
  const dirs = [
    [ {q: 1, r: 0}, {q: 1, r: -1}, {q: 0, r: -1}, {q: -1, r: 0}, {q: 0, r: 1}, {q: 1, r: 1} ], // Odd rows
    [ {q: 1, r: 0}, {q: 0, r: -1}, {q: -1, r: -1}, {q: -1, r: 0}, {q: -1, r: 1}, {q: 0, r: 1} ]  // Even rows
  ];

  for (const d of dirs[parity]) {
    const nq = q + d.q;
    const nr = r + d.r;
    if (nq >= 0 && nq < cols && nr >= 0 && nr < rows) {
      neighbors.push({ q: nq, r: nr });
    }
  }
  return neighbors;
}

// -----------------------------
// Elevation Classification
// -----------------------------

function classifyElevation(e) {
  if (e < 0.25) return "ocean";
  if (e < COAST_THRESHOLD) return "coast";
  if (e < 0.6) return "plains";
  if (e < 0.8) return "hills";
  return "mountains";
}

// -----------------------------
// Tectonic Plates (Simple Version)
// -----------------------------

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
          if (hex.plateType === "continental" && other.plateType === "continental") {
            hex.boundary = "convergent";
          } else if (hex.plateType !== other.plateType) {
            hex.boundary = "divergent";
          } else {
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
        hex.elevationValue = Math.min(1, hex.elevationValue + 0.35);
      }

      if (hex.boundary === "divergent") {
        hex.elevationValue = Math.max(0, hex.elevationValue - 0.25);
      }

      if (hex.boundary === "transform") {
        hex.elevationValue += (noise(q, r) - 0.5) * 0.1;
      }
    }
  }
}

// -----------------------------
// Biome Selection
// -----------------------------

function pickBiome(lm, we, tr, hy, q, r, rows, elevationBand) {
  const climate = lm.primary.toLowerCase();
  const winds = we.primary.toLowerCase();
  const water = hy.primary.toLowerCase();
  const tect = tr.primary.toLowerCase();

  const n = noise(q + 100, r + 200);
  const lat = latitudeFromRow(r, rows);

  // Oceans & coasts override everything
  if (elevationBand === "ocean") return "ocean";
  if (elevationBand === "coast") {
    if (lat > -0.25 && lat < 0.25) return "wetlands";
    return "temperate forest";
  }

  // Latitude bands
  let biome;
  if (lat > 0.75 || lat < -0.75) biome = n < 0.5 ? "tundra" : "alpine";
  else if (lat > 0.55 || lat < -0.55) biome = n < 0.4 ? "tundra" : "temperate forest";
  else if (lat > 0.25 || lat < -0.25) biome = n < 0.5 ? "temperate forest" : "mixed";
  else biome = n < 0.6 ? "tropical rainforest" : "monsoon forest";

  // Climate modifiers
  if (climate.includes("hot")) biome = "tropical rainforest";
  if (climate.includes("cold")) biome = "tundra";
  if (climate.includes("ice")) biome = "tundra";
  if (climate.includes("greenhouse")) biome = "tropical rainforest";

  // Elevation modifiers
  if (elevationBand === "mountains") biome = "alpine";
  if (elevationBand === "hills" && biome === "temperate forest" && n > 0.5)
    biome = "mixed";

  // Hydrology modifiers
  if (water.includes("sparse") && n > 0.4) biome = "desert";
  if (water.includes("wetland") && n < 0.7) biome = "wetlands";

  // Tectonic modifiers
  if (tect.includes("mountain") && elevationBand === "mountains") biome = "alpine";
  if (tect.includes("rift") && elevationBand === "plains" && n > 0.6) biome = "desert";

  return biome;
}

// -----------------------------
// River Simulation
// -----------------------------

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

  return target;
}
// -----------------------------
// Lake Detection Helpers
// -----------------------------

function drainsToOcean(q, r, hexes, cols, rows, visited = new Set()) {
  const key = `${q},${r}`;
  if (visited.has(key)) return false;
  visited.add(key);

  const hex = hexes[r][q];

  if (hex.elevation === "ocean" || hex.elevation === "coast") {
    return true;
  }

  const neighbors = getNeighbors(q, r, cols, rows);

  for (const n of neighbors) {
    const next = hexes[n.r][n.q];
    if (next.elevationValue < hex.elevationValue) {
      if (drainsToOcean(n.q, n.r, hexes, cols, rows, visited)) {
        return true;
      }
    }
  }

  return false;
}

function floodFillBasin(q, r, hexes, cols, rows, threshold = 0.55) {
  const stack = [{ q, r }];
  const basin = [];
  const visited = new Set();

  while (stack.length > 0) {
    const { q, r } = stack.pop();
    const key = `${q},${r}`;
    if (visited.has(key)) continue;
    visited.add(key);

    const hex = hexes[r][q];
    if (hex.elevationValue > threshold) continue;

    basin.push(hex);

    const neighbors = getNeighbors(q, r, cols, rows);
    for (const n of neighbors) {
      stack.push({ q: n.q, r: n.r });
    }
  }

  return basin;
}

function isWaterBiome(biome) {
  return biome === "ocean" || biome === "wetlands";
}
// -----------------------------
// Main Map Generation
// -----------------------------

export function generateHexMap(decoded) {
  const { lm, we, tr, hy } = decoded;

  const cols = 16;
  const rows = 12;
  const hexes = [];

  // FIRST PASS: base elevation + landmass
  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let q = 0; q < cols; q++) {
      const e = noise(q * 1.37, r * 2.11);
      const ln = landNoise(q * 0.7, r * 0.7);
      const blended = (e * 0.6) + (ln * 0.4);

      row.push({
        q,
        r,
        elevationValue: blended,
        plate: null,
        plateType: null,
        boundary: "none",
        river: 0,
        biome: "mixed",
        elevation: "plains"
      });
    }
    hexes.push(row);
  }

  // SECOND PASS: tectonics
  const plates = generatePlateCenters(cols, rows);
  assignPlates(hexes, plates, cols, rows);
  detectBoundaries(hexes, cols, rows);
  applyTectonics(hexes, cols, rows);

  // THIRD PASS: classify elevation + biome
  for (let r = 0; r < rows; r++) {
    for (let q = 0; q < cols; q++) {
      const hex = hexes[r][q];

      const elevationBand = classifyElevation(hex.elevationValue);
      hex.elevation = elevationBand;

      hex.biome = pickBiome(lm, we, tr, hy, q, r, rows, elevationBand);
    }
  }

  // FOURTH PASS: rivers
  for (let r = 0; r < rows; r++) {
    for (let q = 0; q < cols; q++) {
      const hex = hexes[r][q];

      if (hex.elevation === "hills" || hex.elevation === "mountains") {
        let current = hex;
        current.river = (current.river || 0) + 1;

        while (true) {
          const next = findDownhill(current.q, current.r, hexes, cols, rows);
          if (!next) break;

          next.river = (next.river || 0) + 1;

          if (next.elevation === "ocean" || next.elevation === "coast") break;

          current = next;
        }
      }
    }
  }

  // FIFTH PASS: lakes & inland seas
  for (let r = 0; r < rows; r++) {
    for (let q = 0; q < cols; q++) {
      const hex = hexes[r][q];
  
      if (hex.elevation === "ocean" || hex.elevation === "coast") continue;
  
      if (drainsToOcean(q, r, hexes, cols, rows)) continue;
  
      const basin = floodFillBasin(q, r, hexes, cols, rows);
  
      // Base classification
      if (basin.length > 20) {
        for (const h of basin) h.biome = "ocean"; // inland sea
      } else if (basin.length > 6) {
        for (const h of basin) h.biome = "wetlands";
      } else {
        for (const h of basin) h.biome = "wetlands"; // small lakes
      }
  
      // Hydrology influence
      if (hy.primary.includes("Lake")) {
        if (basin.length > 4) for (const h of basin) h.biome = "wetlands";
      }
  
      if (hy.primary.includes("Inland")) {
        if (basin.length > 10) for (const h of basin) h.biome = "ocean";
      }
  
      if (hy.primary.includes("Wetland")) {
        for (const h of basin) h.biome = "wetlands";
      }
    }
  }

  // SIXTH PASS: lake & inland sea shorelines
  for (let r = 0; r < rows; r++) {
    for (let q = 0; q < cols; q++) {
      const hex = hexes[r][q];

      if (isWaterBiome(hex.biome)) continue;

      const neighbors = getNeighbors(q, r, cols, rows);
      let touchesWater = false;

      for (const n of neighbors) {
        const nb = hexes[n.r][n.q];
        if (isWaterBiome(nb.biome)) {
          touchesWater = true;
          break;
        }
      }

      if (touchesWater) {
        if (hex.biome === "tropical rainforest") hex.biome = "wetlands";
        else if (hex.biome === "temperate forest") hex.biome = "mixed";
        else if (hex.biome === "desert") hex.biome = "mixed";
        else if (hex.biome === "tundra") hex.biome = "wetlands";
        else hex.biome = "mixed";
      }
    }
  }

  return { cols, rows, hexes };
}

// -----------------------------
// Rendering
// -----------------------------

export function renderHexMap(hexMap) {
  const canvas = document.getElementById("hexMapCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const { cols, rows, hexes } = hexMap;

  const size = 18;
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
      const color = HEX_COLORS[hex.biome] || "#555";

      const x = q * w + (r % 2 ? w / 2 : 0) + w;
      const y = r * h + h;

      drawHex(ctx, x, y, size, color);
    }
  }

  // Draw rivers
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
