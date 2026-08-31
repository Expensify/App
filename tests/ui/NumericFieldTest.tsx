import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import NumericField, {useNumericFieldActions, useNumericFieldState} from '@components/NumericField';
import type {NumericFieldRef} from '@components/NumericField';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import Text from '@components/Text';
import TextInput from '@components/TextInput';

import type * as NativeNavigation from '@react-navigation/native';

import React from 'react';
import {View} from 'react-native';

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof NativeNavigation>('@react-navigation/native'),
    useIsFocused: jest.fn(() => true),
    useNavigation: jest.fn(() => ({
        navigate: jest.fn(),
        addListener: jest.fn(() => jest.fn()),
    })),
}));

type NumericFieldProps = React.ComponentProps<typeof NumericField>;

function ContextReadout() {
    const {value, allowNegative, errorText} = useNumericFieldState();
    const {setNumber, handleBlur} = useNumericFieldActions();

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
            <TextInput
                accessibilityHint="Triggers the blur callback"
                accessibilityLabel="Trigger blur"
                testID="ctx-triggerBlur"
                onBlur={handleBlur}
            />
        </View>
    );
}

function renderWithProviders(children: React.ReactNode) {
    return render(<ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>{children}</ComposeProviders>);
}

describe('NumericField', () => {
    const onInputChange = jest.fn();
    const onBlur = jest.fn();

    const renderNumericField = (props: Partial<NumericFieldProps> = {}, children: React.ReactNode = <ContextReadout />) =>
        renderWithProviders(
            <NumericField
                onInputChange={onInputChange}
                {...props}
            >
                {children}
            </NumericField>,
        );

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
        it('provides default state: empty value and none negative mode', () => {
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

        it('forwards blur to the root onBlur through handleBlur', () => {
            // Given a NumericField with an onBlur callback
            renderNumericField({onBlur});

            // When the child input blurs
            fireEvent(screen.getByTestId('ctx-triggerBlur'), 'blur');

            // Then the root onBlur callback is invoked
            expect(onBlur).toHaveBeenCalledTimes(1);
        });
    });

    describe('external value synchronization', () => {
        it('re-initializes the editing state when the value prop resets to an empty string', () => {
            // Given a NumericField controlled with value "10"
            const {rerender} = renderNumericField({value: '10'});

            expect(screen.getByTestId('ctx-value')).toHaveTextContent('10');

            // When the parent rerenders with an empty value
            rerender(
                <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
                    <NumericField
                        value=""
                        onInputChange={onInputChange}
                    >
                        <ContextReadout />
                    </NumericField>
                </ComposeProviders>,
            );

            // Then the editing state resets
            expect(screen.getByTestId('ctx-value')).toHaveTextContent('');
        });

        it('ignores an external change to another non-empty value, matching NumberWithSymbolForm', () => {
            // Given a NumericField controlled with value "10"
            const {rerender} = renderNumericField({value: '10'});

            expect(screen.getByTestId('ctx-value')).toHaveTextContent('10');

            // When the parent rerenders with value "20"
            rerender(
                <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
                    <NumericField
                        value="20"
                        onInputChange={onInputChange}
                    >
                        <ContextReadout />
                    </NumericField>
                </ComposeProviders>,
            );

            // Then the editing state keeps the current value; external pushes must use the imperative ref
            expect(screen.getByTestId('ctx-value')).toHaveTextContent('10');
        });

        it('does not overwrite a local edit when the parent rerenders with the same external value', () => {
            // Given a NumericField controlled with value "10" and a local edit to "7"
            const {rerender} = renderNumericField({value: '10'});

            fireEvent.press(screen.getByTestId('ctx-setNumber'));

            // When the parent rerenders with the same external value "10"
            rerender(
                <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
                    <NumericField
                        value="10"
                        onInputChange={onInputChange}
                    >
                        <ContextReadout />
                    </NumericField>
                </ComposeProviders>,
            );

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
            const numericEditingRef = React.createRef<NumericFieldRef>();
            renderNumericField({numericEditingRef});

            // When updateNumber is called through the imperative ref
            act(() => {
                numericEditingRef.current?.updateNumber('99');
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
    });
});
