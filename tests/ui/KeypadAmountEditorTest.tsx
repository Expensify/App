import {act, fireEvent, render, screen} from '@testing-library/react-native';

import type {AmountEditingRef} from '@components/AmountEditingController';
import KeypadAmountEditor, {useKeypadAmountEditorActions} from '@components/KeypadAmountEditor';
import {PressableWithoutFeedback} from '@components/Pressable';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import type * as NativeNavigation from '@react-navigation/native';

import {useIsFocused} from '@react-navigation/native';
import React from 'react';

jest.mock('@hooks/useLocalize', () => () => ({
    fromLocaleDigit: (digit: string) => digit,
    toLocaleDigit: (digit: string) => digit,
    numberFormat: (num: number) => String(num),
    translate: (key: string) => key,
}));

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof NativeNavigation>('@react-navigation/native'),
    useIsFocused: jest.fn(() => true),
    useNavigation: jest.fn(() => ({
        navigate: jest.fn(),
        addListener: jest.fn(() => jest.fn()),
    })),
}));

type KeypadAmountEditorProps = React.ComponentProps<typeof KeypadAmountEditor>;

const INPUT_TEST_ID = 'numeric-text-input';
const SYMBOL_ACCESSIBILITY_LABEL = 'Select a symbol or currency';
const MINUS_SIGN = '-';

/** Selects the whole displayed magnitude, as a select-all before a paste does. */
function selectAll(input: ReturnType<typeof screen.getByTestId>, length: number) {
    fireEvent(input, 'selectionChange', {nativeEvent: {selection: {start: 0, end: length}}});
}

function ToggleSignTrigger() {
    const {toggleSign} = useKeypadAmountEditorActions();

    return (
        <PressableWithoutFeedback
            accessibilityLabel="Toggle sign"
            testID="toggle-sign"
            onPress={toggleSign}
        />
    );
}

describe('KeypadAmountEditor', () => {
    const onInputChange = jest.fn();

    const buildKeypadAmountEditor = (props: Partial<KeypadAmountEditorProps> = {}, children?: React.ReactNode) => (
        <KeypadAmountEditor
            onInputChange={onInputChange}
            decimals={2}
            {...props}
        >
            {children ?? (
                <>
                    <KeypadAmountEditor.Symbol>$</KeypadAmountEditor.Symbol>
                    <KeypadAmountEditor.Input testID={INPUT_TEST_ID} />
                </>
            )}
        </KeypadAmountEditor>
    );

    const renderKeypadAmountEditor = (props: Partial<KeypadAmountEditorProps> = {}, children?: React.ReactNode) => render(buildKeypadAmountEditor(props, children));

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('symbol primitive', () => {
        it('renders its children as a passive symbol, without a button', () => {
            // Given a passive symbol composed beside the number
            // When the component is rendered
            renderKeypadAmountEditor({value: '12'}, <KeypadAmountEditor.Symbol>km</KeypadAmountEditor.Symbol>);

            // Then the symbol is shown as plain text, so pressing it cannot open a selector
            expect(screen.getByText('km')).toBeOnTheScreen();
            expect(screen.queryAllByRole(CONST.ROLE.BUTTON, {name: SYMBOL_ACCESSIBILITY_LABEL})).toHaveLength(0);
        });
    });

    describe('sign handling', () => {
        it('renders a negative value as a separate sign and editable magnitude', () => {
            renderKeypadAmountEditor({value: '-12', allowNegative: true});

            expect(screen.getByText(MINUS_SIGN)).toBeOnTheScreen();
            expect(screen.getByTestId(INPUT_TEST_ID)).toHaveDisplayValue('12');
        });

        it('keeps a negative value in the input when negative values are not allowed', () => {
            renderKeypadAmountEditor({value: '-12'});

            expect(screen.queryByText(MINUS_SIGN)).not.toBeOnTheScreen();
            expect(screen.getByTestId(INPUT_TEST_ID)).toHaveDisplayValue('-12');
        });

        it('preserves the sign when the magnitude is edited', () => {
            renderKeypadAmountEditor({value: '-12', allowNegative: true});

            fireEvent.changeText(screen.getByTestId(INPUT_TEST_ID), '123');

            expect(onInputChange).toHaveBeenCalledWith('-123');
        });

        it('keeps the sign when the magnitude is cleared, so a further backspace clears it', () => {
            renderKeypadAmountEditor({value: '-12', allowNegative: true});

            const input = screen.getByTestId(INPUT_TEST_ID);
            fireEvent.changeText(input, '');

            expect(screen.getByText(MINUS_SIGN)).toBeOnTheScreen();
            expect(input).toHaveDisplayValue('');
            expect(onInputChange).toHaveBeenLastCalledWith('-');

            fireEvent(input, 'keyPress', {nativeEvent: {key: 'Backspace'}});

            expect(screen.queryByText(MINUS_SIGN)).not.toBeOnTheScreen();
            expect(onInputChange).toHaveBeenLastCalledWith('');
        });

        it('toggles the sign when a minus is typed into the input', () => {
            renderKeypadAmountEditor({value: '-12', allowNegative: true});

            const input = screen.getByTestId(INPUT_TEST_ID);
            fireEvent(input, 'selectionChange', {nativeEvent: {selection: {start: 0, end: 0}}});
            fireEvent.changeText(input, '-12');

            expect(screen.queryByText(MINUS_SIGN)).not.toBeOnTheScreen();
            expect(input).toHaveDisplayValue('12');
            expect(onInputChange).toHaveBeenLastCalledWith('12');
        });

        it('rejects a minus typed at an invalid position', () => {
            renderKeypadAmountEditor({value: '-12', allowNegative: true});

            const input = screen.getByTestId(INPUT_TEST_ID);
            // With the caret at the end, the typed minus produces "12-", which the validator rejects.
            fireEvent.changeText(input, '12-');

            expect(onInputChange).not.toHaveBeenCalled();
        });

        it.each([
            ['50', '50'],
            // The digits of the pasted value must not decide the outcome, so a shared leading digit changes nothing.
            ['15', '15'],
        ])('clears the sign when the pasted positive value %s replaces the whole number', (pastedText, expectedValue) => {
            renderKeypadAmountEditor({value: '-12', allowNegative: true});

            const input = screen.getByTestId(INPUT_TEST_ID);
            selectAll(input, 2);
            fireEvent.changeText(input, pastedText);

            expect(screen.queryByText(MINUS_SIGN)).not.toBeOnTheScreen();
            expect(onInputChange).toHaveBeenLastCalledWith(expectedValue);
        });

        it('keeps the sign when a pasted positive value replaces only part of the number', () => {
            renderKeypadAmountEditor({value: '-12', allowNegative: true});

            const input = screen.getByTestId(INPUT_TEST_ID);
            fireEvent(input, 'selectionChange', {nativeEvent: {selection: {start: 1, end: 1}}});
            fireEvent.changeText(input, '1502');

            expect(screen.getByText(MINUS_SIGN)).toBeOnTheScreen();
            expect(onInputChange).toHaveBeenLastCalledWith('-1502');
        });

        it('keeps the sign when digits are appended to a fully selected empty magnitude', () => {
            renderKeypadAmountEditor({value: '-', allowNegative: true});

            const input = screen.getByTestId(INPUT_TEST_ID);
            selectAll(input, 0);
            fireEvent.changeText(input, '5');

            expect(screen.getByText(MINUS_SIGN)).toBeOnTheScreen();
            expect(onInputChange).toHaveBeenLastCalledWith('-5');
        });

        it('takes the sign from a pasted negative value', () => {
            renderKeypadAmountEditor({value: '12', allowNegative: true});

            fireEvent.changeText(screen.getByTestId(INPUT_TEST_ID), '-50');

            expect(screen.getByText(MINUS_SIGN)).toBeOnTheScreen();
            expect(onInputChange).toHaveBeenLastCalledWith('-50');
        });

        it('keeps the sign when a negative value is pasted onto a negative value, because a paste never toggles', () => {
            renderKeypadAmountEditor({value: '-12', allowNegative: true});
            const input = screen.getByTestId(INPUT_TEST_ID);

            fireEvent.changeText(input, '-50');
            fireEvent.changeText(input, '-50');

            expect(screen.getByText(MINUS_SIGN)).toBeOnTheScreen();
            expect(input).toHaveDisplayValue('50');
        });

        it('clears a standalone minus when backspace is pressed on an empty input', () => {
            renderKeypadAmountEditor({value: '-', allowNegative: true});

            fireEvent(screen.getByTestId(INPUT_TEST_ID), 'keyPress', {nativeEvent: {key: 'Backspace'}});

            expect(screen.queryByText(MINUS_SIGN)).not.toBeOnTheScreen();
            expect(onInputChange).toHaveBeenCalledWith('');
        });

        it('clears the minus sign when backspace is pressed with caret at the start of a non-empty negative input', () => {
            renderKeypadAmountEditor({value: '-1.23', allowNegative: true});
            const input = screen.getByTestId(INPUT_TEST_ID);

            expect(screen.getByText(MINUS_SIGN)).toBeOnTheScreen();
            expect(input).toHaveDisplayValue('1.23');

            // Position caret before the first digit ("-|1.23")
            fireEvent(input, 'selectionChange', {nativeEvent: {selection: {start: 0, end: 0}}});
            fireEvent(input, 'keyPress', {nativeEvent: {key: 'Backspace'}});

            // Minus sign is removed, value becomes positive
            expect(screen.queryByText(MINUS_SIGN)).not.toBeOnTheScreen();
            expect(input).toHaveDisplayValue('1.23');
            expect(onInputChange).toHaveBeenLastCalledWith('1.23');

            // Pressing backspace again at the start does nothing because the sign is already gone
            fireEvent(input, 'keyPress', {nativeEvent: {key: 'Backspace'}});
            expect(screen.queryByText(MINUS_SIGN)).not.toBeOnTheScreen();
            expect(input).toHaveDisplayValue('1.23');
            expect(onInputChange).toHaveBeenCalledTimes(1);
        });

        it('does not clear anything when backspace is pressed with caret at the start of a positive input', () => {
            renderKeypadAmountEditor({value: '1.23', allowNegative: true});
            const input = screen.getByTestId(INPUT_TEST_ID);

            expect(screen.queryByText(MINUS_SIGN)).not.toBeOnTheScreen();
            expect(input).toHaveDisplayValue('1.23');

            fireEvent(input, 'selectionChange', {nativeEvent: {selection: {start: 0, end: 0}}});
            fireEvent(input, 'keyPress', {nativeEvent: {key: 'Backspace'}});

            expect(screen.queryByText(MINUS_SIGN)).not.toBeOnTheScreen();
            expect(input).toHaveDisplayValue('1.23');
            expect(onInputChange).not.toHaveBeenCalled();
        });

        it('does not clear the minus sign when backspace is pressed on a non-collapsed selection starting at 0', () => {
            renderKeypadAmountEditor({value: '-12.34', allowNegative: true});
            const input = screen.getByTestId(INPUT_TEST_ID);

            expect(screen.getByText(MINUS_SIGN)).toBeOnTheScreen();

            // Select "12" (range 0..2)
            fireEvent(input, 'selectionChange', {nativeEvent: {selection: {start: 0, end: 2}}});
            fireEvent(input, 'keyPress', {nativeEvent: {key: 'Backspace'}});

            // Since selection is not collapsed, the minus sign should not be cleared by the keypress handler
            expect(screen.getByText(MINUS_SIGN)).toBeOnTheScreen();
            expect(onInputChange).not.toHaveBeenCalled();
        });

        it('toggles the sign and notifies the parent with the signed value', () => {
            renderKeypadAmountEditor({value: '12', allowNegative: true}, <ToggleSignTrigger />);

            fireEvent.press(screen.getByTestId('toggle-sign'));

            expect(screen.getByText(MINUS_SIGN)).toBeOnTheScreen();
            expect(onInputChange).toHaveBeenLastCalledWith('-12');
        });

        it('ignores a sign toggle when negative values are not allowed', () => {
            renderKeypadAmountEditor({value: '12'}, <ToggleSignTrigger />);

            fireEvent.press(screen.getByTestId('toggle-sign'));

            expect(screen.queryByText(MINUS_SIGN)).not.toBeOnTheScreen();
            expect(onInputChange).not.toHaveBeenCalled();
        });
    });

    describe('text input primitive', () => {
        it('commits a valid edit through the root and displays it', () => {
            // Given a composition with two accepted decimal places and value "12"
            renderKeypadAmountEditor({value: '12'});

            // When the user appends a decimal fraction
            fireEvent.changeText(screen.getByTestId(INPUT_TEST_ID), '12.5');

            // Then the root is notified and the input displays the committed value
            expect(onInputChange).toHaveBeenLastCalledWith('12.5');
            expect(screen.getByTestId(INPUT_TEST_ID)).toHaveDisplayValue('12.5');
        });

        it('moves the caret to the end of the value after an edit', () => {
            // Given a composition with value "12" and the caret at the end
            renderKeypadAmountEditor({value: '12'});

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
            renderKeypadAmountEditor({value: '12'});

            // When a digit is appended and native echoes the pre-edit caret position
            const input = screen.getByTestId(INPUT_TEST_ID);
            fireEvent.changeText(input, '123');
            fireEvent(input, 'selectionChange', {nativeEvent: {selection: {start: 0, end: 0}}});

            // Then the echo is dropped and the caret stays where the edit put it
            expect(input.props.selection).toEqual({start: 3, end: 3});
        });

        it('rejects an edit that exceeds the accepted number of decimals', () => {
            // Given a composition with two accepted decimal places and value "1.23"
            renderKeypadAmountEditor({value: '1.23'});

            // When the user types a third decimal place
            fireEvent.changeText(screen.getByTestId(INPUT_TEST_ID), '1.234');

            // Then the edit is rejected and the displayed value is unchanged
            expect(onInputChange).not.toHaveBeenCalled();
            expect(screen.getByTestId(INPUT_TEST_ID)).toHaveDisplayValue('1.23');
        });

        it('strips decimals from an in-progress value when the accepted decimals decrease', () => {
            // Given an empty composition whose in-progress value has two decimal places
            const {rerender} = renderKeypadAmountEditor({value: ''});
            fireEvent.changeText(screen.getByTestId(INPUT_TEST_ID), '1.23');

            // When the accepted number of decimals drops to zero
            rerender(buildKeypadAmountEditor({decimals: 0, value: ''}, <KeypadAmountEditor.Input testID={INPUT_TEST_ID} />));

            // Then the in-progress value is sanitized to the new precision
            expect(screen.getByTestId(INPUT_TEST_ID)).toHaveDisplayValue('1');
        });

        it('preserves the sign when sanitizing a fully selected negative value after the accepted decimals decrease', () => {
            // Given a negative value whose displayed magnitude is fully selected
            const {rerender} = renderKeypadAmountEditor({value: '-12.55', allowNegative: true});
            const input = screen.getByTestId(INPUT_TEST_ID);
            selectAll(input, 5);

            // When the accepted number of decimals drops to zero
            rerender(buildKeypadAmountEditor({decimals: 0, value: '-12.55', allowNegative: true}, <KeypadAmountEditor.Input testID={INPUT_TEST_ID} />));

            // Then sanitization keeps the canonical negative sign
            expect(screen.getByText(MINUS_SIGN)).toBeOnTheScreen();
            expect(screen.getByTestId(INPUT_TEST_ID)).toHaveDisplayValue('12');
            expect(onInputChange).toHaveBeenLastCalledWith('-12');
        });

        it('rejects an edit with more integer digits than the root maxLength allows', () => {
            // Given a composition limited to two integer digits and value "12"
            renderKeypadAmountEditor({value: '12', maxLength: 2});

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
            renderKeypadAmountEditor(
                {value: '12'},
                <KeypadAmountEditor.Input
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

    describe('error', () => {
        it('renders the root error, placed by the layout', () => {
            // Given an error message supplied to the root
            // When the component is rendered
            renderKeypadAmountEditor({errorText: 'Invalid amount'}, <KeypadAmountEditor.Input testID={INPUT_TEST_ID} />);

            // Then the error is displayed with the alert role to inform the user
            expect(screen.getByText('Invalid amount')).toBeOnTheScreen();
            expect(screen.getByRole(CONST.ROLE.ALERT)).toBeOnTheScreen();
        });

        it('renders nothing when the root has no error', () => {
            // Given a composition with no error
            // When the component is rendered
            renderKeypadAmountEditor({}, <KeypadAmountEditor.Input testID={INPUT_TEST_ID} />);

            // Then no error alert is rendered
            expect(screen.queryByRole(CONST.ROLE.ALERT)).not.toBeOnTheScreen();
        });
    });

    describe('dynamic font size (shouldUseDynamicFontSize)', () => {
        function extractFontSize(style: unknown): number | undefined {
            if (!style) {
                return undefined;
            }
            if (Array.isArray(style)) {
                for (let i = style.length - 1; i >= 0; i--) {
                    const nested = extractFontSize(style.at(i));
                    if (nested !== undefined) {
                        return nested;
                    }
                }
                return undefined;
            }
            if (typeof style === 'object' && 'fontSize' in style && typeof style.fontSize === 'number') {
                return style.fontSize;
            }
            return undefined;
        }

        function getElementFontSize(element: {props: unknown}): number | undefined {
            const rawProps: unknown = element.props;
            if (typeof rawProps !== 'object' || rawProps === null || !('style' in rawProps)) {
                return undefined;
            }
            return extractFontSize(rawProps.style);
        }

        it('does not apply dynamic font size when shouldUseDynamicFontSize is not set', () => {
            // Given a KeypadAmountEditor with a short amount and default dynamic font size (disabled)
            renderKeypadAmountEditor({value: '12'});
            const shortInputFontSize = getElementFontSize(screen.getByTestId(INPUT_TEST_ID));

            screen.unmount();

            // When a long amount is rendered without dynamic font size
            renderKeypadAmountEditor({value: '1234567890123'});
            const longInputFontSize = getElementFontSize(screen.getByTestId(INPUT_TEST_ID));

            // Then the font size remains the full-screen amount size, the same as the symbol's, and does not scale with length
            expect(longInputFontSize).toBe(shortInputFontSize);
            expect(longInputFontSize).toBe(getElementFontSize(screen.getByText('$')));
        });

        it('scales font size down across input and symbol when shouldUseDynamicFontSize is enabled', () => {
            // Given a KeypadAmountEditor with dynamic font size enabled and a short amount
            renderKeypadAmountEditor({value: '12', shouldUseDynamicFontSize: true, allowNegative: true});
            // When inspecting font sizes for a short amount
            const shortInputFontSize = getElementFontSize(screen.getByTestId(INPUT_TEST_ID));
            const shortSymbolFontSize = getElementFontSize(screen.getByText('$'));

            // Then short amounts use the base font size for both symbol and input
            expect(shortInputFontSize).toBeDefined();
            expect(shortSymbolFontSize).toBe(shortInputFontSize);

            screen.unmount();

            // When rendered with a long amount that requires scaling
            renderKeypadAmountEditor({value: '1234567890123', shouldUseDynamicFontSize: true, allowNegative: true});
            const longInputFontSize = getElementFontSize(screen.getByTestId(INPUT_TEST_ID));
            const longSymbolFontSize = getElementFontSize(screen.getByText('$'));

            // Then the font size is scaled down equally for both input and symbol
            expect(longInputFontSize).toBeDefined();
            expect(shortInputFontSize).toBeDefined();
            if (longInputFontSize !== undefined && shortInputFontSize !== undefined) {
                expect(longInputFontSize).toBeLessThan(shortInputFontSize);
            }
            expect(longSymbolFontSize).toBe(longInputFontSize);
        });

        it('accounts for minus sign and symbol length when calculating dynamic font size', () => {
            // Given a positive value with dynamic font size enabled
            renderKeypadAmountEditor({value: '1234567890', shouldUseDynamicFontSize: true, allowNegative: true});
            const positiveFontSize = getElementFontSize(screen.getByTestId(INPUT_TEST_ID));

            screen.unmount();

            // When the value is negative and the minus sign is shown
            renderKeypadAmountEditor({value: '-1234567890', shouldUseDynamicFontSize: true, allowNegative: true});
            const negativeFontSize = getElementFontSize(screen.getByTestId(INPUT_TEST_ID));
            const minusSignFontSize = getElementFontSize(screen.getByText(MINUS_SIGN));

            // Then the negative value scales down more because the minus sign consumes space, and the minus sign matches the input
            expect(positiveFontSize).toBeDefined();
            expect(negativeFontSize).toBeDefined();
            if (negativeFontSize !== undefined && positiveFontSize !== undefined) {
                expect(negativeFontSize).toBeLessThan(positiveFontSize);
            }
            expect(minusSignFontSize).toBe(negativeFontSize);

            screen.unmount();

            // When a longer symbol is provided
            renderKeypadAmountEditor(
                {value: '1234567890', shouldUseDynamicFontSize: true, allowNegative: true},
                <>
                    <KeypadAmountEditor.Symbol>PLN</KeypadAmountEditor.Symbol>
                    <KeypadAmountEditor.Input testID={INPUT_TEST_ID} />
                </>,
            );
            const longSymbolFontSize = getElementFontSize(screen.getByTestId(INPUT_TEST_ID));

            // Then font size is further reduced to fit the longer symbol
            expect(longSymbolFontSize).toBeDefined();
            if (longSymbolFontSize !== undefined && positiveFontSize !== undefined) {
                expect(longSymbolFontSize).toBeLessThan(positiveFontSize);
            }
        });

        it('does not count a symbol that the composition does not render', () => {
            // Given a ten-digit amount with dynamic font size enabled and a symbol composed beside it
            renderKeypadAmountEditor({value: '1234567890', shouldUseDynamicFontSize: true});
            const withSymbolFontSize = getElementFontSize(screen.getByTestId(INPUT_TEST_ID));

            screen.unmount();

            // When the same amount is composed without a symbol
            renderKeypadAmountEditor({value: '1234567890', shouldUseDynamicFontSize: true}, <KeypadAmountEditor.Input testID={INPUT_TEST_ID} />);
            const withoutSymbolFontSize = getElementFontSize(screen.getByTestId(INPUT_TEST_ID));

            // Then the amount keeps a larger font, because only symbols that are actually shown take up space in the row
            expect(withSymbolFontSize).toBeDefined();
            expect(withoutSymbolFontSize).toBeDefined();
            if (withSymbolFontSize !== undefined && withoutSymbolFontSize !== undefined) {
                expect(withoutSymbolFontSize).toBeGreaterThan(withSymbolFontSize);
            }
        });

        it('rescales the amount when the composed symbol changes', () => {
            // Given a ten-digit amount with dynamic font size enabled and a one-character symbol
            const renderWithSymbol = (symbol: string) =>
                buildKeypadAmountEditor(
                    {value: '1234567890', shouldUseDynamicFontSize: true},
                    <>
                        <KeypadAmountEditor.Symbol>{symbol}</KeypadAmountEditor.Symbol>
                        <KeypadAmountEditor.Input testID={INPUT_TEST_ID} />
                    </>,
                );
            render(renderWithSymbol('$'));
            const shortSymbolFontSize = getElementFontSize(screen.getByTestId(INPUT_TEST_ID));

            // When the composition swaps it for a longer symbol, as after picking another currency
            screen.rerender(renderWithSymbol('PLN'));
            const longSymbolFontSize = getElementFontSize(screen.getByTestId(INPUT_TEST_ID));

            // Then the amount and the symbol shrink together, because the symbol reports its new length instead of keeping the old one
            expect(shortSymbolFontSize).toBeDefined();
            expect(longSymbolFontSize).toBeDefined();
            if (shortSymbolFontSize !== undefined && longSymbolFontSize !== undefined) {
                expect(longSymbolFontSize).toBeLessThan(shortSymbolFontSize);
            }
            expect(getElementFontSize(screen.getByText('PLN'))).toBe(longSymbolFontSize);
        });

        it('counts a symbol wrapped in another component and stops counting it once removed', () => {
            // Given a ten-digit amount whose symbol is rendered by a screen-level wrapper rather than as a direct child, as a
            // pressable currency symbol would be
            function CurrencySymbol({symbol}: {symbol: string}) {
                return <KeypadAmountEditor.Symbol>{symbol}</KeypadAmountEditor.Symbol>;
            }
            const renderAmount = (row: React.ReactNode) => buildKeypadAmountEditor({value: '1234567890', shouldUseDynamicFontSize: true}, row);
            render(
                renderAmount(
                    <>
                        <KeypadAmountEditor.Symbol>PLN</KeypadAmountEditor.Symbol>
                        <KeypadAmountEditor.Input testID={INPUT_TEST_ID} />
                    </>,
                ),
            );
            const directSymbolFontSize = getElementFontSize(screen.getByTestId(INPUT_TEST_ID));

            // When the same symbol is rendered through the wrapper
            screen.rerender(
                renderAmount(
                    <>
                        <CurrencySymbol symbol="PLN" />
                        <KeypadAmountEditor.Input testID={INPUT_TEST_ID} />
                    </>,
                ),
            );
            const wrappedSymbolFontSize = getElementFontSize(screen.getByTestId(INPUT_TEST_ID));

            // Then it is sized exactly like the direct symbol, because the symbol registers itself wherever it is rendered
            expect(wrappedSymbolFontSize).toBeDefined();
            expect(wrappedSymbolFontSize).toBe(directSymbolFontSize);

            // When the wrapper is removed from the composition
            screen.rerender(renderAmount(<KeypadAmountEditor.Input testID={INPUT_TEST_ID} />));
            const withoutSymbolFontSize = getElementFontSize(screen.getByTestId(INPUT_TEST_ID));

            // Then the amount grows back, because the unmounted symbol no longer counts toward the row length
            expect(withoutSymbolFontSize).toBeDefined();
            if (withoutSymbolFontSize !== undefined && wrappedSymbolFontSize !== undefined) {
                expect(withoutSymbolFontSize).toBeGreaterThan(wrappedSymbolFontSize);
            }
        });

        it('ensures dynamic font size takes precedence over static fontSize in style prop', () => {
            // Given a KeypadAmountEditor with dynamic font size enabled and a custom style with static fontSize (like styles.iouAmountTextInput)
            renderKeypadAmountEditor(
                {value: '0', shouldUseDynamicFontSize: true},
                <>
                    <KeypadAmountEditor.Input
                        testID={INPUT_TEST_ID}
                        style={{fontSize: variables.iouAmountTextSize}}
                    />
                    <KeypadAmountEditor.Symbol textStyle={{fontSize: variables.iouAmountTextSize}}>hrs</KeypadAmountEditor.Symbol>
                </>,
            );

            // When inspecting font sizes
            const inputFontSize = getElementFontSize(screen.getByTestId(INPUT_TEST_ID));
            const symbolFontSize = getElementFontSize(screen.getByText('hrs'));

            // Then both input and symbol receive the dynamic font size rather than the static fontSize, matching each other
            expect(inputFontSize).toBeDefined();
            expect(symbolFontSize).toBe(inputFontSize);
            expect(inputFontSize).not.toBe(variables.iouAmountTextSize);
        });
    });

    describe('root imperative API', () => {
        it('reads and replaces the value without notifying onInputChange', () => {
            // Given a composition holding value "12" and a root ref
            const ref = React.createRef<AmountEditingRef>();
            renderKeypadAmountEditor({value: '12', ref});

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
            const ref = React.createRef<AmountEditingRef>();
            renderKeypadAmountEditor({value: '1234', ref});

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

        it('notifies onInputChange synchronously from toggleSign', () => {
            // Given a negative-capable composition whose parent records whether it was notified inside the toggle call
            let wasParentUpdatedDuringToggle = false;
            let isInsideToggle = false;
            function SynchronousToggleProbe() {
                const {toggleSign} = useKeypadAmountEditorActions();

                return (
                    <PressableWithoutFeedback
                        accessibilityLabel="Toggle sign synchronously"
                        testID="toggle-sign-sync"
                        onPress={() => {
                            isInsideToggle = true;
                            toggleSign();
                            isInsideToggle = false;
                        }}
                    />
                );
            }
            render(
                <KeypadAmountEditor
                    value="12"
                    allowNegative
                    onInputChange={() => {
                        wasParentUpdatedDuringToggle = isInsideToggle;
                    }}
                >
                    <SynchronousToggleProbe />
                </KeypadAmountEditor>,
            );

            // When the sign is toggled
            fireEvent.press(screen.getByTestId('toggle-sign-sync'));

            // Then the parent was notified before toggleSign returned. NumberWithSymbolForm relies on this to tell a flip from an edit.
            expect(wasParentUpdatedDuringToggle).toBe(true);
        });

        it('stores a value through updateNumber without validating it', () => {
            // Given a composition that accepts no decimal places, with a root ref
            const ref = React.createRef<AmountEditingRef>();
            renderKeypadAmountEditor({value: '10', decimals: 0, ref});

            // When a value that typing would reject is set imperatively
            act(() => {
                ref.current?.updateNumber('1.5');
            });

            // Then the value is stored and displayed as is, because callers use the ref to push already-formatted amounts
            expect(ref.current?.getNumber()).toBe('1.5');
            expect(screen.getByTestId(INPUT_TEST_ID)).toHaveDisplayValue('1.5');
            expect(onInputChange).not.toHaveBeenCalled();
        });

        it('renders the sign of a negative value set through updateNumber outside the input', () => {
            // Given a negative-capable composition with a root ref
            const ref = React.createRef<AmountEditingRef>();
            renderKeypadAmountEditor({value: '12', allowNegative: true, ref});

            // When a negative amount is set imperatively
            act(() => {
                ref.current?.updateNumber('-5.00');
            });

            // Then the sign renders separately, the input shows the magnitude with the caret at its end, and the root is not notified
            expect(ref.current?.getNumber()).toBe('-5.00');
            expect(screen.getByText(MINUS_SIGN)).toBeOnTheScreen();
            expect(screen.getByTestId(INPUT_TEST_ID)).toHaveDisplayValue('5.00');
            expect(screen.getByTestId(INPUT_TEST_ID).props.selection).toEqual({start: 4, end: 4});
            expect(onInputChange).not.toHaveBeenCalled();
        });
    });

    describe('normalization and leading zero', () => {
        it('adds a leading zero when a decimal separator is typed into an empty input', () => {
            // Given an empty composition that accepts two decimal places
            renderKeypadAmountEditor({value: ''});

            // When the user types the decimal separator
            fireEvent.changeText(screen.getByTestId(INPUT_TEST_ID), '.');

            // Then a leading zero turns it into a valid in-progress decimal
            expect(onInputChange).toHaveBeenLastCalledWith('0.');
            expect(screen.getByTestId(INPUT_TEST_ID)).toHaveDisplayValue('0.');
        });

        it.each([
            ['.', '-0.', '0.'],
            ['.5', '-0.5', '0.5'],
        ])('adds the leading zero inside the magnitude when %s is typed after a lone minus', (typedText, expectedValue, expectedDisplay) => {
            // Given a negative composition whose magnitude is still empty
            renderKeypadAmountEditor({value: '-', allowNegative: true});

            // When the user types a magnitude starting with the decimal separator
            fireEvent.changeText(screen.getByTestId(INPUT_TEST_ID), typedText);

            // Then the zero goes after the sign, because the sign is rendered outside the input and never reaches the normalizer
            expect(onInputChange).toHaveBeenLastCalledWith(expectedValue);
            expect(screen.getByText(MINUS_SIGN)).toBeOnTheScreen();
            expect(screen.getByTestId(INPUT_TEST_ID)).toHaveDisplayValue(expectedDisplay);
        });

        it.each([
            // Commas are treated as the decimal separator, and spaces iOS Safari adds when pasting are dropped
            ['1 2,5', '12.5'],
            // When a period is present, commas are thousands separators and are dropped instead
            ['1,234.5', '1234.5'],
        ])('normalizes the pasted text %s to %s', (pastedText, expectedValue) => {
            // Given an empty composition that accepts two decimal places
            renderKeypadAmountEditor({value: ''});

            // When the user pastes a localized number
            fireEvent.changeText(screen.getByTestId(INPUT_TEST_ID), pastedText);

            // Then the normalized value is committed and displayed
            expect(onInputChange).toHaveBeenLastCalledWith(expectedValue);
            expect(screen.getByTestId(INPUT_TEST_ID)).toHaveDisplayValue(expectedValue);
        });

        it('normalizes the magnitude before restoring the sign', () => {
            // Given a negative composition whose magnitude is still empty
            renderKeypadAmountEditor({value: '-', allowNegative: true});

            // When the user pastes a number with a space and a comma separator
            fireEvent.changeText(screen.getByTestId(INPUT_TEST_ID), ' 1,5');

            // Then the normalized magnitude keeps the sign
            expect(onInputChange).toHaveBeenLastCalledWith('-1.5');
            expect(screen.getByText(MINUS_SIGN)).toBeOnTheScreen();
            expect(screen.getByTestId(INPUT_TEST_ID)).toHaveDisplayValue('1.5');
        });

        // Quirk locked in on purpose, matching NumberWithSymbolForm: `addLeadingZero('-.', true)` prepends `-0` to the whole
        // string (`-0-.`) instead of inserting the zero after the sign, so the value fails validation.
        it.each(['-.', '-.5'])('rejects the pasted text %s on an empty input', (pastedText) => {
            // Given an empty negative-capable composition
            renderKeypadAmountEditor({value: '', allowNegative: true});

            // When the user pastes a negative value that starts with the decimal separator
            fireEvent.changeText(screen.getByTestId(INPUT_TEST_ID), pastedText);

            // Then the paste is rejected and no sign appears
            expect(onInputChange).not.toHaveBeenCalled();
            expect(screen.queryByText(MINUS_SIGN)).not.toBeOnTheScreen();
            expect(screen.getByTestId(INPUT_TEST_ID)).toHaveDisplayValue('');
        });

        it('rejects a typed minus when negative values are not allowed', () => {
            // Given a composition that does not allow negative values and displays "12"
            renderKeypadAmountEditor({value: '12'});

            // When the user types a minus in front of the number
            fireEvent.changeText(screen.getByTestId(INPUT_TEST_ID), '-12');

            // Then the edit is rejected instead of toggling a sign the composition cannot hold
            expect(onInputChange).not.toHaveBeenCalled();
            expect(screen.getByTestId(INPUT_TEST_ID)).toHaveDisplayValue('12');
        });
    });

    describe('maxLength', () => {
        it('accepts a value that fits maxLength', () => {
            // Given a composition limited to two integer digits and displaying "1"
            renderKeypadAmountEditor({value: '1', maxLength: 2});

            // When the user types a second integer digit
            fireEvent.changeText(screen.getByTestId(INPUT_TEST_ID), '12');

            // Then the edit is committed
            expect(onInputChange).toHaveBeenLastCalledWith('12');
        });

        it('rejects a pasted value that replaces the whole number and exceeds maxLength', () => {
            // Given a composition limited to two integer digits with "12" fully selected
            renderKeypadAmountEditor({value: '12', maxLength: 2});
            const input = screen.getByTestId(INPUT_TEST_ID);
            selectAll(input, 2);

            // When the user pastes a longer number over the selection
            fireEvent.changeText(input, '345');

            // Then the paste is rejected like typing, because the limit applies to the resulting value
            expect(onInputChange).not.toHaveBeenCalled();
            expect(input).toHaveDisplayValue('12');
        });

        it('does not count decimal digits toward maxLength', () => {
            // Given a composition limited to two integer digits and displaying "12"
            renderKeypadAmountEditor({value: '12', maxLength: 2});

            // When the user appends two decimal places
            fireEvent.changeText(screen.getByTestId(INPUT_TEST_ID), '12.34');

            // Then the edit is committed, because maxLength only limits the integer part
            expect(onInputChange).toHaveBeenLastCalledWith('12.34');
        });

        it('does not count the separately rendered sign toward maxLength', () => {
            // Given a negative composition limited to two integer digits and displaying "-1"
            renderKeypadAmountEditor({value: '-1', allowNegative: true, maxLength: 2});
            const input = screen.getByTestId(INPUT_TEST_ID);

            // When the user types a second integer digit
            fireEvent.changeText(input, '12');

            // Then the edit is committed with its sign, because only the magnitude is validated
            expect(onInputChange).toHaveBeenLastCalledWith('-12');

            // When the user types a third integer digit
            fireEvent.changeText(input, '123');

            // Then the edit is rejected and the sign stays
            expect(onInputChange).toHaveBeenCalledTimes(1);
            expect(screen.getByText(MINUS_SIGN)).toBeOnTheScreen();
            expect(input).toHaveDisplayValue('12');
        });
    });

    describe('decimals change', () => {
        it('leaves a value that is already valid at the new precision untouched', () => {
            // Given a composition displaying "1.5" with two accepted decimal places
            const {rerender} = renderKeypadAmountEditor({value: '1.5'});

            // When the accepted number of decimals drops to one
            rerender(buildKeypadAmountEditor({value: '1.5', decimals: 1}));

            // Then the value still fits, so it is neither changed nor reported
            expect(screen.getByTestId(INPUT_TEST_ID)).toHaveDisplayValue('1.5');
            expect(onInputChange).not.toHaveBeenCalled();
        });
    });

    describe('selection', () => {
        const signToggleComposition = (
            <>
                <KeypadAmountEditor.Input testID={INPUT_TEST_ID} />
                <ToggleSignTrigger />
            </>
        );

        it('keeps the caret at the start when toggling the sign of an empty value, so the next digit becomes a negative amount', () => {
            // Given an empty negative-capable composition
            renderKeypadAmountEditor({value: '', allowNegative: true}, signToggleComposition);
            const input = screen.getByTestId(INPUT_TEST_ID);

            // When the sign is toggled
            fireEvent.press(screen.getByTestId('toggle-sign'));

            // Then the sign renders outside the input, so the empty magnitude keeps its caret at the start
            expect(onInputChange).toHaveBeenLastCalledWith('-');
            expect(screen.getByText(MINUS_SIGN)).toBeOnTheScreen();
            expect(input.props.selection).toEqual({start: 0, end: 0});

            // When a digit is typed at the caret
            fireEvent.changeText(input, '5');

            // Then the digit becomes a negative amount
            expect(onInputChange).toHaveBeenLastCalledWith('-5');
            expect(input).toHaveDisplayValue('5');
        });

        it('does not move the caret when toggling the sign of a non-empty value', () => {
            // Given a negative-capable composition displaying "12" with the caret between the digits
            renderKeypadAmountEditor({value: '12', allowNegative: true}, signToggleComposition);
            const input = screen.getByTestId(INPUT_TEST_ID);
            fireEvent(input, 'selectionChange', {nativeEvent: {selection: {start: 1, end: 1}}});

            // When the sign is toggled
            fireEvent.press(screen.getByTestId('toggle-sign'));

            // Then the magnitude and the caret are untouched, because only the separately rendered sign changed
            expect(onInputChange).toHaveBeenLastCalledWith('-12');
            expect(input.props.selection).toEqual({start: 1, end: 1});

            // When the user moves the caret to the end and appends a digit
            fireEvent(input, 'selectionChange', {nativeEvent: {selection: {start: 2, end: 2}}});
            fireEvent.changeText(input, '123');

            // Then the digit extends the negative amount
            expect(onInputChange).toHaveBeenLastCalledWith('-123');
            expect(input.props.selection).toEqual({start: 3, end: 3});
        });

        it('keeps the caret in place after a forward delete', () => {
            // Given a composition displaying "1234" with the caret after "12"
            renderKeypadAmountEditor({value: '1234'});
            const input = screen.getByTestId(INPUT_TEST_ID);
            fireEvent(input, 'selectionChange', {nativeEvent: {selection: {start: 2, end: 2}}});

            // When the character after the caret is forward-deleted
            fireEvent(input, 'keyPress', {nativeEvent: {key: 'Delete', ctrlKey: false}});
            fireEvent.changeText(input, '124');

            // Then the caret stays put, because forward delete removes the character after it
            expect(input).toHaveDisplayValue('124');
            expect(input.props.selection).toEqual({start: 2, end: 2});
        });

        it('clamps a native selection beyond the magnitude length', () => {
            // Given a negative composition displaying the magnitude "12"
            renderKeypadAmountEditor({value: '-12', allowNegative: true});
            const input = screen.getByTestId(INPUT_TEST_ID);

            // When native reports a selection past the end of the value
            fireEvent(input, 'selectionChange', {nativeEvent: {selection: {start: 10, end: 10}}});

            // Then the selection is clamped to the displayed magnitude, which does not include the sign
            expect(input.props.selection).toEqual({start: 2, end: 2});
        });

        it('collapses the selection when the screen regains focus', () => {
            // Given an unfocused screen whose composition has a range selection
            jest.mocked(useIsFocused).mockReturnValue(false);
            const {rerender} = renderKeypadAmountEditor({value: '1234'});
            const input = screen.getByTestId(INPUT_TEST_ID);
            fireEvent(input, 'selectionChange', {nativeEvent: {selection: {start: 1, end: 3}}});
            expect(input.props.selection).toEqual({start: 1, end: 3});

            // When the screen regains focus
            jest.mocked(useIsFocused).mockReturnValue(true);
            rerender(buildKeypadAmountEditor({value: '1234'}));

            // Then the selection collapses onto its end, so returning to the screen never types over a stale range
            expect(input.props.selection).toEqual({start: 3, end: 3});
        });

        it('keeps the sign when a key other than backspace is pressed on an empty negative input', () => {
            // Given a negative composition whose magnitude is empty
            renderKeypadAmountEditor({value: '-', allowNegative: true});

            // When a digit key is pressed
            fireEvent(screen.getByTestId(INPUT_TEST_ID), 'keyPress', {nativeEvent: {key: '1'}});

            // Then the sign stays, because only backspace clears a lone minus
            expect(screen.getByText(MINUS_SIGN)).toBeOnTheScreen();
            expect(onInputChange).not.toHaveBeenCalled();
        });
    });

    describe('external value synchronization', () => {
        it('clears the magnitude, the sign and the caret when the value prop resets to empty', () => {
            // Given a negative composition displaying "-12"
            const {rerender} = renderKeypadAmountEditor({value: '-12', allowNegative: true});
            const input = screen.getByTestId(INPUT_TEST_ID);

            // When the parent resets the value to empty
            rerender(buildKeypadAmountEditor({value: '', allowNegative: true}));

            // Then nothing of the previous amount is left, and the caret is back at the start
            expect(screen.queryByText(MINUS_SIGN)).not.toBeOnTheScreen();
            expect(input).toHaveDisplayValue('');
            expect(input.props.selection).toEqual({start: 0, end: 0});
        });

        it('ignores an external change to another non-empty value', () => {
            // Given a composition displaying "10"
            const {rerender} = renderKeypadAmountEditor({value: '10'});

            // When the parent rerenders with value "20"
            rerender(buildKeypadAmountEditor({value: '20'}));

            // Then the editing state keeps the current value because external pushes must use the imperative ref
            expect(screen.getByTestId(INPUT_TEST_ID)).toHaveDisplayValue('10');
        });
    });
});
