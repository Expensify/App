import {act, render} from '@testing-library/react-native';

import {KeyboardStateProvider} from '@components/withKeyboardState';

import useKeyboardShownRef from '@hooks/useKeyboardShownRef';
import useKeyboardState from '@hooks/useKeyboardState';

import type {RefObject} from 'react';
import type {KeyboardEventData} from 'react-native-keyboard-controller';

import React from 'react';

const mockKeyboardListeners: Record<string, Array<(e: KeyboardEventData) => void>> = {};

jest.mock('react-native-keyboard-controller', () => ({
    KeyboardEvents: {
        addListener: jest.fn((event: string, handler: (e: KeyboardEventData) => void) => {
            (mockKeyboardListeners[event] ??= []).push(handler);
            return {remove: jest.fn()};
        }),
    },
    useKeyboardHandler: jest.fn(),
}));

jest.mock('@hooks/useSafeAreaInsets', () => () => ({top: 0, bottom: 0, left: 0, right: 0}));

type KeyboardEventName = 'keyboardWillShow' | 'keyboardDidShow' | 'keyboardWillHide' | 'keyboardDidHide';

function emitKeyboardEvent(event: KeyboardEventName, height: number) {
    const eventData: KeyboardEventData = {height, duration: 250, timestamp: 0, target: -1, type: 'default', appearance: 'light'};
    act(() => {
        for (const handler of mockKeyboardListeners[event] ?? []) {
            handler(eventData);
        }
    });
}

function showKeyboard(height = 300) {
    emitKeyboardEvent('keyboardWillShow', height);
    emitKeyboardEvent('keyboardDidShow', height);
}

function hideKeyboard() {
    emitKeyboardEvent('keyboardWillHide', 0);
    emitKeyboardEvent('keyboardDidHide', 0);
}

const onRefReaderRender = jest.fn<void, [RefObject<boolean>]>();
const onStateReaderRender = jest.fn();

function RefReader() {
    onRefReaderRender(useKeyboardShownRef());
    return null;
}

/** The ref the reader got on its latest render */
function getKeyboardShownRef(): RefObject<boolean> | undefined {
    return onRefReaderRender.mock.calls.at(-1)?.[0];
}

function StateReader() {
    useKeyboardState();
    onStateReaderRender();
    return null;
}

function renderProvider() {
    render(
        <KeyboardStateProvider>
            <RefReader />
            <StateReader />
        </KeyboardStateProvider>,
    );
}

describe('KeyboardStateProvider keyboard shown ref', () => {
    beforeEach(() => {
        for (const key of Object.keys(mockKeyboardListeners)) {
            delete mockKeyboardListeners[key];
        }
        jest.clearAllMocks();
    });

    it('is true while the keyboard is shown and false once it hides', () => {
        // Given a component that reads the ref under the provider, before any keyboard event
        renderProvider();
        expect(getKeyboardShownRef()?.current).toBe(false);

        // When the keyboard opens
        showKeyboard();

        // Then the ref says the keyboard is shown, as isKeyboardShown does
        expect(getKeyboardShownRef()?.current).toBe(true);

        // When the keyboard closes
        hideKeyboard();

        // Then the ref says the keyboard is hidden again
        expect(getKeyboardShownRef()?.current).toBe(false);
    });

    it('stays false when the keyboard is shown with no height', () => {
        // Given a component that reads the ref under the provider
        renderProvider();

        // When a keyboard with no height is shown, e.g. a hardware keyboard, for which isKeyboardShown stays false too
        showKeyboard(0);

        // Then the ref still says the keyboard is hidden
        expect(getKeyboardShownRef()?.current).toBe(false);
    });

    it('does not re-render its readers on keyboard events', () => {
        // Given one component that reads the ref and one that reads the keyboard state
        renderProvider();
        const initialRef = getKeyboardShownRef();
        const initialRefReaderRenders = onRefReaderRender.mock.calls.length;
        const initialStateReaderRenders = onStateReaderRender.mock.calls.length;

        // When the keyboard opens and closes
        showKeyboard();
        hideKeyboard();

        // Then only the keyboard state reader re-renders, because the ref keeps its identity, which is the reason the ref exists
        expect(onStateReaderRender.mock.calls.length).toBeGreaterThan(initialStateReaderRenders);
        expect(onRefReaderRender).toHaveBeenCalledTimes(initialRefReaderRenders);
        expect(getKeyboardShownRef()).toBe(initialRef);
    });
});
