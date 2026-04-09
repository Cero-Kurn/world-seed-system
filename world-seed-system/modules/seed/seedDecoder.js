import { CC_TABLE, LM_TABLE, WE_TABLE, TR_TABLE, HY_TABLE, SF_TABLE } from "./lookupTables.js";

export function decodeSeed(seedStr) {
  const parts = seedStr.trim().toUpperCase().split("-");
  if (parts.length !== 6) {
    throw new Error("Seed must have 6 parts: CC-LM-WE-TR-HY-SF");
  }

  const [cc, lm, we, tr, hy, sf] = parts;

  const decodePair = (pair, table, label) => {
    const a = pair[0];
    const b = pair[1];
    const descA = table[a] || `Unknown (${a})`;
    const descB = table[b] || `Unknown (${b})`;
    return { label, code: pair, primary: descA, twist: descB };
  };

  return {
    cc: decodePair(cc, CC_TABLE, "Continental Configuration"),
    lm: decodePair(lm, LM_TABLE, "Latitude & Temperature Model"),
    we: decodePair(we, WE_TABLE, "Wind & Rainfall Model"),
    tr: decodePair(tr, TR_TABLE, "Tectonic & Elevation Model"),
    hy: decodePair(hy, HY_TABLE, "Hydrology Model"),
    sf: decodePair(sf, SF_TABLE, "Special Features Model"),
  };
}
