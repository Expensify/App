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

        it('parses two-digit years into the 2000s window', () => {
            expect(parseCSVDate('01/15/25')).toBe('2025-01-15');
            expect(parseCSVDate('9/8/25')).toBe('2025-09-08');
            expect(parseCSVDate('12/31/99')).toBe('1999-12-31');
            expect(parseCSVDate('08-09-25')).toBe('2025-08-09');
            expect(parseCSVDate('2 Nov 25')).toBe('2025-11-02');
        });

        it('still reads a four-digit year when a two-digit format could have matched', () => {
            expect(parseCSVDate('01/15/2025')).toBe('2025-01-15');
            expect(parseCSVDate('08-09-2025')).toBe('2025-08-09');
            expect(parseCSVDate('2 Nov 2025')).toBe('2025-11-02');
        });

        it('returns null for invalid input', () => {
            expect(parseCSVDate('not a date')).toBeNull();
            expect(parseCSVDate('')).toBeNull();
        });
    });
});
