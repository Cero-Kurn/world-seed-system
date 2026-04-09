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
