export const calculateShipping = (subtotal: number, country: string): number => {
  const normalizedCountry = country.trim().toLowerCase();

  if (subtotal >= 100) {
    return 0;
  }

  if (
    normalizedCountry === "españa" ||
    normalizedCountry === "spain"
  ) {
    return 5.99;
  }

  return 15.99;
};