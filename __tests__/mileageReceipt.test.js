// @flow
import {formatDistance, formatTotalAmount, getMileageReceiptData} from '../src/libs/mileageReceipt';

describe('Mileage receipt helpers', () => {
    const expenseUS = {
        distance: 12.5,
        rate: 0.58,
        amount: 7.25,
        currency: 'USD',
    };

    const expenseMetric = {
        distance: 20,
        rate: 0.45,
        amount: 9,
        currency: 'METRIC',
    };

    test('formatDistance uses miles by default', () => {
        expect(formatDistance(expenseUS)).toBe('12.5 mi');
    });

    test('formatDistance switches to km for metric currency', () => {
        expect(formatDistance(expenseMetric)).toBe('20 km');
    });

    test('formatTotalAmount formats USD correctly', () => {
        // Intl may add locale‑specific spacing; we only assert it contains the amount
        const formatted = formatTotalAmount(expenseUS);
        expect(formatted).toMatch(/\$7\.25/);
    });

    test('formatTotalAmount falls back to USD when currency missing', () => {
        const noCurrency = {...expenseUS, currency: undefined};
        const formatted = formatTotalAmount(noCurrency);
        expect(formatted).toMatch(/\$7\.25/);
    });

    test('getMileageReceiptData aggregates correctly', () => {
        const data = getMileageReceiptData(expenseUS);
        expect(data).toEqual({
            distance: '12.5 mi',
            totalAmount: expect.stringContaining('7.25'),
            rate: 0.58,
        });
    });
});
