import Onyx from 'react-native-onyx';
import CONST from '@src/CONST';
import * as CurrencyUtils from '@src/libs/CurrencyUtils';
import LocaleListener from '@src/libs/Localize/LocaleListener';
import ONYXKEYS from '@src/ONYXKEYS';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
// This file can get outdated. In that case, you can follow these steps to update it:
// - open your browser console and navigate to the Network tab
// - refresh the App
// - click on the OpenApp request and in the preview tab locate the key `currencyList`
// - copy the value and format it to valid json using some external tool
// - update currencyList.json
import currencyList from './currencyList.json';

const currencyCodeList = Object.keys(currencyList);
const AVAILABLE_LOCALES = [CONST.LOCALES.EN, CONST.LOCALES.ES];

describe('CurrencyUtils', () => {
    beforeAll(() => {
        Onyx.init({
            keys: {
                NVP_PREFERRED_LOCALE: ONYXKEYS.NVP_PREFERRED_LOCALE,
                CURRENCY_LIST: ONYXKEYS.CURRENCY_LIST,
            },
            initialKeyStates: {
                [ONYXKEYS.NVP_PREFERRED_LOCALE]: CONST.LOCALES.DEFAULT,
                [ONYXKEYS.CURRENCY_LIST]: currencyList,
            },
        });
        LocaleListener.connect();
        return waitForBatchedUpdates();
    });

    afterEach(() => Onyx.clear());

    describe('getLocalizedCurrencySymbol', () => {
        test.each(AVAILABLE_LOCALES)('Returns non empty string for all currencyCode with preferredLocale %s', (prefrredLocale) =>
            Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, prefrredLocale).then(() => {
                currencyCodeList.forEach((currencyCode: string) => {
                    const localizedSymbol = CurrencyUtils.getLocalizedCurrencySymbol(currencyCode);

                    expect(localizedSymbol).toBeTruthy();
                });
            }),
        );
    });

    describe('isCurrencySymbolLTR', () => {
        test.each([
            [true, CONST.LOCALES.EN, 'USD'],
            [false, CONST.LOCALES.ES, 'USD'],
        ])('Returns %s for preferredLocale %s and currencyCode %s', (isLeft, locale, currencyCode) =>
            Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, locale).then(() => {
                const isSymbolLeft = CurrencyUtils.isCurrencySymbolLTR(currencyCode);
                expect(isSymbolLeft).toBe(isLeft);
            }),
        );
    });

    describe('getCurrencyDecimals', () => {
        test('Currency decimals smaller than or equal 2', () => {
            expect(CurrencyUtils.getCurrencyDecimals('JPY')).toBe(0);
            expect(CurrencyUtils.getCurrencyDecimals('USD')).toBe(2);
            expect(CurrencyUtils.getCurrencyDecimals('RSD')).toBe(2);
        });

        test('Currency decimals larger than 2 should return 2', () => {
            // Actual: 3
            expect(CurrencyUtils.getCurrencyDecimals('LYD')).toBe(2);

            // Actual: 4
            expect(CurrencyUtils.getCurrencyDecimals('UYW')).toBe(2);
        });
    });

    describe('getCurrencyUnit', () => {
        test('Currency with decimals smaller than or equal 2', () => {
            expect(CurrencyUtils.getCurrencyUnit('JPY')).toBe(1);
            expect(CurrencyUtils.getCurrencyUnit('USD')).toBe(100);
        });

        test('Currency with decimals larger than 2 should be floor to 2', () => {
            expect(CurrencyUtils.getCurrencyUnit('LYD')).toBe(100);
        });
    });

    describe('convertToBackendAmount', () => {
        test.each([
            [25, 2500],
            [25.25, 2525],
            [25.5, 2550],
            [2500, 250000],
            [80.6, 8060],
            [80.9, 8090],
            [80.99, 8099],
            [25, 2500],
            [25.25, 2525],
            [25.5, 2550],
            [2500, 250000],
            [80.6, 8060],
            [80.9, 8090],
            [80.99, 8099],
        ])('Correctly converts %s to amount in cents (subunit) handled in backend', (amount, expectedResult) => {
            expect(CurrencyUtils.convertToBackendAmount(amount)).toBe(expectedResult);
        });
    });

    describe('convertToFrontendAmountAsInteger', () => {
        test.each([
            [2500, 25, 'USD'],
            [2550, 25.5, 'USD'],
            [25, 0.25, 'USD'],
            [2500, 25, 'USD'],
            [2500.5, 25, 'USD'], // The backend should never send a decimal .5 value
            [2500, 25, 'VND'],
            [2550, 26, 'VND'],
            [25, 0, 'VND'],
            [2586, 26, 'VND'],
            [2500.5, 25, 'VND'], // The backend should never send a decimal .5 value
        ])('Correctly converts %s to amount in units handled in frontend as an integer', (amount, expectedResult, currency) => {
            expect(CurrencyUtils.convertToFrontendAmountAsInteger(amount, currency)).toBe(expectedResult);
        });
    });

    describe('convertToFrontendAmountAsString', () => {
        test.each([
            [2500, '25.00', 'USD'],
            [2550, '25.50', 'USD'],
            [25, '0.25', 'USD'],
            [2500.5, '25.00', 'USD'],
            [null, '', 'USD'],
            [undefined, '', 'USD'],
            [0, '0.00', 'USD'],
            [2500, '25', 'VND'],
            [2550, '26', 'VND'],
            [25, '0', 'VND'],
            [2500.5, '25', 'VND'],
            [null, '', 'VND'],
            [undefined, '', 'VND'],
            [0, '0', 'VND'],
            [2586, '26', 'VND'],
        ])('Correctly converts %s to amount in units handled in frontend as a string', (input, expectedResult, currency) => {
            expect(CurrencyUtils.convertToFrontendAmountAsString(input, currency ?? CONST.CURRENCY.USD)).toBe(expectedResult);
        });
    });

    describe('convertToDisplayString', () => {
        test.each([
            [CONST.CURRENCY.USD, 25, '$0.25'],
            [CONST.CURRENCY.USD, 2500, '$25.00'],
            [CONST.CURRENCY.USD, 150, '$1.50'],
            [CONST.CURRENCY.USD, 250000, '$2,500.00'],
            ['JPY', 2500, '¥25'],
            ['JPY', 250000, '¥2,500'],
            ['JPY', 2500.5, '¥25'],
            ['RSD', 100, 'RSD\xa01.00'],
            ['RSD', 145, 'RSD\xa01.45'],
            ['BHD', 12345, 'BHD\xa0123.45'],
            ['BHD', 1, 'BHD\xa00.01'],
        ])('Correctly displays %s', (currency, amount, expectedResult) => {
            expect(CurrencyUtils.convertToDisplayString(amount, currency)).toBe(expectedResult);
        });

        test.each([
            ['EUR', 25, '0,25\xa0€'],
            ['EUR', 2500, '25,00\xa0€'],
            ['EUR', 250000, '2500,00\xa0€'],
            ['EUR', 250000000, '2.500.000,00\xa0€'],
        ])('Correctly displays %s in ES locale', (currency, amount, expectedResult) =>
            Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.ES).then(() => expect(CurrencyUtils.convertToDisplayString(amount, currency)).toBe(expectedResult)),
        );
    });

    describe('convertToShortDisplayString', () => {
        test.each([
            [CONST.CURRENCY.USD, 25, '$0'],
            [CONST.CURRENCY.USD, 2500, '$25'],
            [CONST.CURRENCY.USD, 150, '$2'],
            [CONST.CURRENCY.USD, 250000, '$2,500'],
            ['JPY', 2500, '¥25'],
            ['JPY', 250000, '¥2,500'],
            ['JPY', 2500.5, '¥25'],
            ['RSD', 100, 'RSD\xa01'],
            ['RSD', 145, 'RSD\xa01'],
            ['BHD', 12345, 'BHD\xa0123'],
            ['BHD', 1, 'BHD\xa00'],
        ])('Correctly displays %s', (currency, amount, expectedResult) => {
            expect(CurrencyUtils.convertToShortDisplayString(amount, currency)).toBe(expectedResult);
        });

        test.each([
            ['EUR', 25, '0\xa0€'],
            ['EUR', 2500, '25\xa0€'],
            ['EUR', 250000, '2500\xa0€'],
            ['EUR', 250000000, '2.500.000\xa0€'],
        ])('Correctly displays %s in ES locale', (currency, amount, expectedResult) =>
            Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.ES).then(() => expect(CurrencyUtils.convertToShortDisplayString(amount, currency)).toBe(expectedResult)),
        );
    });
});
