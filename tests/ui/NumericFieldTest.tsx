import {act, fireEvent, render, screen} from '@testing-library/react-native';

import NumericField, {useNumericFieldActions, useNumericFieldState} from '@components/NumericField';
import type {NumericFieldRef} from '@components/NumericField';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import Text from '@components/Text';

import type * as NativeNavigation from '@react-navigation/native';

import React from 'react';
import {View} from 'react-native';

jest.mock('@hooks/useLocalize', () => () => ({
    fromLocaleDigit: (digit: string) => digit,
    toLocaleDigit: (digit: string) => digit,
}));

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof NativeNavigation>('@react-navigation/native'),
    useIsFocused: jest.fn(() => true),
    useNavigation: jest.fn(() => ({
        navigate: jest.fn(),
        addListener: jest.fn(() => jest.fn()),
    })),
}));

type NumericFieldProps = React.ComponentProps<typeof NumericField>;

const INPUT_TEST_ID = 'numeric-field-input';

function ContextReadout() {
    const {value, allowNegative, errorText} = useNumericFieldState();
    const {setNumber, toggleSign} = useNumericFieldActions();

    return (
        <View>
            <Text testID="ctx-value">{value}</Text>
            <Text testID="ctx-allowNegative">{String(allowNegative)}</Text>
            <Text testID="ctx-errorText">{errorText ?? ''}</Text>
            <PressableWithFeedback
                accessibilityLabel="Set number"
                accessibilityRole="button"
                testID="ctx-setNumber"
                onPress={() => {
                    setNumber('7');
                }}
            />
            <PressableWithFeedback
                accessibilityLabel="Set numbers rapidly"
                accessibilityRole="button"
                testID="ctx-setNumbersRapidly"
                onPress={() => {
                    setNumber('7');
                    setNumber('99');
                }}
            />
            <PressableWithFeedback
                accessibilityLabel="Toggle sign"
                accessibilityRole="button"
                testID="ctx-toggleSign"
                onPress={() => {
                    toggleSign();
                }}
            />
        </View>
    );
}

describe('NumericField', () => {
    const onInputChange = jest.fn();

    const wrapNumericField = (props: Partial<NumericFieldProps> = {}, children: React.ReactNode = <ContextReadout />) => (
        <NumericField
            onInputChange={onInputChange}
            {...props}
        >
            {children}
        </NumericField>
    );

    const renderNumericField = (props: Partial<NumericFieldProps> = {}, children: React.ReactNode = <ContextReadout />) => render(wrapNumericField(props, children));

    /** Composes the root with its text input, so edits, the caret and the displayed text can be exercised like a user would. */
    const wrapFieldWithInput = (props: Partial<NumericFieldProps> = {}) => (
        <NumericField
            onInputChange={onInputChange}
            {...props}
        >
            <NumericField.TextInput testID={INPUT_TEST_ID} />
            <ContextReadout />
        </NumericField>
    );
    const renderFieldWithInput = (props: Partial<NumericFieldProps> = {}) => render(wrapFieldWithInput(props));

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('rendering', () => {
        it('renders children', () => {
            // Given a NumericField with a child element
            renderNumericField({}, <Text testID="child">hello</Text>);

            // Then the child is rendered
            expect(screen.getByTestId('child')).toBeOnTheScreen();
        });
    });

    describe('NumericFieldContext', () => {
        it('provides default state with an empty value and negative input disabled', () => {
            // Given a NumericField with no value or mode props
            renderNumericField();

            // Then the context exposes an empty value, negative input disabled, and no error
            expect(screen.getByTestId('ctx-value')).toHaveTextContent('');
            expect(screen.getByTestId('ctx-allowNegative')).toHaveTextContent('false');
            expect(screen.getByTestId('ctx-errorText')).toHaveTextContent('');
        });

        it('propagates value, allowNegative, and errorText from props', () => {
            // Given a NumericField with value, allowNegative, and errorText props
            renderNumericField({
                value: '12.50',
                allowNegative: true,
                decimals: 2,
                errorText: 'Required',
            });

            // Then the context reflects those props
            expect(screen.getByTestId('ctx-value')).toHaveTextContent('12.50');
            expect(screen.getByTestId('ctx-allowNegative')).toHaveTextContent('true');
            expect(screen.getByTestId('ctx-errorText')).toHaveTextContent('Required');
        });
    });

    describe('external value synchronization', () => {
        it('re-initializes the editing state when the value prop resets to an empty string', () => {
            // Given a NumericField controlled with value "10"
            const {rerender} = renderNumericField({value: '10'});

            expect(screen.getByTestId('ctx-value')).toHaveTextContent('10');

            // When the parent rerenders with an empty value
            rerender(wrapNumericField({value: ''}));

            // Then the editing state resets
            expect(screen.getByTestId('ctx-value')).toHaveTextContent('');
        });

        it('ignores an external change to another non-empty value, matching NumberWithSymbolForm', () => {
            // Given a NumericField controlled with value "10"
            const {rerender} = renderNumericField({value: '10'});

            expect(screen.getByTestId('ctx-value')).toHaveTextContent('10');

            // When the parent rerenders with value "20"
            rerender(wrapNumericField({value: '20'}));

            // Then the editing state keeps the current value; external pushes must use the imperative ref
            expect(screen.getByTestId('ctx-value')).toHaveTextContent('10');
        });

        it('does not overwrite a local edit when the parent rerenders with the same external value', () => {
            // Given a NumericField controlled with value "10" and a local edit to "7"
            const {rerender} = renderNumericField({value: '10'});

            fireEvent.press(screen.getByTestId('ctx-setNumber'));

            // When the parent rerenders with the same external value "10"
            rerender(wrapNumericField({value: '10'}));

            // Then the local edit is preserved
            expect(screen.getByTestId('ctx-value')).toHaveTextContent('7');
        });
    });

    describe('value updates', () => {
        it('updates context and notifies the parent when setNumber is called', () => {
            // Given an uncontrolled NumericField
            renderNumericField();

            // When setNumber is called from a child
            fireEvent.press(screen.getByTestId('ctx-setNumber'));

            // Then the context value updates and onInputChange is notified
            expect(screen.getByTestId('ctx-value')).toHaveTextContent('7');
            expect(onInputChange).toHaveBeenCalledTimes(1);
            expect(onInputChange).toHaveBeenCalledWith('7');
        });

        it('updates the field without notifying the parent when updateNumber is called through the imperative ref', () => {
            // Given an uncontrolled NumericField with an imperative ref
            const ref = React.createRef<NumericFieldRef>();
            renderNumericField({ref});

            // When updateNumber is called through the imperative ref
            act(() => {
                ref.current?.updateNumber('99');
            });

            // Then the context value updates without calling onInputChange
            expect(screen.getByTestId('ctx-value')).toHaveTextContent('99');
            expect(onInputChange).not.toHaveBeenCalled();
        });

        it('commits the last value when setNumber is called more than once before a render', () => {
            // Given a NumericField with value "1"
            renderNumericField({value: '1'});

            // When setNumber is called twice before the next render
            fireEvent.press(screen.getByTestId('ctx-setNumbersRapidly'));

            // Then both edits are reported in order and the final context value is "99"
            expect(onInputChange).toHaveBeenNthCalledWith(1, '7');
            expect(onInputChange).toHaveBeenNthCalledWith(2, '99');
            expect(screen.getByTestId('ctx-value')).toHaveTextContent('99');
        });

        it('does nothing when toggleSign is called and allowNegative is false', () => {
            // Given a NumericField with negative input disabled
            renderNumericField({value: '10', allowNegative: false});

            // When toggleSign is called
            fireEvent.press(screen.getByTestId('ctx-toggleSign'));

            // Then the value remains unchanged and onInputChange is not called
            expect(screen.getByTestId('ctx-value')).toHaveTextContent('10');
            expect(onInputChange).not.toHaveBeenCalled();
        });

        it('toggles sign when toggleSign is called and allowNegative is true', () => {
            // Given a NumericField with negative input enabled
            renderNumericField({value: '10', allowNegative: true});

            // When toggleSign is called
            fireEvent.press(screen.getByTestId('ctx-toggleSign'));

            // Then the value is negated and onInputChange is notified
            expect(screen.getByTestId('ctx-value')).toHaveTextContent('-10');
            expect(onInputChange).toHaveBeenCalledWith('-10');

            // When toggleSign is called again
            fireEvent.press(screen.getByTestId('ctx-toggleSign'));

            // Then the value becomes positive again
            expect(screen.getByTestId('ctx-value')).toHaveTextContent('10');
            expect(onInputChange).toHaveBeenCalledWith('10');
        });
    });

    describe('normalization and leading zero', () => {
        it('preserves a negative decimal that already has a leading zero', () => {
            // Given an empty field that accepts negative decimals
            renderFieldWithInput({decimals: 2, allowNegative: true});

            // When the user types a negative decimal with its leading zero
            fireEvent.changeText(screen.getByTestId(INPUT_TEST_ID), '-0.5');

            // Then the value is kept as typed, because it is already canonical
            expect(onInputChange).toHaveBeenLastCalledWith('-0.5');
            expect(screen.getByTestId(INPUT_TEST_ID)).toHaveDisplayValue('-0.5');
        });

        // Quirk locked in on purpose: `addLeadingZero('-.', true)` prepends `-0` to the whole string (`-0-.`) instead of
        // inserting the zero after the sign, so a negative value starting with the separator fails validation.
        it.each([
            ['-.', true],
            ['-.', false],
            ['-.5', true],
        ])('rejects %s when allowNegative is %s', (typedText, allowNegative) => {
            // Given an empty field that accepts two decimal places
            renderFieldWithInput({decimals: 2, allowNegative});

            // When the user types a negative value that starts with the decimal separator
            fireEvent.changeText(screen.getByTestId(INPUT_TEST_ID), typedText);

            // Then the edit is rejected and the field stays empty
            expect(onInputChange).not.toHaveBeenCalled();
            expect(screen.getByTestId(INPUT_TEST_ID)).toHaveDisplayValue('');
        });
    });

    describe('validation', () => {
        it('rejects more decimals than accepted and accepts the accepted precision', () => {
            // Given a field that accepts one decimal place
            renderFieldWithInput({value: '1', decimals: 1});
            const input = screen.getByTestId(INPUT_TEST_ID);

            // When the user types two decimal places
            fireEvent.changeText(input, '1.55');

            // Then the edit is rejected
            expect(onInputChange).not.toHaveBeenCalled();

            // When the user types a single decimal place
            fireEvent.changeText(input, '1.5');

            // Then the edit is committed
            expect(onInputChange).toHaveBeenLastCalledWith('1.5');
            expect(input).toHaveDisplayValue('1.5');
        });
    });

    describe('maxLength', () => {
        it('does not count the minus sign toward maxLength', () => {
            // Given a negative-capable field limited to two integer digits and displaying "12"
            renderFieldWithInput({value: '12', decimals: 2, maxLength: 2, allowNegative: true});

            // When the user makes the value negative
            fireEvent.changeText(screen.getByTestId(INPUT_TEST_ID), '-12');

            // Then the edit is committed, because the sign is not a digit
            expect(onInputChange).toHaveBeenLastCalledWith('-12');
        });
    });

    describe('decimals change', () => {
        it('keeps the sign when stripping decimals from a negative value', () => {
            // Given a negative-capable field displaying "-1.5"
            const {rerender} = renderFieldWithInput({value: '-1.5', decimals: 2, allowNegative: true});

            // When the accepted number of decimals drops to zero
            rerender(wrapFieldWithInput({value: '-1.5', decimals: 0, allowNegative: true}));

            // Then only the decimals are removed and the amount stays negative
            expect(screen.getByTestId(INPUT_TEST_ID)).toHaveDisplayValue('-1');
            expect(onInputChange).toHaveBeenLastCalledWith('-1');
        });

        // Quirk locked in on purpose: `stripDecimalsFromAmount` drops every decimal instead of truncating to the new precision.
        it('strips every decimal when the accepted decimals drop to a non-zero precision', () => {
            // Given a field displaying "1.55" with two accepted decimal places
            const {rerender} = renderFieldWithInput({value: '1.55', decimals: 2});

            // When the accepted number of decimals drops to one
            rerender(wrapFieldWithInput({value: '1.55', decimals: 1}));

            // Then the whole fraction is removed rather than only the extra digit
            expect(screen.getByTestId(INPUT_TEST_ID)).toHaveDisplayValue('1');
            expect(onInputChange).toHaveBeenLastCalledWith('1');
        });
    });

    describe('selection', () => {
        it('places the caret after the sign when toggling an empty value, so the next digit becomes a negative amount', () => {
            // Given an empty negative-capable field
            renderFieldWithInput({decimals: 2, allowNegative: true});
            const input = screen.getByTestId(INPUT_TEST_ID);

            // When the sign is toggled
            fireEvent.press(screen.getByTestId('ctx-toggleSign'));

            // Then a lone minus is reported and the caret sits after it
            expect(onInputChange).toHaveBeenLastCalledWith('-');
            expect(input.props.selection).toEqual({start: 1, end: 1});

            // When a digit is typed at the caret
            fireEvent.changeText(input, '-5');

            // Then the digit joins the negative value
            expect(onInputChange).toHaveBeenLastCalledWith('-5');
            expect(input).toHaveDisplayValue('-5');
        });

        it('keeps the caret after the digits when toggling a non-empty value, so further typing appends', () => {
            // Given a negative-capable field displaying "5" with the caret at the end
            renderFieldWithInput({value: '5', decimals: 2, allowNegative: true});
            const input = screen.getByTestId(INPUT_TEST_ID);

            // When the sign is toggled
            fireEvent.press(screen.getByTestId('ctx-toggleSign'));

            // Then the caret shifts by the added sign and stays after the digits
            expect(onInputChange).toHaveBeenLastCalledWith('-5');
            expect(input.props.selection).toEqual({start: 2, end: 2});

            // When another digit is typed at the caret
            fireEvent.changeText(input, '-50');

            // Then it is appended to the negative value
            expect(onInputChange).toHaveBeenLastCalledWith('-50');
            expect(input).toHaveDisplayValue('-50');
        });

        it('moves the caret back by one when the sign is removed', () => {
            // Given a negative-capable field displaying "-5" with the caret at the end
            renderFieldWithInput({value: '-5', decimals: 2, allowNegative: true});

            // When the sign is toggled off
            fireEvent.press(screen.getByTestId('ctx-toggleSign'));

            // Then the caret follows the shorter text and stays after the digit
            expect(onInputChange).toHaveBeenLastCalledWith('5');
            expect(screen.getByTestId(INPUT_TEST_ID).props.selection).toEqual({start: 1, end: 1});
        });

        it('ignores the stale selection event native echoes once after a toggle', () => {
            // Given a negative-capable field displaying "12" with the caret at the end
            renderFieldWithInput({value: '12', decimals: 2, allowNegative: true});
            const input = screen.getByTestId(INPUT_TEST_ID);

            // When the sign is toggled
            fireEvent.press(screen.getByTestId('ctx-toggleSign'));

            // Then the added sign shifts the caret by one
            expect(input.props.selection).toEqual({start: 3, end: 3});

            // When native echoes the pre-toggle caret position
            fireEvent(input, 'selectionChange', {nativeEvent: {selection: {start: 0, end: 0}}});

            // Then the echo is dropped and the caret stays where the toggle put it
            expect(input.props.selection).toEqual({start: 3, end: 3});

            // When the user moves the caret afterwards
            fireEvent(input, 'selectionChange', {nativeEvent: {selection: {start: 0, end: 0}}});

            // Then the selection is applied, because only one echo is expected
            expect(input.props.selection).toEqual({start: 0, end: 0});
        });

        it('moves the caret after a digit inserted in the middle of the value', () => {
            // Given a field displaying "1234" with the caret after "12"
            renderFieldWithInput({value: '1234', decimals: 2});
            const input = screen.getByTestId(INPUT_TEST_ID);
            fireEvent(input, 'selectionChange', {nativeEvent: {selection: {start: 2, end: 2}}});

            // When a digit is typed at the caret
            fireEvent.changeText(input, '12934');

            // Then the caret follows the inserted digit instead of jumping to the end
            expect(input.props.selection).toEqual({start: 3, end: 3});
        });
    });
});
