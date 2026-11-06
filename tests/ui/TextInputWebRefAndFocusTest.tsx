/** Exercises the web wrapper with DOM-backed input refs while keeping its effects and focus timers real. */
import {act, cleanup, render} from '@testing-library/react-native';

import type * as WebTextInput from '@components/TextInput';
import type {BaseTextInputProps, BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

import {isMobileChrome} from '@libs/Browser';
import type * as WebDomUtils from '@libs/DomUtils';
import Visibility from '@libs/Visibility';

import CONST from '@src/CONST';

import React, {createRef} from 'react';
import {StyleSheet} from 'react-native';

import createMock from '../utils/createMock';

const {default: TextInput, getIsRestoringKeyboardFocus} = jest.requireActual<typeof WebTextInput>('../../src/components/TextInput/index.tsx');

const mockCaptureInputProps = jest.fn<void, [BaseTextInputProps]>();
let mockInput: HTMLInputElement | HTMLTextAreaElement;
let mockInputRef: BaseTextInputRef;
let mockVisibilityChange: (() => void) | undefined;
const mockRemoveVisibilityListener = jest.fn<void, []>();

jest.mock('@libs/DomUtils', () => jest.requireActual<typeof WebDomUtils>('../../src/libs/DomUtils/index.ts'));
jest.mock('@libs/Browser', () => ({isMobileChrome: jest.fn(() => true)}));
jest.mock('@libs/Visibility', () => ({
    __esModule: true,
    default: {
        isVisible: jest.fn(() => true),
        onVisibilityChange: jest.fn((listener: () => void) => {
            mockVisibilityChange = listener;
            return mockRemoveVisibilityListener;
        }),
    },
}));
jest.mock('@hooks/useThemeStyles', () => () => ({
    baseTextInput: {color: 'red'},
    textInputDesktop: {color: 'blue'},
    textInputMultiline: {color: 'green'},
    cursorText: {cursor: 'text'},
}));
jest.mock('@components/TextInput/BaseTextInput', () => {
    const ReactMock = jest.requireActual<typeof React>('react');
    function MockBaseTextInput(props: BaseTextInputProps) {
        const {ref: inputRef} = props;
        ReactMock.useLayoutEffect(() => {
            mockCaptureInputProps(props);
        });
        ReactMock.useLayoutEffect(() => {
            if (typeof inputRef === 'function') {
                inputRef(mockInputRef);
                return () => inputRef(null);
            }
            return undefined;
        }, [inputRef]);
        return null;
    }
    return {__esModule: true, default: MockBaseTextInput};
});

function getWebInputProps() {
    const props = mockCaptureInputProps.mock.calls.at(-1)?.[0];
    expect(props).toBeDefined();
    if (!props) {
        throw new Error('The web wrapper did not render BaseTextInput');
    }
    return props;
}

function notifyVisibility() {
    expect(mockVisibilityChange).toBeDefined();
    act(() => mockVisibilityChange?.());
}

describe('web TextInput refs and focus', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        jest.clearAllMocks();
        jest.mocked(isMobileChrome).mockReturnValue(true);
        jest.mocked(Visibility.isVisible).mockReturnValue(true);
        mockInput = document.createElement('input');
        // The test-only partial ref keeps the real DOM node identity without fabricating an animated native instance.
        const inputMethods: Pick<BaseTextInputRef, 'focus' | 'blur' | 'setAttribute'> = mockInput;
        mockInputRef = createMock<BaseTextInputRef>(inputMethods);
        document.body.appendChild(mockInput);
    });
    afterEach(() => {
        cleanup();
        mockInput.remove();
        jest.clearAllTimers();
    });

    it.each([false, true])('forwards the exact DOM node and null detach for multiline: %s', (multiline) => {
        // Given either web input variant and a callback ref
        if (multiline) {
            mockInput.remove();
            mockInput = document.createElement('textarea');
            const inputMethods: Pick<BaseTextInputRef, 'focus' | 'blur' | 'setAttribute'> = mockInput;
            mockInputRef = createMock<BaseTextInputRef>(inputMethods);
            document.body.appendChild(mockInput);
        }
        const ref = jest.fn<void, [BaseTextInputRef | null]>();
        // When the wrapper mounts with keyboard and name attributes
        const {unmount} = render(
            <TextInput
                accessibilityRole="text"
                ref={ref}
                multiline={multiline}
                disableKeyboard
                name="code"
            />,
        );
        // Then attributes and ref identity refer to that same node, including detach
        expect(ref).toHaveBeenLastCalledWith(mockInput);
        expect(mockInput.getAttribute('inputmode')).toBe('none');
        expect(mockInput.getAttribute('name')).toBe('code');
        unmount();
        expect(ref).toHaveBeenLastCalledWith(null);
    });

    it('keeps object ref identity and caller style precedence', () => {
        // Given a labeled multiline input with caller overrides
        const ref = createRef<BaseTextInputRef>();
        // When the wrapper assembles the styles
        const {unmount} = render(
            <TextInput
                accessibilityRole="text"
                ref={ref}
                label="Description"
                multiline
                inputStyle={{color: 'purple'}}
                textInputContainerStyles={{cursor: 'pointer'}}
            />,
        );
        const props = getWebInputProps();
        // Then the exact three CSS properties precede caller styles and the final cursor style
        expect(ref.current).toBe(mockInput);
        expect(props.textInputContainerStyles).toEqual([
            Object.fromEntries([
                ['--active-label-translate-y', '7px'],
                ['--active-label-scale', '0.8668'],
                ['--label-transition-duration', '80ms'],
            ]),
            {cursor: 'pointer'},
            {cursor: 'text'},
        ]);
        expect(StyleSheet.flatten(props.inputStyle)).toEqual({color: 'purple'});
        unmount();
        expect(ref.current).toBeNull();
    });

    it('restores the active input after the delay and resets the shared flag', () => {
        // Given the active field when mobile Chrome returns to the foreground
        render(<TextInput accessibilityRole="text" />);
        mockInput.focus();
        // When visibility changes, duplicate notifications must not restart restoration
        notifyVisibility();
        expect(document.activeElement).toBe(document.body);
        expect(getIsRestoringKeyboardFocus()).toBe(true);
        act(() => window.dispatchEvent(new Event('focus')));
        act(() => jest.advanceTimersByTime(CONST.ANIMATED_TRANSITION - 1));
        expect(document.activeElement).toBe(document.body);
        act(() => jest.advanceTimersByTime(1));
        // Then focus returns only at the prescribed delay and the flag survives until its own delay
        expect(document.activeElement).toBe(mockInput);
        expect(getIsRestoringKeyboardFocus()).toBe(true);
        act(() => jest.advanceTimersByTime(CONST.KEYBOARD_RESTORATION_FLAG_RESET_DELAY));
        expect(getIsRestoringKeyboardFocus()).toBe(false);
    });

    it('does not steal focus when another field becomes active during restoration', () => {
        // Given a restoration started for the original active input
        render(<TextInput accessibilityRole="text" />);
        mockInput.focus();
        notifyVisibility();
        const otherInput = document.createElement('input');
        document.body.appendChild(otherInput);
        otherInput.focus();
        // When the restore delay expires after focus moved elsewhere
        act(() => jest.advanceTimersByTime(CONST.ANIMATED_TRANSITION));
        // Then the other field remains active and the cancellation resets the flag
        expect(document.activeElement).toBe(otherInput);
        expect(getIsRestoringKeyboardFocus()).toBe(false);
        otherInput.remove();
    });

    it.each(['inactive', 'hidden', 'other-browser'])('does not begin restoration for %s', (condition) => {
        // Given one of the preconditions for restoration is absent
        jest.mocked(isMobileChrome).mockReturnValue(condition !== 'other-browser');
        jest.mocked(Visibility.isVisible).mockReturnValue(condition !== 'hidden');
        render(<TextInput accessibilityRole="text" />);
        if (condition !== 'inactive') {
            mockInput.focus();
        }
        const activeElement = document.activeElement;
        // When visibility is announced
        notifyVisibility();
        // Then no blur or restoration timer begins
        expect(document.activeElement).toBe(activeElement);
        expect(getIsRestoringKeyboardFocus()).toBe(false);
    });

    it.each([false, true])('clears pending timers and both listeners on detach after refocus: %s', (afterRefocus) => {
        // Given a pending focus or flag-reset timer
        const {unmount} = render(<TextInput accessibilityRole="text" />);
        mockInput.focus();
        act(() => window.dispatchEvent(new Event('focus')));
        if (afterRefocus) {
            act(() => jest.advanceTimersByTime(CONST.ANIMATED_TRANSITION));
        }
        // When the wrapper unmounts
        unmount();
        // Then neither timeout can outlive the field and the visibility subscription is removed
        expect(jest.getTimerCount()).toBe(0);
        expect(mockRemoveVisibilityListener).toHaveBeenCalledTimes(1);
        expect(getIsRestoringKeyboardFocus()).toBe(false);
        act(() => window.dispatchEvent(new Event('focus')));
        expect(jest.getTimerCount()).toBe(0);
    });
});
