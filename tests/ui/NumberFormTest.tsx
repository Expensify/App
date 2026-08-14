import {fireEvent, render, screen} from '@testing-library/react-native';

import NumberForm, {useNumberFormContext} from '@components/NumberForm';
import type {NumberFormProps} from '@components/NumberForm';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import Text from '@components/Text';
import TextInput from '@components/TextInput';

import React from 'react';
import {View} from 'react-native';

function ContextReadout() {
    const {value, negativeMode, errorText, setValue, onBlur} = useNumberFormContext();

    return (
        <View>
            <Text testID="ctx-value">{value}</Text>
            <Text testID="ctx-negativeMode">{negativeMode}</Text>
            <Text testID="ctx-errorText">{errorText ?? ''}</Text>
            <Text testID="ctx-hasOnBlur">{String(!!onBlur)}</Text>
            <PressableWithFeedback
                accessibilityLabel="Set value"
                accessibilityRole="button"
                testID="ctx-setValue"
                onPress={() => setValue('7')}
            />
            <PressableWithFeedback
                accessibilityLabel="Set value silently"
                accessibilityRole="button"
                testID="ctx-setValueSilent"
                onPress={() => setValue('99', {notify: false})}
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
            renderNumberForm({}, <Text testID="child">hello</Text>);

            expect(screen.getByTestId('child')).toBeOnTheScreen();
        });
    });

    describe('NumberFormContext', () => {
        it('provides default state: empty value and inValue negative mode', () => {
            renderNumberForm();

            expect(screen.getByTestId('ctx-value')).toHaveTextContent('');
            expect(screen.getByTestId('ctx-negativeMode')).toHaveTextContent('inValue');
            expect(screen.getByTestId('ctx-errorText')).toHaveTextContent('');
            expect(screen.getByTestId('ctx-hasOnBlur')).toHaveTextContent('false');
        });

        it('propagates value, negativeMode, and errorText from props', () => {
            renderNumberForm({
                value: '12.50',
                negativeMode: 'external',
                errorText: 'Required',
            });

            expect(screen.getByTestId('ctx-value')).toHaveTextContent('12.50');
            expect(screen.getByTestId('ctx-negativeMode')).toHaveTextContent('external');
            expect(screen.getByTestId('ctx-errorText')).toHaveTextContent('Required');
        });

        it('propagates onBlur to children via context', () => {
            renderNumberForm({onBlur});

            expect(screen.getByTestId('ctx-hasOnBlur')).toHaveTextContent('true');

            fireEvent(screen.getByTestId('ctx-triggerBlur'), 'blur');

            expect(onBlur).toHaveBeenCalledTimes(1);
        });

        it('syncs context value when the controlled value prop changes', () => {
            const {rerender} = renderNumberForm({value: '10'});

            expect(screen.getByTestId('ctx-value')).toHaveTextContent('10');

            rerender(
                <NumberForm
                    value="20"
                    onInputChange={onInputChange}
                >
                    <ContextReadout />
                </NumberForm>,
            );

            expect(screen.getByTestId('ctx-value')).toHaveTextContent('20');
        });
    });

    describe('value updates', () => {
        it('updates context and notifies the parent when setValue is called', () => {
            renderNumberForm();

            fireEvent.press(screen.getByTestId('ctx-setValue'));

            expect(screen.getByTestId('ctx-value')).toHaveTextContent('7');
            expect(onInputChange).toHaveBeenCalledTimes(1);
            expect(onInputChange).toHaveBeenCalledWith('7');
        });

        it('updates context without notifying the parent when setValue is called with notify: false', () => {
            renderNumberForm();

            fireEvent.press(screen.getByTestId('ctx-setValueSilent'));

            expect(screen.getByTestId('ctx-value')).toHaveTextContent('99');
            expect(onInputChange).not.toHaveBeenCalled();
        });
    });
});
