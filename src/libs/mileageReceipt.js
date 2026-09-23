// @flow
/**
 * Helper utilities for generating mileage receipt data.
 *
 * The previous implementation relied on stale UI state which caused the
 * enlarged receipt view to display incorrect distance and total amount.
 * This module centralises the logic and guarantees that the values are
 * derived directly from the expense object.
 */

type Expense = {
    // The distance travelled in miles (or km depending on user settings)
    distance: number,
    // The rate applied per unit distance
    rate: number,
    // The total amount for the mileage line (may include tax)
    amount: number,
    // Optional: currency code (e.g., 'USD')
    currency?: string,
};

/**
 * Returns a formatted string for the distance (e.g., "12.5 mi").
 */
export function formatDistance(expense: Expense): string {
    const unit = expense.currency?.toUpperCase() === 'METRIC' ? 'km' : 'mi';
    // Ensure we keep up to two decimal places without trailing zeros
    const distance = Number(expense.distance).toFixed(2).replace(/\.?0+$/, '');
    return `${distance} ${unit}`;
}

/**
 * Returns the total amount formatted as a currency string.
 * Falls back to USD if no currency is supplied.
 */
export function formatTotalAmount(expense: Expense): string {
    const currency = expense.currency ?? 'USD';
    // Using Intl.NumberFormat for locale‑aware formatting
    const formatter = new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency,
    });
    return formatter.format(expense.amount);
}

/**
 * Consolidated data used by the receipt UI.
 */
export function getMileageReceiptData(expense: Expense) {
    return {
        distance: formatDistance(expense),
        totalAmount: formatTotalAmount(expense),
        rate: expense.rate,
    };
}
