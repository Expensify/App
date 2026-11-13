import {act, fireEvent, render, screen} from '@testing-library/react-native';

import type {AmountEditingRef} from '@components/AmountEditingController';
import AmountForm from '@components/AmountForm';
import ComposeProviders from '@components/ComposeProviders';
import {CurrencyListContextProvider} from '@components/CurrencyListContextProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

import ONYXKEYS from '@src/ONYXKEYS';

import type * as NativeNavigation from '@react-navigation/native';

import React from 'react';
import Onyx from 'react-native-onyx';

import currencyList from '../unit/currencyList.json';
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

// AmountForm routes `displayAsTextInput` to AmountFormField and every other variant to KeypadAmountEditor.
// These tests pin that routing and the behavior of both paths.
describe('AmountForm', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await act(async () => {
            await Onyx.set(ONYXKEYS.CURRENCY_LIST, currencyList);
        });
        await waitForBatchedUpdatesWithAct();
    });

    afterEach(async () => {
        jest.clearAllMocks();
        await act(async () => {
            await Onyx.clear();
        });
    });

    describe('displayAsTextInput without a currency button (AmountFormField path)', () => {
        it('renders the currency symbol, validates with currency decimals, and reports changes', async () => {
            // Given a text-input AmountForm for USD (2 decimal places)
            const onInputChange = jest.fn();
            const {unmount} = renderForm({displayAsTextInput: true, value: '10', currency: 'USD', label: 'Amount', onInputChange});
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

            unmount();

            // Given a text-input AmountForm for JPY (0 decimal places)
            const onInputChangeJPY = jest.fn();
            renderForm({displayAsTextInput: true, value: '10', currency: 'JPY', label: 'Amount', onInputChange: onInputChangeJPY});
            await waitForBatchedUpdatesWithAct();

            // When the user enters a decimal value for a zero-decimal currency
            fireEvent.changeText(screen.getByDisplayValue('10'), '10.5');
            await waitForBatchedUpdatesWithAct();

            // Then the change is rejected
            expect(onInputChangeJPY).not.toHaveBeenCalled();
            expect(screen.getByDisplayValue('10')).toBeOnTheScreen();
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

        it('exposes the imperative API through numberFormRef', async () => {
            // Given a text-input AmountForm with a numberFormRef
            const numberFormRef = React.createRef<AmountEditingRef>();
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

    describe('displayAsTextInput with a currency button (AmountFormField path)', () => {
        it('renders the composed currency button and forwards button clicks', async () => {
            // Given a text-input AmountForm with the trailing currency button enabled
            const onCurrencyButtonPress = jest.fn();
            renderForm({displayAsTextInput: true, value: '10', currency: 'USD', shouldShowCurrencyButton: true, onCurrencyButtonPress});
            await waitForBatchedUpdatesWithAct();

            // Then the currency button renders inside the input
            const currencyButton = screen.getByText('USD');
            expect(currencyButton).toBeOnTheScreen();

            // When the currency button is pressed
            fireEvent.press(currencyButton);
            await waitForBatchedUpdatesWithAct();

            // Then the currency callback is invoked
            expect(onCurrencyButtonPress).toHaveBeenCalledTimes(1);
        });

        it('supports custom currencyButtonLabel (such as duration units)', async () => {
            // Given a text-input AmountForm configured with a custom button label
            const onCurrencyButtonPress = jest.fn();

            // When the form is rendered
            renderForm({
                displayAsTextInput: true,
                value: '2',
                currency: 'USD',
                shouldShowCurrencyButton: true,
                currencyButtonLabel: 'hours',
                onCurrencyButtonPress,
            });
            await waitForBatchedUpdatesWithAct();

            // Then the custom button label renders
            expect(screen.getByText('hours')).toBeOnTheScreen();
            expect(screen.queryByText('USD')).toBeNull();
        });
    });

    describe('default variant without displayAsTextInput (KeypadAmountEditor path)', () => {
        it('renders the number pad and the currency symbol as separate text', async () => {
            // Given a keypad AmountForm for USD
            renderForm({value: '10', currency: 'USD'});
            await waitForBatchedUpdatesWithAct();

            // Then the value, the number pad and the symbol render
            expect(screen.getByDisplayValue('10')).toBeOnTheScreen();
            expect(screen.getByTestId('button_1')).toBeOnTheScreen();
            expect(screen.getByText('$')).toBeOnTheScreen();
        });

        it('hides the currency symbol with hideCurrencySymbol', async () => {
            // Given a keypad AmountForm that hides the symbol
            renderForm({value: '10', currency: 'USD', hideCurrencySymbol: true});
            await waitForBatchedUpdatesWithAct();

            // Then no symbol renders
            expect(screen.queryByText('$')).toBeNull();
        });

        it('edits the value with the number pad and reports changes', async () => {
            // Given a keypad AmountForm with an empty value
            const onInputChange = jest.fn();
            renderForm({value: '', currency: 'USD', onInputChange});
            await waitForBatchedUpdatesWithAct();

            // When the user presses 1, 2, a decimal point and 5
            fireEvent.press(screen.getByTestId('button_1'));
            fireEvent.press(screen.getByTestId('button_2'));
            fireEvent.press(screen.getByTestId('button_.'));
            fireEvent.press(screen.getByTestId('button_5'));
            await waitForBatchedUpdatesWithAct();

            // Then every accepted key is reported and the value is displayed
            expect(onInputChange).toHaveBeenLastCalledWith('12.5');
            expect(screen.getByDisplayValue('12.5')).toBeOnTheScreen();

            // When the user presses backspace
            fireEvent.press(screen.getByTestId('button_<'));
            await waitForBatchedUpdatesWithAct();

            // Then the last digit is removed
            expect(onInputChange).toHaveBeenLastCalledWith('12.');
        });

        it('limits the decimals to the currency precision and honors the decimals override', async () => {
            // Given a keypad AmountForm for JPY (0 decimal places)
            const onInputChangeJPY = jest.fn();
            const {unmount} = renderForm({value: '10', currency: 'JPY', onInputChange: onInputChangeJPY});
            await waitForBatchedUpdatesWithAct();

            // When the user types a decimal value
            fireEvent.changeText(screen.getByDisplayValue('10'), '10.5');
            await waitForBatchedUpdatesWithAct();

            // Then the change is rejected
            expect(onInputChangeJPY).not.toHaveBeenCalled();
            expect(screen.getByDisplayValue('10')).toBeOnTheScreen();

            unmount();

            // Given a keypad AmountForm with a 3 decimal places override, like the distance rate pages
            const onInputChange = jest.fn();
            renderForm({value: '1', currency: 'USD', decimals: 3, onInputChange});
            await waitForBatchedUpdatesWithAct();

            // When the user types three decimal places
            fireEvent.changeText(screen.getByDisplayValue('1'), '1.125');
            await waitForBatchedUpdatesWithAct();

            // Then the override is respected
            expect(onInputChange).toHaveBeenLastCalledWith('1.125');
        });

        it('exposes the imperative API through numberFormRef', async () => {
            // Given a keypad AmountForm with a numberFormRef
            const numberFormRef = React.createRef<AmountEditingRef>();
            const onInputChange = jest.fn();
            renderForm({value: '10', numberFormRef, onInputChange});
            await waitForBatchedUpdatesWithAct();

            expect(numberFormRef.current?.getNumber()).toBe('10');

            // When updateNumber replaces the value imperatively
            act(() => {
                numberFormRef.current?.updateNumber('25');
            });
            await waitForBatchedUpdatesWithAct();

            // Then the value updates without notifying onInputChange
            expect(numberFormRef.current?.getNumber()).toBe('25');
            expect(screen.getByDisplayValue('25')).toBeOnTheScreen();
            expect(onInputChange).not.toHaveBeenCalled();
        });

        it('forwards the ref to the text input so FormProvider can focus it', async () => {
            // Given a keypad AmountForm with an object ref
            const ref = React.createRef<BaseTextInputRef>();
            renderForm({value: '10', ref});
            await waitForBatchedUpdatesWithAct();

            // Then the ref exposes the input methods FormProvider relies on
            expect(typeof ref.current?.focus).toBe('function');
            expect(typeof ref.current?.measureLayout).toBe('function');
        });

        it('renders the error text and forwards blur and focus', async () => {
            // Given a keypad AmountForm with an error and focus callbacks
            const onBlur = jest.fn();
            const onFocus = jest.fn();
            renderForm({value: '10', errorText: 'Invalid amount', onBlur, onFocus});
            await waitForBatchedUpdatesWithAct();

            // Then the error text is displayed
            expect(screen.getByText('Invalid amount')).toBeOnTheScreen();

            // When the input receives and loses focus
            fireEvent(screen.getByDisplayValue('10'), 'focus');
            fireEvent(screen.getByDisplayValue('10'), 'blur');

            // Then both callbacks are forwarded
            expect(onFocus).toHaveBeenCalledTimes(1);
            expect(onBlur).toHaveBeenCalledTimes(1);
        });

        it('clears the editor when the value is reset to an empty string', async () => {
            // Given a keypad AmountForm with a value
            const {rerender} = renderForm({value: '10'});
            await waitForBatchedUpdatesWithAct();
            expect(screen.getByDisplayValue('10')).toBeOnTheScreen();

            // When the parent resets the value
            rerender(wrapForm({value: ''}));
            await waitForBatchedUpdatesWithAct();

            // Then the input is cleared
            expect(screen.queryByDisplayValue('10')).toBeNull();
        });

        it('renders the currency button only when the currency is pressable', async () => {
            // Given a keypad AmountForm with a non-pressable currency
            const {unmount} = renderForm({value: '10', currency: 'USD', isCurrencyPressable: false});
            await waitForBatchedUpdatesWithAct();

            // Then there is no currency button
            expect(screen.queryByText('USD')).toBeNull();

            unmount();

            // Given a keypad AmountForm with the default pressable currency
            const onCurrencyButtonPress = jest.fn();
            renderForm({value: '10', currency: 'USD', onCurrencyButtonPress});
            await waitForBatchedUpdatesWithAct();

            // When the currency button is pressed
            fireEvent.press(screen.getByText('USD'));
            await waitForBatchedUpdatesWithAct();

            // Then the currency callback is invoked
            expect(onCurrencyButtonPress).toHaveBeenCalledTimes(1);
        });

        it('uses the amount accessibility label unless a label is passed', async () => {
            // Given a keypad AmountForm without a label
            const {unmount} = renderForm({value: '10'});
            await waitForBatchedUpdatesWithAct();

            // Then the input falls back to the default amount label
            expect(screen.getByLabelText('Amount')).toBeOnTheScreen();

            unmount();

            // Given a keypad AmountForm with a label
            renderForm({value: '10', label: 'Rate'});
            await waitForBatchedUpdatesWithAct();

            // Then the label is used as the accessibility label
            expect(screen.getByLabelText('Rate')).toBeOnTheScreen();
        });
    });
});
