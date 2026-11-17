import {act, renderHook} from '@testing-library/react-native';

import useScrollOnKeyboardReopenDefault from '@hooks/useScrollOnKeyboardReopen/index';
import useScrollOnKeyboardReopen from '@hooks/useScrollOnKeyboardReopen/index.android';

import type {AppStateStatus} from 'react-native';
import type {KeyboardEventData} from 'react-native-keyboard-controller';

import {AppState} from 'react-native';

const mockKeyboardListeners: Record<string, Set<(event: KeyboardEventData) => void>> = {};
let mockIsScreenFocused = true;
const mockRemove = jest.fn();
const appStateListeners = new Set<(state: AppStateStatus) => void>();
const mockAppStateRemove = jest.fn();

jest.mock('@react-navigation/native', () => ({useIsFocused: () => mockIsScreenFocused}));
jest.mock('react-native-keyboard-controller', () => ({
    KeyboardEvents: {
        addListener: jest.fn((event: string, listener: (data: KeyboardEventData) => void) => {
            (mockKeyboardListeners[event] ??= new Set()).add(listener);
            return {
                remove: () => {
                    mockKeyboardListeners[event].delete(listener);
                    mockRemove();
                },
            };
        }),
    },
}));

function emitKeyboardEvent(event: 'keyboardDidShow' | 'keyboardDidHide', height: number, duration = 250) {
    const data: KeyboardEventData = {height, duration, timestamp: 0, target: -1, type: 'default', appearance: 'light'};
    act(() => {
        for (const listener of mockKeyboardListeners[event] ?? []) {
            listener(data);
        }
    });
}

function setAppState(state: AppStateStatus) {
    (AppState as {currentState: AppStateStatus}).currentState = state;
    act(() => {
        for (const listener of appStateListeners) {
            listener(state);
        }
    });
}

type Step = 'hide' | 'instantHide' | 'partialHide' | 'show' | 'zeroShow' | 'blur' | 'focus' | 'background' | 'foreground';

describe('useScrollOnKeyboardReopen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockIsScreenFocused = true;
        for (const key of Object.keys(mockKeyboardListeners)) {
            delete mockKeyboardListeners[key];
        }
        appStateListeners.clear();
        setAppState('active');
        jest.spyOn(AppState, 'addEventListener').mockImplementation((_event, listener) => {
            appStateListeners.add(listener);
            return {
                remove: () => {
                    appStateListeners.delete(listener);
                    mockAppStateRemove();
                },
            };
        });
    });

    it.each<[string, Step[], number]>([
        ['does not add a scroll on first focus', ['focus', 'show'], 0],
        ['scrolls when the keyboard reopens with focus retained', ['show', 'hide', 'show'], 1],
        ['consumes the flag before a repeated show', ['hide', 'show', 'show'], 1],
        ['supports repeated dismiss and reopen cycles', ['hide', 'show', 'hide', 'show'], 2],
        ['ignores a cancelled partial dismissal', ['partialHide', 'show'], 0],
        ['clears the flag on actual blur', ['hide', 'blur', 'show'], 0],
        ['leaves fresh focus scrolling to the focus handler', ['hide', 'blur', 'focus', 'show'], 0],
        ['does not arm for an unfocused input', ['blur', 'hide', 'show'], 0],
        ['does not scroll for a zero-height show', ['hide', 'zeroShow'], 0],
        ['preserves a pending reopen until a positive-height show', ['hide', 'zeroShow', 'show'], 1],
        ['clears the flag when the app enters the background', ['hide', 'background', 'foreground', 'show'], 0],
        ['does not scroll while the app is backgrounded', ['hide', 'background', 'hide', 'show'], 0],
        ['ignores a foreground resynchronization hide', ['background', 'foreground', 'hide', 'show'], 0],
        ['does not consume background suppression on a partial hide', ['background', 'foreground', 'partialHide', 'hide', 'show'], 0],
        ['supports reopening after returning from the background', ['background', 'foreground', 'show', 'hide', 'show'], 1],
        ['restores scrolling after rotation without blurring', ['instantHide', 'show'], 1],
    ])('%s', (_name, steps, expectedScrolls) => {
        // Given an input whose native focus is preserved unless an actual blur event occurs
        let isInputFocused = true;
        const ref = {current: {isFocused: () => isInputFocused, blur: jest.fn(), focus: jest.fn()}};
        const scrollToInput = jest.fn();
        const {result} = renderHook(() => useScrollOnKeyboardReopen(ref, scrollToInput, true));

        // When keyboard, focus and app events arrive in the specified order
        for (const step of steps) {
            if (step === 'focus' || step === 'blur') {
                isInputFocused = step === 'focus';
                act(() => result.current());
            } else if (step === 'background' || step === 'foreground') {
                setAppState(step === 'background' ? 'background' : 'active');
            } else {
                let height = 0;
                if (step === 'show') {
                    height = 300;
                } else if (step === 'partialHide') {
                    height = 100;
                }
                const isHide = step === 'hide' || step === 'instantHide' || step === 'partialHide';
                emitKeyboardEvent(isHide ? 'keyboardDidHide' : 'keyboardDidShow', height, step === 'instantHide' ? 0 : 250);
            }
        }

        // Then only retained-focus reopenings request an extra scroll, without issuing native focus commands
        expect(scrollToInput).toHaveBeenCalledTimes(expectedScrolls);
        expect(ref.current.blur).not.toHaveBeenCalled();
        expect(ref.current.focus).not.toHaveBeenCalled();
    });

    it.each(['form', 'route'] as const)('clears a pending scroll when the %s becomes inactive', (target) => {
        // Given a dismissed keyboard with input focus retained
        const ref = {current: {isFocused: () => true}};
        const scrollToInput = jest.fn();
        const {rerender} = renderHook(({isActive}) => useScrollOnKeyboardReopen(ref, scrollToInput, isActive), {initialProps: {isActive: true}});
        emitKeyboardEvent('keyboardDidHide', 0);

        // When this form loses activity or route focus, keyboard events must be ignored even if the native input still reports focus
        mockIsScreenFocused = target !== 'route';
        rerender({isActive: target !== 'form'});
        emitKeyboardEvent('keyboardDidHide', 0);
        emitKeyboardEvent('keyboardDidShow', 300);
        mockIsScreenFocused = true;
        rerender({isActive: true});
        emitKeyboardEvent('keyboardDidShow', 300);

        // Then the old dismissal cannot trigger a scroll on the newly active screen
        expect(scrollToInput).not.toHaveBeenCalled();
    });

    it('keeps a pending reopen and uses the latest callback across a rerender', () => {
        // Given a dismissed keyboard while the input retains focus
        const ref = {current: {isFocused: () => true}};
        const previousScrollToInput = jest.fn();
        const nextScrollToInput = jest.fn();
        const {rerender} = renderHook(({scroll}) => useScrollOnKeyboardReopen(ref, scroll, true), {initialProps: {scroll: previousScrollToInput}});
        emitKeyboardEvent('keyboardDidHide', 0);

        // When the parent provides a new callback before the keyboard reopens
        rerender({scroll: nextScrollToInput});
        emitKeyboardEvent('keyboardDidShow', 300);

        // Then the pending scroll runs exactly once with the current form callback
        expect(previousScrollToInput).not.toHaveBeenCalled();
        expect(nextScrollToInput).toHaveBeenCalledTimes(1);
    });

    it('does not scroll after the input ref is cleared', () => {
        // Given a dismissed keyboard with a focused input
        const ref: {current: {isFocused: () => boolean} | null} = {current: {isFocused: () => true}};
        const scrollToInput = jest.fn();
        renderHook(() => useScrollOnKeyboardReopen(ref, scrollToInput, true));
        emitKeyboardEvent('keyboardDidHide', 0);

        // When the input disappears before the keyboard show notification
        ref.current = null;
        emitKeyboardEvent('keyboardDidShow', 300);

        // Then no scroll targets the removed input
        expect(scrollToInput).not.toHaveBeenCalled();
    });

    it('removes listeners and discards a pending scroll on unmount', () => {
        // Given a mounted hook with a pending reopen
        const scrollToInput = jest.fn();
        const {unmount} = renderHook(() => useScrollOnKeyboardReopen({current: {isFocused: () => true}}, scrollToInput, true));
        emitKeyboardEvent('keyboardDidHide', 0);

        // When the form unmounts before the keyboard reopens
        unmount();
        emitKeyboardEvent('keyboardDidShow', 300);

        // Then every subscription is removed and no stale scroll runs
        expect(mockRemove).toHaveBeenCalledTimes(2);
        expect(mockAppStateRemove).toHaveBeenCalledTimes(1);
        expect(scrollToInput).not.toHaveBeenCalled();
    });

    it('leaves other platforms unchanged', () => {
        // Given the default platform implementation
        const scrollToInput = jest.fn();
        const {result} = renderHook(() => useScrollOnKeyboardReopenDefault({current: {isFocused: () => true}}, scrollToInput, true));

        // When input focus and keyboard events occur
        act(() => result.current());
        emitKeyboardEvent('keyboardDidHide', 0);
        emitKeyboardEvent('keyboardDidShow', 300);

        // Then no keyboard listener or additional scroll is introduced
        expect(mockKeyboardListeners).toEqual({});
        expect(scrollToInput).not.toHaveBeenCalled();
    });
});
