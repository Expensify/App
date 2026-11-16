import CONST from '@src/CONST';
import Log from '@src/libs/Log';
import * as NumberFormatUtils from '@src/libs/NumberFormatUtils';

describe('NumberFormatUtils', () => {
    let warnSpy: jest.SpyInstance;

    beforeEach(() => {
        NumberFormatUtils.resetMalformedCurrenciesForTesting();
        warnSpy = jest.spyOn(Log, 'warn').mockImplementation(() => undefined);
    });

    afterEach(() => {
        warnSpy.mockRestore();
    });

    describe('format', () => {
        test('formats a valid currency without entering the fallback path', () => {
            expect(NumberFormatUtils.format(CONST.LOCALES.EN, 25, {style: 'currency', currency: 'USD'})).toBe('$25.00');
            expect(warnSpy).not.toHaveBeenCalled();
        });

        test('formats decimal style without a currency option', () => {
            expect(NumberFormatUtils.format(CONST.LOCALES.EN, 25.5, {style: 'decimal', minimumFractionDigits: 2})).toBe('25.50');
            expect(warnSpy).not.toHaveBeenCalled();
        });

        test.each(['', 'XX', '1USD', 'US-D', '???'])('falls back to USD without throwing for malformed currency %p', (input) => {
            expect(() => NumberFormatUtils.format(CONST.LOCALES.EN, 25, {style: 'currency', currency: input})).not.toThrow();
            expect(NumberFormatUtils.format(CONST.LOCALES.EN, 25, {style: 'currency', currency: input})).toBe('$25.00');
            expect(warnSpy).toHaveBeenCalled();
        });

        test('explicitly recovers from an empty-string currency (RangeError guard via "in" check)', () => {
            expect(() => NumberFormatUtils.format(CONST.LOCALES.EN, 25, {style: 'currency', currency: ''})).not.toThrow();
            expect(NumberFormatUtils.format(CONST.LOCALES.EN, 25, {style: 'currency', currency: ''})).toBe('$25.00');
        });

        test('passes case-insensitive valid codes through without entering the fallback', () => {
            // Intl.NumberFormat accepts lowercase ISO 4217 codes natively (it normalizes case),
            // so no RangeError is thrown and the fallback should not run.
            expect(NumberFormatUtils.format(CONST.LOCALES.EN, 25, {style: 'currency', currency: 'usd'})).toBe('$25.00');
            expect(warnSpy).not.toHaveBeenCalled();
        });

        test('does not swallow RangeErrors when options has no currency key', () => {
            // An invalid `unit` triggers a RangeError but the fallback only applies when `currency` is in options,
            // so this should still throw rather than being silently rewritten to USD.
            expect(() => NumberFormatUtils.format(CONST.LOCALES.EN, 25, {style: 'unit', unit: 'not-a-real-unit'} as Intl.NumberFormatOptions)).toThrow(RangeError);
        });

        test('does not swallow RangeErrors when options is undefined', () => {
            expect(NumberFormatUtils.format(CONST.LOCALES.EN, 25)).toBe('25');
            expect(warnSpy).not.toHaveBeenCalled();
        });

        test('uses the default locale when locale is undefined', () => {
            expect(NumberFormatUtils.format(undefined, 25, {style: 'currency', currency: 'USD'})).toBe('$25.00');
        });
    });

    describe('formatToParts', () => {
        test('returns parts for a valid currency without entering the fallback path', () => {
            const parts = NumberFormatUtils.formatToParts(CONST.LOCALES.EN, 0, {style: 'currency', currency: 'USD'});
            expect(parts.find((part) => part.type === 'currency')?.value).toBe('$');
            expect(warnSpy).not.toHaveBeenCalled();
        });

        test.each(['', 'XX', '1USD', 'US-D', '???'])('falls back to USD without throwing for malformed currency %p', (input) => {
            expect(() => NumberFormatUtils.formatToParts(CONST.LOCALES.EN, 0, {style: 'currency', currency: input})).not.toThrow();
            const parts = NumberFormatUtils.formatToParts(CONST.LOCALES.EN, 0, {style: 'currency', currency: input});
            expect(parts.find((part) => part.type === 'currency')?.value).toBe('$');
            expect(warnSpy).toHaveBeenCalled();
        });

        test('explicitly recovers from an empty-string currency (RangeError guard via "in" check)', () => {
            expect(() => NumberFormatUtils.formatToParts(CONST.LOCALES.EN, 0, {style: 'currency', currency: ''})).not.toThrow();
            const parts = NumberFormatUtils.formatToParts(CONST.LOCALES.EN, 0, {style: 'currency', currency: ''});
            expect(parts.find((part) => part.type === 'currency')?.value).toBe('$');
        });

        test('does not swallow RangeErrors when options has no currency key', () => {
            expect(() => NumberFormatUtils.formatToParts(CONST.LOCALES.EN, 0, {style: 'unit', unit: 'not-a-real-unit'} as Intl.NumberFormatOptions)).toThrow(RangeError);
        });
    });

    describe('formatDistanceToParts', () => {
        const joinParts = (parts: Intl.NumberFormatPart[]) => parts.map((part) => part.value).join('');

        test('formats miles in English with the number first and a short unit part', () => {
            // Given a distance in miles and the English locale
            // When the distance is formatted into parts
            const parts = NumberFormatUtils.formatDistanceToParts(CONST.LOCALES.EN, 1234.5, CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES);

            // Then the locale grouping and two decimals are used, and the unit comes back as its own part so it can be styled separately
            expect(joinParts(parts)).toBe('1,234.50 mi');
            expect(parts.find((part) => part.type === 'unit')?.value).toBe('mi');
        });

        test('uses the locale decimal separator for kilometers', () => {
            // Given a distance in kilometers and the Spanish locale, which uses a decimal comma
            // When the distance is formatted into parts
            const parts = NumberFormatUtils.formatDistanceToParts(CONST.LOCALES.ES, 12.5, CONST.CUSTOM_UNITS.DISTANCE_UNIT_KILOMETERS);

            // Then the number uses a comma and the unit is still a separate part
            expect(joinParts(parts)).toBe('12,50 km');
            expect(parts.find((part) => part.type === 'unit')?.value).toBe('km');
        });

        test('lets the locale decide spacing and unit spelling', () => {
            // Given a locale that writes the unit without a space after the number
            // When the distance is formatted into parts
            const parts = NumberFormatUtils.formatDistanceToParts(CONST.LOCALES.ZH_HANS, 12.5, CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES);

            // Then no space is inserted before the translated unit
            expect(joinParts(parts)).toBe('12.50英里');
            expect(parts.find((part) => part.type === 'unit')?.value).toBe('英里');
        });

        test('always shows two decimal places', () => {
            // Given distances that would otherwise drop trailing zeros or show more than two decimals
            // When they are formatted into parts
            // Then they are rounded and padded to two decimals, matching how distances are stored
            expect(joinParts(NumberFormatUtils.formatDistanceToParts(CONST.LOCALES.EN, 0, CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES))).toBe('0.00 mi');
            expect(joinParts(NumberFormatUtils.formatDistanceToParts(CONST.LOCALES.EN, 3.14159, CONST.CUSTOM_UNITS.DISTANCE_UNIT_KILOMETERS))).toBe('3.14 km');
        });
    });

    describe('malformed-currency warn deduplication', () => {
        test('warns at most once per unique malformed currency across repeated format calls', () => {
            NumberFormatUtils.format(CONST.LOCALES.EN, 25, {style: 'currency', currency: 'XX'});
            NumberFormatUtils.format(CONST.LOCALES.EN, 25, {style: 'currency', currency: 'XX'});
            NumberFormatUtils.format(CONST.LOCALES.EN, 25, {style: 'currency', currency: 'XX'});
            expect(warnSpy).toHaveBeenCalledTimes(1);

            NumberFormatUtils.format(CONST.LOCALES.EN, 25, {style: 'currency', currency: '???'});
            expect(warnSpy).toHaveBeenCalledTimes(2);
        });

        test('the deduplication is shared between format and formatToParts', () => {
            NumberFormatUtils.format(CONST.LOCALES.EN, 25, {style: 'currency', currency: 'YY'});
            NumberFormatUtils.formatToParts(CONST.LOCALES.EN, 0, {style: 'currency', currency: 'YY'});
            expect(warnSpy).toHaveBeenCalledTimes(1);
        });
    });
});
