import {act, fireEvent, render, screen} from '@testing-library/react-native';

import type {AmountEditingRef} from '@components/AmountEditingController';
import AmountFormKeypad from '@components/AmountFormAdapters/AmountFormKeypad';
import type {AmountFormKeypadProps} from '@components/AmountFormAdapters/AmountFormKeypad';
import ComposeProviders from '@components/ComposeProviders';
import {CurrencyListContextProvider} from '@components/CurrencyListContextProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

import ONYXKEYS from '@src/ONYXKEYS';

import type * as NativeNavigation from '@react-navigation/native';
import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {StyleSheet} from 'react-native';
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

// No inset by default; the safe area test gives the screen a home indicator
const NO_SAFE_AREA_INSETS = {top: 0, right: 0, bottom: 0, left: 0};
const HOME_INDICATOR_INSETS = {...NO_SAFE_AREA_INSETS, bottom: 34};
const mockSafeAreaInsets = jest.fn(() => NO_SAFE_AREA_INSETS);

jest.mock('@hooks/useSafeAreaInsets', () => ({
    __esModule: true,
    default: () => mockSafeAreaInsets(),
}));

function wrapForm(props: AmountFormKeypadProps = {}) {
    return (
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrencyListContextProvider]}>
            <AmountFormKeypad {...props} />
        </ComposeProviders>
    );
}

function renderForm(props: AmountFormKeypadProps = {}) {
    return render(wrapForm(props));
}

// These tests pin the behavior of the keypad adapter, which renders KeypadAmountEditor.
describe('AmountFormKeypad', () => {
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
        mockSafeAreaInsets.mockReturnValue(NO_SAFE_AREA_INSETS);
        jest.clearAllMocks();
        await act(async () => {
            await Onyx.clear();
        });
    });

    describe('keypad rendering', () => {
        it('renders the number pad and the currency symbol as separate text', async () => {
            // Given an AmountFormKeypad for USD
            // When the form renders
            renderForm({value: '10', currency: 'USD'});
            await waitForBatchedUpdatesWithAct();

            // Then the value, the number pad and the symbol render, with the symbol outside the input so it is not part of the edited value
            expect(screen.getByDisplayValue('10')).toBeOnTheScreen();
            expect(screen.getByTestId('button_1')).toBeOnTheScreen();
            expect(screen.getByText('$')).toBeOnTheScreen();
        });

        it('hides the currency symbol with hideCurrencySymbol', async () => {
            // Given an AmountFormKeypad that hides the symbol
            // When the form renders
            renderForm({value: '10', currency: 'USD', hideCurrencySymbol: true});
            await waitForBatchedUpdatesWithAct();

            // Then no symbol renders, so the currency is not shown twice
            expect(screen.queryByText('$')).toBeNull();
        });

        it('edits the value with the number pad and reports changes', async () => {
            // Given an AmountFormKeypad with an empty value
            const onInputChange = jest.fn();
            renderForm({value: '', currency: 'USD', onInputChange});
            await waitForBatchedUpdatesWithAct();

            // When the user presses 1, 2, a decimal point and 5
            fireEvent.press(screen.getByTestId('button_1'));
            fireEvent.press(screen.getByTestId('button_2'));
            fireEvent.press(screen.getByTestId('button_.'));
            fireEvent.press(screen.getByTestId('button_5'));
            await waitForBatchedUpdatesWithAct();

            // Then every accepted key is reported in order and the value is displayed
            expect(onInputChange.mock.calls).toEqual([['1'], ['12'], ['12.'], ['12.5']]);
            expect(screen.getByDisplayValue('12.5')).toBeOnTheScreen();

            // When the user presses backspace
            fireEvent.press(screen.getByTestId('button_<'));
            await waitForBatchedUpdatesWithAct();

            // Then the last digit is removed
            expect(onInputChange).toHaveBeenLastCalledWith('12.');
        });

        it('limits the decimals to the currency precision', async () => {
            // Given an AmountFormKeypad for JPY (0 decimal places)
            const onInputChangeJPY = jest.fn();
            renderForm({value: '10', currency: 'JPY', onInputChange: onInputChangeJPY});
            await waitForBatchedUpdatesWithAct();

            // When the user types a decimal value
            fireEvent.changeText(screen.getByDisplayValue('10'), '10.5');
            await waitForBatchedUpdatesWithAct();

            // Then the change is rejected
            expect(onInputChangeJPY).not.toHaveBeenCalled();
            expect(screen.getByDisplayValue('10')).toBeOnTheScreen();
        });

        it('honors the decimals override', async () => {
            // Given an AmountFormKeypad with a 3 decimal places override, like the distance rate pages
            const onInputChange = jest.fn();
            renderForm({value: '1', currency: 'USD', decimals: 3, onInputChange});
            await waitForBatchedUpdatesWithAct();

            // When the user types three decimal places
            fireEvent.changeText(screen.getByDisplayValue('1'), '1.125');
            await waitForBatchedUpdatesWithAct();

            // Then the override is respected
            expect(onInputChange).toHaveBeenLastCalledWith('1.125');
        });

        it('reads the current value through numberFormRef', async () => {
            // Given an AmountFormKeypad with a numberFormRef
            const numberFormRef = React.createRef<AmountEditingRef>();

            // When the form renders with a value
            renderForm({value: '10', numberFormRef});
            await waitForBatchedUpdatesWithAct();

            // Then getNumber returns that value, so parents can read the amount without tracking it
            expect(numberFormRef.current?.getNumber()).toBe('10');
        });

        it('updates the value imperatively through numberFormRef', async () => {
            // Given a rendered AmountFormKeypad with a numberFormRef
            const numberFormRef = React.createRef<AmountEditingRef>();
            const onInputChange = jest.fn();
            renderForm({value: '10', numberFormRef, onInputChange});
            await waitForBatchedUpdatesWithAct();

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
            // Given an AmountFormKeypad with an object ref
            const ref = React.createRef<BaseTextInputRef>();

            // When an AmountFormKeypad mounts with it
            renderForm({value: '10', ref});
            await waitForBatchedUpdatesWithAct();

            // Then the ref exposes focus and measureLayout, which FormProvider needs to focus and scroll to the field on errors
            expect(typeof ref.current?.focus).toBe('function');
            expect(typeof ref.current?.measureLayout).toBe('function');
        });

        it('renders the error text and forwards blur and focus', async () => {
            // Given an AmountFormKeypad with an error and focus callbacks
            const onBlur = jest.fn();
            const onFocus = jest.fn();

            // When it renders with an error
            renderForm({value: '10', errorText: 'Invalid amount', onBlur, onFocus});
            await waitForBatchedUpdatesWithAct();

            // Then the error text is displayed, so the user knows why the form cannot be submitted
            expect(screen.getByText('Invalid amount')).toBeOnTheScreen();

            // When the input receives and loses focus
            fireEvent(screen.getByDisplayValue('10'), 'focus');
            fireEvent(screen.getByDisplayValue('10'), 'blur');

            // Then both callbacks are forwarded
            expect(onFocus).toHaveBeenCalledTimes(1);
            expect(onBlur).toHaveBeenCalledTimes(1);
        });

        it('clears the editor when the value is reset to an empty string', async () => {
            // Given a rendered AmountFormKeypad with a value
            const {rerender} = renderForm({value: '10'});
            await waitForBatchedUpdatesWithAct();

            // When the parent resets the value
            rerender(wrapForm({value: ''}));
            await waitForBatchedUpdatesWithAct();

            // Then the input is cleared
            expect(screen.queryByDisplayValue('10')).toBeNull();
        });

        it('forwards submit editing', async () => {
            // Given an AmountFormKeypad with an onSubmitEditing callback
            const onSubmitEditing = jest.fn();
            renderForm({value: '10', onSubmitEditing});
            await waitForBatchedUpdatesWithAct();

            // When the user submits from a hardware keyboard
            fireEvent(screen.getByDisplayValue('10'), 'submitEditing');

            // Then the callback is forwarded, so FormProvider can submit the form on Enter
            expect(onSubmitEditing).toHaveBeenCalledTimes(1);
        });

        it('adds no bottom safe area, because FormProvider and ScreenWrapper already apply it', async () => {
            // Given a screen with a home indicator
            mockSafeAreaInsets.mockReturnValue(HOME_INDICATOR_INSETS);

            // When an AmountFormKeypad renders, as it does inside FormProvider on the full-screen amount pages
            renderForm({value: '10', currency: 'USD'});
            await waitForBatchedUpdatesWithAct();

            // Then no scroll container of the editor pads its content by the inset, so the gap above the submit button is not doubled
            const scrollViews = screen.UNSAFE_root.findAll((node) => (node.props as {contentContainerStyle?: unknown}).contentContainerStyle !== undefined);
            const paddings = scrollViews.map((node) => {
                const {contentContainerStyle} = node.props as {contentContainerStyle?: StyleProp<ViewStyle>};
                return Number(StyleSheet.flatten(contentContainerStyle)?.paddingBottom ?? 0);
            });
            expect(paddings.length).toBeGreaterThan(0);
            for (const padding of paddings) {
                expect(padding).toBeLessThan(HOME_INDICATOR_INSETS.bottom);
            }
        });

        it('uses the amount accessibility label', async () => {
            // Given an AmountFormKeypad, which takes no label of its own
            // When the form renders
            renderForm({value: '10'});
            await waitForBatchedUpdatesWithAct();

            // Then the input uses the default amount label
            expect(screen.getByLabelText('Amount')).toBeOnTheScreen();
        });

        it('rejects props that only the inline adapter takes', () => {
            // Given props meant for the inline adapter
            // When they are passed to AmountFormKeypad
            // Then typecheck fails on each @ts-expect-error line if the keypad starts accepting the prop. The runtime assertion only keeps the elements in use
            // @ts-expect-error -- the keypad adapter takes no label
            const withLabel = <AmountFormKeypad label="Rate" />;
            // @ts-expect-error -- the keypad adapter takes no disabled
            const withDisabled = <AmountFormKeypad disabled />;
            // @ts-expect-error -- the keypad adapter takes no currency button props
            const withCurrencyButton = <AmountFormKeypad shouldShowCurrencyButton />;

            expect([withLabel, withDisabled, withCurrencyButton]).toHaveLength(3);
        });
    });
});
