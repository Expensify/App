import {getSnapshot, subscribe} from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigatorComponent/ScreenActivityWrapper/windowSizeChangeStore';

import type {ScaledSize} from 'react-native';

import {Dimensions} from 'react-native';

// How long the store keeps reporting a change after the last qualifying event, mirrored from the implementation.
const SETTLE_DELAY_MS = 250;

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
    handler?.({window: makeScaledSize(width, height), screen: makeScaledSize(width, height)});
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
    it('reports no change before any dimensions event', () => {
        unsubscribe = subscribe(jest.fn());

        expect(getSnapshot()).toBe(false);
    });

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
        jest.advanceTimersByTime(SETTLE_DELAY_MS);

        expect(getSnapshot()).toBe(false);
        expect(listener).toHaveBeenCalledTimes(2);
    });

    it('extends the settle window while width changes keep coming, without extra notifications', () => {
        const listener = jest.fn();
        unsubscribe = subscribe(listener);

        emitDimensionsChange(initialWindow.width + 100);
        jest.advanceTimersByTime(SETTLE_DELAY_MS - 50);
        emitDimensionsChange(initialWindow.width + 200);
        jest.advanceTimersByTime(SETTLE_DELAY_MS - 1);

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

        jest.advanceTimersByTime(SETTLE_DELAY_MS);

        expect(getSnapshot()).toBe(false);
        expect(remaining).toHaveBeenCalledTimes(2);
    });

    it('resets and registers a fresh listener once the last subscriber left', () => {
        const listener = jest.fn();
        unsubscribe = subscribe(listener);
        emitDimensionsChange(initialWindow.width + 100);
        expect(getSnapshot()).toBe(true);

        unsubscribe();

        expect(getSnapshot()).toBe(false);

        unsubscribe = subscribe(listener);

        expect(mockedAddEventListener).toHaveBeenCalledTimes(2);
        expect(getSnapshot()).toBe(false);
    });
});
