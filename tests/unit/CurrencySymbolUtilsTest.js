import _ from 'underscore';
import * as CurrencySymbolUtils from '../../src/libs/CurrencySymbolUtils';

// Taken from GetCurrencyList API.
import currencyList from './currencyList.json';

const currencyCodeList = _.keys(currencyList);
const AVAILABLE_LOCALES = ['en', 'es'];

// Contains item [isLeft, locale, currencyCode]
const symbolPositions = [
    [true, 'en', 'USD'],
    [false, 'es', 'USD'],
];

describe('CurrencySymbolUtils', () => {
    describe('getLocalizedCurrencySymbol', () => {
        test.each(AVAILABLE_LOCALES)('Returns non empty string for all currencyCode with preferredLocale %s', (prefrredLocale) => {
            _.forEach(currencyCodeList, (currencyCode) => {
                const localizedSymbol = CurrencySymbolUtils.getLocalizedCurrencySymbol(prefrredLocale, currencyCode);

                expect(localizedSymbol).toBeTruthy();
            });
        });
    });

    describe('isCurrencySymbolLTR', () => {
        test.each(symbolPositions)('Returns %s for preferredLocale %s and currencyCode %s', (isLeft, locale, currencyCode) => {
            const isSymbolLeft = CurrencySymbolUtils.isCurrencySymbolLTR(locale, currencyCode);
            expect(isSymbolLeft).toBe(isLeft);
        });
    });
});

