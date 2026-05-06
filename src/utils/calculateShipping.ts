export const calculateShipping = (subtotal: number, country: string): number => {
  const normalizedCountry = country.trim().toLowerCase();

  if (subtotal >= 100) {
    return 0;
  }

  if (
    normalizedCountry === "españa" ||
    normalizedCountry === "spain"
  ) {
    return 4.99;
  }

  return 12.99;
};