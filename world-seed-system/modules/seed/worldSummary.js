export function generateWorldSummary(decoded) {
  const [CC1, LM1, WE1, TR1, HY1, SF1, CC2, LM2, WE2, TR2, HY2, SF2] = clean;

  const combo = (item) => {
    if (item.primary === item.twist) return item.primary;
    return `${item.primary}, with a twist of ${item.twist.toLowerCase()}`;
  };

  return `
    <p><strong>Continental Layout:</strong> ${combo(cc)}.</p>
    <p><strong>Climate:</strong> ${combo(lm)}.</p>
    <p><strong>Wind & Rainfall:</strong> ${combo(we)}.</p>
    <p><strong>Tectonics:</strong> ${combo(tr)}.</p>
    <p><strong>Hydrology:</strong> ${combo(hy)}.</p>
    <p><strong>Special Features:</strong> ${combo(sf)}.</p>

    <p style="margin-top:1rem;">
      This world features ${trait.primary} — ${trait.secondary} shaped by ${tr.primary.toLowerCase()}.
      Its climate follows ${lm.primary.toLowerCase()}, while ${we.primary.toLowerCase()} winds
      sculpt moisture patterns across the land. Hydrology is dominated by
      ${hy.primary.toLowerCase()}, and the landscape is marked by
      ${sf.primary.toLowerCase()} as a defining feature.
    </p>
  `;
}
