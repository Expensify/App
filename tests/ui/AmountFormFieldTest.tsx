import {act, fireEvent, render, screen} from '@testing-library/react-native';

import AmountFormField, {useAmountFormFieldActions, useAmountFormFieldState} from '@components/AmountFormField';
import type {AmountFormFieldRef} from '@components/AmountFormField';
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

type AmountFormFieldProps = React.ComponentProps<typeof AmountFormField>;

function ContextReadout() {
    const {value, allowNegative, errorText} = useAmountFormFieldState();
    const {setNumber, toggleSign} = useAmountFormFieldActions();

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

describe('AmountFormField', () => {
    const onInputChange = jest.fn();

    const wrapAmountFormField = (props: Partial<AmountFormFieldProps> = {}, children: React.ReactNode = <ContextReadout />) => (
        <AmountFormField
            onInputChange={onInputChange}
            {...props}
        >
            {children}
        </AmountFormField>
    );

    const renderAmountFormField = (props: Partial<AmountFormFieldProps> = {}, children: React.ReactNode = <ContextReadout />) => render(wrapAmountFormField(props, children));

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('rendering', () => {
        it('renders children', () => {
            // Given a AmountFormField with a child element
            renderAmountFormField({}, <Text testID="child">hello</Text>);

            // Then the child is rendered
            expect(screen.getByTestId('child')).toBeOnTheScreen();
        });
    });

    describe('AmountFormFieldContext', () => {
        it('provides default state with an empty value and negative input disabled', () => {
            // Given a AmountFormField with no value or mode props
            renderAmountFormField();

            // Then the context exposes an empty value, negative input disabled, and no error
            expect(screen.getByTestId('ctx-value')).toHaveTextContent('');
            expect(screen.getByTestId('ctx-allowNegative')).toHaveTextContent('false');
            expect(screen.getByTestId('ctx-errorText')).toHaveTextContent('');
        });

        it('propagates value, allowNegative, and errorText from props', () => {
            // Given a AmountFormField with value, allowNegative, and errorText props
            renderAmountFormField({
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
            // Given a AmountFormField controlled with value "10"
            const {rerender} = renderAmountFormField({value: '10'});

            expect(screen.getByTestId('ctx-value')).toHaveTextContent('10');

            // When the parent rerenders with an empty value
            rerender(wrapAmountFormField({value: ''}));

            // Then the editing state resets
            expect(screen.getByTestId('ctx-value')).toHaveTextContent('');
        });

        it('ignores an external change to another non-empty value, matching NumberWithSymbolForm', () => {
            // Given a AmountFormField controlled with value "10"
            const {rerender} = renderAmountFormField({value: '10'});

            expect(screen.getByTestId('ctx-value')).toHaveTextContent('10');

            // When the parent rerenders with value "20"
            rerender(wrapAmountFormField({value: '20'}));

            // Then the editing state keeps the current value; external pushes must use the imperative ref
            expect(screen.getByTestId('ctx-value')).toHaveTextContent('10');
        });

        it('does not overwrite a local edit when the parent rerenders with the same external value', () => {
            // Given a AmountFormField controlled with value "10" and a local edit to "7"
            const {rerender} = renderAmountFormField({value: '10'});

            fireEvent.press(screen.getByTestId('ctx-setNumber'));

            // When the parent rerenders with the same external value "10"
            rerender(wrapAmountFormField({value: '10'}));

            // Then the local edit is preserved
            expect(screen.getByTestId('ctx-value')).toHaveTextContent('7');
        });
    });

    describe('value updates', () => {
        it('updates context and notifies the parent when setNumber is called', () => {
            // Given an uncontrolled AmountFormField
            renderAmountFormField();

            // When setNumber is called from a child
            fireEvent.press(screen.getByTestId('ctx-setNumber'));

            // Then the context value updates and onInputChange is notified
            expect(screen.getByTestId('ctx-value')).toHaveTextContent('7');
            expect(onInputChange).toHaveBeenCalledTimes(1);
            expect(onInputChange).toHaveBeenCalledWith('7');
        });

        it('updates the field without notifying the parent when updateNumber is called through the imperative ref', () => {
            // Given an uncontrolled AmountFormField with an imperative ref
            const ref = React.createRef<AmountFormFieldRef>();
            renderAmountFormField({ref});

            // When updateNumber is called through the imperative ref
            act(() => {
                ref.current?.updateNumber('99');
            });

            // Then the context value updates without calling onInputChange
            expect(screen.getByTestId('ctx-value')).toHaveTextContent('99');
            expect(onInputChange).not.toHaveBeenCalled();
        });

        it('commits the last value when setNumber is called more than once before a render', () => {
            // Given a AmountFormField with value "1"
            renderAmountFormField({value: '1'});

            // When setNumber is called twice before the next render
            fireEvent.press(screen.getByTestId('ctx-setNumbersRapidly'));

            // Then both edits are reported in order and the final context value is "99"
            expect(onInputChange).toHaveBeenNthCalledWith(1, '7');
            expect(onInputChange).toHaveBeenNthCalledWith(2, '99');
            expect(screen.getByTestId('ctx-value')).toHaveTextContent('99');
        });

        it('does nothing when toggleSign is called and allowNegative is false', () => {
            // Given a AmountFormField with negative input disabled
            renderAmountFormField({value: '10', allowNegative: false});

            // When toggleSign is called
            fireEvent.press(screen.getByTestId('ctx-toggleSign'));

            // Then the value remains unchanged and onInputChange is not called
            expect(screen.getByTestId('ctx-value')).toHaveTextContent('10');
            expect(onInputChange).not.toHaveBeenCalled();
        });

        it('toggles sign when toggleSign is called and allowNegative is true', () => {
            // Given a AmountFormField with negative input enabled
            renderAmountFormField({value: '10', allowNegative: true});

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
});
