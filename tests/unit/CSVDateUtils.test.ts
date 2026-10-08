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
            expect(parseCSVDate('20251102')).toBe('2025-11-02');
        });

        it('parses two-digit years as 19xx or 20xx', () => {
            // Given dates with a two-digit year, which is Excel's default short-date format on US locales.
            // date-fns's `yyyy` token matches 1-4 digits, so these must match a `yy` format before any `yyyy` format.
            // When they are parsed
            // Then the year is in this century and the month and day are not swapped
            expect(parseCSVDate('01/20/24')).toBe('2024-01-20');
            expect(parseCSVDate('11/2/25')).toBe('2025-11-02');
            expect(parseCSVDate('11-02-25')).toBe('2025-11-02');
            expect(parseCSVDate('Nov 2, 25')).toBe('2025-11-02');
            expect(parseCSVDate('2 Nov 25')).toBe('2025-11-02');
            expect(parseCSVDate('20/01/24')).toBe('2024-01-20');
        });

        it('parses two-digit years when native Date parsing rejects them, as Hermes does', () => {
            // Given a Date constructor that rejects every string, like Hermes does for strings that are not ISO 8601
            const NativeDate = Date;
            const dateSpy = jest.spyOn(global, 'Date').mockImplementation((value?: string | number | Date) => {
                if (typeof value === 'string') {
                    return new NativeDate(Number.NaN);
                }
                return value === undefined ? new NativeDate() : new NativeDate(value);
            });

            // When dates with a two-digit year are parsed, along with a three-digit year that only a `yyyy` format matches
            const results = ['01/20/24', '11-02-25', 'Nov 2, 25', '2 Nov 25', '20/01/24', '01/20/24 10:30', 'Nov 2, 025'].map(parseCSVDate);
            dateSpy.mockRestore();

            // Then the date-fns formats give the right year without native parsing, and a year below 1000 is rejected instead of saved
            expect(results).toEqual(['2024-01-20', '2025-11-02', '2025-11-02', '2025-11-02', '2024-01-20', '2024-01-20', null]);
        });

        it('handles out-of-range ISO dates the same way as native parsing', () => {
            // Given ISO dates that native parsing either rolls over or rejects
            // When they are parsed in local time
            // Then days past the end of the month roll over, and invalid months and days are still rejected
            expect(parseCSVDate('2026-02-30')).toBe('2026-03-02');
            expect(parseCSVDate('2026-04-31')).toBe('2026-05-01');
            expect(parseCSVDate('2026-13-01')).toBeNull();
            expect(parseCSVDate('2026-00-05')).toBeNull();
            expect(parseCSVDate('2026-01-00')).toBeNull();
        });

        it('parses the ISO date at the start of a longer value', () => {
            // Given an ISO date followed by text that native parsing rejects
            // When it is parsed
            // Then the first 10 characters are used as the date
            expect(parseCSVDate('2024-01-15 posted')).toBe('2024-01-15');
        });

        it('parses Excel date serial numbers', () => {
            // XLSX date cells arrive as serial numbers counted from 1900-01-01, offset by Excel's phantom 1900-02-29.
            // These are formatted in local time, so a `toISOString()`-based implementation would report the previous
            // day east of UTC. The suite runs under TZ=utc, so only the values themselves are asserted here.
            expect(parseCSVDate('45678')).toBe('2025-01-21');
            expect(parseCSVDate('45658')).toBe('2025-01-01');
            expect(parseCSVDate('44927')).toBe('2023-01-01');
        });

        it('does not treat a year-only value as an Excel serial number', () => {
            // Only 5-digit values are serial numbers, so `2025` stays a year instead of becoming 1905-07-09.
            expect(parseCSVDate('2025')).toBe('2025-01-01');
        });

        it('returns null for invalid input', () => {
            expect(parseCSVDate('not a date')).toBeNull();
            expect(parseCSVDate('')).toBeNull();
        });
    });
});
