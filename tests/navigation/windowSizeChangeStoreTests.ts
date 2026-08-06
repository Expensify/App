import {act, renderHook} from '@testing-library/react-native';

import useIsWindowSizeChanging from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigatorComponent/ScreenActivityWrapper/useIsWindowSizeChanging';

import type {ScaledSize} from 'react-native';

import type {WindowDimensionsChangeMock} from '../utils/mockWindowDimensionsChange';

import {buildWindowSize, mockWindowDimensionsChange} from '../utils/mockWindowDimensionsChange';

const mockLogInfo = jest.fn<void, [string, boolean, Record<string, unknown>]>();

jest.mock('@libs/Log', () => ({
    info: (message: string, isAlert: boolean, parameters: Record<string, unknown>) => mockLogInfo(message, isAlert, parameters),
}));

const INITIAL_WINDOW_SIZE: ScaledSize = buildWindowSize(400, 900);

let windowDimensions: WindowDimensionsChangeMock;

function emitWindowSize(size: ScaledSize) {
    act(() => {
        windowDimensions.emit(size);
    });
}

describe('windowSizeChangeStore', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        windowDimensions = mockWindowDimensionsChange(INITIAL_WINDOW_SIZE);
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
        jest.useRealTimers();
    });

    it('reports no change while the window size is stable', () => {
        const {result} = renderHook(() => useIsWindowSizeChanging());

        expect(result.current).toBe(false);
    });

    it('reports a change when the window width changes', () => {
        const {result} = renderHook(() => useIsWindowSizeChanging());

        emitWindowSize(buildWindowSize(1200, 900));

        expect(result.current).toBe(true);
    });

    it('stops reporting a change 250ms after the last one', () => {
        const {result} = renderHook(() => useIsWindowSizeChanging());
        emitWindowSize(buildWindowSize(1200, 900));

        act(() => {
            jest.advanceTimersByTime(249);
        });
        expect(result.current).toBe(true);

        act(() => {
            jest.advanceTimersByTime(1);
        });
        expect(result.current).toBe(false);
    });

    it('extends the change window while the user keeps dragging the window edge', () => {
        const {result} = renderHook(() => useIsWindowSizeChanging());
        emitWindowSize(buildWindowSize(1200, 900));

        for (const width of [1100, 1000, 900]) {
            act(() => {
                jest.advanceTimersByTime(200);
            });
            emitWindowSize(buildWindowSize(width, 900));
        }

        expect(result.current).toBe(true);

        act(() => {
            jest.advanceTimersByTime(250);
        });
        expect(result.current).toBe(false);
    });

    it('ignores a height only change, which is how the soft keyboard resizes the window', () => {
        const {result} = renderHook(() => useIsWindowSizeChanging());

        emitWindowSize(buildWindowSize(INITIAL_WINDOW_SIZE.width, 500));

        expect(result.current).toBe(false);
    });

    it('ignores a change that repeats the current window size', () => {
        const {result} = renderHook(() => useIsWindowSizeChanging());

        emitWindowSize(INITIAL_WINDOW_SIZE);

        expect(result.current).toBe(false);
    });

    it('reports an orientation change that keeps the window width', () => {
        const {result} = renderHook(() => useIsWindowSizeChanging());

        // The stored window is 400 wide and portrait, so a height below the width flips the orientation only.
        emitWindowSize(buildWindowSize(INITIAL_WINDOW_SIZE.width, 300));

        expect(result.current).toBe(true);
    });

    it('reports the following height only change after an orientation change', () => {
        const {result} = renderHook(() => useIsWindowSizeChanging());
        emitWindowSize(buildWindowSize(800, 400));
        act(() => {
            jest.advanceTimersByTime(250);
        });

        // The window is landscape now, so growing the height back past the width is another orientation change.
        emitWindowSize(buildWindowSize(800, 1000));

        expect(result.current).toBe(true);
    });

    describe('shared state', () => {
        it('serves every screen from a single Dimensions subscription', () => {
            renderHook(() => useIsWindowSizeChanging());
            renderHook(() => useIsWindowSizeChanging());
            renderHook(() => useIsWindowSizeChanging());

            expect(windowDimensions.getSubscriptionCount()).toBe(1);
        });

        it('notifies every subscribed screen about the same change', () => {
            const first = renderHook(() => useIsWindowSizeChanging());
            const second = renderHook(() => useIsWindowSizeChanging());

            emitWindowSize(buildWindowSize(1200, 900));

            expect(first.result.current).toBe(true);
            expect(second.result.current).toBe(true);
        });

        it('keeps the subscription while at least one screen is mounted', () => {
            const first = renderHook(() => useIsWindowSizeChanging());
            renderHook(() => useIsWindowSizeChanging());

            first.unmount();

            expect(windowDimensions.removeSubscription).not.toHaveBeenCalled();
        });

        it('removes the subscription once the last screen unmounts', () => {
            const first = renderHook(() => useIsWindowSizeChanging());
            const second = renderHook(() => useIsWindowSizeChanging());

            first.unmount();
            second.unmount();

            expect(windowDimensions.removeSubscription).toHaveBeenCalledTimes(1);
        });

        it('drops the pending stop timeout when the last screen unmounts', () => {
            const {unmount} = renderHook(() => useIsWindowSizeChanging());
            emitWindowSize(buildWindowSize(1200, 900));

            unmount();

            expect(jest.getTimerCount()).toBe(0);
        });

        it('starts from no change after a full unsubscribe and resubscribe cycle', () => {
            const first = renderHook(() => useIsWindowSizeChanging());
            emitWindowSize(buildWindowSize(1200, 900));
            first.unmount();

            const second = renderHook(() => useIsWindowSizeChanging());

            expect(second.result.current).toBe(false);
        });

        it('reads the current window size on resubscribe so a stale width does not fake a change', () => {
            const first = renderHook(() => useIsWindowSizeChanging());
            emitWindowSize(buildWindowSize(1200, 900));
            first.unmount();
            windowDimensions.setCurrentSize(buildWindowSize(1200, 900));

            const second = renderHook(() => useIsWindowSizeChanging());
            emitWindowSize(buildWindowSize(1200, 900));

            expect(second.result.current).toBe(false);
        });
    });

    describe('logging', () => {
        it('logs the change once, no matter how many screens are deprioritized', () => {
            renderHook(() => useIsWindowSizeChanging());
            renderHook(() => useIsWindowSizeChanging());

            emitWindowSize(buildWindowSize(1200, 900));

            expect(mockLogInfo).toHaveBeenCalledTimes(1);
            expect(mockLogInfo).toHaveBeenCalledWith('[ScreenActivityWrapper] Window size changed, revealing deprioritized screens', false, {
                width: 1200,
                height: 900,
                isPortrait: false,
            });
        });

        it('does not log again while the same change is still in progress', () => {
            renderHook(() => useIsWindowSizeChanging());
            emitWindowSize(buildWindowSize(1200, 900));

            emitWindowSize(buildWindowSize(1100, 900));
            emitWindowSize(buildWindowSize(1000, 900));

            expect(mockLogInfo).toHaveBeenCalledTimes(1);
        });

        it('logs the next change that starts after the previous one settled', () => {
            renderHook(() => useIsWindowSizeChanging());
            emitWindowSize(buildWindowSize(1200, 900));
            act(() => {
                jest.advanceTimersByTime(250);
            });

            emitWindowSize(buildWindowSize(600, 900));

            expect(mockLogInfo).toHaveBeenCalledTimes(2);
        });

        it('does not log an ignored height only change', () => {
            renderHook(() => useIsWindowSizeChanging());

            emitWindowSize(buildWindowSize(INITIAL_WINDOW_SIZE.width, 500));

            expect(mockLogInfo).not.toHaveBeenCalled();
        });
    });
});
