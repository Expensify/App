import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import type {NumberWithSymbolFormProps, NumberWithSymbolFormRef} from '@components/NumberWithSymbolForm';
import NumberWithSymbolForm from '@components/NumberWithSymbolForm';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import Text from '@components/Text';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

import type * as DeviceCapabilities from '@libs/DeviceCapabilities';
import type ShouldIgnoreSelectionWhenUpdatedManually from '@libs/shouldIgnoreSelectionWhenUpdatedManually/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type * as NativeNavigation from '@react-navigation/native';

import React from 'react';
import Onyx from 'react-native-onyx';

import {translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const mockIsFocused = jest.fn(() => true);

jest.mock('@libs/DeviceCapabilities', () => ({
    ...jest.requireActual<typeof DeviceCapabilities>('@libs/DeviceCapabilities'),
    canUseTouchScreen: () => true,
}));
jest.mock('@libs/shouldIgnoreSelectionWhenUpdatedManually', () => ({
    ...jest.requireActual<{default: ShouldIgnoreSelectionWhenUpdatedManually}>('@libs/shouldIgnoreSelectionWhenUpdatedManually'),
    __esModule: true,
    default: true,
}));

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof NativeNavigation>('@react-navigation/native'),
    useNavigation: jest.fn(() => ({
        navigate: jest.fn(),
        addListener: jest.fn(() => jest.fn()),
    })),
    useIsFocused: () => mockIsFocused(),
    useRoute: jest.fn(() => ({key: '', name: '', params: {}})),
}));

const mockIsInLandscapeMode = jest.fn(() => false);
jest.mock('@hooks/useIsInLandscapeMode', () => ({
    __esModule: true,
    default: () => mockIsInLandscapeMode(),
}));

const INPUT_TEST_ID = 'number-with-symbol-form-input';
const getFlipLabel = () => translateLocal('iou.flip');

function wrapForm(props: Partial<NumberWithSymbolFormProps> = {}) {
    return (
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <NumberWithSymbolForm
                symbol="$"
                testID={INPUT_TEST_ID}
                {...props}
            />
        </ComposeProviders>
    );
}

function renderForm(props: Partial<NumberWithSymbolFormProps> = {}) {
    return render(wrapForm(props));
}

function queryAllById(id: string) {
    return screen.UNSAFE_queryAllByProps({id});
}

function getTextInput() {
    return screen.getByTestId(INPUT_TEST_ID);
}

type TextSelection = {
    start: number;
    end: number;
};

type AccessibilityStateProps = {
    accessibilityState?: {
        disabled?: boolean;
    };
};

function isTextSelection(value: unknown): value is TextSelection {
    if (typeof value !== 'object' || value === null) {
        return false;
    }

    return typeof Reflect.get(value, 'start') === 'number' && typeof Reflect.get(value, 'end') === 'number';
}

function getTextInputSelection(input: ReturnType<typeof getTextInput>): TextSelection {
    const {selection} = input.props;
    if (!isTextSelection(selection)) {
        throw new Error('Expected text input selection');
    }

    return selection;
}

describe('NumberWithSymbolForm', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => {
        jest.clearAllMocks();
        mockIsInLandscapeMode.mockReturnValue(false);
        mockIsFocused.mockReturnValue(true);
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
    });

    describe('displayAsTextInput path', () => {
        it('renders a plain text input with no number pad', async () => {
            // Given a form configured to display as a text input
            renderForm({displayAsTextInput: true, value: '10'});
            await waitForBatchedUpdatesWithAct();

            // Then the text input is shown without the number pad
            expect(getTextInput()).toBeTruthy();
            expect(screen.getByDisplayValue('10')).toBeTruthy();
            // No BigNumberPad on this path, even though `shouldShowBigNumberPad` defaults to true on touch devices
            expect(screen.queryByTestId('button_1')).toBeNull();
            expect(screen.queryByTestId('button_<')).toBeNull();
            expect(queryAllById('numberView')).toHaveLength(0);
            expect(queryAllById('numPadContainerView')).toHaveLength(0);
        });

        it('clears the internal number and selection when the value prop resets to empty', async () => {
            // Given a text input with an initial value
            const {rerender} = renderForm({displayAsTextInput: true, value: '5'});
            await waitForBatchedUpdatesWithAct();

            // When the user changes the value and the value prop is reset to empty
            fireEvent.changeText(getTextInput(), '25');
            await waitForBatchedUpdatesWithAct();

            // Then the value and selection are cleared
            expect(screen.getByDisplayValue('25')).toBeTruthy();

            rerender(wrapForm({displayAsTextInput: true, value: ''}));

            await waitForBatchedUpdatesWithAct();

            expect(screen.getByDisplayValue('')).toBeTruthy();
            expect(getTextInput().props.selection).toEqual({start: 0, end: 0});
        });

        it('does not update the internal number when the value prop changes to another non-empty value', async () => {
            // Given a text input with an initial value
            const {rerender} = renderForm({displayAsTextInput: true, value: '5'});
            await waitForBatchedUpdatesWithAct();

            // When the value prop changes to another non-empty value
            rerender(wrapForm({displayAsTextInput: true, value: '10'}));

            await waitForBatchedUpdatesWithAct();

            // Then the internal value remains unchanged
            expect(screen.getByDisplayValue('5')).toBeTruthy();
        });

        it('strips decimals when the decimals prop changes to a lower precision', async () => {
            // Given a text input displaying a decimal value
            const onInputChange = jest.fn();
            const {rerender} = renderForm({displayAsTextInput: true, value: '1.5', decimals: 2, onInputChange});
            await waitForBatchedUpdatesWithAct();

            // When the allowed precision is reduced
            rerender(wrapForm({displayAsTextInput: true, value: '1.5', decimals: 0, onInputChange}));

            await waitForBatchedUpdatesWithAct();

            // Then the value is truncated and reported to the caller
            expect(screen.getByDisplayValue('1')).toBeTruthy();
            expect(onInputChange).toHaveBeenCalledWith('1');
        });

        it('does not render the flip or currency buttons by default', async () => {
            // Given a text input with currency configured but no optional controls enabled
            renderForm({displayAsTextInput: true, value: '10', currency: 'USD'});
            await waitForBatchedUpdatesWithAct();

            // Then neither optional button is rendered
            expect(screen.queryByText(getFlipLabel())).toBeNull();
            expect(screen.queryByText('USD')).toBeNull();
        });

        it('passes the symbol as the prefix character for a display text input', async () => {
            // Given a text input with a visible symbol
            renderForm({displayAsTextInput: true, value: '10', symbol: '$'});
            await waitForBatchedUpdatesWithAct();

            // Then the symbol is rendered as a prefix
            expect(screen.getByText('$')).toBeTruthy();
        });

        it('does not pass a prefix character when the symbol is hidden', async () => {
            // Given a text input with a hidden symbol
            renderForm({displayAsTextInput: true, value: '10', symbol: '$', hideSymbol: true});
            await waitForBatchedUpdatesWithAct();

            // Then no prefix symbol is rendered
            expect(screen.queryByText('$')).toBeNull();
        });

        it('passes disabled to display-input trailing controls', async () => {
            // Given a disabled text input with a currency button
            const onCurrencyButtonPress = jest.fn();
            renderForm({displayAsTextInput: true, value: '10', currency: 'USD', shouldShowCurrencyButton: true, disabled: true, onCurrencyButtonPress});
            await waitForBatchedUpdatesWithAct();

            // Then the currency button is disabled
            const currencyButton = screen.getByLabelText('Select a currency, USD');
            expect(currencyButton.props.accessibilityState).toEqual(expect.objectContaining({disabled: true}));

            // When the disabled currency button is pressed
            fireEvent.press(currencyButton);

            // Then the currency callback is not called
            expect(onCurrencyButtonPress).not.toHaveBeenCalled();
        });

        it('calls onSubmitEditing on the display-input path', async () => {
            // Given a text input with an onSubmitEditing callback
            const onSubmitEditing = jest.fn();
            renderForm({displayAsTextInput: true, value: '10', onSubmitEditing});
            await waitForBatchedUpdatesWithAct();

            // When the input is submitted
            fireEvent(getTextInput(), 'submitEditing');

            // Then the callback is called
            expect(onSubmitEditing).toHaveBeenCalledTimes(1);
        });

        it('renders error text on the display-input path', async () => {
            // Given a text input with an error
            renderForm({displayAsTextInput: true, value: '10', errorText: 'Invalid amount'});
            await waitForBatchedUpdatesWithAct();

            // Then the error text is displayed
            expect(screen.getByText('Invalid amount')).toBeTruthy();
        });

        it('assigns the text input instance to the separate `ref` prop', async () => {
            // Given a text input with an object ref
            const ref = React.createRef<BaseTextInputRef>();
            renderForm({displayAsTextInput: true, value: '10', ref});
            await waitForBatchedUpdatesWithAct();

            // Then the ref points to the text input instance
            expect(ref.current).toBeTruthy();
        });

        it('assigns the text input instance via a callback `ref` prop', async () => {
            // Given a text input with a callback ref
            const ref = jest.fn<void, [BaseTextInputRef | null]>();
            renderForm({displayAsTextInput: true, value: '10', ref});
            await waitForBatchedUpdatesWithAct();

            // Then the callback ref receives the text input instance
            expect(ref).toHaveBeenCalled();
            expect(jest.mocked(ref).mock.calls.at(-1)?.[0]).toBeTruthy();
        });

        describe('setFormattedNumber / addLeadingZero', () => {
            it('adds a leading zero when the value starts with a decimal separator', async () => {
                // Given an empty text input that accepts decimals
                const onInputChange = jest.fn();
                renderForm({displayAsTextInput: true, value: '', decimals: 2, onInputChange});
                await waitForBatchedUpdatesWithAct();

                // When a decimal separator is entered
                fireEvent.changeText(getTextInput(), '.');
                await waitForBatchedUpdatesWithAct();

                // Then a leading zero is added
                expect(onInputChange).toHaveBeenCalledWith('0.');
                expect(screen.getByDisplayValue('0.')).toBeTruthy();
            });

            it('preserves a negative decimal that already has a leading zero', async () => {
                // Given an empty text input that allows negative decimal input
                const onInputChange = jest.fn();
                renderForm({displayAsTextInput: true, value: '', decimals: 2, allowNegativeInput: true, onInputChange});
                await waitForBatchedUpdatesWithAct();

                // When a negative decimal is entered
                fireEvent.changeText(getTextInput(), '-0.5');
                await waitForBatchedUpdatesWithAct();

                // Then the value is preserved
                expect(onInputChange).toHaveBeenCalledWith('-0.5');
                expect(screen.getByDisplayValue('-0.5')).toBeTruthy();
            });

            // Quirk locked in on purpose: `addLeadingZero('-.', true)` returns `-0-.` (it prepends `-0` to the whole
            // string instead of inserting the zero after the sign), so the value fails validation and is dropped.
            it('rejects "-." even when negative input is allowed', async () => {
                // Given an empty text input that allows negative input
                const onInputChange = jest.fn();
                renderForm({displayAsTextInput: true, value: '', decimals: 2, allowNegativeInput: true, onInputChange});
                await waitForBatchedUpdatesWithAct();

                // When an invalid negative decimal is entered
                fireEvent.changeText(getTextInput(), '-.');
                await waitForBatchedUpdatesWithAct();

                // Then the invalid value is rejected
                expect(onInputChange).not.toHaveBeenCalled();
                expect(screen.getByDisplayValue('')).toBeTruthy();
            });

            it('rejects "-." when negative input is not allowed', async () => {
                // Given an empty text input that does not allow negative input
                const onInputChange = jest.fn();
                renderForm({displayAsTextInput: true, value: '', decimals: 2, onInputChange});
                await waitForBatchedUpdatesWithAct();

                // When an invalid negative decimal is entered
                fireEvent.changeText(getTextInput(), '-.');
                await waitForBatchedUpdatesWithAct();

                // Then the invalid value is rejected
                expect(onInputChange).not.toHaveBeenCalled();
                expect(screen.getByDisplayValue('')).toBeTruthy();
            });

            it('replaces commas with a period and strips spaces', async () => {
                // Given an empty text input that accepts decimals
                const onInputChange = jest.fn();
                renderForm({displayAsTextInput: true, value: '', decimals: 2, onInputChange});
                await waitForBatchedUpdatesWithAct();

                // When a number containing spaces and a comma is entered
                fireEvent.changeText(getTextInput(), '1 2,5');
                await waitForBatchedUpdatesWithAct();

                // Then the value is normalized
                expect(onInputChange).toHaveBeenCalledWith('12.5');
            });

            it('does not update the value when the new number is invalid', async () => {
                // Given a text input displaying an integer
                const onInputChange = jest.fn();
                renderForm({displayAsTextInput: true, value: '12', decimals: 0, onInputChange});
                await waitForBatchedUpdatesWithAct();

                // When a decimal value is entered while decimals are disabled
                fireEvent.changeText(getTextInput(), '12.5');
                await waitForBatchedUpdatesWithAct();

                // Then the invalid value is ignored
                expect(onInputChange).not.toHaveBeenCalled();
                expect(screen.getByDisplayValue('12')).toBeTruthy();
            });
        });

        describe('negation via the internal handleFlipPress', () => {
            const flipProps: Partial<NumberWithSymbolFormProps> = {
                displayAsTextInput: true,
                shouldShowFlipButton: true,
                allowNegativeInput: true,
                decimals: 2,
            };

            it('shows the flip button only when `shouldShowFlipButton` and `allowNegativeInput` are both set', async () => {
                // Given a text input with the flip button requested but negative input disabled
                renderForm({...flipProps, allowNegativeInput: false, value: '5'});
                await waitForBatchedUpdatesWithAct();

                // Then the flip button is hidden
                expect(screen.queryByText(getFlipLabel())).toBeNull();

                // When negative input is enabled
                screen.unmount();

                renderForm({...flipProps, value: '5'});
                await waitForBatchedUpdatesWithAct();

                // Then the flip button is shown
                expect(screen.getByText(getFlipLabel())).toBeTruthy();
            });

            it('toggles the minus sign on the value and calls onInputChange, without calling toggleNegative', async () => {
                // Given a text input with negative input and flipping enabled
                const onInputChange = jest.fn();
                const toggleNegative = jest.fn();
                renderForm({...flipProps, value: '5', onInputChange, toggleNegative, allowFlippingAmount: true});
                await waitForBatchedUpdatesWithAct();

                // When the flip button is pressed twice
                fireEvent.press(screen.getByText(getFlipLabel()));
                await waitForBatchedUpdatesWithAct();

                // Then the value toggles and the text-input callback is used
                expect(onInputChange).toHaveBeenLastCalledWith('-5');
                expect(screen.getByDisplayValue('-5')).toBeTruthy();
                // The text-input path never delegates to the caller-supplied toggleNegative
                expect(toggleNegative).not.toHaveBeenCalled();

                fireEvent.press(screen.getByText(getFlipLabel()));
                await waitForBatchedUpdatesWithAct();

                expect(onInputChange).toHaveBeenLastCalledWith('5');
                expect(screen.getByDisplayValue('5')).toBeTruthy();
                expect(toggleNegative).not.toHaveBeenCalled();
            });

            it('flips an empty value to a lone minus sign', async () => {
                // Given an empty text input with flipping enabled
                const onInputChange = jest.fn();
                renderForm({...flipProps, value: '', onInputChange});
                await waitForBatchedUpdatesWithAct();

                // When the flip button is pressed
                fireEvent.press(screen.getByText(getFlipLabel()));
                await waitForBatchedUpdatesWithAct();

                // Then a lone minus sign is reported
                expect(onInputChange).toHaveBeenLastCalledWith('-');
            });

            function typeAtSelection(key: string) {
                const input = getTextInput();
                const value = String(input.props.value ?? '');
                const {start, end} = getTextInputSelection(input);
                fireEvent.changeText(input, `${value.slice(0, start)}${key}${value.slice(end)}`);
            }

            it('places the caret after the sign on an empty flip so the next digit becomes a negative amount', async () => {
                // Given an empty text input with flipping enabled
                const onInputChange = jest.fn();
                renderForm({...flipProps, value: '', onInputChange});
                await waitForBatchedUpdatesWithAct();

                // When the flip button is pressed
                fireEvent.press(screen.getByText(getFlipLabel()));
                await waitForBatchedUpdatesWithAct();

                // Then the caret is placed after the minus sign
                expect(getTextInput().props.selection).toEqual({start: 1, end: 1});

                // When a digit is typed at the caret
                typeAtSelection('5');
                await waitForBatchedUpdatesWithAct();

                // Then the digit becomes part of the negative value
                expect(onInputChange).toHaveBeenLastCalledWith('-5');
                expect(screen.getByDisplayValue('-5')).toBeTruthy();
            });

            it('keeps the caret after the digits when flipping a non-empty value so further typing appends', async () => {
                // Given a non-empty text input with flipping enabled
                const onInputChange = jest.fn();
                renderForm({...flipProps, value: '5', onInputChange});
                await waitForBatchedUpdatesWithAct();

                // When the flip button is pressed
                fireEvent.press(screen.getByText(getFlipLabel()));
                await waitForBatchedUpdatesWithAct();

                // Then the caret is placed after the digits
                expect(onInputChange).toHaveBeenLastCalledWith('-5');
                expect(getTextInput().props.selection).toEqual({start: 2, end: 2});

                // When another digit is typed
                typeAtSelection('0');
                await waitForBatchedUpdatesWithAct();

                // Then it is appended to the negative value
                expect(onInputChange).toHaveBeenLastCalledWith('-50');
                expect(screen.getByDisplayValue('-50')).toBeTruthy();
            });
        });

        describe('currency button', () => {
            it('renders the currency button and calls onCurrencyButtonPress', async () => {
                // Given a text input with a currency button
                const onCurrencyButtonPress = jest.fn();
                renderForm({displayAsTextInput: true, value: '5', shouldShowCurrencyButton: true, currency: 'USD', onCurrencyButtonPress});
                await waitForBatchedUpdatesWithAct();

                // When the currency button is pressed
                fireEvent.press(screen.getByText('USD'));
                await waitForBatchedUpdatesWithAct();

                // Then the currency callback is called
                expect(onCurrencyButtonPress).toHaveBeenCalledTimes(1);
            });

            it('prefers `currencyButtonLabel` over `currency` and falls back to onSymbolButtonPress', async () => {
                // Given a text input with a custom currency button label
                const onSymbolButtonPress = jest.fn();
                renderForm({displayAsTextInput: true, value: '5', shouldShowCurrencyButton: true, currency: 'USD', currencyButtonLabel: 'hrs', onSymbolButtonPress});
                await waitForBatchedUpdatesWithAct();

                // When the custom label is pressed
                expect(screen.queryByText('USD')).toBeNull();
                fireEvent.press(screen.getByText('hrs'));
                await waitForBatchedUpdatesWithAct();

                // Then the symbol callback is called
                expect(onSymbolButtonPress).toHaveBeenCalledTimes(1);
            });
        });
    });

    describe('landscape path', () => {
        beforeEach(() => {
            mockIsInLandscapeMode.mockReturnValue(true);
        });

        it('renders the symbol input, the number pad and the currency button', async () => {
            // Given a form rendered in landscape mode
            renderForm({value: '10', currency: 'USD'});
            await waitForBatchedUpdatesWithAct();

            // Then the input, number pad, and currency button are shown
            expect(screen.getByDisplayValue('10')).toBeTruthy();
            // The landscape branch renders the pad next to the input, inside the row ScrollView
            expect(screen.getByTestId('button_1')).toBeTruthy();
            expect(screen.getByTestId('button_<')).toBeTruthy();
            expect(screen.getByText('USD')).toBeTruthy();
            // The landscape branch never renders the portrait `numberView` wrapper
            expect(queryAllById('numberView')).toHaveLength(0);
            expect(queryAllById('numPadContainerView').length).toBeGreaterThan(0);
        });

        it('hides the currency button when the symbol is not pressable', async () => {
            // Given a landscape form with a non-pressable symbol
            renderForm({value: '10', currency: 'USD', isSymbolPressable: false});
            await waitForBatchedUpdatesWithAct();

            // Then the currency button is hidden
            expect(screen.queryByText('USD')).toBeNull();
        });

        it('hides the number pad when `shouldShowBigNumberPad` is false', async () => {
            // Given a landscape form with the number pad disabled
            renderForm({value: '10', shouldShowBigNumberPad: false});
            await waitForBatchedUpdatesWithAct();

            // Then the number pad is hidden
            expect(queryAllById('numPadContainerView')).toHaveLength(0);
            expect(screen.queryByTestId('button_1')).toBeNull();
        });

        it('renders the error message and the footer', async () => {
            // Given a landscape form with an error and footer
            renderForm({
                value: '10',
                errorText: 'Something went wrong',
                footer: <Text>Landscape footer</Text>,
            });
            await waitForBatchedUpdatesWithAct();

            // Then both the error and footer are displayed
            expect(screen.getByText('Something went wrong')).toBeTruthy();
            expect(screen.getByText('Landscape footer')).toBeTruthy();
        });

        it('presses the currency button through onSymbolButtonPress (not onCurrencyButtonPress)', async () => {
            // Given a landscape form with both currency callbacks
            const onSymbolButtonPress = jest.fn();
            const onCurrencyButtonPress = jest.fn();
            renderForm({value: '10', currency: 'USD', onSymbolButtonPress, onCurrencyButtonPress});
            await waitForBatchedUpdatesWithAct();

            // When the currency button is pressed
            fireEvent.press(screen.getByText('USD'));
            await waitForBatchedUpdatesWithAct();

            // Then only onSymbolButtonPress is called
            expect(onSymbolButtonPress).toHaveBeenCalledTimes(1);
            expect(onCurrencyButtonPress).not.toHaveBeenCalled();
        });

        // Known quirk: unlike displayAsTextInput trailing controls, landscape currency/flip buttons never receive `isDisabled`.
        it('does not disable the currency or flip buttons when `disabled` is set', async () => {
            // Given a disabled landscape form with currency and flip buttons
            const onSymbolButtonPress = jest.fn();
            const toggleNegative = jest.fn();
            renderForm({
                value: '10',
                currency: 'USD',
                disabled: true,
                allowFlippingAmount: true,
                onSymbolButtonPress,
                toggleNegative,
            });
            await waitForBatchedUpdatesWithAct();

            // Then the buttons remain enabled
            const currencyButton = screen.getByLabelText('Select a currency, USD');
            expect(currencyButton.props.accessibilityState).toEqual(expect.objectContaining({disabled: false}));
            // Flip is labeled on both the icon and the button; none should report disabled.
            for (const node of screen.getAllByLabelText(getFlipLabel())) {
                const {accessibilityState} = node.props as AccessibilityStateProps;
                expect(accessibilityState?.disabled ?? false).toBe(false);
            }

            // When both buttons are pressed
            fireEvent.press(currencyButton);
            fireEvent.press(screen.getByText(getFlipLabel()));
            await waitForBatchedUpdatesWithAct();

            // Then both callbacks are called
            expect(onSymbolButtonPress).toHaveBeenCalledTimes(1);
            expect(toggleNegative).toHaveBeenCalledTimes(1);
        });

        describe('negation via the caller-supplied toggleNegative', () => {
            it('shows the flip button only when `allowFlippingAmount` is set and delegates the press to toggleNegative', async () => {
                // Given a landscape form without amount flipping enabled
                const toggleNegative = jest.fn();
                const onInputChange = jest.fn();
                renderForm({value: '10', toggleNegative, onInputChange});
                await waitForBatchedUpdatesWithAct();

                // Then the flip button is hidden
                expect(screen.queryByText(getFlipLabel())).toBeNull();

                // When amount flipping is enabled and the flip button is pressed
                screen.unmount();

                renderForm({value: '10', allowFlippingAmount: true, toggleNegative, onInputChange});
                await waitForBatchedUpdatesWithAct();

                fireEvent.press(screen.getByText(getFlipLabel()));
                await waitForBatchedUpdatesWithAct();

                // Then toggleNegative is called without changing the input value
                expect(toggleNegative).toHaveBeenCalledTimes(1);
                // Unlike the text-input path, flipping here never rewrites the value itself
                expect(onInputChange).not.toHaveBeenCalled();
                expect(screen.getByDisplayValue('10')).toBeTruthy();
            });

            it('strips a typed minus sign and toggles negative when `allowFlippingAmount` is set', async () => {
                // Given a landscape form with amount flipping enabled
                const toggleNegative = jest.fn();
                const onInputChange = jest.fn();
                renderForm({value: '10', decimals: 2, allowFlippingAmount: true, toggleNegative, onInputChange});
                await waitForBatchedUpdatesWithAct();

                // When a negative value is typed
                fireEvent.changeText(getTextInput(), '-10');
                await waitForBatchedUpdatesWithAct();

                // Then the minus sign is handled by toggling the amount
                expect(toggleNegative).toHaveBeenCalledTimes(1);
                expect(onInputChange).toHaveBeenCalledWith('10');
            });
        });
    });

    describe('portrait path', () => {
        it('renders the input inside the portrait wrapper, with the pad below it', async () => {
            // Given a form rendered in portrait mode
            renderForm({value: '10', currency: 'USD'});
            await waitForBatchedUpdatesWithAct();

            // Then the input is wrapped and the number pad is shown below it
            expect(screen.getByDisplayValue('10')).toBeTruthy();
            expect(queryAllById('numberView').length).toBeGreaterThan(0);
            expect(queryAllById('numPadContainerView').length).toBeGreaterThan(0);
            expect(screen.getByTestId('button_1')).toBeTruthy();
        });

        it('skips the wrapper when `shouldWrapInputInContainer` is false', async () => {
            // Given a portrait form configured not to wrap the input
            renderForm({value: '10', shouldWrapInputInContainer: false});
            await waitForBatchedUpdatesWithAct();

            // Then the wrapper is skipped
            expect(queryAllById('numberView')).toHaveLength(0);
            expect(screen.getByDisplayValue('10')).toBeTruthy();
        });

        // Known UX defect: the currency button renders with an empty label when currency is omitted.
        it('renders the currency button with an empty label when currency is not provided', async () => {
            // Given a portrait form without a currency
            renderForm({value: '10'});
            await waitForBatchedUpdatesWithAct();

            // Then the currency button has an empty currency label
            expect(screen.getByLabelText('Select a currency, ')).toBeTruthy();
        });

        it('renders the symbol in the suffix position', async () => {
            // Given a form configured to render the symbol as a suffix
            renderForm({value: '10', symbol: 'hrs', symbolPosition: CONST.TEXT_INPUT_SYMBOL_POSITION.SUFFIX});
            await waitForBatchedUpdatesWithAct();

            // Then the symbol is displayed
            expect(screen.getByText('hrs')).toBeTruthy();
        });

        it('does not make the inline symbol pressable when the input is wrapped', async () => {
            // Given a wrapped input with a symbol callback
            const onSymbolButtonPress = jest.fn();
            renderForm({value: '10', symbol: '$', onSymbolButtonPress});
            await waitForBatchedUpdatesWithAct();

            // When the inline symbol is pressed
            fireEvent.press(screen.getByText('$'));

            // Then the symbol callback is not called
            expect(onSymbolButtonPress).not.toHaveBeenCalled();
        });

        it('makes the inline symbol pressable when the input is not wrapped', async () => {
            // Given an unwrapped input with a symbol callback
            const onSymbolButtonPress = jest.fn();
            renderForm({value: '10', symbol: '$', onSymbolButtonPress, shouldWrapInputInContainer: false});
            await waitForBatchedUpdatesWithAct();

            // When the inline symbol is pressed
            fireEvent.press(screen.getByText('$'));

            // Then the symbol callback is called
            expect(onSymbolButtonPress).toHaveBeenCalledTimes(1);
        });

        it('renders the currency button and delegates to onSymbolButtonPress', async () => {
            // Given a portrait form with a symbol callback
            const onSymbolButtonPress = jest.fn();
            renderForm({value: '10', currency: 'USD', onSymbolButtonPress});
            await waitForBatchedUpdatesWithAct();

            // When the currency button is pressed
            fireEvent.press(screen.getByText('USD'));
            await waitForBatchedUpdatesWithAct();

            // Then the symbol callback is called
            expect(onSymbolButtonPress).toHaveBeenCalledTimes(1);
        });

        it('renders both the currency and flip buttons when both are enabled', async () => {
            // Given a portrait form with currency and flipping enabled
            const onSymbolButtonPress = jest.fn();
            const toggleNegative = jest.fn();
            renderForm({
                value: '10',
                currency: 'USD',
                allowFlippingAmount: true,
                onSymbolButtonPress,
                toggleNegative,
            });
            await waitForBatchedUpdatesWithAct();

            // Then both buttons are shown
            expect(screen.getByText('USD')).toBeTruthy();
            expect(screen.getByText(getFlipLabel())).toBeTruthy();

            // When both buttons are pressed
            fireEvent.press(screen.getByText('USD'));
            fireEvent.press(screen.getByText(getFlipLabel()));
            await waitForBatchedUpdatesWithAct();

            // Then both callbacks are called
            expect(onSymbolButtonPress).toHaveBeenCalledTimes(1);
            expect(toggleNegative).toHaveBeenCalledTimes(1);
        });

        // Known quirk: unlike displayAsTextInput trailing controls, portrait currency/flip buttons never receive `isDisabled`.
        it('does not disable the currency or flip buttons when `disabled` is set', async () => {
            // Given a disabled portrait form with currency and flip buttons
            const onSymbolButtonPress = jest.fn();
            const toggleNegative = jest.fn();
            renderForm({
                value: '10',
                currency: 'USD',
                disabled: true,
                allowFlippingAmount: true,
                onSymbolButtonPress,
                toggleNegative,
            });
            await waitForBatchedUpdatesWithAct();

            // Then the buttons remain enabled
            const currencyButton = screen.getByLabelText('Select a currency, USD');
            expect(currencyButton.props.accessibilityState).toEqual(expect.objectContaining({disabled: false}));
            // Flip is labeled on both the icon and the button; none should report disabled.
            for (const node of screen.getAllByLabelText(getFlipLabel())) {
                const {accessibilityState} = node.props as AccessibilityStateProps;
                expect(accessibilityState?.disabled ?? false).toBe(false);
            }

            // When both buttons are pressed
            fireEvent.press(currencyButton);
            fireEvent.press(screen.getByText(getFlipLabel()));
            await waitForBatchedUpdatesWithAct();

            // Then both callbacks are called
            expect(onSymbolButtonPress).toHaveBeenCalledTimes(1);
            expect(toggleNegative).toHaveBeenCalledTimes(1);
        });

        it('renders the error message', async () => {
            // Given a portrait form with an error
            renderForm({value: '10', errorText: 'Please enter an amount'});
            await waitForBatchedUpdatesWithAct();

            // Then the error message is displayed
            expect(screen.getByText('Please enter an amount')).toBeTruthy();
        });

        it('renders the footer without the pad when `shouldShowBigNumberPad` is false', async () => {
            // Given a portrait form with the number pad disabled and a footer
            renderForm({value: '10', shouldShowBigNumberPad: false, footer: <Text>Portrait footer</Text>});
            await waitForBatchedUpdatesWithAct();

            // Then the footer is shown and the pad buttons are hidden
            expect(screen.getByText('Portrait footer')).toBeTruthy();
            expect(queryAllById('numPadContainerView').length).toBeGreaterThan(0);
            expect(screen.queryByTestId('button_1')).toBeNull();
        });

        it('assigns the text input instance to the separate `ref` prop', async () => {
            // Given a portrait form with an object ref
            const ref = React.createRef<BaseTextInputRef>();
            renderForm({value: '10', ref});
            await waitForBatchedUpdatesWithAct();

            // Then the ref points to the text input instance
            expect(ref.current).toBeTruthy();
        });

        it('assigns the text input instance via a callback `ref` prop', async () => {
            // Given a portrait form with a callback ref
            const ref = jest.fn<void, [BaseTextInputRef | null]>();
            renderForm({value: '10', ref});
            await waitForBatchedUpdatesWithAct();

            // Then the callback ref receives the text input instance
            expect(ref).toHaveBeenCalled();
            expect(jest.mocked(ref).mock.calls.at(-1)?.[0]).toBeTruthy();
        });

        it('renders the negative symbol when `isNegative` is set', async () => {
            // Given a portrait form marked as negative
            renderForm({value: '10', isNegative: true});
            await waitForBatchedUpdatesWithAct();

            // Then the negative symbol is displayed
            expect(screen.getByText('-')).toBeTruthy();
        });

        describe('BigNumberPad drives setNewNumber', () => {
            it('appends the pressed digit and reports the new value', async () => {
                // Given a form displaying 1
                const onInputChange = jest.fn();
                renderForm({value: '1', decimals: 2, onInputChange});
                await waitForBatchedUpdatesWithAct();

                // When the digit 2 is pressed on the number pad
                fireEvent.press(screen.getByTestId('button_2'));
                await waitForBatchedUpdatesWithAct();

                // Then 12 is reported and displayed
                expect(onInputChange).toHaveBeenLastCalledWith('12');
                expect(screen.getByDisplayValue('12')).toBeTruthy();
            });

            it('deletes the last character on backspace', async () => {
                // Given a form displaying 12
                const onInputChange = jest.fn();
                renderForm({value: '12', decimals: 2, onInputChange});
                await waitForBatchedUpdatesWithAct();

                // When backspace is pressed on the number pad
                fireEvent.press(screen.getByTestId('button_<'));
                await waitForBatchedUpdatesWithAct();

                // Then the last character is removed
                expect(onInputChange).toHaveBeenLastCalledWith('1');
                expect(screen.getByDisplayValue('1')).toBeTruthy();
            });

            it('adds the leading zero in updateValueNumberPad, before setNewNumber runs', async () => {
                // Given an empty form that accepts decimals
                const onInputChange = jest.fn();
                renderForm({value: '', decimals: 2, onInputChange});
                await waitForBatchedUpdatesWithAct();

                // When the decimal separator is pressed on the number pad
                fireEvent.press(screen.getByTestId('button_.'));
                await waitForBatchedUpdatesWithAct();

                // Then a leading zero is reported
                // `setNewNumber` itself never calls addLeadingZero - the pad handler does it for this path
                expect(onInputChange).toHaveBeenLastCalledWith('0.');
            });

            it('rejects a pad press that would make the number invalid', async () => {
                // Given a form that does not allow decimals
                const onInputChange = jest.fn();
                renderForm({value: '1', decimals: 0, onInputChange});
                await waitForBatchedUpdatesWithAct();

                // When the decimal separator is pressed on the number pad
                fireEvent.press(screen.getByTestId('button_.'));
                await waitForBatchedUpdatesWithAct();

                // Then the invalid value is rejected
                expect(onInputChange).not.toHaveBeenCalled();
                expect(screen.getByDisplayValue('1')).toBeTruthy();
            });

            it('inserts a digit at the current caret position', async () => {
                // Given a form displaying 1234 with the caret after 12
                const onInputChange = jest.fn();
                renderForm({value: '1234', decimals: 2, onInputChange});
                await waitForBatchedUpdatesWithAct();

                fireEvent(getTextInput(), 'selectionChange', {nativeEvent: {selection: {start: 2, end: 2}}});
                await waitForBatchedUpdatesWithAct();

                // When the digit 9 is pressed on the number pad
                fireEvent.press(screen.getByTestId('button_9'));
                await waitForBatchedUpdatesWithAct();

                // Then the digit is inserted at the caret position
                expect(screen.getByDisplayValue('12934')).toBeTruthy();
                expect(getTextInput().props.selection).toEqual({start: 3, end: 3});
                expect(onInputChange).toHaveBeenLastCalledWith('12934');
            });

            it('deletes the selected range', async () => {
                // Given a form displaying 1234 with characters 2 and 3 selected
                const onInputChange = jest.fn();
                renderForm({value: '1234', decimals: 2, onInputChange});
                await waitForBatchedUpdatesWithAct();

                fireEvent(getTextInput(), 'selectionChange', {nativeEvent: {selection: {start: 1, end: 3}}});
                await waitForBatchedUpdatesWithAct();

                // When backspace is pressed on the number pad
                fireEvent.press(screen.getByTestId('button_<'));
                await waitForBatchedUpdatesWithAct();

                // Then the selected range is deleted
                expect(screen.getByDisplayValue('14')).toBeTruthy();
                expect(getTextInput().props.selection).toEqual({start: 1, end: 1});
                expect(onInputChange).toHaveBeenLastCalledWith('14');
            });

            it('does nothing when backspace is pressed for an empty value', async () => {
                // Given an empty form
                const onInputChange = jest.fn();
                renderForm({value: '', decimals: 2, onInputChange});
                await waitForBatchedUpdatesWithAct();

                // When backspace is pressed on the number pad
                fireEvent.press(screen.getByTestId('button_<'));
                await waitForBatchedUpdatesWithAct();

                // Then the value and selection remain empty
                expect(screen.getByDisplayValue('')).toBeTruthy();
                expect(getTextInput().props.selection).toEqual({start: 0, end: 0});
                expect(onInputChange).not.toHaveBeenCalled();
            });

            it('keeps the caret position for a forward-delete keypress followed by pad deletion', async () => {
                // Given a form displaying 1234 with the caret after 12
                const onInputChange = jest.fn();
                renderForm({value: '1234', decimals: 2, onInputChange});
                await waitForBatchedUpdatesWithAct();

                fireEvent(getTextInput(), 'selectionChange', {nativeEvent: {selection: {start: 2, end: 2}}});
                await waitForBatchedUpdatesWithAct();

                // When a character is forward-deleted and backspace is pressed on the number pad
                fireEvent(getTextInput(), 'keyPress', {nativeEvent: {key: 'Delete', ctrlKey: false}});
                fireEvent.changeText(getTextInput(), '124');
                await waitForBatchedUpdatesWithAct();

                fireEvent.press(screen.getByTestId('button_<'));
                await waitForBatchedUpdatesWithAct();

                // Then the expected character is removed and the caret position is preserved
                expect(screen.getByDisplayValue('14')).toBeTruthy();
                expect(getTextInput().props.selection).toEqual({start: 2, end: 2});
                expect(onInputChange).toHaveBeenLastCalledWith('14');
            });
        });
    });

    describe('NumberWithSymbolFormRef imperative API', () => {
        it('getNumber returns the current number and updateNumber replaces it', async () => {
            // Given a form with an imperative ref displaying 10
            const numberFormRef = React.createRef<NumberWithSymbolFormRef>();
            renderForm({value: '10', decimals: 2, numberFormRef});
            await waitForBatchedUpdatesWithAct();

            expect(numberFormRef.current?.getNumber()).toBe('10');

            // When updateNumber changes the value to 25
            await act(async () => {
                numberFormRef.current?.updateNumber('25');
                await waitForBatchedUpdatesWithAct();
            });

            // Then getNumber and the input return 25
            expect(numberFormRef.current?.getNumber()).toBe('25');
            expect(screen.getByDisplayValue('25')).toBeTruthy();
        });

        it('updateNumber bypasses validation and never calls onInputChange', async () => {
            // Given a form that allows no decimal places
            const numberFormRef = React.createRef<NumberWithSymbolFormRef>();
            const onInputChange = jest.fn();
            renderForm({value: '10', decimals: 0, numberFormRef, onInputChange});
            await waitForBatchedUpdatesWithAct();

            // When updateNumber is called with an invalid decimal value
            await act(async () => {
                // "1.5" is invalid for decimals: 0, but updateNumber stores it anyway
                numberFormRef.current?.updateNumber('1.5');
                await waitForBatchedUpdatesWithAct();
            });

            // Then the value is stored without calling onInputChange
            expect(numberFormRef.current?.getNumber()).toBe('1.5');
            expect(onInputChange).not.toHaveBeenCalled();
        });

        it('updateNumber strips the minus sign and toggles negative when `allowFlippingAmount` is set', async () => {
            // Given a form with amount flipping enabled
            const numberFormRef = React.createRef<NumberWithSymbolFormRef>();
            const toggleNegative = jest.fn();
            renderForm({value: '10', decimals: 2, allowFlippingAmount: true, toggleNegative, numberFormRef});
            await waitForBatchedUpdatesWithAct();

            // When updateNumber is called with a negative value
            await act(async () => {
                numberFormRef.current?.updateNumber('-25');
                await waitForBatchedUpdatesWithAct();
            });

            // Then the sign is handled by toggleNegative and the stored number is positive
            expect(toggleNegative).toHaveBeenCalledTimes(1);
            expect(numberFormRef.current?.getNumber()).toBe('25');
        });

        it('updateNumber moves the caret to the end of the new number', async () => {
            // Given a form with an imperative ref
            const numberFormRef = React.createRef<NumberWithSymbolFormRef>();
            renderForm({value: '10', decimals: 2, numberFormRef});
            await waitForBatchedUpdatesWithAct();

            // When updateNumber replaces the value with 1234
            await act(async () => {
                numberFormRef.current?.updateNumber('1234');
                await waitForBatchedUpdatesWithAct();
            });

            // Then the caret is at the end of the value
            expect(getTextInput().props.selection).toEqual({start: 4, end: 4});
        });

        it('clearSelection collapses the selection onto its end', async () => {
            // Given a form with a selected range
            const numberFormRef = React.createRef<NumberWithSymbolFormRef>();
            renderForm({value: '1234', decimals: 2, numberFormRef});
            await waitForBatchedUpdatesWithAct();

            fireEvent(getTextInput(), 'selectionChange', {nativeEvent: {selection: {start: 1, end: 3}}});
            await waitForBatchedUpdatesWithAct();

            expect(getTextInput().props.selection).toEqual({start: 1, end: 3});

            // When clearSelection is called
            await act(async () => {
                numberFormRef.current?.clearSelection();
                await waitForBatchedUpdatesWithAct();
            });

            // Then the selection collapses onto its end
            expect(getTextInput().props.selection).toEqual({start: 3, end: 3});
        });
    });

    describe('selection handling', () => {
        it('clears the selection when focus returns after leaving the screen', async () => {
            // Given a form that is not focused and has a selected range
            mockIsFocused.mockReturnValue(false);
            const {rerender} = renderForm({value: '1234'});
            await waitForBatchedUpdatesWithAct();

            fireEvent(getTextInput(), 'selectionChange', {nativeEvent: {selection: {start: 1, end: 3}}});
            await waitForBatchedUpdatesWithAct();

            expect(getTextInput().props.selection).toEqual({start: 1, end: 3});

            // When focus returns to the form
            mockIsFocused.mockReturnValue(true);
            rerender(wrapForm({value: '1234'}));
            await waitForBatchedUpdatesWithAct();

            // Then the selection collapses onto its end
            expect(getTextInput().props.selection).toEqual({start: 3, end: 3});
        });

        it('clamps the selection to the length of the current number', async () => {
            // Given a form displaying 12
            renderForm({value: '12', decimals: 2});
            await waitForBatchedUpdatesWithAct();

            // When a selection beyond the value length is requested
            fireEvent(getTextInput(), 'selectionChange', {nativeEvent: {selection: {start: 10, end: 10}}});
            await waitForBatchedUpdatesWithAct();

            // Then the selection is clamped to the value length
            expect(getTextInput().props.selection).toEqual({start: 2, end: 2});
        });

        it('ignores the selection change once after a manual update (shouldIgnoreSelectionWhenUpdatedManually)', async () => {
            // `handleFlipPress` sets `willSelectionBeUpdatedManually` and never resets it itself, so the next
            // selection event is swallowed. `shouldIgnoreSelectionWhenUpdatedManually` is `true` on native.
            // Given a form with the flip button enabled
            renderForm({displayAsTextInput: true, value: '12', decimals: 2, shouldShowFlipButton: true, allowNegativeInput: true});
            await waitForBatchedUpdatesWithAct();

            // When the value is manually flipped
            fireEvent.press(screen.getByText(getFlipLabel()));
            await waitForBatchedUpdatesWithAct();

            // The caret was at the end of "12" and the added sign shifted it by one
            expect(getTextInput().props.selection).toEqual({start: 3, end: 3});

            fireEvent(getTextInput(), 'selectionChange', {nativeEvent: {selection: {start: 0, end: 0}}});
            await waitForBatchedUpdatesWithAct();

            // Then the first selection event is ignored
            // Swallowed
            expect(getTextInput().props.selection).toEqual({start: 3, end: 3});

            // When a second selection event is fired
            fireEvent(getTextInput(), 'selectionChange', {nativeEvent: {selection: {start: 0, end: 0}}});
            await waitForBatchedUpdatesWithAct();

            // Then the selection is applied
            // Applied
            expect(getTextInput().props.selection).toEqual({start: 0, end: 0});
        });

        it('ignores selection changes while the pad backspace is long pressed (shouldUpdateSelection)', async () => {
            // Given a form displaying 1234 with the caret after 12
            renderForm({value: '1234', decimals: 2});
            await waitForBatchedUpdatesWithAct();

            fireEvent(getTextInput(), 'selectionChange', {nativeEvent: {selection: {start: 2, end: 2}}});
            await waitForBatchedUpdatesWithAct();

            expect(getTextInput().props.selection).toEqual({start: 2, end: 2});

            // When the number pad backspace is long pressed and a selection event occurs
            // `onLongPress` flips `shouldUpdateSelection` off via `longPressHandlerStateChanged(true)`.
            // BigNumberPad also starts a 100ms interval that would call `updateValueNumberPad('<')`.
            // Pin timers so that interval cannot fire, then release the press to clear it.
            jest.useFakeTimers({doNotFake: ['nextTick']});
            try {
                const backspace = screen.getByTestId('button_<');
                fireEvent(backspace, 'longPress');

                fireEvent(getTextInput(), 'selectionChange', {nativeEvent: {selection: {start: 0, end: 0}}});

                // Then the selection remains unchanged while the backspace is held
                expect(getTextInput().props.selection).toEqual({start: 2, end: 2});
                expect(screen.getByDisplayValue('1234')).toBeTruthy();

                fireEvent(backspace, 'pressOut');
            } finally {
                jest.runOnlyPendingTimers();
                jest.useRealTimers();
            }
        });
    });

    describe('validation', () => {
        it('rejects a value longer than `maxLength`', async () => {
            // Given a form with maxLength set to 2
            const onInputChange = jest.fn();
            renderForm({value: '12', decimals: 2, maxLength: 2, onInputChange});
            await waitForBatchedUpdatesWithAct();

            // When a value longer than maxLength is entered
            fireEvent.changeText(getTextInput(), '123');
            await waitForBatchedUpdatesWithAct();

            // Then the value is rejected
            expect(onInputChange).not.toHaveBeenCalled();
            expect(screen.getByDisplayValue('12')).toBeTruthy();
        });

        it('accepts a value that fits `maxLength`', async () => {
            // Given a form with maxLength set to 2
            const onInputChange = jest.fn();
            renderForm({value: '1', decimals: 2, maxLength: 2, onInputChange});
            await waitForBatchedUpdatesWithAct();

            // When a value within maxLength is entered
            fireEvent.changeText(getTextInput(), '12');
            await waitForBatchedUpdatesWithAct();

            // Then the value is accepted
            expect(onInputChange).toHaveBeenCalledWith('12');
        });

        it('rejects more decimals than `decimals` allows', async () => {
            // Given a form that allows one decimal place
            const onInputChange = jest.fn();
            renderForm({value: '1', decimals: 1, onInputChange});
            await waitForBatchedUpdatesWithAct();

            // When a value with too many decimals is entered
            fireEvent.changeText(getTextInput(), '1.55');
            await waitForBatchedUpdatesWithAct();

            // Then the invalid value is rejected
            expect(onInputChange).not.toHaveBeenCalled();

            // When a value with the allowed precision is entered
            fireEvent.changeText(getTextInput(), '1.5');
            await waitForBatchedUpdatesWithAct();

            // Then the valid value is accepted
            expect(onInputChange).toHaveBeenCalledWith('1.5');
        });

        it('keeps the minus sign when `allowNegativeInput` is set and rejects it otherwise', async () => {
            // Given a form that allows negative input
            const onInputChange = jest.fn();
            const toggleNegative = jest.fn();
            renderForm({value: '1', decimals: 2, allowNegativeInput: true, toggleNegative, onInputChange});
            await waitForBatchedUpdatesWithAct();

            // When a negative value is entered
            fireEvent.changeText(getTextInput(), '-15');
            await waitForBatchedUpdatesWithAct();

            // Then the negative value is accepted without toggling
            expect(onInputChange).toHaveBeenCalledWith('-15');
            expect(toggleNegative).not.toHaveBeenCalled();

            // Given a form that does not allow negative input
            screen.unmount();
            onInputChange.mockClear();

            renderForm({value: '1', decimals: 2, toggleNegative, onInputChange});
            await waitForBatchedUpdatesWithAct();

            // When a negative value is entered
            fireEvent.changeText(getTextInput(), '-15');
            await waitForBatchedUpdatesWithAct();

            // Then the value is rejected
            // Neither flipping nor direct negative input is allowed, so the value is rejected outright
            expect(onInputChange).not.toHaveBeenCalled();
            expect(toggleNegative).not.toHaveBeenCalled();
        });
    });

    describe('clearNegative on backspace', () => {
        it('calls clearNegative when backspace is pressed on an empty negative input', async () => {
            // Given an empty negative input
            const clearNegative = jest.fn();
            renderForm({value: '', decimals: 2, isNegative: true, clearNegative});
            await waitForBatchedUpdatesWithAct();

            // When backspace is pressed
            fireEvent(getTextInput(), 'keyPress', {nativeEvent: {key: 'Backspace'}});
            await waitForBatchedUpdatesWithAct();

            // Then clearNegative is called
            expect(clearNegative).toHaveBeenCalledTimes(1);
        });

        it('does not call clearNegative when the amount is not negative', async () => {
            // Given an empty non-negative input
            const clearNegative = jest.fn();
            renderForm({value: '', decimals: 2, clearNegative});
            await waitForBatchedUpdatesWithAct();

            // When backspace is pressed
            fireEvent(getTextInput(), 'keyPress', {nativeEvent: {key: 'Backspace'}});
            await waitForBatchedUpdatesWithAct();

            // Then clearNegative is not called
            expect(clearNegative).not.toHaveBeenCalled();
        });

        it('does not call clearNegative for other keys', async () => {
            // Given an empty negative input
            const clearNegative = jest.fn();
            renderForm({value: '', decimals: 2, isNegative: true, clearNegative});
            await waitForBatchedUpdatesWithAct();

            // When another key is pressed
            fireEvent(getTextInput(), 'keyPress', {nativeEvent: {key: '1'}});
            await waitForBatchedUpdatesWithAct();

            // Then clearNegative is not called
            expect(clearNegative).not.toHaveBeenCalled();
        });
    });
});
