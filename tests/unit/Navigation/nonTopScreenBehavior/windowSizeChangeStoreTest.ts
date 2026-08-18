import {act, renderHook} from '@testing-library/react-native';

import useIsWindowSizeChanging from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigatorComponent/ScreenActivityWrapper/useIsWindowSizeChanging';
import {
    getSnapshot,
    subscribe,
    WINDOW_SIZE_CHANGE_DURATION_MS,
} from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigatorComponent/ScreenActivityWrapper/windowSizeChangeStore';

import type {ScaledSize} from 'react-native';

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

// The react-native mock hands out a fresh `{remove}` subscription per call, which is what proves the store
// detaches its listener instead of leaking one per stack.
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
        const listener = jest.fn();
        unsubscribe = subscribe(listener);

        emitDimensionsChange(initialWindow.width + 100);

        expect(getSnapshot()).toBe(true);
        expect(listener).toHaveBeenCalledTimes(1);
    });

    it('ignores a height-only change', () => {
        const listener = jest.fn();
        unsubscribe = subscribe(listener);

        emitDimensionsChange(initialWindow.width, initialWindow.height - 300);

        expect(getSnapshot()).toBe(false);
        expect(listener).not.toHaveBeenCalled();
    });

    it('flips back off once the change settles', () => {
        const listener = jest.fn();
        unsubscribe = subscribe(listener);

        emitDimensionsChange(initialWindow.width + 100);
        jest.advanceTimersByTime(WINDOW_SIZE_CHANGE_DURATION_MS);

        expect(getSnapshot()).toBe(false);
        expect(listener).toHaveBeenCalledTimes(2);
    });

    it('extends the settle window while width changes keep coming, without extra notifications', () => {
        const listener = jest.fn();
        unsubscribe = subscribe(listener);

        emitDimensionsChange(initialWindow.width + 100);
        jest.advanceTimersByTime(WINDOW_SIZE_CHANGE_DURATION_MS - 50);
        emitDimensionsChange(initialWindow.width + 200);
        jest.advanceTimersByTime(WINDOW_SIZE_CHANGE_DURATION_MS - 1);

        expect(getSnapshot()).toBe(true);
        expect(listener).toHaveBeenCalledTimes(1);

        jest.advanceTimersByTime(1);

        expect(getSnapshot()).toBe(false);
    });

    it('keeps the shared state for the remaining subscriber when another one leaves mid-change', () => {
        const remaining = jest.fn();
        unsubscribe = subscribe(remaining);
        const unsubscribeOther = subscribe(jest.fn());

        emitDimensionsChange(initialWindow.width + 100);
        unsubscribeOther();

        expect(getSnapshot()).toBe(true);
        expect(mockedAddEventListener).toHaveBeenCalledTimes(1);
        expect(getSubscriptionRemove(0)).not.toHaveBeenCalled();

        jest.advanceTimersByTime(WINDOW_SIZE_CHANGE_DURATION_MS);

        expect(getSnapshot()).toBe(false);
        expect(remaining).toHaveBeenCalledTimes(2);
    });

    it('detaches its listener and resets once the last subscriber left, then registers a fresh one', () => {
        const listener = jest.fn();
        unsubscribe = subscribe(listener);
        emitDimensionsChange(initialWindow.width + 100);
        expect(getSnapshot()).toBe(true);

        unsubscribe();

        expect(getSubscriptionRemove(0)).toHaveBeenCalledTimes(1);
        expect(getSnapshot()).toBe(false);

        unsubscribe = subscribe(listener);

        expect(mockedAddEventListener).toHaveBeenCalledTimes(2);
        expect(getSnapshot()).toBe(false);
    });
});

// The hook is mocked in every consumer test, so this is the one place the real adapter over the store is verified.
describe('useIsWindowSizeChanging', () => {
    it('follows the store through a width change and its settling', () => {
        const {result, unmount} = renderHook(() => useIsWindowSizeChanging());
        expect(result.current).toBe(false);

        act(() => {
            emitDimensionsChange(initialWindow.width + 100);
        });
        expect(result.current).toBe(true);

        act(() => {
            jest.advanceTimersByTime(WINDOW_SIZE_CHANGE_DURATION_MS);
        });
        expect(result.current).toBe(false);

        unmount();
    });
});
