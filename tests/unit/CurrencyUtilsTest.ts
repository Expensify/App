import type {RenderAPI} from '@testing-library/react-native';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import * as CurrencyUtils from '@src/libs/CurrencyUtils';
import Log from '@src/libs/Log';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import initCurrencyListContext from '../utils/initCurrencyListContext';
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
    let currencyListProvider: RenderAPI;

    beforeEach(async () => {
        currencyListProvider = await initCurrencyListContext({
            keys: {
                NVP_PREFERRED_LOCALE: ONYXKEYS.NVP_PREFERRED_LOCALE,
                CURRENCY_LIST: ONYXKEYS.CURRENCY_LIST,
            },
            initialKeyStates: {
                [ONYXKEYS.NVP_PREFERRED_LOCALE]: CONST.LOCALES.DEFAULT,
            },
        });
        IntlStore.load(CONST.LOCALES.DEFAULT);
        await waitForBatchedUpdates();
    });

    afterEach(async () => {
        currencyListProvider.unmount();
        await Onyx.clear();
    });

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
            [2500, 25, 2],
            [2550, 25.5, 2],
            [25, 0.25, 2],
            [2500, 25, 2],
            [2500.5, 25, 2], // The backend should never send a decimal .5 value
            [2500, 25, 0],
            [2550, 26, 0],
            [25, 0, 0],
            [2586, 26, 0],
            [2500.5, 25, 0], // The backend should never send a decimal .5 value
        ])('Correctly converts %s to amount in units handled in frontend as an integer', (amount, expectedResult, decimals) => {
            expect(CurrencyUtils.convertToFrontendAmountAsInteger(amount, decimals)).toBe(expectedResult);
        });
    });

    describe('convertToFrontendAmountAsString', () => {
        test.each([
            [2500, '25.00', 2],
            [2550, '25.50', 2],
            [25, '0.25', 2],
            [2500.5, '25.00', 2],
            [null, '', 2],
            [undefined, '', 2],
            [0, '0.00', 2],
            [2500, '25', 0],
            [2550, '26', 0],
            [25, '0', 0],
            [2500.5, '25', 0],
            [null, '', 0],
            [undefined, '', 0],
            [0, '0', 0],
            [2586, '26', 0],
        ])('Correctly converts %s to amount in units handled in frontend as a string', (input, expectedResult, decimals) => {
            expect(CurrencyUtils.convertToFrontendAmountAsString(input, decimals)).toBe(expectedResult);
        });
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

    describe('isValidCurrencyCode', () => {
        test.each([
            ['USD', true],
            ['EUR', true],
            ['JPY', true],
            ['', false],
            ['eur', false],
            [' USD', false],
            ['US', false],
            ['USDD', false],
            ['US1', false],
            [undefined, false],
            [null, false],
            [42, false],
            [{}, false],
            [[], false],
            [true, false],
        ])('isValidCurrencyCode(%p) → %p', (input, expected) => {
            expect(CurrencyUtils.isValidCurrencyCode(input)).toBe(expected);
        });
    });

    describe('sanitizeCurrencyCode', () => {
        beforeEach(() => {
            CurrencyUtils.resetInvalidCurrencyWarningsForTesting();
        });

        test('returns the input unchanged for a valid ISO 4217 code', () => {
            expect(CurrencyUtils.sanitizeCurrencyCode('EUR')).toBe('EUR');
        });

        test.each([
            [' usd ', 'USD'],
            ['eur', 'EUR'],
            ['UsD', 'USD'],
            ['\tEUR', 'EUR'],
            ['JPY\n', 'JPY'],
            ['  GBP  ', 'GBP'],
        ])('normalizes whitespace and case: %p → %p', (input, expected) => {
            expect(CurrencyUtils.sanitizeCurrencyCode(input)).toBe(expected);
        });

        test.each(['', 'XX', 'USDD', 'US1', '???', 'us-d', 'U S D'])('falls back to USD for malformed string %p', (input) => {
            expect(CurrencyUtils.sanitizeCurrencyCode(input)).toBe(CONST.CURRENCY.USD);
        });

        test.each([undefined, null, 42, true, {}, []])('falls back to USD for non-string input %p', (input) => {
            expect(CurrencyUtils.sanitizeCurrencyCode(input)).toBe(CONST.CURRENCY.USD);
        });

        test('logs a warning at most once per unique malformed value', () => {
            const warnSpy = jest.spyOn(Log, 'warn').mockImplementation(() => undefined);
            try {
                CurrencyUtils.sanitizeCurrencyCode('XX');
                CurrencyUtils.sanitizeCurrencyCode('XX');
                CurrencyUtils.sanitizeCurrencyCode('XX');
                expect(warnSpy).toHaveBeenCalledTimes(1);

                CurrencyUtils.sanitizeCurrencyCode('???');
                expect(warnSpy).toHaveBeenCalledTimes(2);
            } finally {
                warnSpy.mockRestore();
            }
        });

        test('does not log a warning when normalization recovers a valid code', () => {
            const warnSpy = jest.spyOn(Log, 'warn').mockImplementation(() => undefined);
            try {
                expect(CurrencyUtils.sanitizeCurrencyCode(' eur ')).toBe('EUR');
                expect(warnSpy).not.toHaveBeenCalled();
            } finally {
                warnSpy.mockRestore();
            }
        });

        test('shares the throttle across helpers that go through sanitizeCurrencyCode', () => {
            const warnSpy = jest.spyOn(Log, 'warn').mockImplementation(() => undefined);
            try {
                CurrencyUtils.convertAmountToDisplayString(2500, 'XX');
                CurrencyUtils.getLocalizedCurrencySymbol(CONST.LOCALES.EN, 'XX');
                CurrencyUtils.convertToShortDisplayString(2500, 'XX');
                expect(warnSpy).toHaveBeenCalledTimes(1);
            } finally {
                warnSpy.mockRestore();
            }
        });
    });

    describe('convertToShortDisplayString with malformed currency', () => {
        test.each(['', 'XX', 'USDD', '???'])('does not throw and falls back to USD formatting for %p', (input) => {
            expect(() => CurrencyUtils.convertToShortDisplayString(2500, input)).not.toThrow();
            expect(CurrencyUtils.convertToShortDisplayString(2500, input)).toBe('$25');
        });
    });

    describe('convertAmountToDisplayString with malformed currency', () => {
        test.each(['', 'XX', 'USDD', '???'])('does not throw and falls back to USD formatting for %p', (input) => {
            expect(() => CurrencyUtils.convertAmountToDisplayString(2500, input)).not.toThrow();
            // The result should at least include a $ symbol from the USD fallback.
            expect(CurrencyUtils.convertAmountToDisplayString(2500, input)).toMatch(/\$/);
        });
    });

    describe('getLocalizedCurrencySymbol with malformed currency', () => {
        test.each(['', 'XX', 'USDD'])('returns the USD symbol without throwing for %p', (input) => {
            expect(() => CurrencyUtils.getLocalizedCurrencySymbol(CONST.LOCALES.EN, input)).not.toThrow();
            expect(CurrencyUtils.getLocalizedCurrencySymbol(CONST.LOCALES.EN, input)).toBe(CurrencyUtils.getLocalizedCurrencySymbol(CONST.LOCALES.EN, CONST.CURRENCY.USD));
        });
    });
});
