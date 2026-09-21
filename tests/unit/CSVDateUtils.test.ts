// cspell:ignore Mär März janv -- German and French month names as a spreadsheet exported by that language writes them.
import parseCSVDate from '@libs/CSVDateUtils';

import CONST from '@src/CONST';

describe('CSVDateUtils', () => {
    describe('parseCSVDate', () => {
        it('parses common date formats to yyyy-MM-dd', () => {
            // Given the shapes an English spreadsheet exports a calendar day as
            // When each is parsed for an English uploader
            // Then each comes back as the stored day. `2024-01-15` is the canary for the UTC-midnight regression: a
            // buggy implementation that runs `new Date('2024-01-15')` before the explicit yyyy-MM-dd format would
            // round-trip to `2024-01-14` in any zone west of UTC.
            expect(parseCSVDate('2024-01-15', CONST.LOCALES.EN)).toBe('2024-01-15');
            expect(parseCSVDate('01/20/2024', CONST.LOCALES.EN)).toBe('2024-01-20');
            expect(parseCSVDate('20-01-2024', CONST.LOCALES.EN)).toBe('2024-01-20');
            expect(parseCSVDate('Jan 25, 2024', CONST.LOCALES.EN)).toBe('2024-01-25');
        });

        it('reads a month abbreviated in the uploader language', () => {
            // Given a cell a German spreadsheet wrote, where the month is abbreviated `Mär` rather than `Mar`
            // When it is parsed for that uploader
            const result = parseCSVDate('2 Mär 2025', CONST.LOCALES.DE);

            // Then it resolves to 2 March, because date-fns matches month names against English alone and the name has
            // to be rewritten before it reaches the parser
            expect(result).toBe('2025-03-02');
        });

        it('reads a month spelled out in the uploader language', () => {
            // Given a cell written `März 2, 2025`, which no format here matches. The previous implementation retried by
            // cutting the cell at a fixed ten characters, leaving `März 2, 20`, which the engine accepted as
            // 2001-02-20: a wrong date written into an imported transaction with no error anywhere.
            // When it is parsed for a German uploader
            const result = parseCSVDate('März 2, 2025', CONST.LOCALES.DE);

            // Then it resolves to the day the cell names
            expect(result).toBe('2025-03-02');
        });

        it('reads a Spanish month abbreviation', () => {
            // Given a cell a Spanish spreadsheet wrote, whose abbreviation shares no prefix with the English one
            // When it is parsed for that uploader
            const result = parseCSVDate('2 ene 2025', CONST.LOCALES.ES);

            // Then it resolves to 2 January
            expect(result).toBe('2025-01-02');
        });

        it('reads a French month abbreviation, including its trailing point', () => {
            // Given a cell a French spreadsheet wrote, where the abbreviation carries a point that is part of the name
            // When it is parsed for that uploader
            const result = parseCSVDate('2 janv. 2025', CONST.LOCALES.FR);

            // Then it resolves to 2 January, so the point is consumed with the name rather than left in the cell
            expect(result).toBe('2025-01-02');
        });

        it('still reads an English month for a non-English uploader', () => {
            // Given an English cell reaching a Spanish uploader, which is what happens when a bank exports in English
            // When it is parsed with that uploader's locale
            const result = parseCSVDate('Jan 25, 2024', CONST.LOCALES.ES);

            // Then it still parses, because rewriting the month name only replaces one the language actually wrote
            expect(result).toBe('2024-01-25');
        });

        it('drops the clock time from a timestamp', () => {
            // Given a cell carrying a time as well as a day, which the transaction list stores as a day alone
            // When it is parsed
            const result = parseCSVDate('2024-01-15 10:30', CONST.LOCALES.EN);

            // Then only the day is kept
            expect(result).toBe('2024-01-15');
        });

        it('returns null for invalid input', () => {
            // Given a cell holding no date at all, and an empty cell
            // When each is parsed
            // Then null comes back, so the importer can report the row rather than store a guessed day
            expect(parseCSVDate('not a date', CONST.LOCALES.EN)).toBeNull();
            expect(parseCSVDate('', CONST.LOCALES.EN)).toBeNull();
        });
    });
});
