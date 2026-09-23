/**
 * Utility helpers for formatting numbers, currencies, and distances.
 */

export const formatCurrency = (amountCents: number, currency: string = 'USD'): string => {
    const amount = amountCents / 100;
    return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency,
    }).format(amount);
};

export const formatDistance = (distance: number, unit: 'mi' | 'km' = 'mi'): string => {
    // Keep one decimal place for readability (e.g., 12.3 mi)
    return `${distance.toFixed(1)} ${unit}`;
};
