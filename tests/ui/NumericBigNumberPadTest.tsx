import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import NumericInput from '@components/NumericInput';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

import type * as DeviceCapabilities from '@libs/DeviceCapabilities';

import type * as NativeNavigation from '@react-navigation/native';

import React from 'react';

import findAncestorWithStyle from '../utils/findAncestorWithStyle';
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
const ROOT_TEST_ID = 'layout';
const PAD_TEST_ID = 'layout-pad';

function renderWithProviders(children: React.ReactNode) {
    return render(<ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>{children}</ComposeProviders>);
}

type NumericInputProps = React.ComponentProps<typeof NumericInput>;

describe('NumericInput number pad', () => {
    const onInputChange = jest.fn();

    // The root renders the number pad itself on touch screens
    const renderInputWithPad = (inputProps: Partial<NumericInputProps> = {}, inputRef?: React.Ref<BaseTextInputRef>) =>
        renderWithProviders(
            <NumericInput
                onInputChange={onInputChange}
                decimals={2}
                testID={ROOT_TEST_ID}
                {...inputProps}
            >
                <NumericInput.TextInput
                    testID={INPUT_TEST_ID}
                    ref={inputRef}
                />
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

        // Then '9' is inserted at the caret position resulting in '12934', with the caret right after it
        expect(screen.getByTestId(INPUT_TEST_ID)).toHaveDisplayValue('12934');
        expect(screen.getByTestId(INPUT_TEST_ID).props.selection).toEqual({start: 3, end: 3});
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

        // Then the selected range is deleted, leaving '14' with the caret where the range started
        expect(screen.getByTestId(INPUT_TEST_ID)).toHaveDisplayValue('14');
        expect(screen.getByTestId(INPUT_TEST_ID).props.selection).toEqual({start: 1, end: 1});
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

        // Then no change is reported and the input remains empty with the caret at the start
        expect(onInputChange).not.toHaveBeenCalled();
        expect(screen.getByTestId(INPUT_TEST_ID)).toHaveDisplayValue('');
        expect(screen.getByTestId(INPUT_TEST_ID).props.selection).toEqual({start: 0, end: 0});
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

    it('does not buffer rejected inputs and correctly deletes the last character on backspace', async () => {
        // Given an input with maxLength 4 and decimals 0
        renderInputWithPad({value: '', maxLength: 4, decimals: 0});
        await waitForBatchedUpdatesWithAct();

        // When filling the input up to maxLength with digits 1, 2, 3, 4
        fireEvent.press(screen.getByTestId('button_1'));
        await waitForBatchedUpdatesWithAct();
        fireEvent.press(screen.getByTestId('button_2'));
        await waitForBatchedUpdatesWithAct();
        fireEvent.press(screen.getByTestId('button_3'));
        await waitForBatchedUpdatesWithAct();
        fireEvent.press(screen.getByTestId('button_4'));
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByTestId(INPUT_TEST_ID)).toHaveDisplayValue('1234');

        // And pressing extra digits beyond maxLength (5, 6, 7, 8, 9)
        fireEvent.press(screen.getByTestId('button_5'));
        await waitForBatchedUpdatesWithAct();
        fireEvent.press(screen.getByTestId('button_6'));
        await waitForBatchedUpdatesWithAct();
        fireEvent.press(screen.getByTestId('button_7'));
        await waitForBatchedUpdatesWithAct();
        fireEvent.press(screen.getByTestId('button_8'));
        await waitForBatchedUpdatesWithAct();
        fireEvent.press(screen.getByTestId('button_9'));
        await waitForBatchedUpdatesWithAct();

        // Then the display value remains '1234'
        expect(screen.getByTestId(INPUT_TEST_ID)).toHaveDisplayValue('1234');

        // When backspace is pressed once on the number pad
        fireEvent.press(screen.getByTestId('button_<'));
        await waitForBatchedUpdatesWithAct();

        // Then the last valid character '4' is deleted immediately, leaving '123'
        expect(screen.getByTestId(INPUT_TEST_ID)).toHaveDisplayValue('123');
        expect(onInputChange).toHaveBeenLastCalledWith('123');
    });

    it('adds the leading zero inside the magnitude when the decimal separator is pressed on an empty negative input', async () => {
        // Given a negative input whose magnitude is still empty ('-')
        renderInputWithPad({value: '-', allowNegative: true});
        await waitForBatchedUpdatesWithAct();

        // When the decimal separator '.' is pressed on the number pad
        fireEvent.press(screen.getByTestId('button_.'));
        await waitForBatchedUpdatesWithAct();

        // Then the zero goes after the sign, because the pad edits only the magnitude
        expect(onInputChange).toHaveBeenLastCalledWith('-0.');
        expect(screen.getByText('-')).toBeOnTheScreen();
        expect(screen.getByTestId(INPUT_TEST_ID)).toHaveDisplayValue('0.');
    });

    it('rejects a digit that would exceed maxLength', async () => {
        // Given an input limited to two integer digits and displaying '12'
        renderInputWithPad({value: '12', maxLength: 2});
        await waitForBatchedUpdatesWithAct();

        // When the digit '3' is pressed on the number pad
        fireEvent.press(screen.getByTestId('button_3'));
        await waitForBatchedUpdatesWithAct();

        // Then the press is rejected like typing, and the value remains '12'
        expect(onInputChange).not.toHaveBeenCalled();
        expect(screen.getByTestId(INPUT_TEST_ID)).toHaveDisplayValue('12');
    });

    it('keeps the caret position for a forward-delete keypress followed by a pad deletion', async () => {
        // Given an input with value '1234' and the caret positioned after '12'
        renderInputWithPad({value: '1234'});
        await waitForBatchedUpdatesWithAct();

        const input = screen.getByTestId(INPUT_TEST_ID);
        fireEvent(input, 'selectionChange', {nativeEvent: {selection: {start: 2, end: 2}}});
        await waitForBatchedUpdatesWithAct();

        // When the character after the caret is forward-deleted with the keyboard
        fireEvent(input, 'keyPress', {nativeEvent: {key: 'Delete', ctrlKey: false}});
        fireEvent.changeText(input, '124');
        await waitForBatchedUpdatesWithAct();

        // And the backspace button is pressed on the number pad
        fireEvent.press(screen.getByTestId('button_<'));
        await waitForBatchedUpdatesWithAct();

        // Then the forward delete left the caret in place, so the pad deletes the character before it, leaving '14'
        expect(input).toHaveDisplayValue('14');
        expect(input.props.selection).toEqual({start: 1, end: 1});
        expect(onInputChange).toHaveBeenLastCalledWith('14');
    });

    it('ignores selection changes while backspace is long pressed', async () => {
        // Given an input with value '1234' and the caret positioned after '12'
        renderInputWithPad({value: '1234'});
        await waitForBatchedUpdatesWithAct();

        const input = screen.getByTestId(INPUT_TEST_ID);
        fireEvent(input, 'selectionChange', {nativeEvent: {selection: {start: 2, end: 2}}});
        await waitForBatchedUpdatesWithAct();
        expect(input.props.selection).toEqual({start: 2, end: 2});

        // Fake timers keep the repeating deletion from firing, so only the selection guard is exercised
        jest.useFakeTimers({doNotFake: ['nextTick']});
        try {
            const backspaceButton = screen.getByTestId('button_<');

            // When the backspace button is long pressed and native reports a selection change
            fireEvent(backspaceButton, 'longPress');
            fireEvent(input, 'selectionChange', {nativeEvent: {selection: {start: 0, end: 0}}});

            // Then the selection is unchanged, because the held key keeps deleting from the caret it started at
            expect(input.props.selection).toEqual({start: 2, end: 2});
            expect(input).toHaveDisplayValue('1234');

            fireEvent(backspaceButton, 'pressOut');
        } finally {
            jest.runOnlyPendingTimers();
            jest.useRealTimers();
        }
    });

    it('focuses the input when a keypad number is pressed', async () => {
        // Given an input rendered with BigNumberPad and a ref tracking focus
        const inputRef = React.createRef<BaseTextInputRef>();
        renderInputWithPad({value: '1'}, inputRef);
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
            renderInputWithPad({value: '12345'}, inputRef);
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

    it('keeps the first caret move after a backspace long press', async () => {
        // Given '123' with the caret at the end
        renderInputWithPad({value: '123'});
        await waitForBatchedUpdatesWithAct();
        const input = screen.getByTestId(INPUT_TEST_ID);
        const backspace = screen.getByTestId('button_<');
        fireEvent(input, 'selectionChange', {nativeEvent: {selection: {start: 3, end: 3}}});
        await waitForBatchedUpdatesWithAct();

        // When backspace repeats once, its native caret echo arrives while held, and the key is released
        jest.useFakeTimers({doNotFake: ['nextTick']});
        try {
            fireEvent(backspace, 'longPress');
            act(() => {
                jest.advanceTimersByTime(100);
            });
            fireEvent(input, 'selectionChange', {nativeEvent: {selection: {start: 2, end: 2}}});
            fireEvent(backspace, 'pressOut');
        } finally {
            jest.useRealTimers();
        }
        await waitForBatchedUpdatesWithAct();

        // And the user moves the caret to the start and types 9
        fireEvent(input, 'selectionChange', {nativeEvent: {selection: {start: 0, end: 0}}});
        await waitForBatchedUpdatesWithAct();
        fireEvent.press(screen.getByTestId('button_9'));
        await waitForBatchedUpdatesWithAct();

        // Then 9 lands at the start, because the caret move is not swallowed as a stale echo
        expect(input).toHaveDisplayValue('912');
    });

    it('deletes all characters when backspace is held down until empty', async () => {
        // Given an input with value '123'
        jest.useFakeTimers();
        try {
            renderInputWithPad({value: '123'});
            await waitForBatchedUpdatesWithAct();

            const backspaceButton = screen.getByTestId('button_<');

            // When backspace is long-pressed until the interval runs long enough to delete all characters
            fireEvent(backspaceButton, 'longPress');
            await waitForBatchedUpdatesWithAct();

            act(() => {
                jest.advanceTimersByTime(500);
            });
            await waitForBatchedUpdatesWithAct();

            // Then all characters are deleted and onInputChange is called with an empty string
            expect(screen.getByTestId(INPUT_TEST_ID)).toHaveDisplayValue('');
            expect(onInputChange).toHaveBeenLastCalledWith('');

            fireEvent(backspaceButton, 'pressOut');
        } finally {
            jest.useRealTimers();
        }
    });

    it('deletes continuously when parent controls value', async () => {
        // Given a parent controlling the value with '12345'
        jest.useFakeTimers();
        try {
            function Controlled() {
                const [val, setVal] = React.useState('12345');
                return (
                    <NumericInput
                        value={val}
                        onInputChange={setVal}
                        decimals={4}
                        maxLength={4}
                    >
                        <NumericInput.TextInput testID={INPUT_TEST_ID} />
                    </NumericInput>
                );
            }
            renderWithProviders(<Controlled />);
            await waitForBatchedUpdatesWithAct();

            const backspaceButton = screen.getByTestId('button_<');

            // When backspace is long-pressed for 300ms
            fireEvent(backspaceButton, 'longPress');
            await waitForBatchedUpdatesWithAct();

            act(() => {
                jest.advanceTimersByTime(300);
            });
            await waitForBatchedUpdatesWithAct();

            // Then the value is repeatedly deleted down to '12'
            expect(screen.getByTestId(INPUT_TEST_ID)).toHaveDisplayValue('12');

            fireEvent(backspaceButton, 'pressOut');
        } finally {
            jest.useRealTimers();
        }
    });

    it('focuses the input and collapses the selection when the number pad gap area is clicked on web', async () => {
        // Given an input with a selection, above the number pad
        const inputRef = React.createRef<BaseTextInputRef>();
        renderInputWithPad({value: '1234'}, inputRef);
        await waitForBatchedUpdatesWithAct();

        const input = screen.getByTestId(INPUT_TEST_ID);
        fireEvent(input, 'selectionChange', {nativeEvent: {selection: {start: 0, end: 2}}});
        await waitForBatchedUpdatesWithAct();

        const inputElement = inputRef.current;
        if (!inputElement) {
            throw new Error('Numeric input ref was not assigned');
        }
        const focusSpy = jest.spyOn(inputElement, 'focus');

        // When clicking the empty area between the keys, which bubbles up to the layout root
        const preventDefault = jest.fn();
        fireEvent(screen.getByTestId(PAD_TEST_ID), 'mouseDown', {nativeEvent: {target: document.createElement('div')}, preventDefault, isDefaultPrevented: () => false});
        await waitForBatchedUpdatesWithAct();

        // Then the event is prevented, the selection collapses, and the input is focused
        expect(preventDefault).toHaveBeenCalledTimes(1);
        expect(input.props.selection).toEqual({start: 2, end: 2});
        expect(focusSpy).toHaveBeenCalledTimes(1);
        focusSpy.mockRestore();
    });

    it('ignores mousedown events from keypad buttons to preserve selection on web', async () => {
        // Given an input with a selection, above the number pad
        renderInputWithPad({value: '1234'});
        await waitForBatchedUpdatesWithAct();

        const input = screen.getByTestId(INPUT_TEST_ID);
        fireEvent(input, 'selectionChange', {nativeEvent: {selection: {start: 0, end: 2}}});
        await waitForBatchedUpdatesWithAct();

        // When a mousedown event bubbles up from a keypad button, which handles the press itself
        const target = document.createElement('div');
        target.setAttribute('role', 'button');
        const preventDefault = jest.fn();
        fireEvent(screen.getByTestId(PAD_TEST_ID), 'mouseDown', {nativeEvent: {target}, preventDefault, isDefaultPrevented: () => false});
        await waitForBatchedUpdatesWithAct();

        // Then preventDefault is not called and the selection remains unchanged
        expect(preventDefault).not.toHaveBeenCalled();
        expect(input.props.selection).toEqual({start: 0, end: 2});
    });

    it('fills the width of its column', async () => {
        // Given the number pad rendered in the layout's pad column, which centers its content
        renderInputWithPad();
        await waitForBatchedUpdatesWithAct();

        // When looking for the closest full-width view around a key
        const fullWidthView = findAncestorWithStyle(screen.getByTestId('button_1'), 'width', '100%');

        // Then the pad itself spans the column, because a centered pad would shrink to its content and stack the key columns onto each other
        expect(fullWidthView).toBeDefined();
        expect(fullWidthView).not.toBe(screen.getByTestId(PAD_TEST_ID));
        expect(screen.getByTestId(PAD_TEST_ID)).toContainElement(fullWidthView ?? null);
    });
});
