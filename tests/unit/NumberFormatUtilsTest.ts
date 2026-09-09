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
