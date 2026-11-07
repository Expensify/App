import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ValidateCodeInput from '@components/ValidateCodeInput';

import CONST from '@src/CONST';

import type {ForwardedRef} from 'react';
import type ReactNative from 'react-native';
import type {TextInputProps} from 'react-native';

import React, {useState} from 'react';

const INPUT_TEST_ID = 'validateCodeInput';

let mockIsInputFocused = false;

jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string, params?: {digitIndex?: number; totalDigits?: number}) =>
            key === 'common.enterDigitLabel' ? `enter digit ${params?.digitIndex} of ${params?.totalDigits}` : key,
    })),
);

const mockAnnounce = jest.fn<void, [string | undefined, boolean]>();

jest.mock('@hooks/useAccessibilityAnnouncement', () => ({
    __esModule: true,
    default: (message: string | undefined, shouldAnnounceMessage: boolean) => mockAnnounce(message, shouldAnnounceMessage),
}));

// The hidden input only needs to report focus the way the paste and Tab listeners read it.
jest.mock('@components/TextInput', () => {
    const ReactMock = jest.requireActual<typeof React>('react');
    const {TextInput} = jest.requireActual<typeof ReactNative>('react-native');

    return ({ref, ...props}: TextInputProps & {ref?: ForwardedRef<unknown>}) => {
        ReactMock.useImperativeHandle(ref, () => ({
            focus: () => {
                mockIsInputFocused = true;
            },
            blur: () => {
                mockIsInputFocused = false;
            },
            isFocused: () => mockIsInputFocused,
        }));
        return ReactMock.createElement(TextInput, props);
    };
});

function ValidateCodeInputHarness({initialValue = ''}: {initialValue?: string}) {
    const [value, setValue] = useState(initialValue);

    return (
        <ValidateCodeInput
            value={value}
            onChangeText={setValue}
            autoComplete="one-time-code"
            shouldSubmitOnComplete={false}
            testID={INPUT_TEST_ID}
        />
    );
}

function currentAnnouncement() {
    return mockAnnounce.mock.lastCall?.[0];
}

function pressKey(key: string) {
    fireEvent(screen.getByTestId(INPUT_TEST_ID), 'keyPress', {nativeEvent: {key}});
}

function moveToSlot(slotIndex: number) {
    for (let i = 0; i < slotIndex; i++) {
        pressKey('ArrowRight');
    }
}

// fireEvent only calls the React props, so the window capture listener needs a real DOM event. Dispatching it on body
// sends it through window and then document in the capture phase, the same path a real key press takes.
function createTabEvent(shiftKey = false) {
    return new KeyboardEvent('keydown', {key: 'Tab', shiftKey, bubbles: true, cancelable: true});
}

function dispatchTab(shiftKey = false) {
    const event = createTabEvent(shiftKey);
    act(() => {
        document.body.dispatchEvent(event);
    });
    return event;
}

describe('ValidateCodeInput', () => {
    // Stands in for focus-trap, which listens for keydown on document in the capture phase.
    const focusTrapKeyDown = jest.fn();

    beforeEach(() => {
        mockIsInputFocused = true;
        mockAnnounce.mockClear();
        focusTrapKeyDown.mockClear();
        document.addEventListener('keydown', focusTrapKeyDown, true);
    });

    afterEach(() => {
        document.removeEventListener('keydown', focusTrapKeyDown, true);
    });

    it('moves Shift+Tab from a middle slot to the previous slot before focus-trap sees it', () => {
        // Given the focused input on slot 3, which focus-trap treats as its first tabbable node
        render(<ValidateCodeInputHarness />);
        moveToSlot(2);
        expect(currentAnnouncement()).toBe('enter digit 3 of 6');

        // When the user presses Shift+Tab
        const event = dispatchTab(true);

        // Then focus moves to slot 2 inside the input, and focus-trap never gets the chance to wrap focus to the footer
        expect(currentAnnouncement()).toBe('enter digit 2 of 6');
        expect(event.defaultPrevented).toBe(true);
        expect(focusTrapKeyDown).not.toHaveBeenCalled();
        expect(mockIsInputFocused).toBe(true);
    });

    it('moves Tab from a middle slot to the next slot', () => {
        // Given the focused input on slot 3
        render(<ValidateCodeInputHarness />);
        moveToSlot(2);

        // When the user presses Tab
        const event = dispatchTab();

        // Then focus moves to slot 4 and the browser does not move focus out of the input
        expect(currentAnnouncement()).toBe('enter digit 4 of 6');
        expect(event.defaultPrevented).toBe(true);
        expect(focusTrapKeyDown).not.toHaveBeenCalled();
    });

    it('lets Shift+Tab from the first slot leave the input', () => {
        // Given the focused input on slot 1, where there is no previous slot
        render(<ValidateCodeInputHarness />);
        expect(currentAnnouncement()).toBe('enter digit 1 of 6');

        // When the user presses Shift+Tab
        const event = dispatchTab(true);

        // Then the event is left alone so focus can move to the previous element on the page
        expect(event.defaultPrevented).toBe(false);
        expect(focusTrapKeyDown).toHaveBeenCalledTimes(1);
        expect(currentAnnouncement()).toBe('enter digit 1 of 6');
    });

    it('lets Tab from the last slot leave the input', () => {
        // Given the focused input on the last slot, where there is no next slot
        render(<ValidateCodeInputHarness />);
        moveToSlot(CONST.VALIDATE_CODE_LENGTH - 1);
        expect(currentAnnouncement()).toBe('enter digit 6 of 6');

        // When the user presses Tab
        const event = dispatchTab();

        // Then the event is left alone so focus can move to the next element on the page
        expect(event.defaultPrevented).toBe(false);
        expect(focusTrapKeyDown).toHaveBeenCalledTimes(1);
    });

    it('ignores Tab while the input is not focused', () => {
        // Given a component whose hidden input does not have focus
        render(<ValidateCodeInputHarness />);
        moveToSlot(2);
        mockIsInputFocused = false;

        // When the user presses Tab somewhere else on the page
        const event = dispatchTab();

        // Then the component leaves the event and its slot alone
        expect(event.defaultPrevented).toBe(false);
        expect(currentAnnouncement()).toBe('enter digit 3 of 6');
    });

    it('applies each Tab once when several arrive before a re-render', () => {
        // Given the focused input on slot 1
        render(<ValidateCodeInputHarness />);

        // When two Tab events are delivered before React re-renders, as with key repeat
        act(() => {
            document.body.dispatchEvent(createTabEvent());
            document.body.dispatchEvent(createTabEvent());
        });

        // Then focus advances two slots instead of applying the same move twice
        expect(currentAnnouncement()).toBe('enter digit 3 of 6');
    });

    it('keeps arrow keys, Backspace, and digits working', () => {
        // Given the focused input on slot 1 with an existing digit in slot 2
        render(<ValidateCodeInputHarness initialValue="12" />);
        expect(screen.getByText('2', {includeHiddenElements: true})).toBeOnTheScreen();

        // When the user moves with the arrow keys
        pressKey('ArrowRight');
        pressKey('ArrowRight');
        pressKey('ArrowLeft');

        // Then focus follows the arrows
        expect(currentAnnouncement()).toBe('enter digit 2 of 6');

        // When the user deletes the digit in slot 2
        pressKey('Backspace');

        // Then the digit is cleared and focus stays on slot 2
        expect(screen.queryByText('2', {includeHiddenElements: true})).toBeNull();
        expect(currentAnnouncement()).toBe('enter digit 2 of 6');

        // When the user types a digit
        fireEvent.changeText(screen.getByTestId(INPUT_TEST_ID), '7');

        // Then the digit fills slot 2 and focus moves to slot 3
        expect(screen.getByText('7', {includeHiddenElements: true})).toBeOnTheScreen();
        expect(currentAnnouncement()).toBe('enter digit 3 of 6');
    });
});
