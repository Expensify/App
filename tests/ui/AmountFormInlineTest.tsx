import {act, fireEvent, render, screen} from '@testing-library/react-native';

import type {AmountEditingRef} from '@components/AmountEditingController';
import AmountFormInline from '@components/AmountFormAdapters/AmountFormInline';
import type {AmountFormInlineProps} from '@components/AmountFormAdapters/AmountFormInline';
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

function wrapForm(props: AmountFormInlineProps = {}) {
    return (
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrencyListContextProvider]}>
            <AmountFormInline {...props} />
        </ComposeProviders>
    );
}

function renderForm(props: AmountFormInlineProps = {}) {
    return render(wrapForm(props));
}

// These tests pin the behavior of the inline adapter, which renders AmountFormField.
describe('AmountFormInline', () => {
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

    describe('without a currency button', () => {
        it('renders the currency symbol as a prefix', async () => {
            // Given an AmountFormInline for USD without a currency button
            // When the form renders
            renderForm({value: '10', currency: 'USD', label: 'Amount'});
            await waitForBatchedUpdatesWithAct();

            // Then the value renders with the currency symbol as a prefix and no currency button
            expect(screen.getByDisplayValue('10')).toBeOnTheScreen();
            expect(screen.getByText('$')).toBeOnTheScreen();
            expect(screen.queryByText('USD')).toBeNull();
        });

        it('accepts and reports a value within the currency precision', async () => {
            // Given an AmountFormInline for USD (2 decimal places)
            const onInputChange = jest.fn();
            renderForm({value: '10', currency: 'USD', label: 'Amount', onInputChange});
            await waitForBatchedUpdatesWithAct();

            // When the user enters a value with 2 decimal places
            fireEvent.changeText(screen.getByDisplayValue('10'), '10.25');
            await waitForBatchedUpdatesWithAct();

            // Then the change is accepted and reported
            expect(onInputChange).toHaveBeenLastCalledWith('10.25');
            expect(screen.getByDisplayValue('10.25')).toBeOnTheScreen();
        });

        it('rejects a value exceeding the currency precision', async () => {
            // Given an AmountFormInline for USD (2 decimal places) with a valid value
            const onInputChange = jest.fn();
            renderForm({value: '10.25', currency: 'USD', label: 'Amount', onInputChange});
            await waitForBatchedUpdatesWithAct();

            // When the user enters a value with 3 decimal places
            fireEvent.changeText(screen.getByDisplayValue('10.25'), '10.253');
            await waitForBatchedUpdatesWithAct();

            // Then the change is rejected and the previous value stays
            expect(onInputChange).not.toHaveBeenCalled();
            expect(screen.getByDisplayValue('10.25')).toBeOnTheScreen();
        });

        it('rejects decimals for a zero-decimal currency', async () => {
            // Given an AmountFormInline for JPY (0 decimal places)
            const onInputChangeJPY = jest.fn();
            renderForm({value: '10', currency: 'JPY', label: 'Amount', onInputChange: onInputChangeJPY});
            await waitForBatchedUpdatesWithAct();

            // When the user enters a decimal value for a zero-decimal currency
            fireEvent.changeText(screen.getByDisplayValue('10'), '10.5');
            await waitForBatchedUpdatesWithAct();

            // Then the change is rejected
            expect(onInputChangeJPY).not.toHaveBeenCalled();
            expect(screen.getByDisplayValue('10')).toBeOnTheScreen();
        });

        it('honors the decimals override', async () => {
            // Given an AmountFormInline with a 3 decimal places override, like the distance rate pages
            const onInputChange = jest.fn();
            renderForm({value: '1', currency: 'USD', decimals: 3, onInputChange});
            await waitForBatchedUpdatesWithAct();

            // When the user types three decimal places
            fireEvent.changeText(screen.getByDisplayValue('1'), '1.125');
            await waitForBatchedUpdatesWithAct();

            // Then the override is respected instead of the 2 decimal places of USD
            expect(onInputChange).toHaveBeenLastCalledWith('1.125');
        });

        it('forwards the label as the accessibility label', async () => {
            // Given an AmountFormInline with a custom label, which differs from the default amount label
            // When the form renders
            renderForm({value: '10', label: 'Rate'});
            await waitForBatchedUpdatesWithAct();

            // Then the input is reachable by that label, so screen readers announce the field correctly
            expect(screen.getByLabelText('Rate')).toBeOnTheScreen();
        });

        it('hides the currency symbol with hideCurrencySymbol', async () => {
            // Given an AmountFormInline that hides the symbol, as ChronosScheduleOOOPage does for a duration
            // When the form renders
            renderForm({value: '10', currency: 'USD', hideCurrencySymbol: true});
            await waitForBatchedUpdatesWithAct();

            // Then no symbol prefix renders, because the value is not a money amount
            expect(screen.getByDisplayValue('10')).toBeOnTheScreen();
            expect(screen.queryByText('$')).toBeNull();
        });

        it('forwards the ref to the text input so FormProvider can focus it', async () => {
            // Given an AmountFormInline with an object ref
            const ref = React.createRef<BaseTextInputRef>();

            // When it mounts with the ref
            renderForm({value: '10', ref});
            await waitForBatchedUpdatesWithAct();

            // Then the ref exposes focus and measureLayout, which FormProvider needs to focus and scroll to the field on errors
            expect(typeof ref.current?.focus).toBe('function');
            expect(typeof ref.current?.measureLayout).toBe('function');
        });

        it('renders the error text', async () => {
            // Given an AmountFormInline with an error
            // When the form renders
            renderForm({value: '10', errorText: 'Invalid amount'});
            await waitForBatchedUpdatesWithAct();

            // Then the error text is displayed, so the user knows why the form cannot be submitted
            expect(screen.getByText('Invalid amount')).toBeOnTheScreen();
        });

        it('forwards blur and focus', async () => {
            // Given a rendered AmountFormInline with focus callbacks
            const onBlur = jest.fn();
            const onFocus = jest.fn();
            renderForm({value: '10', onBlur, onFocus});
            await waitForBatchedUpdatesWithAct();

            // When the input receives and loses focus
            fireEvent(screen.getByDisplayValue('10'), 'focus');
            fireEvent(screen.getByDisplayValue('10'), 'blur');

            // Then both callbacks are forwarded, which LimitTypeStep relies on for onFocus
            expect(onFocus).toHaveBeenCalledTimes(1);
            expect(onBlur).toHaveBeenCalledTimes(1);
        });

        it('forwards submit editing', async () => {
            // Given an AmountFormInline with an onSubmitEditing callback
            const onSubmitEditing = jest.fn();
            renderForm({value: '10', onSubmitEditing});
            await waitForBatchedUpdatesWithAct();

            // When the user submits from the keyboard
            fireEvent(screen.getByDisplayValue('10'), 'submitEditing');

            // Then the callback is forwarded, so FormProvider can submit the form from the return key
            expect(onSubmitEditing).toHaveBeenCalledTimes(1);
        });

        it('reads the current value through numberFormRef', async () => {
            // Given an AmountFormInline with a numberFormRef
            const numberFormRef = React.createRef<AmountEditingRef>();

            // When the form renders with a value
            renderForm({value: '10', numberFormRef});
            await waitForBatchedUpdatesWithAct();

            // Then getNumber returns that value, so parents can read the amount without tracking it
            expect(numberFormRef.current?.getNumber()).toBe('10');
        });

        it('updates the value imperatively through numberFormRef', async () => {
            // Given a rendered AmountFormInline with a numberFormRef
            const numberFormRef = React.createRef<AmountEditingRef>();
            const onInputChange = jest.fn();
            renderForm({value: '10', numberFormRef, onInputChange});
            await waitForBatchedUpdatesWithAct();

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

    describe('with a currency button', () => {
        it('renders the composed currency button and forwards button clicks', async () => {
            // Given an AmountFormInline with the trailing currency button enabled
            const onCurrencyButtonPress = jest.fn();
            renderForm({value: '10', currency: 'USD', shouldShowCurrencyButton: true, onCurrencyButtonPress});
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
            // Given an AmountFormInline configured with a custom button label
            const onCurrencyButtonPress = jest.fn();

            // When the form is rendered
            renderForm({
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

    describe('disabled', () => {
        it('locks the input and the currency button', async () => {
            // Given a disabled AmountFormInline with a currency button
            const onCurrencyButtonPress = jest.fn();
            renderForm({value: '10', currency: 'USD', disabled: true, shouldShowCurrencyButton: true, onCurrencyButtonPress});
            await waitForBatchedUpdatesWithAct();

            // When the user presses the currency button
            fireEvent.press(screen.getByText('USD'));
            await waitForBatchedUpdatesWithAct();

            // Then the callback is not invoked and the input cannot be edited
            expect(onCurrencyButtonPress).not.toHaveBeenCalled();
            expect(screen.getByDisplayValue('10').props.readOnly).toBe(true);
        });
    });

    describe('props compatibility', () => {
        it('rejects props that only the keypad adapter takes', () => {
            // Given props meant only for the keypad adapter
            // When they are passed to AmountFormInline
            // Then the compiler rejects them, since the inline adapter takes no isCurrencyPressable prop
            // @ts-expect-error -- the inline adapter takes no isCurrencyPressable prop
            const withCurrencyPressable = <AmountFormInline isCurrencyPressable />;

            expect([withCurrencyPressable]).toHaveLength(1);
        });
    });
});
