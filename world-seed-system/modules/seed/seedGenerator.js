import { CC_TABLE, LM_TABLE, WE_TABLE, TR_TABLE, HY_TABLE, SF_TABLE } from "./lookupTables.js";
import { CC_SECONDARY, LM_SECONDARY, TR_SECONDARY, HY_SECONDARY, SF_SECONDARY } from "./secondaryTables.js";

function randomKey(table) {
  const keys = Object.keys(table);
  return keys[Math.floor(Math.random() * keys.length)];
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

