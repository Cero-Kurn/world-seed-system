// seedDecoder.js
// Decodes a 12‑character seed into primary + secondary world traits

import {
  CC_TABLE,
  LM_TABLE,
  WE_TABLE,
  TR_TABLE,
  HY_TABLE,
  SF_TABLE
} from "./lookupTables.js";

import {
  CC_SECONDARY,
  LM_SECONDARY,
  WE_SECONDARY,
  TR_SECONDARY,
  HY_SECONDARY,
  SF_SECONDARY
} from "./secondaryTables.js";

export function decodeSeed(seed) {
  // Remove hyphens, spaces, lowercase, etc.
  const clean = seed.replace(/[^A-Za-z0-9]/g, "").toUpperCase();

  if (clean.length < 12) {
    throw new Error("Seed must be 12 characters (6 primary + 6 secondary).");
  }

  // Primary characters
  const CC1 = clean[0];
  const LM1 = clean[1];
  const WE1 = clean[2];
  const TR1 = clean[3];
  const HY1 = clean[4];
  const SF1 = clean[5];

  // Secondary characters
  const CC2 = clean[6];
  const LM2 = clean[7];
  const WE2 = clean[8];
  const TR2 = clean[9];
  const HY2 = clean[10];
  const SF2 = clean[11];

  return {
    cc: {
      code: CC1,
      primary: CC_TABLE[CC1] || `Unknown (${CC1}, "Continental Configuration")`,
      secondary: CC_SECONDARY[CC2] || `Unknown (${CC2}, "Latitude & Temperature Model")`
    },

    lm: {
      code: LM1,
      primary: LM_TABLE[LM1] || `Unknown (${LM1})`,
      secondary: LM_SECONDARY[LM2] || `Unknown (${LM2})`
    },

    we: {
      code: WE1,
      primary: WE_TABLE[WE1] || `Unknown (${WE1})`,
      secondary: WE_SECONDARY[WE2] || `Unknown (${WE2})`
    },

    tr: {
      code: TR1,
      primary: TR_TABLE[TR1] || `Unknown (${TR1})`,
      secondary: TR_SECONDARY[TR2] || `Unknown (${TR2})`
    },

    hy: {
      code: HY1,
      primary: HY_TABLE[HY1] || `Unknown (${HY1})`,
      secondary: HY_SECONDARY[HY2] || `Unknown (${HY2})`
    },

    sf: {
      code: SF1,
      primary: SF_TABLE[SF1] || `Unknown (${SF1})`,
      secondary: SF_SECONDARY[SF2] || `Unknown (${SF2})`
    }
  };
}
