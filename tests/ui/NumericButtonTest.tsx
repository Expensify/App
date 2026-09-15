import {fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import NumericField from '@components/NumericField';
import NumericInput from '@components/NumericInput';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import type * as NativeNavigation from '@react-navigation/native';

import React from 'react';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof NativeNavigation>('@react-navigation/native'),
    useIsFocused: jest.fn(() => true),
    useNavigation: jest.fn(() => ({
        navigate: jest.fn(),
        addListener: jest.fn(() => jest.fn()),
    })),
}));

function renderWithProviders(children: React.ReactNode) {
    return render(<ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>{children}</ComposeProviders>);
}

describe('Numeric buttons', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('CurrencyButton', () => {
        const CURRENCY_TEST_ID = 'currency-button';

        it('is the same presentational button on both roots', () => {
            // The button reads nothing from context, so both roots expose the shared component
            // and its behavior only has to be asserted once below.
            expect(NumericInput.CurrencyButton).toBe(NumericField.CurrencyButton);
        });

        it('renders the currency and calls onPress', async () => {
            const onPress = jest.fn();

            renderWithProviders(
                <NumericInput value="12">
                    <NumericInput.CurrencyButton
                        currency="USD"
                        onPress={onPress}
                        testID={CURRENCY_TEST_ID}
                    />
                </NumericInput>,
            );
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText('USD')).toBeOnTheScreen();
            expect(screen.getByTestId(CURRENCY_TEST_ID)).toHaveAccessibleName('Select a currency, USD');

            fireEvent.press(screen.getByTestId(CURRENCY_TEST_ID));

            expect(onPress).toHaveBeenCalledTimes(1);
        });

        it('uses a custom accessibility label when provided', async () => {
            renderWithProviders(
                <NumericInput value="12">
                    <NumericInput.CurrencyButton
                        currency="USD"
                        accessibilityLabel="Select a duration unit, hours"
                        testID={CURRENCY_TEST_ID}
                    />
                </NumericInput>,
            );
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByTestId(CURRENCY_TEST_ID)).toHaveAccessibleName('Select a duration unit, hours');
        });

        it('does not call onPress when disabled', async () => {
            const onPress = jest.fn();

            renderWithProviders(
                <NumericInput value="12">
                    <NumericInput.CurrencyButton
                        currency="USD"
                        isDisabled
                        onPress={onPress}
                        testID={CURRENCY_TEST_ID}
                    />
                </NumericInput>,
            );
            await waitForBatchedUpdatesWithAct();

            fireEvent.press(screen.getByTestId(CURRENCY_TEST_ID));

            expect(onPress).not.toHaveBeenCalled();
        });
    });

    describe.each([
        ['NumericInput', NumericInput],
        ['NumericField', NumericField],
    ])('%s.FlipButton', (name, NumericComponent) => {
        const FLIP_TEST_ID = 'flip-button';

        const renderFlipButton = ({allowNegative = true, value = '12', isDisabled = false} = {}, onInputChange = jest.fn()) => {
            renderWithProviders(
                <NumericComponent
                    value={value}
                    onInputChange={onInputChange}
                    allowNegative={allowNegative}
                >
                    <NumericComponent.FlipButton
                        isDisabled={isDisabled}
                        testID={FLIP_TEST_ID}
                    />
                </NumericComponent>,
            );

            return onInputChange;
        };

        it('renders the button when negative values are allowed', async () => {
            renderFlipButton();
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByTestId(FLIP_TEST_ID)).toHaveAccessibleName('Flip');
        });

        it('does not render when negative values are not allowed', async () => {
            renderFlipButton({allowNegative: false});
            await waitForBatchedUpdatesWithAct();

            expect(screen.queryByTestId(FLIP_TEST_ID)).not.toBeOnTheScreen();
        });

        it('makes a positive value negative', async () => {
            const onInputChange = renderFlipButton({value: '12'});
            await waitForBatchedUpdatesWithAct();

            fireEvent.press(screen.getByTestId(FLIP_TEST_ID));

            expect(onInputChange).toHaveBeenLastCalledWith('-12');
        });

        it('makes a negative value positive', async () => {
            const onInputChange = renderFlipButton({value: '-12'});
            await waitForBatchedUpdatesWithAct();

            fireEvent.press(screen.getByTestId(FLIP_TEST_ID));

            expect(onInputChange).toHaveBeenLastCalledWith('12');
        });

        it('commits a standalone sign when the value is empty, matching what typing a minus does', async () => {
            const onInputChange = renderFlipButton({value: ''});
            await waitForBatchedUpdatesWithAct();

            fireEvent.press(screen.getByTestId(FLIP_TEST_ID));

            expect(onInputChange).toHaveBeenLastCalledWith('-');
        });

        it('does not toggle the sign when disabled', async () => {
            const onInputChange = renderFlipButton({isDisabled: true});
            await waitForBatchedUpdatesWithAct();

            fireEvent.press(screen.getByTestId(FLIP_TEST_ID));

            expect(onInputChange).not.toHaveBeenCalled();
        });
    });

    describe('FlipButton caret handling', () => {
        const INPUT_TEST_ID = 'numeric-input';
        const FLIP_TEST_ID = 'flip-button';

        it('prevents the default mousedown, so the input keeps its focus and caret on web', async () => {
            renderWithProviders(
                <NumericInput
                    value="12"
                    allowNegative
                >
                    <NumericInput.FlipButton testID={FLIP_TEST_ID} />
                </NumericInput>,
            );
            await waitForBatchedUpdatesWithAct();

            const preventDefault = jest.fn();
            fireEvent(screen.getByTestId(FLIP_TEST_ID), 'mouseDown', {preventDefault});

            expect(preventDefault).toHaveBeenCalledTimes(1);
        });

        it('leaves the displayed magnitude and the caret untouched in NumericInput, which renders the sign separately', async () => {
            // Given a NumericInput composition whose caret sits between the digits of "12"
            const onInputChange = jest.fn();
            renderWithProviders(
                <NumericInput
                    value="12"
                    onInputChange={onInputChange}
                    allowNegative
                >
                    <NumericInput.FlipButton testID={FLIP_TEST_ID} />
                    <NumericInput.MinusSign />
                    <NumericInput.TextInput testID={INPUT_TEST_ID} />
                </NumericInput>,
            );
            await waitForBatchedUpdatesWithAct();

            const input = screen.getByTestId(INPUT_TEST_ID);
            fireEvent(input, 'selectionChange', {
                nativeEvent: {selection: {start: 1, end: 1}},
            });

            // When the sign is toggled
            fireEvent.press(screen.getByTestId(FLIP_TEST_ID));

            // Then the input still shows the magnitude and keeps its caret, and only the separate sign appears
            expect(onInputChange).toHaveBeenLastCalledWith('-12');
            expect(input).toHaveDisplayValue('12');
            expect(input.props.selection).toEqual({start: 1, end: 1});
            expect(screen.getByText('-')).toBeOnTheScreen();
        });

        it('shifts the caret with the sign in NumericField, which renders the sign inside the input', async () => {
            // Given a NumericField composition whose caret sits between the digits of "12"
            const onInputChange = jest.fn();
            renderWithProviders(
                <NumericField
                    value="12"
                    onInputChange={onInputChange}
                    allowNegative
                >
                    <NumericField.FlipButton testID={FLIP_TEST_ID} />
                    <NumericField.TextInput testID={INPUT_TEST_ID} />
                </NumericField>,
            );
            await waitForBatchedUpdatesWithAct();

            const input = screen.getByTestId(INPUT_TEST_ID);
            fireEvent(input, 'selectionChange', {
                nativeEvent: {selection: {start: 1, end: 1}},
            });

            // When the sign is toggled
            fireEvent.press(screen.getByTestId(FLIP_TEST_ID));

            // Then the sign is part of the displayed text and the caret moves with it, so typing appends to the digits
            expect(onInputChange).toHaveBeenLastCalledWith('-12');
            expect(input).toHaveDisplayValue('-12');
            expect(input.props.selection).toEqual({start: 2, end: 2});
        });
    });
});
