import {act, fireEvent, render, screen} from '@testing-library/react-native';

import NumberForm from '@components/NumberForm';
import {useNumberFormContext} from '@components/NumberForm/context';
import type {NumberFormProps} from '@components/NumberForm/types';

import type {NativeSyntheticEvent, TextInputFocusEventData} from 'react-native';

import React from 'react';
import {Pressable, Text, View} from 'react-native';

const mockBlurEvent = {nativeEvent: {text: ''}} as NativeSyntheticEvent<TextInputFocusEventData>;

function ContextReadout() {
    const {value, negativeMode, errorText, onInputChange, setValue, onBlur} = useNumberFormContext();

    return (
        <View>
            <Text testID="ctx-value">{value}</Text>
            <Text testID="ctx-negativeMode">{negativeMode}</Text>
            <Text testID="ctx-errorText">{errorText ?? ''}</Text>
            <Text testID="ctx-hasOnBlur">{String(!!onBlur)}</Text>
            <Pressable
                testID="ctx-onInputChange"
                onPress={() => onInputChange('7')}
            />
            <Pressable
                testID="ctx-setValue"
                onPress={() => setValue('42')}
            />
            <Pressable
                testID="ctx-setValueSilent"
                onPress={() => setValue('99', {notify: false})}
            />
            <Pressable
                testID="ctx-triggerBlur"
                onPress={() => onBlur?.(mockBlurEvent)}
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

            fireEvent.press(screen.getByTestId('ctx-triggerBlur'));

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
        it('updates context and notifies the parent when onInputChange is called from a child', () => {
            renderNumberForm();

            act(() => {
                fireEvent.press(screen.getByTestId('ctx-onInputChange'));
            });

            expect(screen.getByTestId('ctx-value')).toHaveTextContent('7');
            expect(onInputChange).toHaveBeenCalledTimes(1);
            expect(onInputChange).toHaveBeenCalledWith('7');
        });

        it('updates context and notifies the parent when setValue is called without options', () => {
            renderNumberForm();

            act(() => {
                fireEvent.press(screen.getByTestId('ctx-setValue'));
            });

            expect(screen.getByTestId('ctx-value')).toHaveTextContent('42');
            expect(onInputChange).toHaveBeenCalledTimes(1);
            expect(onInputChange).toHaveBeenCalledWith('42');
        });

        it('updates context without notifying the parent when setValue is called with notify: false', () => {
            renderNumberForm();

            act(() => {
                fireEvent.press(screen.getByTestId('ctx-setValueSilent'));
            });

            expect(screen.getByTestId('ctx-value')).toHaveTextContent('99');
            expect(onInputChange).not.toHaveBeenCalled();
        });
    });
});
