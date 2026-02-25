import {fromLocaleDigit} from '@libs/LocaleDigitUtils';
import {replaceAllDigits} from '@libs/MoneyRequestUtils';

/**
 * Replicates the normalizeOdometerText logic from IOURequestStepDistanceOdometer.
 * fromLocaleDigit converts each locale character to its standard equivalent,
 * then we strip everything except digits and the standard decimal point '.'.
 */
function normalizeOdometerText(text: string, localeFromLocaleDigit: (char: string) => string): string {
    const standardized = replaceAllDigits(text, localeFromLocaleDigit);
    return standardized.replaceAll(/[^0-9.]/g, '');
}

describe('Odometer normalization respects locale conventions', () => {
    describe('German locale (comma-decimal, dot-group)', () => {
        const germanFromLocaleDigit = (char: string) => fromLocaleDigit('de', char);

        it("German '1,5' (one and a half) normalizes to '1.5'", () => {
            expect(normalizeOdometerText('1,5', germanFromLocaleDigit)).toBe('1.5');
        });

        it("German '1.5' (fifteen, dot is group separator) normalizes to '15'", () => {
            expect(normalizeOdometerText('1.5', germanFromLocaleDigit)).toBe('15');
        });

        it("German '1.234,5' (1234.5) normalizes to '1234.5'", () => {
            expect(normalizeOdometerText('1.234,5', germanFromLocaleDigit)).toBe('1234.5');
        });

        it("German '9999999' with no separators normalizes correctly", () => {
            expect(normalizeOdometerText('9999999', germanFromLocaleDigit)).toBe('9999999');
        });
    });

    describe('English locale (dot-decimal, comma-group)', () => {
        const englishFromLocaleDigit = (char: string) => fromLocaleDigit('en', char);

        it("English '1.5' (one and a half) normalizes to '1.5'", () => {
            expect(normalizeOdometerText('1.5', englishFromLocaleDigit)).toBe('1.5');
        });

        it("English '1,234.5' normalizes to '1234.5'", () => {
            expect(normalizeOdometerText('1,234.5', englishFromLocaleDigit)).toBe('1234.5');
        });

        it("English '9999999' with no separators normalizes correctly", () => {
            expect(normalizeOdometerText('9999999', englishFromLocaleDigit)).toBe('9999999');
        });
    });
});
