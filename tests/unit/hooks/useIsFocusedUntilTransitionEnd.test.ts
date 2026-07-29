import {act, renderHook} from '@testing-library/react-native';

import useIsFocusedUntilTransitionEnd from '@hooks/useIsFocusedUntilTransitionEnd';

import CONST from '@src/CONST';

import {useIsFocused, useNavigation} from '@react-navigation/native';

jest.mock('@react-navigation/native', () => ({
    useIsFocused: jest.fn(),
    useNavigation: jest.fn(),
}));

const mockedUseIsFocused = jest.mocked(useIsFocused);
const mockedUseNavigation = jest.mocked(useNavigation);

// Captures the callbacks registered for the `transitionEnd` event so tests can fire it on demand.
let transitionEndListeners: Array<() => void> = [];
const unsubscribe = jest.fn();
const addListener = jest.fn((event: string, callback: () => void) => {
    if (event === 'transitionEnd') {
        transitionEndListeners.push(callback);
    }
    return unsubscribe;
});

/** Simulate the navigation `transitionEnd` event firing for every active listener. */
function fireTransitionEnd() {
    act(() => {
        for (const callback of transitionEndListeners) {
            callback();
        }
    });
}

describe('useIsFocusedUntilTransitionEnd', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        jest.clearAllMocks();
        transitionEndListeners = [];
        mockedUseNavigation.mockReturnValue({addListener});
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
    });

    it('returns true while the screen is focused', () => {
        mockedUseIsFocused.mockReturnValue(true);

        const {result} = renderHook(() => useIsFocusedUntilTransitionEnd());

        expect(result.current).toBe(true);
    });

    it('does not subscribe to transitionEnd while focused', () => {
        mockedUseIsFocused.mockReturnValue(true);

        renderHook(() => useIsFocusedUntilTransitionEnd());

        expect(addListener).not.toHaveBeenCalled();
    });

    it('stays true after losing focus until the transition ends', () => {
        mockedUseIsFocused.mockReturnValue(true);
        const {result, rerender} = renderHook(() => useIsFocusedUntilTransitionEnd());
        expect(result.current).toBe(true);

        // Screen starts navigating away (loses focus) but the closing transition is still in progress.
        mockedUseIsFocused.mockReturnValue(false);
        rerender({});

        expect(addListener).toHaveBeenCalledWith('transitionEnd', expect.any(Function));
        expect(result.current).toBe(true);
    });

    it('turns false once the transition has ended while unfocused', () => {
        mockedUseIsFocused.mockReturnValue(true);
        const {result, rerender} = renderHook(() => useIsFocusedUntilTransitionEnd());

        mockedUseIsFocused.mockReturnValue(false);
        rerender({});
        expect(result.current).toBe(true);

        fireTransitionEnd();

        expect(result.current).toBe(false);
    });

    it('returns true when mounted unfocused before any transition ends', () => {
        mockedUseIsFocused.mockReturnValue(false);

        const {result} = renderHook(() => useIsFocusedUntilTransitionEnd());

        expect(result.current).toBe(true);
        expect(addListener).toHaveBeenCalledWith('transitionEnd', expect.any(Function));
    });

    it('resets to true when the screen is refocused after having transitioned out', () => {
        mockedUseIsFocused.mockReturnValue(true);
        const {result, rerender} = renderHook(() => useIsFocusedUntilTransitionEnd());

        // Blur, finish the transition -> false.
        mockedUseIsFocused.mockReturnValue(false);
        rerender({});
        fireTransitionEnd();
        expect(result.current).toBe(false);

        // Refocus -> the flag must turn back on.
        mockedUseIsFocused.mockReturnValue(true);
        rerender({});

        expect(result.current).toBe(true);
    });

    it('unsubscribes from transitionEnd when the screen regains focus', () => {
        mockedUseIsFocused.mockReturnValue(false);
        const {rerender} = renderHook(() => useIsFocusedUntilTransitionEnd());
        expect(addListener).toHaveBeenCalledTimes(1);

        mockedUseIsFocused.mockReturnValue(true);
        rerender({});

        expect(unsubscribe).toHaveBeenCalledTimes(1);
    });

    it('unsubscribes from transitionEnd on unmount', () => {
        mockedUseIsFocused.mockReturnValue(false);
        const {unmount} = renderHook(() => useIsFocusedUntilTransitionEnd());
        expect(addListener).toHaveBeenCalledTimes(1);

        unmount();

        expect(unsubscribe).toHaveBeenCalledTimes(1);
    });

    // Regression for #91846: iOS sometimes never emits `transitionEnd`. Without a timeout fallback the flag
    // would stay true forever and the heavy SearchAutocompleteList would never unmount behind the chat.
    it('turns false via the timeout fallback when transitionEnd is never emitted', () => {
        mockedUseIsFocused.mockReturnValue(true);
        const {result, rerender} = renderHook(() => useIsFocusedUntilTransitionEnd());

        mockedUseIsFocused.mockReturnValue(false);
        rerender({});
        expect(result.current).toBe(true);

        // transitionEnd is dropped — only the safety timeout elapses.
        act(() => {
            jest.advanceTimersByTime(CONST.SCREEN_TRANSITION_END_TIMEOUT);
        });

        expect(result.current).toBe(false);
    });

    it('clears the timeout fallback when transitionEnd arrives first', () => {
        mockedUseIsFocused.mockReturnValue(true);
        const {result, rerender} = renderHook(() => useIsFocusedUntilTransitionEnd());

        mockedUseIsFocused.mockReturnValue(false);
        rerender({});

        // Real event fires before the timeout.
        fireTransitionEnd();
        expect(result.current).toBe(false);

        // Advancing past the timeout must not throw or re-fire stale state.
        act(() => {
            jest.advanceTimersByTime(CONST.SCREEN_TRANSITION_END_TIMEOUT);
        });
        expect(result.current).toBe(false);
    });

    it('does not fire the timeout fallback after the screen is refocused', () => {
        mockedUseIsFocused.mockReturnValue(true);
        const {result, rerender} = renderHook(() => useIsFocusedUntilTransitionEnd());

        // Blur, then refocus before the timeout elapses.
        mockedUseIsFocused.mockReturnValue(false);
        rerender({});
        mockedUseIsFocused.mockReturnValue(true);
        rerender({});

        act(() => {
            jest.advanceTimersByTime(CONST.SCREEN_TRANSITION_END_TIMEOUT);
        });

        // The stale timeout must not flip the refocused screen to false.
        expect(result.current).toBe(true);
    });

    it('handles repeated focus/blur cycles, resetting on each refocus', () => {
        mockedUseIsFocused.mockReturnValue(true);
        const {result, rerender} = renderHook(() => useIsFocusedUntilTransitionEnd());

        // First cycle: blur + transition end -> false.
        mockedUseIsFocused.mockReturnValue(false);
        rerender({});
        fireTransitionEnd();
        expect(result.current).toBe(false);

        // Refocus -> true.
        mockedUseIsFocused.mockReturnValue(true);
        rerender({});
        expect(result.current).toBe(true);

        // Second cycle: blur again -> true until the new transition ends.
        transitionEndListeners = [];
        mockedUseIsFocused.mockReturnValue(false);
        rerender({});
        expect(result.current).toBe(true);

        fireTransitionEnd();
        expect(result.current).toBe(false);
    });
});
