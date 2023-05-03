import _ from 'underscore';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../src/ONYXKEYS';
import CONST from '../../src/CONST';
import waitForPromisesToResolve from '../utils/waitForPromisesToResolve';
import * as CurrencyUtils from '../../src/libs/CurrencyUtils';
import LocaleListener from '../../src/libs/Localize/LocaleListener';

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

describe('CurrencyUtils', () => {
    beforeAll(() => {
        Onyx.init({
            keys: {NVP_PREFERRED_LOCALE: ONYXKEYS.NVP_PREFERRED_LOCALE},
            initialKeyStates: {[ONYXKEYS.NVP_PREFERRED_LOCALE]: CONST.LOCALES.DEFAULT},
        });
        LocaleListener.connect();
        return waitForPromisesToResolve();
    });

    afterEach(() => Onyx.clear());

    describe('getLocalizedCurrencySymbol', () => {
        test.each(AVAILABLE_LOCALES)('Returns non empty string for all currencyCode with preferredLocale %s', prefrredLocale => (
            Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, prefrredLocale)
                .then(() => {
                    _.forEach(currencyCodeList, (currencyCode) => {
                        const localizedSymbol = CurrencyUtils.getLocalizedCurrencySymbol(currencyCode);

                        expect(localizedSymbol).toBeTruthy();
                    });
                })
        ));
    });

    describe('isCurrencySymbolLTR', () => {
        test.each(symbolPositions)('Returns %s for preferredLocale %s and currencyCode %s', (isLeft, locale, currencyCode) => (
            Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, locale)
                .then(() => {
                    const isSymbolLeft = CurrencyUtils.isCurrencySymbolLTR(currencyCode);
                    expect(isSymbolLeft).toBe(isLeft);
                })
        ));
    });
});
