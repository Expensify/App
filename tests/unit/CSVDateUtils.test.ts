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

        it('parses two-digit years into the current century instead of years 1-99', () => {
            // Given CSV dates with two-digit years in every supported separator and month-name layout, since bank exports
            // commonly shorten years and the `yyyy` formats would otherwise read `26` as AD 26, which the backend drops
            const twoDigitYearDates = ['9/22/26', '09/22/26', '22/09/26', '09-22-26', '22-09-26', 'Sep 22, 26', '22 Sep 26'];

            // When each value is parsed
            const parsedDates = twoDigitYearDates.map((date) => parseCSVDate(date));
            const parsedShortDate = parseCSVDate('1/2/25');

            // Then every value resolves to the same date in the current century, including unpadded day and month values
            for (const parsedDate of parsedDates) {
                expect(parsedDate).toBe('2026-09-22');
            }
            expect(parsedShortDate).toBe('2025-01-02');
        });

        it('rejects dates with implausibly old years', () => {
            // Given dates just before, well before, and exactly at the minimum year of 1900, because years that old are never
            // real transaction dates and only come from misread short years
            const ancientDate = '0026-09-22';
            const dayBeforeMinimumYear = '1899-12-31';
            const firstDayOfMinimumYear = '1900-01-01';

            // When each value is parsed
            const parsedAncientDate = parseCSVDate(ancientDate);
            const parsedDayBeforeMinimumYear = parseCSVDate(dayBeforeMinimumYear);
            const parsedFirstDayOfMinimumYear = parseCSVDate(firstDayOfMinimumYear);

            // Then dates before 1900 are rejected so they are never sent to the backend, while 1900 itself is still accepted
            expect(parsedAncientDate).toBeNull();
            expect(parsedDayBeforeMinimumYear).toBeNull();
            expect(parsedFirstDayOfMinimumYear).toBe('1900-01-01');
        });

        it('returns null for invalid input', () => {
            expect(parseCSVDate('not a date')).toBeNull();
            expect(parseCSVDate('')).toBeNull();
        });
    });
});
