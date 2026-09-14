import {renderHook} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {CurrencyListContextProvider} from '@components/CurrencyListContextProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {useCurrencyListActions} from '@hooks/useCurrencyList';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import currencyList from './currencyList.json';

function Wrapper({children}: {children: React.ReactNode}) {
    return <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrencyListContextProvider]}>{children}</ComposeProviders>;
}

async function renderCurrencyListActions() {
    const hook = renderHook(() => useCurrencyListActions(), {wrapper: Wrapper});
    await waitForBatchedUpdates();
    return hook;
}

describe('useCurrencyListActions', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            initialKeyStates: {
                [ONYXKEYS.NVP_PREFERRED_LOCALE]: CONST.LOCALES.DEFAULT,
                [ONYXKEYS.CURRENCY_LIST]: currencyList,
            },
        });
        return waitForBatchedUpdates();
    });

    beforeEach(async () => {
        await IntlStore.load(CONST.LOCALES.DEFAULT);
        await Onyx.merge(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.DEFAULT);
        await Onyx.merge(ONYXKEYS.CURRENCY_LIST, currencyList);
        await waitForBatchedUpdates();
    });

    describe('getCurrencyDecimals', () => {
        test('Currency decimals smaller than or equal 2', async () => {
            const {result} = await renderCurrencyListActions();
            expect(result.current.getCurrencyDecimals('JPY')).toBe(0);
            expect(result.current.getCurrencyDecimals('USD')).toBe(2);
            expect(result.current.getCurrencyDecimals('RSD')).toBe(2);
        });

        test('Currency decimals larger than 2 should return 2', async () => {
            const {result} = await renderCurrencyListActions();

            // Actual: 3
            expect(result.current.getCurrencyDecimals('LYD')).toBe(2);

            // Actual: 4
            expect(result.current.getCurrencyDecimals('UYW')).toBe(2);
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
        ])('Correctly displays %s', async (currency, amount, expectedResult) => {
            const {result} = await renderCurrencyListActions();
            expect(result.current.convertToDisplayString(amount, currency)).toBe(expectedResult);
        });

        test.each([
            ['EUR', 25, '0,25\xa0€'],
            ['EUR', 2500, '25,00\xa0€'],
            ['EUR', 250000, '2500,00\xa0€'],
            ['EUR', 250000000, '2.500.000,00\xa0€'],
        ])('Correctly displays %s in ES locale', async (currency, amount, expectedResult) => {
            await IntlStore.load(CONST.LOCALES.ES);
            await Onyx.merge(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.ES);
            await waitForBatchedUpdates();

            const {result} = await renderCurrencyListActions();
            expect(result.current.convertToDisplayString(amount, currency)).toBe(expectedResult);
        });
    });

    describe('convertToDisplayString with malformed currency', () => {
        test.each(['', 'XX', 'USDD', '???'])('does not throw and falls back to USD formatting for %p', async (input) => {
            const {result} = await renderCurrencyListActions();
            expect(() => result.current.convertToDisplayString(2500, input)).not.toThrow();
            expect(result.current.convertToDisplayString(2500, input)).toBe('$25.00');
        });

        test('normalizes case-only variations to the intended currency instead of USD', async () => {
            const {result} = await renderCurrencyListActions();
            expect(result.current.convertToDisplayString(2500, 'eur')).toBe(result.current.convertToDisplayString(2500, 'EUR'));
        });

        test('handles undefined currency', async () => {
            const {result} = await renderCurrencyListActions();
            expect(result.current.convertToDisplayString(2500, undefined)).toBe('$25.00');
        });
    });

    describe('convertToDisplayStringWithoutCurrency with malformed currency', () => {
        test.each(['', 'XX', 'USDD', '???'])('does not throw and produces a numeric output for %p', async (input) => {
            const {result} = await renderCurrencyListActions();
            expect(() => result.current.convertToDisplayStringWithoutCurrency(2500, input)).not.toThrow();
            // Output should not contain a currency symbol but should contain the numeric portion.
            const output = result.current.convertToDisplayStringWithoutCurrency(2500, input);
            expect(output).not.toMatch(/\$/);
            expect(output).toContain('25');
        });
    });
});
