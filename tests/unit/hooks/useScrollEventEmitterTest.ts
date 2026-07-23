import {act, renderHook} from '@testing-library/react-native';

import useScrollEventEmitter from '@hooks/useScrollEventEmitter';

import CONST from '@src/CONST';

import {DeviceEventEmitter} from 'react-native';

const SCROLL_END_DELAY = 250;

describe('useScrollEventEmitter', () => {
    let emitted: boolean[];
    let subscription: ReturnType<typeof DeviceEventEmitter.addListener>;

    beforeEach(() => {
        jest.useFakeTimers();
        emitted = [];
        subscription = DeviceEventEmitter.addListener(CONST.EVENTS.SCROLLING, (isScrolling: boolean) => {
            emitted.push(isScrolling);
        });
    });

    afterEach(() => {
        subscription.remove();
        jest.useRealTimers();
    });

    it('should announce the scroll starting, then ending once it settles', () => {
        const {result} = renderHook(() => useScrollEventEmitter());

        act(() => result.current());

        expect(emitted).toEqual([true]);

        act(() => {
            jest.advanceTimersByTime(SCROLL_END_DELAY);
        });

        expect(emitted).toEqual([true, false]);
    });

    it('should announce a burst of scroll events as a single scroll', () => {
        const {result} = renderHook(() => useScrollEventEmitter());

        act(() => result.current());
        act(() => {
            jest.advanceTimersByTime(200);
        });
        act(() => result.current());
        act(() => {
            jest.advanceTimersByTime(200);
        });

        // Still mid-scroll, so no "ended" yet and no repeated "started"
        expect(emitted).toEqual([true]);

        act(() => {
            jest.advanceTimersByTime(SCROLL_END_DELAY);
        });

        expect(emitted).toEqual([true, false]);
    });

    it('should announce the scroll ending when unmounted mid-scroll', () => {
        const {result, unmount} = renderHook(() => useScrollEventEmitter());

        act(() => result.current());
        expect(emitted).toEqual([true]);

        // Navigating away before the scroll settles must not strand listeners in the scrolling state,
        // which would leave tooltips hidden and swallow wheel events elsewhere in the app.
        unmount();

        expect(emitted).toEqual([true, false]);
    });

    it('should not announce anything when unmounted without scrolling', () => {
        const {unmount} = renderHook(() => useScrollEventEmitter());

        unmount();

        expect(emitted).toEqual([]);
    });
});
