interface ShippingItem {
  quantity: number;
  weight?: number;
  width?: number;
  height?: number;
  depth?: number;
}

export const calculateShipping = (
  items: ShippingItem[],
  country: string,
): number => {
  const normalizedCountry = country.trim().toLowerCase();

  let totalWeight = 0;

  let totalVolume = 0;

  for (const item of items) {
    const quantity = Number(item.quantity || 1);

    const weight = Number(item.weight || 0);

    const width = Number(item.width || 0);
    const height = Number(item.height || 0);
    const depth = Number(item.depth || 0);

    totalWeight += weight * quantity;

    totalVolume += width * height * depth * quantity;
  }

  // gramos -> kg
  const weightKg = totalWeight / 1000;

  const isSpain =
    normalizedCountry === "españa" || normalizedCountry === "spain";

  // ESPAÑA
  if (isSpain) {
    if (weightKg <= 0.5) return 5.99;
    if (weightKg <= 1) return 6.99;
    if (weightKg <= 2) return 8.99;
    if (weightKg <= 5) return 10.99;

    return 14.99;
  }

  // EUROPA
  if (weightKg <= 0.5) return 15.99;
  if (weightKg <= 1) return 16.99;
  if (weightKg <= 2) return 20.99;
  if (weightKg <= 5) return 28.99;

  return 39.99;
};
