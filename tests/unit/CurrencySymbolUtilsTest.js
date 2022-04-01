const _ = require('underscore');
import * as CurrencySymbolUtils from '../../src/libs/CurrencySymbolUtils';
import currencyList from './currencyList.json';

const currencyCodeList = _.keys(currencyList);

const AVAILABLE_LOCALES = ['en', 'es'];

// Contains item [isLeft, locale, currencyCode]
const symbolPositions = [
    [true, 'en', 'USD'],
    [false, 'es', 'USD']
];


describe('CurrencySymbolUtils', () => {
    describe('getLocalizedCurrencySymbol', () => {

        test.each(AVAILABLE_LOCALES)('returns non empty string for all currencyCode with preferredLocale %s', (prefrredLocale) => {
            _.forEach(currencyCodeList, (currencyCode) => {
                const localizedSymbol = CurrencySymbolUtils.getLocalizedCurrencySymbol(prefrredLocale, currencyCode);

                expect(typeof localizedSymbol).toBe('string');
                expect(localizedSymbol.length).toBeGreaterThan(0);
            });
        });
    });

    describe('isCurrencySymbolLTR', () => {

        test.each(symbolPositions)('returns %s for prefrredLocale %s and currencyCode %s', (isLeft, locale, currencyCode) => {
            const isSymbolLeft = CurrencySymbolUtils.isCurrencySymbolLTR(locale, currencyCode);
            expect(isSymbolLeft).toBe(isLeft);
        });
    });
});
