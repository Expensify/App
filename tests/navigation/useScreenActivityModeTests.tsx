import {act, renderHook} from '@testing-library/react-native';

import useScreenActivityMode from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigatorComponent/ScreenActivityWrapper/useScreenActivityMode';

import type {ScaledSize} from 'react-native';

import type {WindowDimensionsChangeMock} from '../utils/mockWindowDimensionsChange';

import completeRevealTransition from '../utils/completeRevealTransition';
import {buildWindowSize, mockWindowDimensionsChange} from '../utils/mockWindowDimensionsChange';

type HookProps = {
    isScreenCovered: boolean;
    routeKey: string;
    routeName: string;
};

const mockLogInfo = jest.fn<void, [string, boolean, Record<string, unknown>]>();

jest.mock('@libs/Log', () => ({
    info: (message: string, isAlert: boolean, parameters: Record<string, unknown>) => mockLogInfo(message, isAlert, parameters),
}));

const INITIAL_WINDOW_SIZE: ScaledSize = buildWindowSize(400, 900);

const DEFAULT_PROPS: HookProps = {isScreenCovered: false, routeKey: 'key-1', routeName: 'MiddleScreen'};

let windowDimensions: WindowDimensionsChangeMock;

function emitWindowSize(size: ScaledSize) {
    act(() => {
        windowDimensions.emit(size);
    });
}

function flushFirstRenderFrame() {
    act(() => {
        jest.advanceTimersByTime(20);
    });
}

describe('useScreenActivityMode', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        windowDimensions = mockWindowDimensionsChange(INITIAL_WINDOW_SIZE);
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
        jest.useRealTimers();
    });

    it('keeps a focused top screen visible', () => {
        const {result} = renderHook(() => useScreenActivityMode(DEFAULT_PROPS));

        flushFirstRenderFrame();

        expect(result.current).toBe('visible');
    });

    it('hides a covered screen', () => {
        const {result} = renderHook((props: HookProps) => useScreenActivityMode(props), {initialProps: {...DEFAULT_PROPS, isScreenCovered: true}});

        flushFirstRenderFrame();

        expect(result.current).toBe('hidden');
    });

    it('reveals a screen again once it stops being covered and the transition completes', async () => {
        const {result, rerender} = renderHook((props: HookProps) => useScreenActivityMode(props), {initialProps: {...DEFAULT_PROPS, isScreenCovered: true}});
        flushFirstRenderFrame();

        rerender({...DEFAULT_PROPS, isScreenCovered: false});
        expect(result.current).toBe('hidden');

        await completeRevealTransition();

        expect(result.current).toBe('visible');
    });

    describe('first render pass', () => {
        it('stays visible on the first render of an already covered screen so its mount effects run', () => {
            const {result} = renderHook((props: HookProps) => useScreenActivityMode(props), {initialProps: {...DEFAULT_PROPS, isScreenCovered: true}});

            expect(result.current).toBe('visible');
        });

        it('deprioritizes the screen one frame later', () => {
            const {result} = renderHook((props: HookProps) => useScreenActivityMode(props), {initialProps: {...DEFAULT_PROPS, isScreenCovered: true}});

            flushFirstRenderFrame();

            expect(result.current).toBe('hidden');
        });

        it('stays visible across re-renders until the frame passes', () => {
            const {result, rerender} = renderHook((props: HookProps) => useScreenActivityMode(props), {initialProps: {...DEFAULT_PROPS, isScreenCovered: true}});

            rerender({...DEFAULT_PROPS, isScreenCovered: true});

            expect(result.current).toBe('visible');
        });

        it('cancels the pending frame when the screen unmounts', () => {
            const cancelAnimationFrameSpy = jest.spyOn(globalThis, 'cancelAnimationFrame');

            const {unmount} = renderHook((props: HookProps) => useScreenActivityMode(props), {initialProps: {...DEFAULT_PROPS, isScreenCovered: true}});
            unmount();

            expect(cancelAnimationFrameSpy).toHaveBeenCalled();
        });

        it('deprioritizes the screen through the fallback timeout when no frame is ever painted', () => {
            // A screen that mounts in a background app or a hidden browser tab never gets its animation frame.
            jest.spyOn(globalThis, 'requestAnimationFrame').mockReturnValue(1);
            const {result} = renderHook((props: HookProps) => useScreenActivityMode(props), {initialProps: {...DEFAULT_PROPS, isScreenCovered: true}});

            act(() => {
                jest.advanceTimersByTime(100);
            });

            expect(result.current).toBe('hidden');
        });

        it('keeps the screen visible until the fallback timeout elapses', () => {
            jest.spyOn(globalThis, 'requestAnimationFrame').mockReturnValue(1);
            const {result} = renderHook((props: HookProps) => useScreenActivityMode(props), {initialProps: {...DEFAULT_PROPS, isScreenCovered: true}});

            act(() => {
                jest.advanceTimersByTime(99);
            });

            expect(result.current).toBe('visible');
        });

        it('clears the pending fallback timeout when the screen unmounts', () => {
            jest.spyOn(globalThis, 'requestAnimationFrame').mockReturnValue(1);
            const {unmount} = renderHook((props: HookProps) => useScreenActivityMode(props), {initialProps: {...DEFAULT_PROPS, isScreenCovered: true}});

            unmount();

            expect(jest.getTimerCount()).toBe(0);
        });
    });

    describe('window size changes', () => {
        it('reveals a covered screen while the window is being resized', () => {
            const {result} = renderHook((props: HookProps) => useScreenActivityMode(props), {initialProps: {...DEFAULT_PROPS, isScreenCovered: true}});
            flushFirstRenderFrame();

            emitWindowSize(buildWindowSize(1200, 900));

            expect(result.current).toBe('visible');
        });

        it('deprioritizes the screen again once the resize settles', () => {
            const {result} = renderHook((props: HookProps) => useScreenActivityMode(props), {initialProps: {...DEFAULT_PROPS, isScreenCovered: true}});
            flushFirstRenderFrame();
            emitWindowSize(buildWindowSize(1200, 900));

            act(() => {
                jest.advanceTimersByTime(250);
            });

            expect(result.current).toBe('hidden');
        });

        it('keeps the screen revealed while the resize is still in progress', () => {
            const {result} = renderHook((props: HookProps) => useScreenActivityMode(props), {initialProps: {...DEFAULT_PROPS, isScreenCovered: true}});
            flushFirstRenderFrame();
            emitWindowSize(buildWindowSize(1200, 900));

            act(() => {
                jest.advanceTimersByTime(200);
            });
            emitWindowSize(buildWindowSize(1300, 900));
            act(() => {
                jest.advanceTimersByTime(200);
            });

            expect(result.current).toBe('visible');
        });

        it('ignores a height only change, which is how the soft keyboard resizes the window', () => {
            const {result} = renderHook((props: HookProps) => useScreenActivityMode(props), {initialProps: {...DEFAULT_PROPS, isScreenCovered: true}});
            flushFirstRenderFrame();

            emitWindowSize(buildWindowSize(INITIAL_WINDOW_SIZE.width, 500));

            expect(result.current).toBe('hidden');
        });

        it('reveals the screen on an orientation change that keeps the window width', () => {
            const {result} = renderHook((props: HookProps) => useScreenActivityMode(props), {initialProps: {...DEFAULT_PROPS, isScreenCovered: true}});
            flushFirstRenderFrame();

            // The window is 400 wide and portrait, so a height below the width flips the orientation without a width change.
            emitWindowSize(buildWindowSize(INITIAL_WINDOW_SIZE.width, 300));

            expect(result.current).toBe('visible');
        });

        it('keeps a top screen visible through a resize', () => {
            const {result} = renderHook((props: HookProps) => useScreenActivityMode(props), {initialProps: DEFAULT_PROPS});
            flushFirstRenderFrame();

            emitWindowSize(buildWindowSize(1200, 900));
            act(() => {
                jest.advanceTimersByTime(250);
            });

            expect(result.current).toBe('visible');
        });
    });

    describe('logging', () => {
        it('logs the mounted Activity of a screen', () => {
            renderHook((props: HookProps) => useScreenActivityMode(props), {initialProps: DEFAULT_PROPS});

            expect(mockLogInfo).toHaveBeenCalledWith('[ScreenActivityWrapper] Activity mounted', false, {navigationMode: 'visible', routeKey: 'key-1', routeName: 'MiddleScreen'});
        });

        it('logs the mounted Activity of a screen that is covered from the start', () => {
            renderHook((props: HookProps) => useScreenActivityMode(props), {initialProps: {...DEFAULT_PROPS, isScreenCovered: true}});

            expect(mockLogInfo).toHaveBeenCalledWith('[ScreenActivityWrapper] Activity mounted', false, expect.objectContaining({navigationMode: 'hidden'}));
        });

        it('logs a navigation driven mode change', () => {
            const {rerender} = renderHook((props: HookProps) => useScreenActivityMode(props), {initialProps: DEFAULT_PROPS});
            flushFirstRenderFrame();

            rerender({...DEFAULT_PROPS, isScreenCovered: true});

            expect(mockLogInfo).toHaveBeenCalledWith('[ScreenActivityWrapper] Activity state changed', false, {navigationMode: 'hidden', routeKey: 'key-1', routeName: 'MiddleScreen'});
        });

        it('does not log a re-render that leaves the mode unchanged', () => {
            const {rerender} = renderHook((props: HookProps) => useScreenActivityMode(props), {initialProps: DEFAULT_PROPS});
            flushFirstRenderFrame();
            const callCountAfterMount = mockLogInfo.mock.calls.length;

            rerender(DEFAULT_PROPS);

            expect(mockLogInfo.mock.calls).toHaveLength(callCountAfterMount);
        });

        it('does not log the first render pass, which flips every deprioritized screen at once', () => {
            renderHook((props: HookProps) => useScreenActivityMode(props), {initialProps: {...DEFAULT_PROPS, isScreenCovered: true}});
            mockLogInfo.mockClear();

            flushFirstRenderFrame();

            expect(mockLogInfo).not.toHaveBeenCalled();
        });

        it('does not log per screen on a window size change, which the store logs once for all of them', () => {
            renderHook((props: HookProps) => useScreenActivityMode(props), {initialProps: {...DEFAULT_PROPS, isScreenCovered: true}});
            flushFirstRenderFrame();
            mockLogInfo.mockClear();

            emitWindowSize(buildWindowSize(1200, 900));

            expect(mockLogInfo).not.toHaveBeenCalledWith(expect.stringContaining('Activity state changed'), expect.anything(), expect.anything());
        });
    });
});
