export const money = (n: number | string) =>
  `$${Number(n).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

export const titleCase = (s: string) =>
  (s || "").replace(/(^|[\s-])\S/g, (c) => c.toUpperCase());

export const cityFrom = (addr: string) => {
  if (!addr) return "Texas";
  const parts = addr.split(",").map((p) => p.trim());
  return parts.length >= 2 ? parts.slice(1, 3).join(", ") : addr;
};
