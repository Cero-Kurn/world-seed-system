export function generateContinentSummary(decoded) {
  const { cc, tr, lm, we } = decoded;

  const ccText = cc.primary.charAt(0).toLowerCase() + cc.primary.slice(1);
  const trText = tr.primary.toLowerCase();
  const lmText = lm.primary.toLowerCase();
  const weText = we.primary.toLowerCase();

  return `
    <p>This world features ${ccText}, shaped by ${trText} tectonics.</p>
    <p>The climate follows ${lmText}, and prevailing winds are ${weText}.</p>
    <p>Together, these forces define the broad outline of the continent.</p>
  `;
}
