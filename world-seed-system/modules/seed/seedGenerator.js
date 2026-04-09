// seedGenerator.js (or wherever this lives)
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

function randomKey(table) {
  const keys = Object.keys(table);
  return keys[Math.floor(Math.random() * keys.length)];
}

export function generateRandomSeed() {
  // primary chars
  const CC1 = randomKey(CC_TABLE);
  const LM1 = randomKey(LM_TABLE);
  const WE1 = randomKey(WE_TABLE);
  const TR1 = randomKey(TR_TABLE);
  const HY1 = randomKey(HY_TABLE);
  const SF1 = randomKey(SF_TABLE);

  // secondary chars
  const CC2 = randomKey(CC_SECONDARY);
  const LM2 = randomKey(LM_SECONDARY);
  const WE2 = randomKey(WE_SECONDARY);
  const TR2 = randomKey(TR_SECONDARY);
  const HY2 = randomKey(HY_SECONDARY);
  const SF2 = randomKey(SF_SECONDARY);

  const primary = `${CC1}${LM1}${WE1}${TR1}${HY1}${SF1}`;
  const secondary = `${CC2}${LM2}${WE2}${TR2}${HY2}${SF2}`;

  // matches decodeSeed (which strips non‑alphanumerics)
  return `${primary}-${secondary}`;
}
