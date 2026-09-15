import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import type {NumericEditingRef} from '@components/NumericEditingController';
import NumericInput, {useNumericDynamicFontSize, useNumericInputActions} from '@components/NumericInput';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import {PressableWithoutFeedback} from '@components/Pressable';
import Text from '@components/Text';

import CONST from '@src/CONST';

import type * as NativeNavigation from '@react-navigation/native';

import React from 'react';

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof NativeNavigation>('@react-navigation/native'),
    useIsFocused: jest.fn(() => true),
    useNavigation: jest.fn(() => ({
        navigate: jest.fn(),
        addListener: jest.fn(() => jest.fn()),
    })),
}));

type NumericInputProps = React.ComponentProps<typeof NumericInput>;

const INPUT_TEST_ID = 'numeric-text-input';
const SYMBOL_ACCESSIBILITY_LABEL = 'Select a symbol or currency';
const MINUS_SIGN = '-';

function renderWithProviders(children: React.ReactNode) {
    return render(<ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>{children}</ComposeProviders>);
}

function ToggleSignTrigger() {
    const {toggleSign} = useNumericInputActions();

    return (
        <PressableWithoutFeedback
            accessibilityLabel="Toggle sign"
            testID="toggle-sign"
            onPress={toggleSign}
        />
    );
}

describe('NumericInput', () => {
    const onInputChange = jest.fn();

    const renderNumericInput = (props: Partial<NumericInputProps> = {}, children?: React.ReactNode) =>
        renderWithProviders(
            <NumericInput
                onInputChange={onInputChange}
                decimals={2}
                {...props}
            >
                {children ?? (
                    <>
                        <NumericInput.MinusSign />
                        <NumericInput.Symbol>$</NumericInput.Symbol>
                        <NumericInput.TextInput testID={INPUT_TEST_ID} />
                    </>
                )}
            </NumericInput>,
        );

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('symbol primitive', () => {
        it('renders its children as a passive symbol, without a button', () => {
            renderNumericInput({value: '12'}, <NumericInput.Symbol>km</NumericInput.Symbol>);

            expect(screen.getByText('km')).toBeOnTheScreen();
            expect(screen.queryAllByRole(CONST.ROLE.BUTTON, {name: SYMBOL_ACCESSIBILITY_LABEL})).toHaveLength(0);
        });

        it('renders its children inside the symbol button and calls onPress when it is pressed', () => {
            const onPress = jest.fn();
            renderNumericInput({value: '12'}, <NumericInput.SymbolButton onPress={onPress}>km</NumericInput.SymbolButton>);

            expect(screen.getByText('km')).toBeOnTheScreen();

            fireEvent.press(screen.getByRole(CONST.ROLE.BUTTON, {name: SYMBOL_ACCESSIBILITY_LABEL}));

            expect(onPress).toHaveBeenCalledTimes(1);
        });
    });

    describe('sign handling', () => {
        it('renders a negative value as a separate sign and editable magnitude', () => {
            renderNumericInput({value: '-12', allowNegative: true});

            expect(screen.getByText(MINUS_SIGN)).toBeOnTheScreen();
            expect(screen.getByTestId(INPUT_TEST_ID)).toHaveDisplayValue('12');
        });

        it('keeps a negative value in the input when negative values are not allowed', () => {
            renderNumericInput({value: '-12'});

            expect(screen.queryByText(MINUS_SIGN)).not.toBeOnTheScreen();
            expect(screen.getByTestId(INPUT_TEST_ID)).toHaveDisplayValue('-12');
        });

        it('preserves the sign when the magnitude is edited', () => {
            renderNumericInput({value: '-12', allowNegative: true});

            fireEvent.changeText(screen.getByTestId(INPUT_TEST_ID), '123');

            expect(onInputChange).toHaveBeenCalledWith('-123');
        });

        it('clears the sign when the magnitude is cleared', () => {
            renderNumericInput({value: '-12', allowNegative: true});

            const input = screen.getByTestId(INPUT_TEST_ID);
            fireEvent.changeText(input, '');

            expect(screen.queryByText(MINUS_SIGN)).not.toBeOnTheScreen();
            expect(input).toHaveDisplayValue('');
            expect(onInputChange).toHaveBeenCalledWith('');
        });

        it('clears a standalone minus when backspace is pressed on an empty input', () => {
            renderNumericInput({value: '-', allowNegative: true});

            fireEvent(screen.getByTestId(INPUT_TEST_ID), 'keyPress', {nativeEvent: {key: 'Backspace'}});

            expect(screen.queryByText(MINUS_SIGN)).not.toBeOnTheScreen();
            expect(onInputChange).toHaveBeenCalledWith('');
        });

        it('toggles the sign and notifies the parent with the signed value', () => {
            renderNumericInput(
                {value: '12', allowNegative: true},
                <>
                    <NumericInput.MinusSign />
                    <ToggleSignTrigger />
                </>,
            );

            fireEvent.press(screen.getByTestId('toggle-sign'));

            expect(screen.getByText(MINUS_SIGN)).toBeOnTheScreen();
            expect(onInputChange).toHaveBeenLastCalledWith('-12');
        });

        it('ignores a sign toggle when negative values are not allowed', () => {
            renderNumericInput(
                {value: '12'},
                <>
                    <NumericInput.MinusSign />
                    <ToggleSignTrigger />
                </>,
            );

            fireEvent.press(screen.getByTestId('toggle-sign'));

            expect(screen.queryByText(MINUS_SIGN)).not.toBeOnTheScreen();
            expect(onInputChange).not.toHaveBeenCalled();
        });
    });

    describe('text input primitive', () => {
        it('commits a valid edit through the root and displays it', () => {
            // Given a composition with two accepted decimal places and value "12"
            renderNumericInput({value: '12'});

            // When the user appends a decimal fraction
            fireEvent.changeText(screen.getByTestId(INPUT_TEST_ID), '12.5');

            // Then the root is notified and the input displays the committed value
            expect(onInputChange).toHaveBeenLastCalledWith('12.5');
            expect(screen.getByTestId(INPUT_TEST_ID)).toHaveDisplayValue('12.5');
        });

        it('moves the caret to the end of the value after an edit', () => {
            // Given a composition with value "12" and the caret at the end
            renderNumericInput({value: '12'});

            const input = screen.getByTestId(INPUT_TEST_ID);
            fireEvent(input, 'selectionChange', {
                nativeEvent: {selection: {start: 2, end: 2}},
            });

            // When a digit is appended
            fireEvent.changeText(input, '123');

            // Then the caret follows the appended digit
            expect(input.props.selection).toEqual({start: 3, end: 3});
        });

        it('ignores the stale selection event native echoes after an edit', () => {
            // Given a composition with value "12"
            renderNumericInput({value: '12'});

            // When a digit is appended and native echoes the pre-edit caret position
            const input = screen.getByTestId(INPUT_TEST_ID);
            fireEvent.changeText(input, '123');
            fireEvent(input, 'selectionChange', {nativeEvent: {selection: {start: 0, end: 0}}});

            // Then the echo is dropped and the caret stays where the edit put it
            expect(input.props.selection).toEqual({start: 3, end: 3});
        });

        it('rejects an edit that exceeds the accepted number of decimals', () => {
            // Given a composition with two accepted decimal places and value "1.23"
            renderNumericInput({value: '1.23'});

            // When the user types a third decimal place
            fireEvent.changeText(screen.getByTestId(INPUT_TEST_ID), '1.234');

            // Then the edit is rejected and the displayed value is unchanged
            expect(onInputChange).not.toHaveBeenCalled();
            expect(screen.getByTestId(INPUT_TEST_ID)).toHaveDisplayValue('1.23');
        });

        it('strips decimals from an in-progress value when the accepted decimals decrease', () => {
            // Given an empty composition whose in-progress value has two decimal places
            const {rerender} = renderNumericInput({value: ''});
            fireEvent.changeText(screen.getByTestId(INPUT_TEST_ID), '1.23');

            // When the accepted number of decimals drops to zero
            rerender(
                <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
                    <NumericInput
                        onInputChange={onInputChange}
                        decimals={0}
                        value=""
                    >
                        <NumericInput.TextInput testID={INPUT_TEST_ID} />
                    </NumericInput>
                </ComposeProviders>,
            );

            // Then the in-progress value is sanitized to the new precision
            expect(screen.getByTestId(INPUT_TEST_ID)).toHaveDisplayValue('1');
        });

        it('rejects an edit with more integer digits than the root maxLength allows', () => {
            // Given a composition limited to two integer digits and value "12"
            renderNumericInput({value: '12', maxLength: 2});

            // When the user types a third integer digit
            fireEvent.changeText(screen.getByTestId(INPUT_TEST_ID), '123');

            // Then the edit is rejected and the displayed value is unchanged
            expect(onInputChange).not.toHaveBeenCalled();
            expect(screen.getByTestId(INPUT_TEST_ID)).toHaveDisplayValue('12');
        });

        it('forwards blur and submit to the primitive callbacks', () => {
            // Given a composition where the text input primitive registers blur and submit callbacks
            const onBlur = jest.fn();
            const onSubmitEditing = jest.fn();
            renderNumericInput(
                {value: '12'},
                <NumericInput.TextInput
                    testID={INPUT_TEST_ID}
                    onBlur={onBlur}
                    onSubmitEditing={onSubmitEditing}
                />,
            );

            // When the input is blurred and submitted
            const input = screen.getByTestId(INPUT_TEST_ID);
            fireEvent(input, 'blur');
            fireEvent(input, 'submitEditing');

            // Then each callback runs exactly once
            expect(onBlur).toHaveBeenCalledTimes(1);
            expect(onSubmitEditing).toHaveBeenCalledTimes(1);
        });
    });

    describe('error primitive', () => {
        it('renders the root error where the composition places it', () => {
            renderNumericInput(
                {errorText: 'Invalid amount'},
                <>
                    <NumericInput.TextInput testID={INPUT_TEST_ID} />
                    <NumericInput.Error />
                </>,
            );

            expect(screen.getByText('Invalid amount')).toBeOnTheScreen();
            expect(screen.getByRole(CONST.ROLE.ALERT)).toBeOnTheScreen();
        });

        it('renders nothing when the root has no error', () => {
            renderNumericInput(
                {},
                <>
                    <NumericInput.TextInput testID={INPUT_TEST_ID} />
                    <NumericInput.Error />
                </>,
            );

            expect(screen.queryByRole(CONST.ROLE.ALERT)).not.toBeOnTheScreen();
        });
    });

    describe('useNumericDynamicFontSize', () => {
        function FontSizeReadout({symbol}: {symbol?: string}) {
            const {fontSize} = useNumericDynamicFontSize(symbol);

            return <Text testID="font-size">{String(fontSize)}</Text>;
        }

        it('scales down when the symbol is longer', () => {
            renderNumericInput({value: '1234567890'}, <FontSizeReadout />);
            const withoutSymbolFontSize = Number(screen.getByTestId('font-size').props.children);

            screen.unmount();
            renderNumericInput({value: '1234567890'}, <FontSizeReadout symbol="PLN" />);
            const withSymbolFontSize = Number(screen.getByTestId('font-size').props.children);

            expect(withSymbolFontSize).toBeLessThan(withoutSymbolFontSize);
        });

        it('scales down for negative values, because the sign takes room the input does not display', () => {
            renderNumericInput({value: '1234567890'}, <FontSizeReadout />);
            const positiveFontSize = Number(screen.getByTestId('font-size').props.children);

            screen.unmount();
            renderNumericInput({value: '-1234567890', allowNegative: true}, <FontSizeReadout />);
            const negativeFontSize = Number(screen.getByTestId('font-size').props.children);

            expect(negativeFontSize).toBeLessThan(positiveFontSize);
        });
    });

    describe('root imperative API', () => {
        it('reads and replaces the value without notifying onInputChange', () => {
            // Given a composition holding value "12" and a root ref
            const ref = React.createRef<NumericEditingRef>();
            renderNumericInput({value: '12', ref});

            expect(ref.current?.getNumber()).toBe('12');

            // When the value is replaced imperatively
            act(() => {
                ref.current?.updateNumber('7.5');
            });

            // Then the new value is displayed with the caret at its end, and the root is not notified
            expect(ref.current?.getNumber()).toBe('7.5');
            expect(screen.getByTestId(INPUT_TEST_ID)).toHaveDisplayValue('7.5');
            expect(screen.getByTestId(INPUT_TEST_ID).props.selection).toEqual({start: 3, end: 3});
            expect(onInputChange).not.toHaveBeenCalled();
        });

        it('collapses the selection onto its end when clearSelection is called', () => {
            // Given a composition with a range selection on the input
            const ref = React.createRef<NumericEditingRef>();
            renderNumericInput({value: '1234', ref});

            const input = screen.getByTestId(INPUT_TEST_ID);
            fireEvent(input, 'selectionChange', {
                nativeEvent: {selection: {start: 1, end: 3}},
            });
            expect(input.props.selection).toEqual({start: 1, end: 3});

            // When the selection is cleared imperatively
            act(() => {
                ref.current?.clearSelection();
            });

            // Then the selection collapses onto its end
            expect(input.props.selection).toEqual({start: 3, end: 3});
        });
    });
});
