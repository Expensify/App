import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import {fromLocaleDigit} from '@libs/LocaleDigitUtils';

describe('normalizeOdometerText', () => {
    describe('German locale (comma-decimal, dot-group)', () => {
        const germanFromLocaleDigit = (char: string) => fromLocaleDigit('de', char);

        it("German '1,5' (one and a half) normalizes to '1.5'", () => {
            expect(DistanceRequestUtils.normalizeOdometerText('1,5', germanFromLocaleDigit)).toBe('1.5');
        });

        it("German '1.5' (dot is group separator, fifteen) normalizes to '15'", () => {
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

    describe('locale-strict decimal handling', () => {
        const englishFromLocaleDigit = (char: string) => fromLocaleDigit('en', char);
        const germanFromLocaleDigit = (char: string) => fromLocaleDigit('de', char);

        it("English '123,4' (comma is group separator, not decimal) normalizes to '1234'", () => {
            expect(DistanceRequestUtils.normalizeOdometerText('123,4', englishFromLocaleDigit)).toBe('1234');
        });

        it("English '1,234.5' (comma as group with dot decimal) normalizes to '1234.5'", () => {
            expect(DistanceRequestUtils.normalizeOdometerText('1,234.5', englishFromLocaleDigit)).toBe('1234.5');
        });

        it("German '1.234,5' (dot-group, comma-decimal) normalizes to '1234.5'", () => {
            expect(DistanceRequestUtils.normalizeOdometerText('1.234,5', germanFromLocaleDigit)).toBe('1234.5');
        });

        it("plain comma with identity function: ',5' normalizes to '5' (comma stripped)", () => {
            const identity = (char: string) => char;
            expect(DistanceRequestUtils.normalizeOdometerText(',5', identity)).toBe('5');
        });
    });

    describe('leading zeroes', () => {
        const identity = (char: string) => char;

        it("strips redundant leading zeroes: '000' → '0'", () => {
            expect(DistanceRequestUtils.normalizeOdometerText('000', identity)).toBe('0');
        });

        it("strips leading zeroes before digits: '007' → '7'", () => {
            expect(DistanceRequestUtils.normalizeOdometerText('007', identity)).toBe('7');
        });

        it("keeps single zero before decimal: '0.5' → '0.5'", () => {
            expect(DistanceRequestUtils.normalizeOdometerText('0.5', identity)).toBe('0.5');
        });

        it("normalizes multiple zeroes before decimal: '00.5' → '0.5'", () => {
            expect(DistanceRequestUtils.normalizeOdometerText('00.5', identity)).toBe('0.5');
        });

        it("keeps a single zero: '0' → '0'", () => {
            expect(DistanceRequestUtils.normalizeOdometerText('0', identity)).toBe('0');
        });

        it("does not affect numbers without leading zeroes: '123' → '123'", () => {
            expect(DistanceRequestUtils.normalizeOdometerText('123', identity)).toBe('123');
        });
    });
});

describe('prepareTextForDisplay', () => {
    it("strips non-numeric characters except decimal and comma: 'abc123.4def' → '123.4'", () => {
        expect(DistanceRequestUtils.prepareTextForDisplay('abc123.4def')).toBe('123.4');
    });

    it("keeps commas for locale display: '1,234.5' → '1,234.5'", () => {
        expect(DistanceRequestUtils.prepareTextForDisplay('1,234.5')).toBe('1,234.5');
    });

    it("strips leading zeroes: '007' → '7'", () => {
        expect(DistanceRequestUtils.prepareTextForDisplay('007')).toBe('7');
    });

    it("strips redundant leading zeroes: '000' → '0'", () => {
        expect(DistanceRequestUtils.prepareTextForDisplay('000')).toBe('0');
    });

    it("keeps single zero before decimal: '0.5' → '0.5'", () => {
        expect(DistanceRequestUtils.prepareTextForDisplay('0.5')).toBe('0.5');
    });

    it("normalizes multiple leading zeroes before decimal: '00.5' → '0.5'", () => {
        expect(DistanceRequestUtils.prepareTextForDisplay('00.5')).toBe('0.5');
    });

    it("keeps single zero: '0' → '0'", () => {
        expect(DistanceRequestUtils.prepareTextForDisplay('0')).toBe('0');
    });

    it("strips letters and symbols: '@#$%123' → '123'", () => {
        expect(DistanceRequestUtils.prepareTextForDisplay('@#$%123')).toBe('123');
    });

    it("handles empty string: '' → ''", () => {
        expect(DistanceRequestUtils.prepareTextForDisplay('')).toBe('');
    });

    it("handles valid number unchanged: '12345.6' → '12345.6'", () => {
        expect(DistanceRequestUtils.prepareTextForDisplay('12345.6')).toBe('12345.6');
    });

    it("keeps spaces as group separator (French locale): '1 234,5' → '1 234,5'", () => {
        expect(DistanceRequestUtils.prepareTextForDisplay('1 234,5')).toBe('1 234,5');
    });

    it("keeps periods as group separator (Italian locale): '1.234,5' → '1.234,5'", () => {
        expect(DistanceRequestUtils.prepareTextForDisplay('1.234,5')).toBe('1.234,5');
    });
});
