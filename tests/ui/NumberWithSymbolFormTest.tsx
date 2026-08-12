import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import type {NumberWithSymbolFormProps, NumberWithSymbolFormRef} from '@components/NumberWithSymbolForm';
import NumberWithSymbolForm from '@components/NumberWithSymbolForm';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import Text from '@components/Text';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type * as NativeNavigation from '@react-navigation/native';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const mockIsFocused = jest.fn(() => true);

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

function renderForm(props: Partial<NumberWithSymbolFormProps> = {}) {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <NumberWithSymbolForm
                symbol="$"
                testID={INPUT_TEST_ID}
                {...props}
            />
        </ComposeProviders>,
    );
}

function queryAllById(id: string) {
    return screen.UNSAFE_queryAllByProps({id});
}

function getTextInput() {
    return screen.getByTestId(INPUT_TEST_ID);
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
            renderForm({displayAsTextInput: true, value: '10'});
            await waitForBatchedUpdatesWithAct();

            expect(getTextInput()).toBeTruthy();
            expect(screen.getByDisplayValue('10')).toBeTruthy();
            // No BigNumberPad on this path, even though `shouldShowBigNumberPad` defaults to true on touch devices
            expect(screen.queryByTestId('button_1')).toBeNull();
            expect(screen.queryByTestId('button_<')).toBeNull();
            expect(queryAllById('numberView')).toHaveLength(0);
            expect(queryAllById('numPadContainerView')).toHaveLength(0);
        });

        it('clears the internal number and selection when the value prop resets to empty', async () => {
            const {rerender} = renderForm({displayAsTextInput: true, value: '5'});
            await waitForBatchedUpdatesWithAct();

            fireEvent.changeText(getTextInput(), '25');
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByDisplayValue('25')).toBeTruthy();

            rerender(
                <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
                    <NumberWithSymbolForm
                        symbol="$"
                        testID={INPUT_TEST_ID}
                        displayAsTextInput
                        value=""
                    />
                </ComposeProviders>,
            );

            await waitForBatchedUpdatesWithAct();

            expect(screen.getByDisplayValue('')).toBeTruthy();
            expect(getTextInput().props.selection).toEqual({start: 0, end: 0});
        });

        it('does not update the internal number when the value prop changes to another non-empty value', async () => {
            const {rerender} = renderForm({displayAsTextInput: true, value: '5'});
            await waitForBatchedUpdatesWithAct();

            rerender(
                <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
                    <NumberWithSymbolForm
                        symbol="$"
                        testID={INPUT_TEST_ID}
                        displayAsTextInput
                        value="10"
                    />
                </ComposeProviders>,
            );

            await waitForBatchedUpdatesWithAct();

            expect(screen.getByDisplayValue('5')).toBeTruthy();
        });

        it('strips decimals when the decimals prop changes to a lower precision', async () => {
            const onInputChange = jest.fn();
            const {rerender} = renderForm({displayAsTextInput: true, value: '1.5', decimals: 2, onInputChange});
            await waitForBatchedUpdatesWithAct();

            rerender(
                <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
                    <NumberWithSymbolForm
                        symbol="$"
                        testID={INPUT_TEST_ID}
                        displayAsTextInput
                        value="1.5"
                        decimals={0}
                        onInputChange={onInputChange}
                    />
                </ComposeProviders>,
            );

            await waitForBatchedUpdatesWithAct();

            expect(screen.getByDisplayValue('1')).toBeTruthy();
            expect(onInputChange).toHaveBeenCalledWith('1');
        });

        it('does not render the flip or currency buttons by default', async () => {
            renderForm({displayAsTextInput: true, value: '10', currency: 'USD'});
            await waitForBatchedUpdatesWithAct();

            expect(screen.queryByText('Flip')).toBeNull();
            expect(screen.queryByText('USD')).toBeNull();
        });

        it('passes the symbol as the prefix character for a display text input', async () => {
            renderForm({displayAsTextInput: true, value: '10', symbol: '$'});
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText('$')).toBeTruthy();
        });

        it('does not pass a prefix character when the symbol is hidden', async () => {
            renderForm({displayAsTextInput: true, value: '10', symbol: '$', hideSymbol: true});
            await waitForBatchedUpdatesWithAct();

            expect(screen.queryByText('$')).toBeNull();
        });

        it('passes disabled to display-input trailing controls', async () => {
            const onCurrencyButtonPress = jest.fn();
            renderForm({displayAsTextInput: true, value: '10', currency: 'USD', shouldShowCurrencyButton: true, disabled: true, onCurrencyButtonPress});
            await waitForBatchedUpdatesWithAct();

            const currencyButton = screen.getByLabelText('Select a currency, USD');
            expect(currencyButton.props.accessibilityState).toEqual(expect.objectContaining({disabled: true}));

            fireEvent.press(currencyButton);
            expect(onCurrencyButtonPress).not.toHaveBeenCalled();
        });

        it('calls onSubmitEditing on the display-input path', async () => {
            const onSubmitEditing = jest.fn();
            renderForm({displayAsTextInput: true, value: '10', onSubmitEditing});
            await waitForBatchedUpdatesWithAct();

            fireEvent(getTextInput(), 'submitEditing');

            expect(onSubmitEditing).toHaveBeenCalledTimes(1);
        });

        it('renders error text on the display-input path', async () => {
            renderForm({displayAsTextInput: true, value: '10', errorText: 'Invalid amount'});
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText('Invalid amount')).toBeTruthy();
        });

        it('assigns the text input instance to the separate `ref` prop', async () => {
            const ref = React.createRef<BaseTextInputRef>();
            renderForm({displayAsTextInput: true, value: '10', ref});
            await waitForBatchedUpdatesWithAct();

            expect(ref.current).toBeTruthy();
        });

        describe('setFormattedNumber / addLeadingZero', () => {
            it('adds a leading zero when the value starts with a decimal separator', async () => {
                const onInputChange = jest.fn();
                renderForm({displayAsTextInput: true, value: '', decimals: 2, onInputChange});
                await waitForBatchedUpdatesWithAct();

                fireEvent.changeText(getTextInput(), '.');
                await waitForBatchedUpdatesWithAct();

                expect(onInputChange).toHaveBeenCalledWith('0.');
                expect(screen.getByDisplayValue('0.')).toBeTruthy();
            });

            it('adds a leading zero to a negative decimal-only value that already has its zero', async () => {
                const onInputChange = jest.fn();
                renderForm({displayAsTextInput: true, value: '', decimals: 2, allowNegativeInput: true, onInputChange});
                await waitForBatchedUpdatesWithAct();

                fireEvent.changeText(getTextInput(), '-0.5');
                await waitForBatchedUpdatesWithAct();

                expect(onInputChange).toHaveBeenCalledWith('-0.5');
                expect(screen.getByDisplayValue('-0.5')).toBeTruthy();
            });

            // Quirk locked in on purpose: `addLeadingZero('-.', true)` returns `-0-.` (it prepends `-0` to the whole
            // string instead of inserting the zero after the sign), so the value fails validation and is dropped.
            it('rejects "-." even when negative input is allowed', async () => {
                const onInputChange = jest.fn();
                renderForm({displayAsTextInput: true, value: '', decimals: 2, allowNegativeInput: true, onInputChange});
                await waitForBatchedUpdatesWithAct();

                fireEvent.changeText(getTextInput(), '-.');
                await waitForBatchedUpdatesWithAct();

                expect(onInputChange).not.toHaveBeenCalled();
                expect(screen.getByDisplayValue('')).toBeTruthy();
            });

            it('rejects "-." when negative input is not allowed', async () => {
                const onInputChange = jest.fn();
                renderForm({displayAsTextInput: true, value: '', decimals: 2, onInputChange});
                await waitForBatchedUpdatesWithAct();

                fireEvent.changeText(getTextInput(), '-.');
                await waitForBatchedUpdatesWithAct();

                expect(onInputChange).not.toHaveBeenCalled();
                expect(screen.getByDisplayValue('')).toBeTruthy();
            });

            it('replaces commas with a period and strips spaces', async () => {
                const onInputChange = jest.fn();
                renderForm({displayAsTextInput: true, value: '', decimals: 2, onInputChange});
                await waitForBatchedUpdatesWithAct();

                fireEvent.changeText(getTextInput(), '1 2,5');
                await waitForBatchedUpdatesWithAct();

                expect(onInputChange).toHaveBeenCalledWith('12.5');
            });

            it('does not update the value when the new number is invalid', async () => {
                const onInputChange = jest.fn();
                renderForm({displayAsTextInput: true, value: '12', decimals: 0, onInputChange});
                await waitForBatchedUpdatesWithAct();

                fireEvent.changeText(getTextInput(), '12.5');
                await waitForBatchedUpdatesWithAct();

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
                renderForm({...flipProps, allowNegativeInput: false, value: '5'});
                await waitForBatchedUpdatesWithAct();

                expect(screen.queryByText('Flip')).toBeNull();

                screen.unmount();

                renderForm({...flipProps, value: '5'});
                await waitForBatchedUpdatesWithAct();

                expect(screen.getByText('Flip')).toBeTruthy();
            });

            it('toggles the minus sign on the value and calls onInputChange, without calling toggleNegative', async () => {
                const onInputChange = jest.fn();
                const toggleNegative = jest.fn();
                renderForm({...flipProps, value: '5', onInputChange, toggleNegative, allowFlippingAmount: true});
                await waitForBatchedUpdatesWithAct();

                fireEvent.press(screen.getByText('Flip'));
                await waitForBatchedUpdatesWithAct();

                expect(onInputChange).toHaveBeenLastCalledWith('-5');
                expect(screen.getByDisplayValue('-5')).toBeTruthy();
                // The text-input path never delegates to the caller-supplied toggleNegative
                expect(toggleNegative).not.toHaveBeenCalled();

                fireEvent.press(screen.getByText('Flip'));
                await waitForBatchedUpdatesWithAct();

                expect(onInputChange).toHaveBeenLastCalledWith('5');
                expect(screen.getByDisplayValue('5')).toBeTruthy();
                expect(toggleNegative).not.toHaveBeenCalled();
            });

            it('flips an empty value to a lone minus sign', async () => {
                const onInputChange = jest.fn();
                renderForm({...flipProps, value: '', onInputChange});
                await waitForBatchedUpdatesWithAct();

                fireEvent.press(screen.getByText('Flip'));
                await waitForBatchedUpdatesWithAct();

                expect(onInputChange).toHaveBeenLastCalledWith('-');
            });
        });

        describe('currency button', () => {
            it('renders the currency button and calls onCurrencyButtonPress', async () => {
                const onCurrencyButtonPress = jest.fn();
                renderForm({displayAsTextInput: true, value: '5', shouldShowCurrencyButton: true, currency: 'USD', onCurrencyButtonPress});
                await waitForBatchedUpdatesWithAct();

                fireEvent.press(screen.getByText('USD'));
                await waitForBatchedUpdatesWithAct();

                expect(onCurrencyButtonPress).toHaveBeenCalledTimes(1);
            });

            it('prefers `currencyButtonLabel` over `currency` and falls back to onSymbolButtonPress', async () => {
                const onSymbolButtonPress = jest.fn();
                renderForm({displayAsTextInput: true, value: '5', shouldShowCurrencyButton: true, currency: 'USD', currencyButtonLabel: 'hrs', onSymbolButtonPress});
                await waitForBatchedUpdatesWithAct();

                expect(screen.queryByText('USD')).toBeNull();
                fireEvent.press(screen.getByText('hrs'));
                await waitForBatchedUpdatesWithAct();

                expect(onSymbolButtonPress).toHaveBeenCalledTimes(1);
            });
        });
    });

    describe('landscape path', () => {
        beforeEach(() => {
            mockIsInLandscapeMode.mockReturnValue(true);
        });

        it('renders the symbol input, the number pad and the currency button', async () => {
            renderForm({value: '10', currency: 'USD'});
            await waitForBatchedUpdatesWithAct();

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
            renderForm({value: '10', currency: 'USD', isSymbolPressable: false});
            await waitForBatchedUpdatesWithAct();

            expect(screen.queryByText('USD')).toBeNull();
        });

        it('hides the number pad when `shouldShowBigNumberPad` is false', async () => {
            renderForm({value: '10', shouldShowBigNumberPad: false});
            await waitForBatchedUpdatesWithAct();

            expect(screen.queryByTestId('button_1')).toBeNull();
        });

        it('renders the error message and the footer', async () => {
            renderForm({
                value: '10',
                errorText: 'Something went wrong',
                footer: <Text>Landscape footer</Text>,
            });
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText('Something went wrong')).toBeTruthy();
            expect(screen.getByText('Landscape footer')).toBeTruthy();
        });

        it('presses the currency button through onSymbolButtonPress (not onCurrencyButtonPress)', async () => {
            const onSymbolButtonPress = jest.fn();
            const onCurrencyButtonPress = jest.fn();
            renderForm({value: '10', currency: 'USD', onSymbolButtonPress, onCurrencyButtonPress});
            await waitForBatchedUpdatesWithAct();

            fireEvent.press(screen.getByText('USD'));
            await waitForBatchedUpdatesWithAct();

            expect(onSymbolButtonPress).toHaveBeenCalledTimes(1);
            expect(onCurrencyButtonPress).not.toHaveBeenCalled();
        });

        describe('negation via the caller-supplied toggleNegative', () => {
            it('shows the flip button only when `allowFlippingAmount` is set and delegates the press to toggleNegative', async () => {
                const toggleNegative = jest.fn();
                const onInputChange = jest.fn();
                renderForm({value: '10', toggleNegative, onInputChange});
                await waitForBatchedUpdatesWithAct();

                expect(screen.queryByText('Flip')).toBeNull();

                screen.unmount();

                renderForm({value: '10', allowFlippingAmount: true, toggleNegative, onInputChange});
                await waitForBatchedUpdatesWithAct();

                fireEvent.press(screen.getByText('Flip'));
                await waitForBatchedUpdatesWithAct();

                expect(toggleNegative).toHaveBeenCalledTimes(1);
                // Unlike the text-input path, flipping here never rewrites the value itself
                expect(onInputChange).not.toHaveBeenCalled();
                expect(screen.getByDisplayValue('10')).toBeTruthy();
            });

            it('strips a typed minus sign and toggles negative when `allowFlippingAmount` is set', async () => {
                const toggleNegative = jest.fn();
                const onInputChange = jest.fn();
                renderForm({value: '10', decimals: 2, allowFlippingAmount: true, toggleNegative, onInputChange});
                await waitForBatchedUpdatesWithAct();

                fireEvent.changeText(getTextInput(), '-10');
                await waitForBatchedUpdatesWithAct();

                expect(toggleNegative).toHaveBeenCalledTimes(1);
                expect(onInputChange).toHaveBeenCalledWith('10');
            });
        });
    });

    describe('portrait path', () => {
        it('renders the input inside the portrait wrapper, with the pad below it', async () => {
            renderForm({value: '10', currency: 'USD'});
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByDisplayValue('10')).toBeTruthy();
            expect(queryAllById('numberView').length).toBeGreaterThan(0);
            expect(queryAllById('numPadContainerView').length).toBeGreaterThan(0);
            expect(screen.getByTestId('button_1')).toBeTruthy();
        });

        it('skips the wrapper when `shouldWrapInputInContainer` is false', async () => {
            renderForm({value: '10', shouldWrapInputInContainer: false});
            await waitForBatchedUpdatesWithAct();

            expect(queryAllById('numberView')).toHaveLength(0);
            expect(screen.getByDisplayValue('10')).toBeTruthy();
        });

        // Known UX defect: the currency button renders with an empty label when currency is omitted.
        it('renders the currency button with an empty label when currency is not provided', async () => {
            renderForm({value: '10'});
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByLabelText('Select a currency, ')).toBeTruthy();
        });

        it('renders the symbol in the suffix position', async () => {
            renderForm({value: '10', symbol: 'hrs', symbolPosition: CONST.TEXT_INPUT_SYMBOL_POSITION.SUFFIX});
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText('hrs')).toBeTruthy();
        });

        it('does not make the inline symbol pressable when the input is wrapped', async () => {
            const onSymbolButtonPress = jest.fn();
            renderForm({value: '10', symbol: '$', onSymbolButtonPress});
            await waitForBatchedUpdatesWithAct();

            fireEvent.press(screen.getByText('$'));

            expect(onSymbolButtonPress).not.toHaveBeenCalled();
        });

        it('makes the inline symbol pressable when the input is not wrapped', async () => {
            const onSymbolButtonPress = jest.fn();
            renderForm({value: '10', symbol: '$', onSymbolButtonPress, shouldWrapInputInContainer: false});
            await waitForBatchedUpdatesWithAct();

            fireEvent.press(screen.getByText('$'));

            expect(onSymbolButtonPress).toHaveBeenCalledTimes(1);
        });

        it('renders the currency button and delegates to onSymbolButtonPress', async () => {
            const onSymbolButtonPress = jest.fn();
            renderForm({value: '10', currency: 'USD', onSymbolButtonPress});
            await waitForBatchedUpdatesWithAct();

            fireEvent.press(screen.getByText('USD'));
            await waitForBatchedUpdatesWithAct();

            expect(onSymbolButtonPress).toHaveBeenCalledTimes(1);
        });

        it('renders both the currency and flip buttons when both are enabled', async () => {
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

            expect(screen.getByText('USD')).toBeTruthy();
            expect(screen.getByText('Flip')).toBeTruthy();

            fireEvent.press(screen.getByText('USD'));
            fireEvent.press(screen.getByText('Flip'));
            await waitForBatchedUpdatesWithAct();

            expect(onSymbolButtonPress).toHaveBeenCalledTimes(1);
            expect(toggleNegative).toHaveBeenCalledTimes(1);
        });

        it('renders the error message', async () => {
            renderForm({value: '10', errorText: 'Please enter an amount'});
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText('Please enter an amount')).toBeTruthy();
        });

        it('renders the footer without the pad when `shouldShowBigNumberPad` is false', async () => {
            renderForm({value: '10', shouldShowBigNumberPad: false, footer: <Text>Portrait footer</Text>});
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText('Portrait footer')).toBeTruthy();
            expect(screen.queryByTestId('button_1')).toBeNull();
        });

        it('assigns the text input instance to the separate `ref` prop', async () => {
            const ref = React.createRef<BaseTextInputRef>();
            renderForm({value: '10', ref});
            await waitForBatchedUpdatesWithAct();

            expect(ref.current).toBeTruthy();
        });

        it('renders the negative symbol when `isNegative` is set', async () => {
            renderForm({value: '10', isNegative: true});
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText('-')).toBeTruthy();
        });

        describe('BigNumberPad drives setNewNumber', () => {
            it('appends the pressed digit and reports the new value', async () => {
                const onInputChange = jest.fn();
                renderForm({value: '1', decimals: 2, onInputChange});
                await waitForBatchedUpdatesWithAct();

                fireEvent.press(screen.getByTestId('button_2'));
                await waitForBatchedUpdatesWithAct();

                expect(onInputChange).toHaveBeenLastCalledWith('12');
                expect(screen.getByDisplayValue('12')).toBeTruthy();
            });

            it('deletes the last character on backspace', async () => {
                const onInputChange = jest.fn();
                renderForm({value: '12', decimals: 2, onInputChange});
                await waitForBatchedUpdatesWithAct();

                fireEvent.press(screen.getByTestId('button_<'));
                await waitForBatchedUpdatesWithAct();

                expect(onInputChange).toHaveBeenLastCalledWith('1');
                expect(screen.getByDisplayValue('1')).toBeTruthy();
            });

            it('adds the leading zero in updateValueNumberPad, before setNewNumber runs', async () => {
                const onInputChange = jest.fn();
                renderForm({value: '', decimals: 2, onInputChange});
                await waitForBatchedUpdatesWithAct();

                fireEvent.press(screen.getByTestId('button_.'));
                await waitForBatchedUpdatesWithAct();

                // `setNewNumber` itself never calls addLeadingZero - the pad handler does it for this path
                expect(onInputChange).toHaveBeenLastCalledWith('0.');
            });

            it('rejects a pad press that would make the number invalid', async () => {
                const onInputChange = jest.fn();
                renderForm({value: '1', decimals: 0, onInputChange});
                await waitForBatchedUpdatesWithAct();

                fireEvent.press(screen.getByTestId('button_.'));
                await waitForBatchedUpdatesWithAct();

                expect(onInputChange).not.toHaveBeenCalled();
                expect(screen.getByDisplayValue('1')).toBeTruthy();
            });

            it('inserts a digit at the current caret position', async () => {
                const onInputChange = jest.fn();
                renderForm({value: '1234', decimals: 2, onInputChange});
                await waitForBatchedUpdatesWithAct();

                fireEvent(getTextInput(), 'selectionChange', {nativeEvent: {selection: {start: 2, end: 2}}});
                await waitForBatchedUpdatesWithAct();

                fireEvent.press(screen.getByTestId('button_9'));
                await waitForBatchedUpdatesWithAct();

                expect(screen.getByDisplayValue('12934')).toBeTruthy();
                expect(getTextInput().props.selection).toEqual({start: 3, end: 3});
                expect(onInputChange).toHaveBeenLastCalledWith('12934');
            });

            it('deletes the selected range', async () => {
                const onInputChange = jest.fn();
                renderForm({value: '1234', decimals: 2, onInputChange});
                await waitForBatchedUpdatesWithAct();

                fireEvent(getTextInput(), 'selectionChange', {nativeEvent: {selection: {start: 1, end: 3}}});
                await waitForBatchedUpdatesWithAct();

                fireEvent.press(screen.getByTestId('button_<'));
                await waitForBatchedUpdatesWithAct();

                expect(screen.getByDisplayValue('14')).toBeTruthy();
                expect(getTextInput().props.selection).toEqual({start: 1, end: 1});
                expect(onInputChange).toHaveBeenLastCalledWith('14');
            });

            it('does nothing when backspace is pressed for an empty value', async () => {
                const onInputChange = jest.fn();
                renderForm({value: '', decimals: 2, onInputChange});
                await waitForBatchedUpdatesWithAct();

                fireEvent.press(screen.getByTestId('button_<'));
                await waitForBatchedUpdatesWithAct();

                expect(screen.getByDisplayValue('')).toBeTruthy();
                expect(getTextInput().props.selection).toEqual({start: 0, end: 0});
                expect(onInputChange).not.toHaveBeenCalled();
            });

            it('keeps the caret position for a forward-delete keypress followed by pad deletion', async () => {
                const onInputChange = jest.fn();
                renderForm({value: '1234', decimals: 2, onInputChange});
                await waitForBatchedUpdatesWithAct();

                fireEvent(getTextInput(), 'selectionChange', {nativeEvent: {selection: {start: 2, end: 2}}});
                await waitForBatchedUpdatesWithAct();

                fireEvent(getTextInput(), 'keyPress', {nativeEvent: {key: 'Delete', ctrlKey: false}});
                fireEvent.press(screen.getByTestId('button_<'));
                await waitForBatchedUpdatesWithAct();

                expect(screen.getByDisplayValue('134')).toBeTruthy();
                expect(getTextInput().props.selection).toEqual({start: 2, end: 2});
                expect(onInputChange).toHaveBeenLastCalledWith('134');
            });
        });
    });

    describe('NumberWithSymbolFormRef imperative API', () => {
        it('getNumber returns the current number and updateNumber replaces it', async () => {
            const numberFormRef = React.createRef<NumberWithSymbolFormRef>();
            renderForm({value: '10', decimals: 2, numberFormRef});
            await waitForBatchedUpdatesWithAct();

            expect(numberFormRef.current?.getNumber()).toBe('10');

            await act(async () => {
                numberFormRef.current?.updateNumber('25');
                await waitForBatchedUpdatesWithAct();
            });

            expect(numberFormRef.current?.getNumber()).toBe('25');
            expect(screen.getByDisplayValue('25')).toBeTruthy();
        });

        it('updateNumber bypasses validation and never calls onInputChange', async () => {
            const numberFormRef = React.createRef<NumberWithSymbolFormRef>();
            const onInputChange = jest.fn();
            renderForm({value: '10', decimals: 0, numberFormRef, onInputChange});
            await waitForBatchedUpdatesWithAct();

            await act(async () => {
                // "1.5" is invalid for decimals: 0, but updateNumber stores it anyway
                numberFormRef.current?.updateNumber('1.5');
                await waitForBatchedUpdatesWithAct();
            });

            expect(numberFormRef.current?.getNumber()).toBe('1.5');
            expect(onInputChange).not.toHaveBeenCalled();
        });

        it('updateNumber strips the minus sign and toggles negative when `allowFlippingAmount` is set', async () => {
            const numberFormRef = React.createRef<NumberWithSymbolFormRef>();
            const toggleNegative = jest.fn();
            renderForm({value: '10', decimals: 2, allowFlippingAmount: true, toggleNegative, numberFormRef});
            await waitForBatchedUpdatesWithAct();

            await act(async () => {
                numberFormRef.current?.updateNumber('-25');
                await waitForBatchedUpdatesWithAct();
            });

            expect(toggleNegative).toHaveBeenCalledTimes(1);
            expect(numberFormRef.current?.getNumber()).toBe('25');
        });

        it('updateNumber moves the caret to the end of the new number', async () => {
            const numberFormRef = React.createRef<NumberWithSymbolFormRef>();
            renderForm({value: '10', decimals: 2, numberFormRef});
            await waitForBatchedUpdatesWithAct();

            await act(async () => {
                numberFormRef.current?.updateNumber('1234');
                await waitForBatchedUpdatesWithAct();
            });

            expect(getTextInput().props.selection).toEqual({start: 4, end: 4});
        });

        it('clearSelection collapses the selection onto its end', async () => {
            const numberFormRef = React.createRef<NumberWithSymbolFormRef>();
            renderForm({value: '1234', decimals: 2, numberFormRef});
            await waitForBatchedUpdatesWithAct();

            fireEvent(getTextInput(), 'selectionChange', {nativeEvent: {selection: {start: 1, end: 3}}});
            await waitForBatchedUpdatesWithAct();

            expect(getTextInput().props.selection).toEqual({start: 1, end: 3});

            await act(async () => {
                numberFormRef.current?.clearSelection();
                await waitForBatchedUpdatesWithAct();
            });

            expect(getTextInput().props.selection).toEqual({start: 3, end: 3});
        });
    });

    describe('selection handling', () => {
        it('clears the selection when focus returns after leaving the screen', async () => {
            mockIsFocused.mockReturnValue(false);
            const {rerender} = renderForm({value: '1234'});
            await waitForBatchedUpdatesWithAct();

            fireEvent(getTextInput(), 'selectionChange', {nativeEvent: {selection: {start: 1, end: 3}}});
            await waitForBatchedUpdatesWithAct();

            expect(getTextInput().props.selection).toEqual({start: 1, end: 3});

            mockIsFocused.mockReturnValue(true);
            rerender(
                <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
                    <NumberWithSymbolForm
                        symbol="$"
                        testID={INPUT_TEST_ID}
                        value="1234"
                    />
                </ComposeProviders>,
            );
            await waitForBatchedUpdatesWithAct();

            expect(getTextInput().props.selection).toEqual({start: 3, end: 3});
        });

        it('clamps the selection to the length of the current number', async () => {
            renderForm({value: '12', decimals: 2});
            await waitForBatchedUpdatesWithAct();

            fireEvent(getTextInput(), 'selectionChange', {nativeEvent: {selection: {start: 10, end: 10}}});
            await waitForBatchedUpdatesWithAct();

            expect(getTextInput().props.selection).toEqual({start: 2, end: 2});
        });

        it('ignores the selection change once after a manual update (shouldIgnoreSelectionWhenUpdatedManually)', async () => {
            // `handleFlipPress` sets `willSelectionBeUpdatedManually` and never resets it itself, so the next
            // selection event is swallowed. `shouldIgnoreSelectionWhenUpdatedManually` is `true` on native.
            renderForm({displayAsTextInput: true, value: '12', decimals: 2, shouldShowFlipButton: true, allowNegativeInput: true});
            await waitForBatchedUpdatesWithAct();

            fireEvent.press(screen.getByText('Flip'));
            await waitForBatchedUpdatesWithAct();

            // The caret was at the end of "12" and the added sign shifted it by one
            expect(getTextInput().props.selection).toEqual({start: 3, end: 3});

            fireEvent(getTextInput(), 'selectionChange', {nativeEvent: {selection: {start: 0, end: 0}}});
            await waitForBatchedUpdatesWithAct();

            // Swallowed
            expect(getTextInput().props.selection).toEqual({start: 3, end: 3});

            fireEvent(getTextInput(), 'selectionChange', {nativeEvent: {selection: {start: 0, end: 0}}});
            await waitForBatchedUpdatesWithAct();

            // Applied
            expect(getTextInput().props.selection).toEqual({start: 0, end: 0});
        });

        it('ignores selection changes while the pad backspace is long pressed (shouldUpdateSelection)', async () => {
            renderForm({value: '1234', decimals: 2});
            await waitForBatchedUpdatesWithAct();

            fireEvent(getTextInput(), 'selectionChange', {nativeEvent: {selection: {start: 2, end: 2}}});
            await waitForBatchedUpdatesWithAct();

            expect(getTextInput().props.selection).toEqual({start: 2, end: 2});

            fireEvent(screen.getByTestId('button_<'), 'longPress');
            await waitForBatchedUpdatesWithAct();

            fireEvent(getTextInput(), 'selectionChange', {nativeEvent: {selection: {start: 0, end: 0}}});
            await waitForBatchedUpdatesWithAct();

            expect(getTextInput().props.selection).toEqual({start: 2, end: 2});
        });
    });

    describe('validation', () => {
        it('rejects a value longer than `maxLength`', async () => {
            const onInputChange = jest.fn();
            renderForm({value: '12', decimals: 2, maxLength: 2, onInputChange});
            await waitForBatchedUpdatesWithAct();

            fireEvent.changeText(getTextInput(), '123');
            await waitForBatchedUpdatesWithAct();

            expect(onInputChange).not.toHaveBeenCalled();
            expect(screen.getByDisplayValue('12')).toBeTruthy();
        });

        it('accepts a value that fits `maxLength`', async () => {
            const onInputChange = jest.fn();
            renderForm({value: '1', decimals: 2, maxLength: 2, onInputChange});
            await waitForBatchedUpdatesWithAct();

            fireEvent.changeText(getTextInput(), '12');
            await waitForBatchedUpdatesWithAct();

            expect(onInputChange).toHaveBeenCalledWith('12');
        });

        it('rejects more decimals than `decimals` allows', async () => {
            const onInputChange = jest.fn();
            renderForm({value: '1', decimals: 1, onInputChange});
            await waitForBatchedUpdatesWithAct();

            fireEvent.changeText(getTextInput(), '1.55');
            await waitForBatchedUpdatesWithAct();

            expect(onInputChange).not.toHaveBeenCalled();

            fireEvent.changeText(getTextInput(), '1.5');
            await waitForBatchedUpdatesWithAct();

            expect(onInputChange).toHaveBeenCalledWith('1.5');
        });

        it('keeps the minus sign when `allowNegativeInput` is set and rejects it otherwise', async () => {
            const onInputChange = jest.fn();
            const toggleNegative = jest.fn();
            renderForm({value: '1', decimals: 2, allowNegativeInput: true, toggleNegative, onInputChange});
            await waitForBatchedUpdatesWithAct();

            fireEvent.changeText(getTextInput(), '-15');
            await waitForBatchedUpdatesWithAct();

            expect(onInputChange).toHaveBeenCalledWith('-15');
            expect(toggleNegative).not.toHaveBeenCalled();

            screen.unmount();
            onInputChange.mockClear();

            renderForm({value: '1', decimals: 2, toggleNegative, onInputChange});
            await waitForBatchedUpdatesWithAct();

            fireEvent.changeText(getTextInput(), '-15');
            await waitForBatchedUpdatesWithAct();

            // Neither flipping nor direct negative input is allowed, so the value is rejected outright
            expect(onInputChange).not.toHaveBeenCalled();
            expect(toggleNegative).not.toHaveBeenCalled();
        });
    });

    describe('clearNegative on backspace', () => {
        it('calls clearNegative when backspace is pressed on an empty negative input', async () => {
            const clearNegative = jest.fn();
            renderForm({value: '', decimals: 2, isNegative: true, clearNegative});
            await waitForBatchedUpdatesWithAct();

            fireEvent(getTextInput(), 'keyPress', {nativeEvent: {key: 'Backspace'}});
            await waitForBatchedUpdatesWithAct();

            expect(clearNegative).toHaveBeenCalledTimes(1);
        });

        it('does not call clearNegative when the amount is not negative', async () => {
            const clearNegative = jest.fn();
            renderForm({value: '', decimals: 2, clearNegative});
            await waitForBatchedUpdatesWithAct();

            fireEvent(getTextInput(), 'keyPress', {nativeEvent: {key: 'Backspace'}});
            await waitForBatchedUpdatesWithAct();

            expect(clearNegative).not.toHaveBeenCalled();
        });

        it('does not call clearNegative for other keys', async () => {
            const clearNegative = jest.fn();
            renderForm({value: '', decimals: 2, isNegative: true, clearNegative});
            await waitForBatchedUpdatesWithAct();

            fireEvent(getTextInput(), 'keyPress', {nativeEvent: {key: '1'}});
            await waitForBatchedUpdatesWithAct();

            expect(clearNegative).not.toHaveBeenCalled();
        });
    });
});
