// seedGenerator.js
// Generates a 12‑character seed: 6 primary + 6 secondary

export function generateSeed() {
  // Allowed characters for both primary and secondary traits
  const chars = "123456789ABC";

  // Generate 6 primary characters
  const primary = Array.from({ length: 12 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");

  // Generate 6 secondary characters
  const secondary = Array.from({ length: 12 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");

  // Return in a readable format
  return `${primary}-${secondary}`;
}
