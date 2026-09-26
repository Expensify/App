import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import NumericInput from '@components/NumericInput';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

import type * as DeviceCapabilities from '@libs/DeviceCapabilities';

import type * as NativeNavigation from '@react-navigation/native';

import React from 'react';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@libs/DeviceCapabilities', () => ({
    ...jest.requireActual<typeof DeviceCapabilities>('@libs/DeviceCapabilities'),
    canUseTouchScreen: () => true,
}));

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof NativeNavigation>('@react-navigation/native'),
    useIsFocused: jest.fn(() => true),
    useNavigation: jest.fn(() => ({
        navigate: jest.fn(),
        addListener: jest.fn(() => jest.fn()),
    })),
}));

const INPUT_TEST_ID = 'numeric-text-input';

function renderWithProviders(children: React.ReactNode) {
    return render(<ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>{children}</ComposeProviders>);
}

type NumericInputProps = React.ComponentProps<typeof NumericInput>;
type NumericBigNumberPadProps = React.ComponentProps<typeof NumericInput.BigNumberPad>;

describe('NumericInput.BigNumberPad', () => {
    const onInputChange = jest.fn();

    const renderInputWithPad = (inputProps: Partial<NumericInputProps> = {}, padProps: Partial<NumericBigNumberPadProps> = {}, inputRef?: React.Ref<BaseTextInputRef>) =>
        renderWithProviders(
            <NumericInput
                onInputChange={onInputChange}
                decimals={2}
                {...inputProps}
            >
                <NumericInput.Container>
                    <NumericInput.MinusSign />
                    <NumericInput.TextInput
                        testID={INPUT_TEST_ID}
                        ref={inputRef}
                    />
                </NumericInput.Container>
                <NumericInput.BigNumberPad {...padProps} />
            </NumericInput>,
        );

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders the number pad buttons when touch screen is available', async () => {
        // Given a device with touch screen support and an input rendered with BigNumberPad
        renderInputWithPad();
        await waitForBatchedUpdatesWithAct();

        // When checking the rendered elements
        // Then all digit buttons, decimal separator, and backspace button are displayed on screen
        for (let i = 0; i <= 9; i++) {
            expect(screen.getByTestId(`button_${i}`)).toBeOnTheScreen();
        }
        expect(screen.getByTestId('button_.')).toBeOnTheScreen();
        expect(screen.getByTestId('button_<')).toBeOnTheScreen();
    });

    it('appends pressed digits to the input value', async () => {
        // Given an input with initial value '1'
        renderInputWithPad({value: '1'});
        await waitForBatchedUpdatesWithAct();

        // When the digit '2' is pressed on the number pad
        fireEvent.press(screen.getByTestId('button_2'));
        await waitForBatchedUpdatesWithAct();

        // Then '12' is reported and displayed
        expect(onInputChange).toHaveBeenLastCalledWith('12');
        expect(screen.getByTestId(INPUT_TEST_ID)).toHaveDisplayValue('12');
    });

    it('adds a leading zero when the decimal separator is pressed on an empty input', async () => {
        // Given an empty input accepting decimals
        renderInputWithPad({value: ''});
        await waitForBatchedUpdatesWithAct();

        // When the decimal separator '.' is pressed on the number pad
        fireEvent.press(screen.getByTestId('button_.'));
        await waitForBatchedUpdatesWithAct();

        // Then '0.' is reported and displayed with a leading zero
        expect(onInputChange).toHaveBeenLastCalledWith('0.');
        expect(screen.getByTestId(INPUT_TEST_ID)).toHaveDisplayValue('0.');
    });

    it('inserts a digit at the current caret position', async () => {
        // Given an input with value '1234' and the caret positioned after '12'
        renderInputWithPad({value: '1234'});
        await waitForBatchedUpdatesWithAct();

        const input = screen.getByTestId(INPUT_TEST_ID);
        fireEvent(input, 'selectionChange', {nativeEvent: {selection: {start: 2, end: 2}}});
        await waitForBatchedUpdatesWithAct();

        // When the digit '9' is pressed on the number pad
        fireEvent.press(screen.getByTestId('button_9'));
        await waitForBatchedUpdatesWithAct();

        // Then '9' is inserted at the caret position resulting in '12934'
        expect(screen.getByTestId(INPUT_TEST_ID)).toHaveDisplayValue('12934');
        expect(onInputChange).toHaveBeenLastCalledWith('12934');
    });

    it('inserts consecutive digits in a row mid-string', async () => {
        // Given an input with value '1234' and the caret positioned after '12'
        renderInputWithPad({value: '1234'});
        await waitForBatchedUpdatesWithAct();

        const input = screen.getByTestId(INPUT_TEST_ID);
        fireEvent(input, 'selectionChange', {nativeEvent: {selection: {start: 2, end: 2}}});
        await waitForBatchedUpdatesWithAct();

        // When digits '9' and '8' are pressed in a row on the number pad
        fireEvent.press(screen.getByTestId('button_9'));
        await waitForBatchedUpdatesWithAct();
        fireEvent.press(screen.getByTestId('button_8'));
        await waitForBatchedUpdatesWithAct();

        // Then both digits are inserted consecutively, resulting in '129834'
        expect(screen.getByTestId(INPUT_TEST_ID)).toHaveDisplayValue('129834');
        expect(onInputChange).toHaveBeenLastCalledWith('129834');
    });

    it('replaces the selected range when a digit is pressed', async () => {
        // Given an input with value '1234' with characters '23' selected
        renderInputWithPad({value: '1234'});
        await waitForBatchedUpdatesWithAct();

        const input = screen.getByTestId(INPUT_TEST_ID);
        fireEvent(input, 'selectionChange', {nativeEvent: {selection: {start: 1, end: 3}}});
        await waitForBatchedUpdatesWithAct();

        // When the digit '9' is pressed on the number pad
        fireEvent.press(screen.getByTestId('button_9'));
        await waitForBatchedUpdatesWithAct();

        // Then the selected range is replaced by '9' resulting in '194'
        expect(screen.getByTestId(INPUT_TEST_ID)).toHaveDisplayValue('194');
        expect(onInputChange).toHaveBeenLastCalledWith('194');
    });

    it('deletes the character before the caret when backspace is pressed', async () => {
        // Given an input with value '12' with the caret at the end
        renderInputWithPad({value: '12'});
        await waitForBatchedUpdatesWithAct();

        // When the backspace button is pressed on the number pad
        fireEvent.press(screen.getByTestId('button_<'));
        await waitForBatchedUpdatesWithAct();

        // Then the last character '2' is deleted, leaving '1'
        expect(onInputChange).toHaveBeenLastCalledWith('1');
        expect(screen.getByTestId(INPUT_TEST_ID)).toHaveDisplayValue('1');
    });

    it('deletes the selected range when backspace is pressed', async () => {
        // Given an input with value '1234' with characters '23' selected
        renderInputWithPad({value: '1234'});
        await waitForBatchedUpdatesWithAct();

        const input = screen.getByTestId(INPUT_TEST_ID);
        fireEvent(input, 'selectionChange', {nativeEvent: {selection: {start: 1, end: 3}}});
        await waitForBatchedUpdatesWithAct();

        // When the backspace button is pressed on the number pad
        fireEvent.press(screen.getByTestId('button_<'));
        await waitForBatchedUpdatesWithAct();

        // Then the selected range is deleted, leaving '14'
        expect(screen.getByTestId(INPUT_TEST_ID)).toHaveDisplayValue('14');
        expect(onInputChange).toHaveBeenLastCalledWith('14');
    });

    it('does nothing when backspace is pressed with caret at position 0 for a non-empty value', async () => {
        // Given an input with value '123' with the caret at the beginning (offset 0)
        renderInputWithPad({value: '123'});
        await waitForBatchedUpdatesWithAct();

        const input = screen.getByTestId(INPUT_TEST_ID);
        fireEvent(input, 'selectionChange', {nativeEvent: {selection: {start: 0, end: 0}}});
        await waitForBatchedUpdatesWithAct();

        // When the backspace button is pressed on the number pad
        fireEvent.press(screen.getByTestId('button_<'));
        await waitForBatchedUpdatesWithAct();

        // Then no change is reported and the value remains '123'
        expect(onInputChange).not.toHaveBeenCalled();
        expect(screen.getByTestId(INPUT_TEST_ID)).toHaveDisplayValue('123');
    });

    it('clears the minus sign when backspace is pressed on an empty negative input', async () => {
        // Given a negative input with an empty magnitude ('-')
        renderInputWithPad({value: '-', allowNegative: true});
        await waitForBatchedUpdatesWithAct();

        // When the backspace button is pressed on the number pad
        fireEvent.press(screen.getByTestId('button_<'));
        await waitForBatchedUpdatesWithAct();

        // Then the minus sign is cleared and an empty value is reported
        expect(screen.queryByText('-')).toBeNull();
        expect(onInputChange).toHaveBeenLastCalledWith('');
    });

    it('clears the minus sign when backspace is pressed at offset 0 on a negative value', async () => {
        // Given a negative input with value '-12' and the caret positioned at the beginning
        renderInputWithPad({value: '-12', allowNegative: true});
        await waitForBatchedUpdatesWithAct();

        const input = screen.getByTestId(INPUT_TEST_ID);
        fireEvent(input, 'selectionChange', {nativeEvent: {selection: {start: 0, end: 0}}});
        await waitForBatchedUpdatesWithAct();

        // When the backspace button is pressed on the number pad
        fireEvent.press(screen.getByTestId('button_<'));
        await waitForBatchedUpdatesWithAct();

        // Then the minus sign is cleared and '12' is reported and displayed
        expect(screen.queryByText('-')).toBeNull();
        expect(onInputChange).toHaveBeenLastCalledWith('12');
        expect(screen.getByTestId(INPUT_TEST_ID)).toHaveDisplayValue('12');
    });

    it('appends pressed digits to a negative input while preserving the sign', async () => {
        // Given a negative input with value '-1'
        renderInputWithPad({value: '-1', allowNegative: true});
        await waitForBatchedUpdatesWithAct();

        // When the digit '2' is pressed on the number pad
        fireEvent.press(screen.getByTestId('button_2'));
        await waitForBatchedUpdatesWithAct();

        // Then '-12' is reported with the negative sign preserved
        expect(onInputChange).toHaveBeenLastCalledWith('-12');
        expect(screen.getByTestId(INPUT_TEST_ID)).toHaveDisplayValue('12');
        expect(screen.getByText('-')).toBeOnTheScreen();
    });

    it('does nothing when backspace is pressed on an empty positive input', async () => {
        // Given an empty positive input
        renderInputWithPad({value: ''});
        await waitForBatchedUpdatesWithAct();

        // When the backspace button is pressed on the number pad
        fireEvent.press(screen.getByTestId('button_<'));
        await waitForBatchedUpdatesWithAct();

        // Then no change is reported and the input remains empty
        expect(onInputChange).not.toHaveBeenCalled();
        expect(screen.getByTestId(INPUT_TEST_ID)).toHaveDisplayValue('');
    });

    it('rejects input that violates validation', async () => {
        // Given an input that does not accept decimals (decimals: 0) and displays '1'
        renderInputWithPad({value: '1', decimals: 0});
        await waitForBatchedUpdatesWithAct();

        // When the decimal separator '.' is pressed on the number pad
        fireEvent.press(screen.getByTestId('button_.'));
        await waitForBatchedUpdatesWithAct();

        // Then the decimal point is rejected and the value remains '1'
        expect(onInputChange).not.toHaveBeenCalled();
        expect(screen.getByTestId(INPUT_TEST_ID)).toHaveDisplayValue('1');
    });

    it('calls custom numberPressed callback when a key is pressed', async () => {
        // Given an input with a custom numberPressed callback
        const customNumberPressed = jest.fn();
        renderInputWithPad({value: '1'}, {numberPressed: customNumberPressed});
        await waitForBatchedUpdatesWithAct();

        // When the digit '5' is pressed on the number pad
        fireEvent.press(screen.getByTestId('button_5'));
        await waitForBatchedUpdatesWithAct();

        // Then the custom callback is invoked with the pressed key
        expect(customNumberPressed).toHaveBeenCalledWith('5');
    });

    it('calls custom longPressHandlerStateChanged callback on long press and release', async () => {
        // Given an input with a custom longPressHandlerStateChanged callback
        const customLongPress = jest.fn();
        renderInputWithPad({value: '12'}, {longPressHandlerStateChanged: customLongPress});
        await waitForBatchedUpdatesWithAct();

        const backspaceButton = screen.getByTestId('button_<');

        // When the user starts long-pressing the backspace button
        fireEvent(backspaceButton, 'longPress');
        await waitForBatchedUpdatesWithAct();

        // Then the callback is called with true indicating long-press started
        expect(customLongPress).toHaveBeenCalledWith(true);

        // When the user releases the backspace button
        fireEvent(backspaceButton, 'pressOut');
        await waitForBatchedUpdatesWithAct();

        // Then the callback is called with false indicating long-press ended
        expect(customLongPress).toHaveBeenCalledWith(false);
    });

    it('focuses the input when a keypad number is pressed', async () => {
        // Given an input rendered with BigNumberPad and a ref tracking focus
        const inputRef = React.createRef<BaseTextInputRef>();
        renderInputWithPad({value: '1'}, {}, inputRef);
        await waitForBatchedUpdatesWithAct();

        const inputElement = inputRef.current;
        if (!inputElement) {
            throw new Error('Numeric input ref was not assigned');
        }
        const focusSpy = jest.spyOn(inputElement, 'focus');

        // When a number button is pressed on the number pad
        fireEvent.press(screen.getByTestId('button_2'));
        await waitForBatchedUpdatesWithAct();

        // Then the input is focused
        expect(focusSpy).toHaveBeenCalledTimes(1);
        focusSpy.mockRestore();
    });

    it('deletes several characters continuously when backspace is held down', async () => {
        jest.useFakeTimers();
        try {
            // Given an input with value '12345' and a ref tracking focus
            const inputRef = React.createRef<BaseTextInputRef>();
            renderInputWithPad({value: '12345'}, {}, inputRef);
            await waitForBatchedUpdatesWithAct();

            const inputElement = inputRef.current;
            if (!inputElement) {
                throw new Error('Numeric input ref was not assigned');
            }
            const focusSpy = jest.spyOn(inputElement, 'focus');

            const backspaceButton = screen.getByTestId('button_<');

            // When the user starts long-pressing the backspace button
            fireEvent(backspaceButton, 'longPress');
            await waitForBatchedUpdatesWithAct();

            // And timers advance for several deletion ticks
            act(() => {
                jest.advanceTimersByTime(300);
            });
            await waitForBatchedUpdatesWithAct();

            // Then characters are deleted continuously, leaving '12'
            expect(screen.getByTestId(INPUT_TEST_ID)).toHaveDisplayValue('12');
            expect(onInputChange).toHaveBeenLastCalledWith('12');

            // When the user releases the backspace button
            focusSpy.mockClear();
            fireEvent(backspaceButton, 'pressOut');
            await waitForBatchedUpdatesWithAct();

            // And timers advance further
            act(() => {
                jest.advanceTimersByTime(300);
            });
            await waitForBatchedUpdatesWithAct();

            // Then deletion stops and the input is refocused
            expect(screen.getByTestId(INPUT_TEST_ID)).toHaveDisplayValue('12');
            expect(focusSpy).toHaveBeenCalledTimes(1);
            focusSpy.mockRestore();
        } finally {
            jest.useRealTimers();
        }
    });

    it('focuses the input and collapses the selection when its own empty area is clicked on web', async () => {
        // Given an input with a selection and rendered BigNumberPad with a testID
        const inputRef = React.createRef<BaseTextInputRef>();
        renderInputWithPad({value: '1234'}, {testID: 'pad-container'}, inputRef);
        await waitForBatchedUpdatesWithAct();

        const input = screen.getByTestId(INPUT_TEST_ID);
        fireEvent(input, 'selectionChange', {nativeEvent: {selection: {start: 0, end: 2}}});
        await waitForBatchedUpdatesWithAct();

        const inputElement = inputRef.current;
        if (!inputElement) {
            throw new Error('Numeric input ref was not assigned');
        }
        const focusSpy = jest.spyOn(inputElement, 'focus');

        const padContainer = screen.getByTestId('pad-container');
        if (typeof padContainer.props.id !== 'string') {
            throw new Error('BigNumberPad container id was not assigned');
        }
        const containerId = padContainer.props.id;

        // When clicking directly on the pad container's empty area
        const target = document.createElement('div');
        target.id = containerId;
        const preventDefault = jest.fn();
        fireEvent(padContainer, 'mouseDown', {nativeEvent: {target}, preventDefault});
        await waitForBatchedUpdatesWithAct();

        // Then the event is prevented, the selection collapses, and the input is focused
        expect(preventDefault).toHaveBeenCalledTimes(1);
        expect(input.props.selection).toEqual({start: 2, end: 2});
        expect(focusSpy).toHaveBeenCalledTimes(1);
        focusSpy.mockRestore();
    });

    it('focuses the input and collapses the selection when the number pad gap area is clicked on web', async () => {
        // Given an input with a selection and rendered BigNumberPad with a testID
        const inputRef = React.createRef<BaseTextInputRef>();
        renderInputWithPad({value: '1234'}, {testID: 'pad-container'}, inputRef);
        await waitForBatchedUpdatesWithAct();

        const input = screen.getByTestId(INPUT_TEST_ID);
        fireEvent(input, 'selectionChange', {nativeEvent: {selection: {start: 0, end: 2}}});
        await waitForBatchedUpdatesWithAct();

        const inputElement = inputRef.current;
        if (!inputElement) {
            throw new Error('Numeric input ref was not assigned');
        }
        const focusSpy = jest.spyOn(inputElement, 'focus');

        const padContainer = screen.getByTestId('pad-container');
        const children: unknown = padContainer.props.children;
        if (!React.isValidElement<{id?: unknown}>(children) || typeof children.props.id !== 'string') {
            throw new Error('BigNumberPad id was not assigned');
        }
        const numPadViewId = children.props.id;

        // When clicking directly on the number pad gap area
        const target = document.createElement('div');
        target.id = numPadViewId;
        const preventDefault = jest.fn();
        fireEvent(padContainer, 'mouseDown', {nativeEvent: {target}, preventDefault});
        await waitForBatchedUpdatesWithAct();

        // Then the event is prevented, the selection collapses, and the input is focused
        expect(preventDefault).toHaveBeenCalledTimes(1);
        expect(input.props.selection).toEqual({start: 2, end: 2});
        expect(focusSpy).toHaveBeenCalledTimes(1);
        focusSpy.mockRestore();
    });

    it('ignores mousedown events bubbling from keypad buttons to preserve selection on web', async () => {
        // Given an input with a selection and rendered BigNumberPad with a testID
        renderInputWithPad({value: '1234'}, {testID: 'pad-container'});
        await waitForBatchedUpdatesWithAct();

        const input = screen.getByTestId(INPUT_TEST_ID);
        fireEvent(input, 'selectionChange', {nativeEvent: {selection: {start: 0, end: 2}}});
        await waitForBatchedUpdatesWithAct();

        const padContainer = screen.getByTestId('pad-container');

        // When a mousedown event bubbles up from a keypad button or nested element
        const target = document.createElement('div');
        target.id = 'button_1';
        const preventDefault = jest.fn();
        fireEvent(padContainer, 'mouseDown', {nativeEvent: {target}, preventDefault});
        await waitForBatchedUpdatesWithAct();

        // Then preventDefault is not called and the selection remains unchanged
        expect(preventDefault).not.toHaveBeenCalled();
        expect(input.props.selection).toEqual({start: 0, end: 2});
    });
});
