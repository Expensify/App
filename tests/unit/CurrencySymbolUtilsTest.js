import _ from 'underscore';
import * as CurrencySymbolUtils from '../../src/libs/CurrencySymbolUtils';
import CONST from '../../src/CONST';

// This file can get outdated. In that case, you can follow these steps to update it:
// - open your browser console and navigate to the Network tab
// - refresh the App
// - click on the OpenApp request and in the preview tab locate the key `currencyList`
// - copy the value and format it to valid json using some external tool
// - update currencyList.json
import currencyList from './currencyList.json';

const currencyCodeList = _.keys(currencyList);
const AVAILABLE_LOCALES = [CONST.LOCALES.EN, CONST.LOCALES.ES];

// Contains item [isLeft, locale, currencyCode]
const symbolPositions = [
    [true, CONST.LOCALES.EN, 'USD'],
    [false, CONST.LOCALES.ES, 'USD'],
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
