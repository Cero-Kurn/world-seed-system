import { CC_TABLE, LM_TABLE, WE_TABLE, TR_TABLE, HY_TABLE, SF_TABLE } from "./lookupTables.js";

import { CC_SECONDARY, LM_SECONDARY, WE_SECONDARY, TR_SECONDARY, HY_SECONDARY, SF_SECONDARY } from "./secondaryTables.js";

function randomKey(table) {
  const keys = Object.keys(table);
  return keys[Math.floor(Math.random() * keys.length)];
}

export function generateRandomSeed() {
  const cc = randomKey(CC_TABLE) + randomKey(CC_TABLE);
  const lm = randomKey(LM_TABLE) + randomKey(LM_TABLE);
  const we = randomKey(WE_TABLE) + randomKey(WE_TABLE);
  const tr = randomKey(TR_TABLE) + randomKey(TR_TABLE);
  const hy = randomKey(HY_TABLE) + randomKey(HY_TABLE);
  const sf = randomKey(SF_TABLE) + randomKey(SF_TABLE);
  return `${cc}-${lm}-${we}-${tr}-${hy}-${sf}`;
}
export function generateSeed() {
  const chars = "123456789ABC";

  const primary = Array.from({ length: 6 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");

  const secondary = Array.from({ length: 6 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");

  return `${primary}-${secondary}`;
}
