import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import type {NumberWithSymbolFormProps} from '@components/NumberWithSymbolForm';
import NumberWithSymbolForm from '@components/NumberWithSymbolForm';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

import ONYXKEYS from '@src/ONYXKEYS';

import type * as NativeNavigation from '@react-navigation/native';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof NativeNavigation>('@react-navigation/native'),
    useNavigation: jest.fn(() => ({
        navigate: jest.fn(),
        addListener: jest.fn(() => jest.fn()),
    })),
    useIsFocused: jest.fn(() => true),
    useRoute: jest.fn(() => ({key: '', name: '', params: {}})),
}));

const mockIsInLandscapeMode = jest.fn(() => false);
jest.mock('@hooks/useIsInLandscapeMode', () => ({
    __esModule: true,
    default: () => mockIsInLandscapeMode(),
}));

const INPUT_LABEL = 'Amount';

function renderForm(props: Partial<NumberWithSymbolFormProps> = {}) {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <NumberWithSymbolForm
                symbol="$"
                label={INPUT_LABEL}
                {...props}
            />
        </ComposeProviders>,
    );
}

function getTextInput() {
    return screen.getByLabelText(INPUT_LABEL);
}

describe('NumberWithSymbolForm', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => {
        jest.clearAllMocks();
        mockIsInLandscapeMode.mockReturnValue(false);
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
        });

        it('does not render the flip or currency buttons by default', async () => {
            renderForm({displayAsTextInput: true, value: '10', currency: 'USD'});
            await waitForBatchedUpdatesWithAct();

            expect(screen.queryByText('Flip')).toBeNull();
            expect(screen.queryByText('USD')).toBeNull();
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
});
