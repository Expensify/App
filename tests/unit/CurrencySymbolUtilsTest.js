import _ from 'underscore';
import * as CurrencySymbolUtils from '../../src/libs/CurrencySymbolUtils';

// This file can get outdated. In that case, you can follow these steps to update it:
// - in src/libs/API.js
// - call: GetCurrencyList().then(data => console.log(data.currencyList));
// - copy the json from console and format it to valid json using some external tool
// - update currencyList.json
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

