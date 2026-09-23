/**
 * Utility functions for formatting currency and distance values.
 */

export const formatCurrency = (amount) => {
  if (typeof amount !== 'number') return '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatDistance = (distanceKm) => {
  if (typeof distanceKm !== 'number') return '-';
  // Convert km to miles for display (1 km ≈ 0.621371 miles)
  const miles = distanceKm * 0.621371;
  return `${miles.toFixed(1)} mi`;
};
