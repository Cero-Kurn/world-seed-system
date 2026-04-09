export function generateWorldSummary(decoded) {
  const { cc, lm, we, tr, hy, sf } = decoded;

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
      This world features ${cc.primary.toLowerCase()} shaped by ${tr.primary.toLowerCase()}.
      Its climate follows ${lm.primary.toLowerCase()}, while ${we.primary.toLowerCase()} winds
      sculpt moisture patterns across the land. Hydrology is dominated by
      ${hy.primary.toLowerCase()}, and the landscape is marked by
      ${sf.primary.toLowerCase()} as a defining feature.
    </p>
  `;
}
