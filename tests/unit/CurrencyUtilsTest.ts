import Onyx from 'react-native-onyx';
import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import * as CurrencyUtils from '@src/libs/CurrencyUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {CurrencyList} from '@src/types/onyx';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
// This file can get outdated. In that case, you can follow these steps to update it:
// - open your browser console and navigate to the Network tab
// - refresh the App
// - click on the OpenApp request and in the preview tab locate the key `currencyList`
// - copy the value and format it to valid json using some external tool
// - update currencyList.json
import currencyList from './currencyList.json';

const currencyCodeList = Object.keys(currencyList as CurrencyList);
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
        return waitForBatchedUpdates();
    });

    beforeEach(() => {
        IntlStore.load(CONST.LOCALES.DEFAULT);
        return waitForBatchedUpdates();
    });

    afterEach(() => Onyx.clear());

    describe('getLocalizedCurrencySymbol', () => {
        test.each(AVAILABLE_LOCALES)('Returns non empty string for all currencyCode with preferredLocale %s', (preferredLocale) =>
            IntlStore.load(preferredLocale).then(() => {
                for (const currencyCode of currencyCodeList) {
                    const localizedSymbol = CurrencyUtils.getLocalizedCurrencySymbol(preferredLocale, currencyCode);

                    expect(localizedSymbol).toBeTruthy();
                }
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
            IntlStore.load(CONST.LOCALES.ES).then(() => expect(CurrencyUtils.convertToDisplayString(amount, currency)).toBe(expectedResult)),
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
            IntlStore.load(CONST.LOCALES.ES).then(() => expect(CurrencyUtils.convertToShortDisplayString(amount, currency)).toBe(expectedResult)),
        );
    });

    describe('isCurrencyCodeLikeSymbol', () => {
        test.each([
            // Exact match
            ['USD', 'USD', true],
            ['ALL', 'ALL', true],

            // Case-insensitive
            ['usd', 'USD', true],
            ['Usd', 'uSd', true],

            // Trimming on both sides
            [' usd ', 'USD', true],
            ['USD', ' usd ', true],
            ['  usd  ', '  UsD  ', true],

            // Not equal => false
            ['USD', 'PEN', false],
            ['US$', 'USD', false],
            ['USD$', 'USD', false],
            ['$', 'USD', false],
            ['S/', 'PEN', false],

            // Missing/empty values => false (note: empty string is falsy)
            [undefined, 'USD', false],
            ['USD', undefined, false],
            ['', 'USD', false],
            ['USD', '', false],
            ['   ', 'USD', false], // whitespace becomes '' after trim, but it's still falsy upfront
            ['USD', '   ', false],
        ])('symbol=%s, currencyCode=%s => %s', (symbol, currencyCode, expected) => {
            expect(CurrencyUtils.isCurrencyCodeLikeSymbol(symbol, currencyCode)).toBe(expected);
        });
    });


    describe('getPreferredCurrencySymbol', () => {
        test('Uses CURRENCY_LIST.symbol when it exists and is not code-like', () => {
            const currencyListTyped = currencyList as CurrencyList;
            const currencyWithNonCodeLikeSymbol = currencyCodeList.find((code) => {
                const symbol = currencyListTyped?.[code]?.symbol;
                return !!symbol && symbol.trim().toUpperCase() !== code.trim().toUpperCase();
            });

            expect(currencyWithNonCodeLikeSymbol).toBeTruthy();

            if (!currencyWithNonCodeLikeSymbol) {
                throw new Error('Expected a currency with a non-code-like symbol');
            }

            const expectedSymbol = CurrencyUtils.getCurrencySymbol(currencyWithNonCodeLikeSymbol);
            expect(expectedSymbol).toBeTruthy();

            expect(CurrencyUtils.getPreferredCurrencySymbol(currencyWithNonCodeLikeSymbol)).toBe(expectedSymbol);
        });

        test('Falls back to localized value when CURRENCY_LIST.symbol is code-like', async () => {
            await IntlStore.load(CONST.LOCALES.EN);
            await waitForBatchedUpdates();

            // Force a known case: make USD symbol "USD" so it becomes code-like
            const modifiedCurrencyList = {
                ...currencyList,
                USD: {
                    ...currencyList.USD,
                    symbol: 'USD',
                },
            };

            await Onyx.set(ONYXKEYS.CURRENCY_LIST, modifiedCurrencyList);
            await waitForBatchedUpdates();

            const preferred = CurrencyUtils.getPreferredCurrencySymbol(CONST.CURRENCY.USD);
            const localized = CurrencyUtils.getLocalizedCurrencySymbol(IntlStore.getCurrentLocale(), CONST.CURRENCY.USD);

            expect(preferred).toBe(localized);
            expect(preferred).not.toBe('USD');

            // Restore for the rest of the suite
            await Onyx.set(ONYXKEYS.CURRENCY_LIST, currencyList);
            await waitForBatchedUpdates();
        });

        test('Falls back to localized value when CURRENCY_LIST.symbol is missing', async () => {
            await IntlStore.load(CONST.LOCALES.EN);
            await waitForBatchedUpdates();

            const modifiedCurrencyList = {
                ...currencyList,
                USD: {
                    ...currencyList.USD,
                    symbol: undefined,
                },
            };

            await Onyx.set(ONYXKEYS.CURRENCY_LIST, modifiedCurrencyList);
            await waitForBatchedUpdates();

            const preferred = CurrencyUtils.getPreferredCurrencySymbol(CONST.CURRENCY.USD);
            const localized = CurrencyUtils.getLocalizedCurrencySymbol(IntlStore.getCurrentLocale(), CONST.CURRENCY.USD);

            expect(preferred).toBe(localized);
            expect(preferred).toBeTruthy();

            // Restore for the rest of the suite
            await Onyx.set(ONYXKEYS.CURRENCY_LIST, currencyList);
            await waitForBatchedUpdates();
        });

        test.each([['USD'], [' usd '], ['Usd']])('Falls back to localized value when CURRENCY_LIST.symbol is code-like (%s)', async (codeLikeSymbol) => {
            await IntlStore.load(CONST.LOCALES.EN);
            await waitForBatchedUpdates();

            const modifiedCurrencyList = {
                ...currencyList,
                USD: {
                    ...currencyList.USD,
                    symbol: codeLikeSymbol,
                },
            };

            await Onyx.set(ONYXKEYS.CURRENCY_LIST, modifiedCurrencyList);
            await waitForBatchedUpdates();

            const preferred = CurrencyUtils.getPreferredCurrencySymbol(CONST.CURRENCY.USD);
            const localized = CurrencyUtils.getLocalizedCurrencySymbol(IntlStore.getCurrentLocale(), CONST.CURRENCY.USD);

            expect(preferred).toBe(localized);
            expect(preferred).not.toBe(codeLikeSymbol);

            await Onyx.set(ONYXKEYS.CURRENCY_LIST, currencyList);
            await waitForBatchedUpdates();
        });
    });
});
