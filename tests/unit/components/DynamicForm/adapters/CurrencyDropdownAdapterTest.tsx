import {act, fireEvent, render, screen} from '@testing-library/react-native';

import CurrencyPickerPopover from '@components/CurrencyPickerPopover';
import type {CurrencyDropdownAdapterProps} from '@components/DynamicForm/adapters/CurrencyDropdownAdapter';
import CurrencyDropdownAdapter from '@components/DynamicForm/adapters/CurrencyDropdownAdapter';
import {LocaleContextProvider} from '@components/LocaleContextProvider';

import ONYXKEYS from '@src/ONYXKEYS';

import type {ComponentRef} from 'react';

import React from 'react';
import {View} from 'react-native';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../../../../utils/waitForBatchedUpdates';

jest.mock('@components/CurrencyPickerPopover', () => jest.fn(() => null));
jest.mock('@hooks/useCurrencyList', () => ({
    useCurrencyListActions: () => ({getCurrencySymbol: (currencyCode: string) => ({GBP: '£', EUR: '€'})[currencyCode]}),
    useCurrencyListState: () => ({currencyList: {}}),
}));
jest.mock('@hooks/useResponsiveLayout', () => jest.fn(() => ({isSmallScreenWidth: false, shouldUseNarrowLayout: false})));
jest.mock('@hooks/useWindowDimensions', () => jest.fn(() => ({windowWidth: 1280, windowHeight: 800})));

const LABEL = 'Currency';
const ACCESSIBILITY_LABEL = 'Currency, Expected monthly volume';

const lastPopoverProps = () => jest.mocked(CurrencyPickerPopover).mock.lastCall?.[0];

describe('CurrencyDropdownAdapter', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.mocked(CurrencyPickerPopover).mockClear();
        jest.spyOn<ComponentRef<typeof View>, 'measureInWindow'>(View.prototype, 'measureInWindow').mockImplementation((callback) => callback(16, 100, 300, 60));
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    const renderAdapter = (props: Partial<CurrencyDropdownAdapterProps> = {}) =>
        render(
            <LocaleContextProvider>
                <CurrencyDropdownAdapter
                    label={LABEL}
                    title={LABEL}
                    {...props}
                />
            </LocaleContextProvider>,
        );

    it('shows the currency with its symbol, as the currency list does', () => {
        // Given a field holding a currency
        renderAdapter({value: 'GBP'});

        // When it renders
        // Then the row reads the code and the symbol
        expect(screen.getByText('GBP - £')).toBeOnTheScreen();
    });

    it('names the amount it belongs to for screen readers', async () => {
        // Given the currency of an amount, whose label alone does not say which amount
        renderAdapter({value: 'GBP', accessibilityLabel: ACCESSIBILITY_LABEL});

        // When the row is read out
        // Then it names the amount and the currency it holds
        expect(await screen.findByLabelText(`${ACCESSIBILITY_LABEL}, GBP - £`)).toBeOnTheScreen();
    });

    it('commits a new currency and ignores the one the field already holds', () => {
        // Given a field holding GBP whose list is open
        const onInputChange = jest.fn();
        renderAdapter({value: 'GBP', accessibilityLabel: ACCESSIBILITY_LABEL, onInputChange});
        fireEvent.press(screen.getByLabelText(ACCESSIBILITY_LABEL, {exact: false}), {nativeEvent: {}});

        // When the user picks GBP again, then EUR
        act(() => lastPopoverProps()?.onSelected({currencyCode: 'GBP', currencyName: 'Pound', keyForList: 'GBP'}));
        act(() => lastPopoverProps()?.onSelected({currencyCode: 'EUR', currencyName: 'Euro', keyForList: 'EUR'}));

        // Then only EUR reaches the form, so a currency that asks the server for a new form asks only when it changes
        expect(onInputChange).toHaveBeenCalledTimes(1);
        expect(onInputChange).toHaveBeenCalledWith('EUR');
    });
});
