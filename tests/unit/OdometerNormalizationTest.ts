import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import {fromLocaleDigit} from '@libs/LocaleDigitUtils';

describe('normalizeOdometerText', () => {
    describe('German locale (comma-decimal, dot-group)', () => {
        const germanFromLocaleDigit = (char: string) => fromLocaleDigit('de', char);

        it("German '1,5' (one and a half) normalizes to '1.5'", () => {
            expect(DistanceRequestUtils.normalizeOdometerText('1,5', germanFromLocaleDigit)).toBe('1.5');
        });

        it("German '1.5' (fifteen, dot is group separator) normalizes to '15'", () => {
            expect(DistanceRequestUtils.normalizeOdometerText('1.5', germanFromLocaleDigit)).toBe('15');
        });

        it("German '1.234,5' (1234.5) normalizes to '1234.5'", () => {
            expect(DistanceRequestUtils.normalizeOdometerText('1.234,5', germanFromLocaleDigit)).toBe('1234.5');
        });

        it("German '9999999' with no separators normalizes correctly", () => {
            expect(DistanceRequestUtils.normalizeOdometerText('9999999', germanFromLocaleDigit)).toBe('9999999');
        });
    });

    describe('English locale (dot-decimal, comma-group)', () => {
        const englishFromLocaleDigit = (char: string) => fromLocaleDigit('en', char);

        it("English '1.5' (one and a half) normalizes to '1.5'", () => {
            expect(DistanceRequestUtils.normalizeOdometerText('1.5', englishFromLocaleDigit)).toBe('1.5');
        });

        it("English '1,234.5' normalizes to '1234.5'", () => {
            expect(DistanceRequestUtils.normalizeOdometerText('1,234.5', englishFromLocaleDigit)).toBe('1234.5');
        });

        it("English '9999999' with no separators normalizes correctly", () => {
            expect(DistanceRequestUtils.normalizeOdometerText('9999999', englishFromLocaleDigit)).toBe('9999999');
        });
    });
});
