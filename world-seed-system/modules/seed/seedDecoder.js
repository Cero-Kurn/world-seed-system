import {
  CC_TABLE, LM_TABLE, WE_TABLE, TR_TABLE, HY_TABLE, SF_TABLE
} from "./lookupTables.js";

import {
  CC_SECONDARY, LM_SECONDARY, WE_SECONDARY,
  TR_SECONDARY, HY_SECONDARY, SF_SECONDARY
} from "./secondaryTables.js";

export function decodeSeed(seed) {
  const clean = seed.replace(/[^A-Za-z0-9]/g, "").toUpperCase();

  if (clean.length < 12) {
    throw new Error("Seed must be 12 characters (6 primary + 6 secondary)");
  }

  const [CC1, LM1, WE1, TR1, HY1, SF1, CC2, LM2, WE2, TR2, HY2, SF2] = clean;

  return {
    cc: { code: CC1, primary: CC_TABLE[CC1], secondary: CC_SECONDARY[CC2], "Continental Configuration" },
    lm: { code: LM1, primary: LM_TABLE[LM1], secondary: LM_SECONDARY[LM2], "Latitude & Temperature Model" },
    we: { code: WE1, primary: WE_TABLE[WE1], secondary: WE_SECONDARY[WE2], "Wind & Rainfall Model" },
    tr: { code: TR1, primary: TR_TABLE[TR1], secondary: TR_SECONDARY[TR2], "Tectonic & Elevation Model" },
    hy: { code: HY1, primary: HY_TABLE[HY1], secondary: HY_SECONDARY[HY2], "Hydrology Model" },
    sf: { code: SF1, primary: SF_TABLE[SF1], secondary: SF_SECONDARY[SF2], "Special Features Model" }
  };
}


