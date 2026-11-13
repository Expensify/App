import {fireEvent, render, renderHook, screen} from '@testing-library/react-native';

import AmountFormField from '@components/AmountFormField';
import ComposeProviders from '@components/ComposeProviders';
import KeypadAmountEditor from '@components/KeypadAmountEditor';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import useTheme from '@hooks/useTheme';

import type * as NativeNavigation from '@react-navigation/native';
import type {View} from 'react-native';

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

describe('Amount action buttons', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('CurrencyPickerButton', () => {
        const CURRENCY_TEST_ID = 'currency-button';

        it('is the same presentational button on both roots', () => {
            // The button reads nothing from context, so both roots expose the shared component
            // and its behavior only has to be asserted once below.
            expect(KeypadAmountEditor.CurrencyPickerButton).toBe(AmountFormField.CurrencyPickerButton);
        });

        it('renders the currency and calls onPress', async () => {
            const onPress = jest.fn();

            renderWithProviders(
                <KeypadAmountEditor value="12">
                    <KeypadAmountEditor.CurrencyPickerButton
                        currency="USD"
                        onPress={onPress}
                        testID={CURRENCY_TEST_ID}
                    />
                </KeypadAmountEditor>,
            );
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText('USD')).toBeOnTheScreen();
            expect(screen.getByTestId(CURRENCY_TEST_ID)).toHaveAccessibleName('Select a currency, USD');

            fireEvent.press(screen.getByTestId(CURRENCY_TEST_ID));

            expect(onPress).toHaveBeenCalledTimes(1);
        });

        it('uses a custom accessibility label when provided', async () => {
            renderWithProviders(
                <KeypadAmountEditor value="12">
                    <KeypadAmountEditor.CurrencyPickerButton
                        currency="USD"
                        accessibilityLabel="Select a duration unit, hours"
                        testID={CURRENCY_TEST_ID}
                    />
                </KeypadAmountEditor>,
            );
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByTestId(CURRENCY_TEST_ID)).toHaveAccessibleName('Select a duration unit, hours');
        });

        it('does not call onPress when disabled', async () => {
            const onPress = jest.fn();

            renderWithProviders(
                <KeypadAmountEditor value="12">
                    <KeypadAmountEditor.CurrencyPickerButton
                        currency="USD"
                        isDisabled
                        onPress={onPress}
                        testID={CURRENCY_TEST_ID}
                    />
                </KeypadAmountEditor>,
            );
            await waitForBatchedUpdatesWithAct();

            fireEvent.press(screen.getByTestId(CURRENCY_TEST_ID));

            expect(onPress).not.toHaveBeenCalled();
        });
    });

    describe.each([
        ['KeypadAmountEditor', KeypadAmountEditor],
        ['AmountFormField', AmountFormField],
    ])('%s.SignFlipButton', (name, AmountComponent) => {
        const FLIP_TEST_ID = 'flip-button';

        const renderSignFlipButton = (
            {allowNegative = true, value = '12', isDisabled = false, shouldShowLabel}: {allowNegative?: boolean; value?: string; isDisabled?: boolean; shouldShowLabel?: boolean} = {},
            onInputChange = jest.fn(),
        ) => {
            renderWithProviders(
                <AmountComponent
                    value={value}
                    onInputChange={onInputChange}
                    allowNegative={allowNegative}
                >
                    <AmountComponent.SignFlipButton
                        isDisabled={isDisabled}
                        shouldShowLabel={shouldShowLabel}
                        testID={FLIP_TEST_ID}
                    />
                </AmountComponent>,
            );

            return onInputChange;
        };

        it('renders the button when negative values are allowed', async () => {
            // Given a numeric input that allows negative values
            // When the flip button is rendered
            renderSignFlipButton();
            await waitForBatchedUpdatesWithAct();

            // Then the flip button is rendered with its accessible name and text label
            expect(screen.getByTestId(FLIP_TEST_ID)).toHaveAccessibleName('Flip');
            expect(screen.getByText('Flip')).toBeOnTheScreen();
        });

        it('hides the text label when shouldShowLabel is false, keeping the accessible name', async () => {
            // Given a numeric flip button configured not to display its text label
            // When the component is rendered
            renderSignFlipButton({shouldShowLabel: false});
            await waitForBatchedUpdatesWithAct();

            // Then the text label is hidden from the UI to save space, but the accessible name is preserved
            expect(screen.getByTestId(FLIP_TEST_ID)).toHaveAccessibleName('Flip');
            expect(screen.queryByText('Flip')).not.toBeOnTheScreen();
        });

        it('does not render when negative values are not allowed', async () => {
            renderSignFlipButton({allowNegative: false});
            await waitForBatchedUpdatesWithAct();

            expect(screen.queryByTestId(FLIP_TEST_ID)).not.toBeOnTheScreen();
        });

        it('makes a positive value negative', async () => {
            const onInputChange = renderSignFlipButton({value: '12'});
            await waitForBatchedUpdatesWithAct();

            fireEvent.press(screen.getByTestId(FLIP_TEST_ID));

            expect(onInputChange).toHaveBeenLastCalledWith('-12');
        });

        it('makes a negative value positive', async () => {
            const onInputChange = renderSignFlipButton({value: '-12'});
            await waitForBatchedUpdatesWithAct();

            fireEvent.press(screen.getByTestId(FLIP_TEST_ID));

            expect(onInputChange).toHaveBeenLastCalledWith('12');
        });

        it('commits a standalone sign when the value is empty, matching what typing a minus does', async () => {
            const onInputChange = renderSignFlipButton({value: ''});
            await waitForBatchedUpdatesWithAct();

            fireEvent.press(screen.getByTestId(FLIP_TEST_ID));

            expect(onInputChange).toHaveBeenLastCalledWith('-');
        });

        it('does not toggle the sign when disabled', async () => {
            const onInputChange = renderSignFlipButton({isDisabled: true});
            await waitForBatchedUpdatesWithAct();

            fireEvent.press(screen.getByTestId(FLIP_TEST_ID));

            expect(onInputChange).not.toHaveBeenCalled();
        });
    });

    describe('SignFlipButton caret handling', () => {
        const INPUT_TEST_ID = 'numeric-input';
        const FLIP_TEST_ID = 'flip-button';

        it('prevents the default mousedown, so the input keeps its focus and caret on web', async () => {
            renderWithProviders(
                <KeypadAmountEditor
                    value="12"
                    allowNegative
                >
                    <KeypadAmountEditor.SignFlipButton testID={FLIP_TEST_ID} />
                </KeypadAmountEditor>,
            );
            await waitForBatchedUpdatesWithAct();

            const preventDefault = jest.fn();
            fireEvent(screen.getByTestId(FLIP_TEST_ID), 'mouseDown', {preventDefault});

            expect(preventDefault).toHaveBeenCalledTimes(1);
        });

        it('leaves the displayed magnitude and the caret untouched in KeypadAmountEditor, which renders the sign separately', async () => {
            // Given a KeypadAmountEditor composition whose caret sits between the digits of "12"
            const onInputChange = jest.fn();
            renderWithProviders(
                <KeypadAmountEditor
                    value="12"
                    onInputChange={onInputChange}
                    allowNegative
                    actions={<KeypadAmountEditor.SignFlipButton testID={FLIP_TEST_ID} />}
                >
                    <KeypadAmountEditor.Input testID={INPUT_TEST_ID} />
                </KeypadAmountEditor>,
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

        it('shifts the caret with the sign in AmountFormField, which renders the sign inside the input', async () => {
            // Given an AmountFormField composition whose caret sits between the digits of "12"
            const onInputChange = jest.fn();
            renderWithProviders(
                <AmountFormField
                    value="12"
                    onInputChange={onInputChange}
                    allowNegative
                >
                    <AmountFormField.SignFlipButton testID={FLIP_TEST_ID} />
                    <AmountFormField.Input testID={INPUT_TEST_ID} />
                </AmountFormField>,
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

    describe('borderless style', () => {
        const renderButtons = (shouldUseBorderlessStyle?: boolean, currencyButtonRef?: React.RefObject<View | null>) =>
            renderWithProviders(
                <AmountFormField
                    value="12"
                    allowNegative
                >
                    <AmountFormField.SignFlipButton shouldUseBorderlessStyle={shouldUseBorderlessStyle} />
                    <AmountFormField.CurrencyPickerButton
                        ref={currencyButtonRef}
                        currency="USD"
                        shouldUseBorderlessStyle={shouldUseBorderlessStyle}
                    />
                </AmountFormField>,
            );

        it('mutes the button labels when the buttons sit inside a field without their fill', async () => {
            // Given the flip and currency buttons drawn borderless, as part of the field they sit in
            const mutedColor = renderHook(() => useTheme()).result.current.textSupporting;

            // When they render
            renderButtons(true);
            await waitForBatchedUpdatesWithAct();

            // Then their labels take the supporting color, matching the icons beside them
            expect(screen.getByText('Flip')).toHaveStyle({color: mutedColor});
            expect(screen.getByText('USD')).toHaveStyle({color: mutedColor});
        });

        it('keeps the button labels in their own color by default', async () => {
            // Given the flip and currency buttons with their default fill
            const mutedColor = renderHook(() => useTheme()).result.current.textSupporting;

            // When they render
            renderButtons();
            await waitForBatchedUpdatesWithAct();

            // Then their labels keep the button's text color, so existing callers look the same
            expect(screen.getByText('Flip')).not.toHaveStyle({color: mutedColor});
            expect(screen.getByText('USD')).not.toHaveStyle({color: mutedColor});
        });

        it('hands the currency button to its ref, so focus can return to it once the picker closes', async () => {
            // Given a ref for the currency button
            const currencyButtonRef = React.createRef<View>();

            // When the button renders
            renderButtons(true, currencyButtonRef);
            await waitForBatchedUpdatesWithAct();

            // Then the ref points at it
            expect(currencyButtonRef.current).not.toBeNull();
        });
    });
});
