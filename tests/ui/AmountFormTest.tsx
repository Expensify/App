import {act, fireEvent, render, screen} from '@testing-library/react-native';

import AmountForm from '@components/AmountForm';
import ComposeProviders from '@components/ComposeProviders';
import {CurrencyListContextProvider} from '@components/CurrencyListContextProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import type {NumberWithSymbolFormRef} from '@components/NumberWithSymbolForm';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import ONYXKEYS from '@src/ONYXKEYS';

import type * as NativeNavigation from '@react-navigation/native';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof NativeNavigation>('@react-navigation/native'),
    useIsFocused: jest.fn(() => true),
    useNavigation: jest.fn(() => ({
        navigate: jest.fn(),
        addListener: jest.fn(() => jest.fn()),
    })),
    useRoute: jest.fn(() => ({key: '', name: '', params: {}})),
}));

type AmountFormProps = React.ComponentProps<typeof AmountForm>;

function wrapForm(props: AmountFormProps = {}) {
    return <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrencyListContextProvider]}>{<AmountForm {...props} />}</ComposeProviders>;
}

function renderForm(props: AmountFormProps = {}) {
    return render(wrapForm(props));
}

// AmountForm routes `displayAsTextInput` without a currency button to NumericField; other variants stay on the
// legacy NumberWithSymbolForm. These tests pin that routing and the behavior parity of the migrated path.
describe('AmountForm', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    afterEach(async () => {
        jest.clearAllMocks();
        await act(async () => {
            await Onyx.clear();
        });
    });

    describe('displayAsTextInput without a currency button (NumericField path)', () => {
        it('renders the currency symbol, validates with currency decimals, and reports changes', async () => {
            // Given a text-input AmountForm for USD (2 decimal places by default)
            const onInputChange = jest.fn();
            renderForm({displayAsTextInput: true, value: '10', currency: 'USD', label: 'Amount', onInputChange});
            await waitForBatchedUpdatesWithAct();

            // Then the value renders with the currency symbol as a prefix and no currency button
            expect(screen.getByDisplayValue('10')).toBeOnTheScreen();
            expect(screen.getByText('$')).toBeOnTheScreen();
            expect(screen.queryByText('USD')).toBeNull();

            // When the user enters a value within the currency precision
            fireEvent.changeText(screen.getByDisplayValue('10'), '10.25');
            await waitForBatchedUpdatesWithAct();

            // Then the change is accepted and reported
            expect(onInputChange).toHaveBeenLastCalledWith('10.25');
            expect(screen.getByDisplayValue('10.25')).toBeOnTheScreen();

            // When the user enters a value exceeding the currency precision
            fireEvent.changeText(screen.getByDisplayValue('10.25'), '10.253');
            await waitForBatchedUpdatesWithAct();

            // Then the change is rejected
            expect(onInputChange).toHaveBeenCalledTimes(1);
            expect(screen.getByDisplayValue('10.25')).toBeOnTheScreen();
        });

        it('renders the error text and forwards blur', async () => {
            // Given a text-input AmountForm with an error and an onBlur callback
            const onBlur = jest.fn();
            renderForm({displayAsTextInput: true, value: '10', errorText: 'Invalid amount', onBlur});
            await waitForBatchedUpdatesWithAct();

            // Then the error text is displayed
            expect(screen.getByText('Invalid amount')).toBeOnTheScreen();

            // When the input blurs
            fireEvent(screen.getByDisplayValue('10'), 'blur');

            // Then onBlur is forwarded
            expect(onBlur).toHaveBeenCalledTimes(1);
        });

        it('exposes the NumberWithSymbolFormRef imperative API through numberFormRef', async () => {
            // Given a text-input AmountForm with a numberFormRef
            const numberFormRef = React.createRef<NumberWithSymbolFormRef>();
            const onInputChange = jest.fn();
            renderForm({displayAsTextInput: true, value: '10', numberFormRef, onInputChange});
            await waitForBatchedUpdatesWithAct();

            expect(numberFormRef.current?.getNumber()).toBe('10');

            // When updateNumber replaces the value imperatively
            act(() => {
                numberFormRef.current?.updateNumber('25');
            });
            await waitForBatchedUpdatesWithAct();

            // Then the value updates without notifying onInputChange, matching the legacy form
            expect(numberFormRef.current?.getNumber()).toBe('25');
            expect(screen.getByDisplayValue('25')).toBeOnTheScreen();
            expect(onInputChange).not.toHaveBeenCalled();
        });
    });

    describe('displayAsTextInput with a currency button (legacy path)', () => {
        it('keeps rendering the legacy form with the currency button', async () => {
            // Given a text-input AmountForm with the trailing currency button enabled
            const onCurrencyButtonPress = jest.fn();
            renderForm({displayAsTextInput: true, value: '10', currency: 'USD', shouldShowCurrencyButton: true, onCurrencyButtonPress});
            await waitForBatchedUpdatesWithAct();

            // Then the legacy currency button renders
            const currencyButton = screen.getByText('USD');
            expect(currencyButton).toBeOnTheScreen();

            // When the currency button is pressed
            fireEvent.press(currencyButton);
            await waitForBatchedUpdatesWithAct();

            // Then the currency callback is invoked
            expect(onCurrencyButtonPress).toHaveBeenCalledTimes(1);
        });
    });

    describe('default variant without displayAsTextInput (legacy path)', () => {
        it('renders the legacy number pad instead of NumericField', async () => {
            renderForm({value: '10', currency: 'USD'});
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByDisplayValue('10')).toBeOnTheScreen();
            expect(screen.getByTestId('button_1')).toBeOnTheScreen();
        });
    });
});
