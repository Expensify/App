import {act, renderHook} from '@testing-library/react-native';

import {
    getIsWindowSizeChanging,
    subscribeToWindowSizeChange,
    WINDOW_SIZE_CHANGE_DURATION_MS,
} from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigatorComponent/ScreenActivityWrapper/windowSizeChangeStore';

import type {ScaledSize} from 'react-native';

import {useSyncExternalStore} from 'react';
import {Dimensions} from 'react-native';

// The react-native manual mock (__mocks__/react-native.ts) replaces Dimensions with an inert addEventListener,
// so the tests capture the handler the store registers there and fire the change events through it directly.
// eslint-disable-next-line @typescript-eslint/unbound-method
const mockedAddEventListener = jest.mocked(Dimensions.addEventListener);

const initialWindow = Dimensions.get('window');
let unsubscribe: (() => void) | undefined;

function makeScaledSize(width: number, height: number): ScaledSize {
    return {width, height, scale: 1, fontScale: 1};
}

function emitDimensionsChange(width: number, height: number = initialWindow.height) {
    const handler = mockedAddEventListener.mock.calls.at(-1)?.[1];
    if (!handler) {
        throw new Error('The store did not register a Dimensions listener');
    }
    handler({window: makeScaledSize(width, height), screen: makeScaledSize(width, height)});
}

// The react-native mock hands out a fresh `{remove}` subscription per call, so a test can tell which of them
// the store detached.
function getSubscriptionRemove(callIndex: number) {
    const result = mockedAddEventListener.mock.results.at(callIndex);
    if (result?.type !== 'return') {
        throw new Error('Dimensions.addEventListener did not return a subscription');
    }
    // eslint-disable-next-line @typescript-eslint/unbound-method
    return jest.mocked(result.value.remove);
}

beforeEach(() => {
    jest.useFakeTimers();
    mockedAddEventListener.mockClear();
});

afterEach(() => {
    unsubscribe?.();
    unsubscribe = undefined;
    jest.useRealTimers();
});

describe('windowSizeChangeStore', () => {
    it('flips on when the window width changes and notifies the subscriber', () => {
        // Given a subscriber attached to the store
        const listener = jest.fn();
        unsubscribe = subscribeToWindowSizeChange(listener);

        // When the window width changes
        emitDimensionsChange(initialWindow.width + 100);

        // Then the store reports a change in progress and tells the subscriber about it
        expect(getIsWindowSizeChanging()).toBe(true);
        expect(listener).toHaveBeenCalledTimes(1);
    });

    it('ignores a height-only change', () => {
        // Given a subscriber attached to the store
        const listener = jest.fn();
        unsubscribe = subscribeToWindowSizeChange(listener);

        // When only the window height changes, which the on-screen keyboard does on its own
        emitDimensionsChange(initialWindow.width, initialWindow.height - 300);

        // Then nothing is reported, because only a width change can move screens between the narrow and the wide layout
        expect(getIsWindowSizeChanging()).toBe(false);
        expect(listener).not.toHaveBeenCalled();
    });

    it('flips back off once the change settles', () => {
        // Given a subscriber attached to the store, and a width change in progress
        const listener = jest.fn();
        unsubscribe = subscribeToWindowSizeChange(listener);
        emitDimensionsChange(initialWindow.width + 100);

        // When the settle window elapses without another change
        jest.advanceTimersByTime(WINDOW_SIZE_CHANGE_DURATION_MS);

        // Then the change is over and the subscriber heard both of its edges
        expect(getIsWindowSizeChanging()).toBe(false);
        expect(listener).toHaveBeenCalledTimes(2);
    });

    it('extends the settle window while width changes keep coming, without extra notifications', () => {
        // Given a subscriber attached to the store
        const listener = jest.fn();
        unsubscribe = subscribeToWindowSizeChange(listener);

        // When another width change arrives before the settle window elapsed, as it does while a window is dragged
        emitDimensionsChange(initialWindow.width + 100);
        jest.advanceTimersByTime(WINDOW_SIZE_CHANGE_DURATION_MS - 50);
        emitDimensionsChange(initialWindow.width + 200);
        jest.advanceTimersByTime(WINDOW_SIZE_CHANGE_DURATION_MS - 1);

        // Then the change is still reported, and the subscriber was told only about its start
        expect(getIsWindowSizeChanging()).toBe(true);
        expect(listener).toHaveBeenCalledTimes(1);

        // When the settle window of the last change elapses
        jest.advanceTimersByTime(1);

        // Then the change is over
        expect(getIsWindowSizeChanging()).toBe(false);
    });

    it('keeps the shared state for the remaining subscriber when another one leaves mid-change', () => {
        // Given two subscribers attached to the store
        const remaining = jest.fn();
        unsubscribe = subscribeToWindowSizeChange(remaining);
        const unsubscribeOther = subscribeToWindowSizeChange(jest.fn());

        // When one of them leaves while a width change is running
        emitDimensionsChange(initialWindow.width + 100);
        unsubscribeOther();

        // Then the shared state and the single Dimensions listener survive
        expect(getIsWindowSizeChanging()).toBe(true);
        expect(mockedAddEventListener).toHaveBeenCalledTimes(1);
        expect(getSubscriptionRemove(0)).not.toHaveBeenCalled();

        // When the change settles
        jest.advanceTimersByTime(WINDOW_SIZE_CHANGE_DURATION_MS);

        // Then the remaining subscriber is still told about the end of it
        expect(getIsWindowSizeChanging()).toBe(false);
        expect(remaining).toHaveBeenCalledTimes(2);
    });

    it('detaches its listener and resets once the last subscriber left, then registers a fresh one', () => {
        // Given a single subscriber and a width change in progress
        const listener = jest.fn();
        unsubscribe = subscribeToWindowSizeChange(listener);
        emitDimensionsChange(initialWindow.width + 100);
        expect(getIsWindowSizeChanging()).toBe(true);

        // When the last subscriber leaves
        unsubscribe();

        // Then the store drops its Dimensions listener and forgets the running change, so nothing stale leaks into the next subscription
        expect(getSubscriptionRemove(0)).toHaveBeenCalledTimes(1);
        expect(getIsWindowSizeChanging()).toBe(false);

        // When a subscriber attaches again
        unsubscribe = subscribeToWindowSizeChange(listener);

        // Then the store registers a fresh listener
        expect(mockedAddEventListener).toHaveBeenCalledTimes(2);
        expect(getIsWindowSizeChanging()).toBe(false);
    });
});

// The store is mocked in every consumer test, so this is the one place that verifies its contract with
// useSyncExternalStore, which is how ScreenActivityWrapper reads it.
describe('windowSizeChangeStore through useSyncExternalStore', () => {
    it('follows the store through a width change and its settling', () => {
        // Given a subscribed reader mounted while no change is running
        const {result, unmount} = renderHook(() => useSyncExternalStore(subscribeToWindowSizeChange, getIsWindowSizeChanging, getIsWindowSizeChanging));
        expect(result.current).toBe(false);

        // When the window width changes
        act(() => {
            emitDimensionsChange(initialWindow.width + 100);
        });

        // Then the reader sees the change
        expect(result.current).toBe(true);

        // When the change settles
        act(() => {
            jest.advanceTimersByTime(WINDOW_SIZE_CHANGE_DURATION_MS);
        });

        // Then the reader sees no change any more
        expect(result.current).toBe(false);

        unmount();
    });
});
