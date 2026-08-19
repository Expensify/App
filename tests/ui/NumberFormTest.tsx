import {fireEvent, render, screen} from '@testing-library/react-native';

import NumberForm, {useNumberFormActions, useNumberFormState} from '@components/NumberForm';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import Text from '@components/Text';
import TextInput from '@components/TextInput';

import React from 'react';
import {View} from 'react-native';

type NumberFormProps = React.ComponentProps<typeof NumberForm>;

function ContextReadout() {
    const {value, allowNegative, errorText} = useNumberFormState();
    const {setValue, onBlur} = useNumberFormActions();

    return (
        <View>
            <Text testID="ctx-value">{value}</Text>
            <Text testID="ctx-allowNegative">{String(allowNegative)}</Text>
            <Text testID="ctx-errorText">{errorText ?? ''}</Text>
            <Text testID="ctx-hasOnBlur">{String(!!onBlur)}</Text>
            <PressableWithFeedback
                accessibilityLabel="Set value"
                accessibilityRole="button"
                testID="ctx-setValue"
                onPress={() => {
                    setValue('7');
                }}
            />
            <PressableWithFeedback
                accessibilityLabel="Set value silently"
                accessibilityRole="button"
                testID="ctx-setValueSilent"
                onPress={() => {
                    setValue('99', {notify: false});
                }}
            />
            <TextInput
                accessibilityHint="Triggers the blur callback"
                accessibilityLabel="Trigger blur"
                testID="ctx-triggerBlur"
                onBlur={onBlur}
            />
        </View>
    );
}

function RapidValueUpdater({onPreviousValues}: {onPreviousValues: (values: string[]) => void}) {
    const {setValue} = useNumberFormActions();

    return (
        <PressableWithFeedback
            accessibilityLabel="Set values rapidly"
            accessibilityRole="button"
            testID="ctx-setValuesRapidly"
            onPress={() => {
                onPreviousValues([setValue('7'), setValue('99')]);
            }}
        />
    );
}

describe('NumberForm', () => {
    const onInputChange = jest.fn();
    const onBlur = jest.fn();

    const renderNumberForm = (props: Partial<NumberFormProps> = {}, children: React.ReactNode = <ContextReadout />) =>
        render(
            <NumberForm
                onInputChange={onInputChange}
                {...props}
            >
                {children}
            </NumberForm>,
        );

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('rendering', () => {
        it('renders children', () => {
            // Given a NumberForm with a child element
            renderNumberForm({}, <Text testID="child">hello</Text>);

            // Then the child is rendered
            expect(screen.getByTestId('child')).toBeOnTheScreen();
        });
    });

    describe('NumberFormContext', () => {
        it('provides default state: empty value and none negative mode', () => {
            // Given a NumberForm with no value or mode props
            renderNumberForm();

            // Then the context exposes an empty value, negative input disabled, no error, and no onBlur
            expect(screen.getByTestId('ctx-value')).toHaveTextContent('');
            expect(screen.getByTestId('ctx-allowNegative')).toHaveTextContent('false');
            expect(screen.getByTestId('ctx-errorText')).toHaveTextContent('');
            expect(screen.getByTestId('ctx-hasOnBlur')).toHaveTextContent('false');
        });

        it('propagates value, allowNegative, and errorText from props', () => {
            // Given a NumberForm with value, allowNegative, and errorText props
            renderNumberForm({
                value: '12.50',
                allowNegative: true,
                errorText: 'Required',
            });

            // Then the context reflects those props
            expect(screen.getByTestId('ctx-value')).toHaveTextContent('12.50');
            expect(screen.getByTestId('ctx-allowNegative')).toHaveTextContent('true');
            expect(screen.getByTestId('ctx-errorText')).toHaveTextContent('Required');
        });

        it('propagates onBlur to children via context', () => {
            // Given a NumberForm with an onBlur callback
            renderNumberForm({onBlur});

            expect(screen.getByTestId('ctx-hasOnBlur')).toHaveTextContent('true');

            // When the child input blurs
            fireEvent(screen.getByTestId('ctx-triggerBlur'), 'blur');

            // Then the root onBlur callback is invoked
            expect(onBlur).toHaveBeenCalledTimes(1);
        });

        it('syncs context value when the controlled value prop changes', () => {
            // Given a NumberForm controlled with value "10"
            const {rerender} = renderNumberForm({value: '10'});

            expect(screen.getByTestId('ctx-value')).toHaveTextContent('10');

            // When the parent rerenders with value "20"
            rerender(
                <NumberForm
                    value="20"
                    onInputChange={onInputChange}
                >
                    <ContextReadout />
                </NumberForm>,
            );

            // Then the context value updates to match
            expect(screen.getByTestId('ctx-value')).toHaveTextContent('20');
        });
    });

    describe('value updates', () => {
        it('updates context and notifies the parent when setValue is called', () => {
            // Given an uncontrolled NumberForm
            renderNumberForm();

            // When setValue is called from a child
            fireEvent.press(screen.getByTestId('ctx-setValue'));

            // Then the context value updates and onInputChange is notified
            expect(screen.getByTestId('ctx-value')).toHaveTextContent('7');
            expect(onInputChange).toHaveBeenCalledTimes(1);
            expect(onInputChange).toHaveBeenCalledWith('7');
        });

        it('updates context without notifying the parent when setValue is called with notify: false', () => {
            // Given an uncontrolled NumberForm
            renderNumberForm();

            // When setValue is called with notify: false
            fireEvent.press(screen.getByTestId('ctx-setValueSilent'));

            // Then the context value updates without calling onInputChange
            expect(screen.getByTestId('ctx-value')).toHaveTextContent('99');
            expect(onInputChange).not.toHaveBeenCalled();
        });

        it('returns the latest previous value when setValue is called more than once before a render', () => {
            const onPreviousValues = jest.fn();

            // Given a NumberForm with value "1"
            renderNumberForm(
                {value: '1'},
                <>
                    <ContextReadout />
                    <RapidValueUpdater onPreviousValues={onPreviousValues} />
                </>,
            );

            // When setValue is called twice before the next render
            fireEvent.press(screen.getByTestId('ctx-setValuesRapidly'));

            // Then each call returns the previous value and the final context value is "99"
            expect(onPreviousValues).toHaveBeenCalledWith(['1', '7']);
            expect(screen.getByTestId('ctx-value')).toHaveTextContent('99');
        });

        it('does not overwrite a local edit when the parent rerenders with the same external value', () => {
            // Given a NumberForm controlled with value "10" and a local edit to "7"
            const {rerender} = renderNumberForm({value: '10'});

            fireEvent.press(screen.getByTestId('ctx-setValue'));

            // When the parent rerenders with the same external value "10"
            rerender(
                <NumberForm
                    value="10"
                    onInputChange={onInputChange}
                >
                    <ContextReadout />
                </NumberForm>,
            );

            // Then the local edit is preserved
            expect(screen.getByTestId('ctx-value')).toHaveTextContent('7');
        });
    });
});
