import parseCSVDate from '@libs/CSVDateUtils';

describe('CSVDateUtils', () => {
    describe('parseCSVDate', () => {
        it('parses common date formats to yyyy-MM-dd', () => {
            // `2024-01-15` is the canary for the UTC-midnight regression: a buggy
            // implementation that runs `new Date('2024-01-15')` before the explicit
            // yyyy-MM-dd format would round-trip to `2024-01-14` in any zone west of UTC.
            expect(parseCSVDate('2024-01-15')).toBe('2024-01-15');
            expect(parseCSVDate('01/20/2024')).toBe('2024-01-20');
            expect(parseCSVDate('20-01-2024')).toBe('2024-01-20');
            expect(parseCSVDate('Jan 25, 2024')).toBe('2024-01-25');
        });

        it('returns null for invalid input', () => {
            expect(parseCSVDate('not a date')).toBeNull();
            expect(parseCSVDate('')).toBeNull();
        });
    });
});
