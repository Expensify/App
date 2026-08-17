import {act, renderHook} from '@testing-library/react-native';

import useIsWindowSizeChanging from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigatorComponent/ScreenActivityWrapper/useIsWindowSizeChanging';
import useScreenActivityState, {
    FIRST_RENDER_FALLBACK_DELAY_MS,
} from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigatorComponent/ScreenActivityWrapper/useScreenActivityState';
import TransitionTracker from '@libs/Navigation/TransitionTracker';

import {useIsFocused} from '@react-navigation/native';

jest.mock('@libs/Navigation/TransitionTracker', () => ({
    runAfterTransitions: jest.fn(),
}));

jest.mock('@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigatorComponent/ScreenActivityWrapper/useIsWindowSizeChanging', () => jest.fn());

jest.mock('@react-navigation/native', () => {
    const actual = jest.requireActual<Record<string, unknown>>('@react-navigation/native');
    return {
        ...actual,
        useIsFocused: jest.fn(),
    };
});

const mockedRunAfterTransitions = jest.mocked(TransitionTracker.runAfterTransitions);
const mockedUseIsFocused = jest.mocked(useIsFocused);
const mockedUseIsWindowSizeChanging = jest.mocked(useIsWindowSizeChanging);

// Captures the callbacks handed to `runAfterTransitions` so tests can fire them on demand, and stubs a cancel handle.
let pendingCallbacks: Array<() => void | Promise<void>> = [];

function firePendingCallbacks() {
    act(() => {
        const callbacks = pendingCallbacks;
        pendingCallbacks = [];
        for (const callback of callbacks) {
            callback();
        }
    });
}

// The hook keeps a freshly mounted screen visible until a frame was painted, so tests flush that first-render
// window before asserting the steady state.
function completeFirstRender() {
    act(() => {
        jest.advanceTimersByTime(FIRST_RENDER_FALLBACK_DELAY_MS);
    });
}

beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    pendingCallbacks = [];
    mockedRunAfterTransitions.mockImplementation(({callback}) => {
        pendingCallbacks.push(callback);
        return {cancel: jest.fn()};
    });
    mockedUseIsFocused.mockReturnValue(true);
    mockedUseIsWindowSizeChanging.mockReturnValue(false);
});

afterEach(() => {
    jest.useRealTimers();
});

describe('useScreenActivityState', () => {
    it('keeps the top screen visible and not covered', () => {
        const {result} = renderHook(() => useScreenActivityState(false));
        completeFirstRender();

        expect(result.current.mode).toBe('visible');
        expect(result.current.isScreenCovered).toBe(false);
    });

    it('renders the first frame of a covered screen visible, then hides it on the painted frame', () => {
        let paintFrame: FrameRequestCallback | undefined;
        const rafSpy = jest.spyOn(globalThis, 'requestAnimationFrame').mockImplementation((callback) => {
            paintFrame = callback;
            return 0;
        });

        const {result} = renderHook(() => useScreenActivityState(true));

        expect(result.current.mode).toBe('visible');
        expect(result.current.isScreenCovered).toBe(true);

        if (!paintFrame) {
            throw new Error('The hook did not request an animation frame');
        }
        const requestedFrame = paintFrame;
        act(() => {
            requestedFrame(0);
        });

        expect(result.current.mode).toBe('hidden');

        rafSpy.mockRestore();
    });

    it('falls back to the 100ms timeout when animation frames never fire', () => {
        const rafSpy = jest.spyOn(globalThis, 'requestAnimationFrame').mockImplementation(() => 0);

        const {result} = renderHook(() => useScreenActivityState(true));

        act(() => {
            jest.advanceTimersByTime(99);
        });
        expect(result.current.mode).toBe('visible');

        act(() => {
            jest.advanceTimersByTime(1);
        });
        expect(result.current.mode).toBe('hidden');

        rafSpy.mockRestore();
    });

    it('treats a screen of an unfocused navigator as covered', () => {
        mockedUseIsFocused.mockReturnValue(false);

        const {result} = renderHook(() => useScreenActivityState(false));
        completeFirstRender();

        expect(result.current.mode).toBe('hidden');
        expect(result.current.isScreenCovered).toBe(true);
    });

    it('reveals an uncovered screen only after the navigation transition ends', () => {
        const {result, rerender} = renderHook(({isScreenBlurred}) => useScreenActivityState(isScreenBlurred), {initialProps: {isScreenBlurred: true}});
        completeFirstRender();
        expect(result.current.mode).toBe('hidden');

        rerender({isScreenBlurred: false});

        expect(result.current.isScreenCovered).toBe(false);
        expect(result.current.mode).toBe('hidden');

        firePendingCallbacks();

        expect(result.current.mode).toBe('visible');
    });

    it('keeps a covered screen visible while the window size is changing', () => {
        const {result, rerender} = renderHook(({isScreenBlurred}) => useScreenActivityState(isScreenBlurred), {initialProps: {isScreenBlurred: true}});
        completeFirstRender();
        expect(result.current.mode).toBe('hidden');

        mockedUseIsWindowSizeChanging.mockReturnValue(true);
        rerender({isScreenBlurred: true});

        expect(result.current.mode).toBe('visible');
        expect(result.current.isScreenCovered).toBe(true);

        mockedUseIsWindowSizeChanging.mockReturnValue(false);
        rerender({isScreenBlurred: true});

        expect(result.current.mode).toBe('hidden');
    });

    it('does not hide an uncovered screen when the window size change ends before the transition', () => {
        const {result, rerender} = renderHook(({isScreenBlurred}) => useScreenActivityState(isScreenBlurred), {initialProps: {isScreenBlurred: true}});
        completeFirstRender();
        expect(result.current.mode).toBe('hidden');

        mockedUseIsWindowSizeChanging.mockReturnValue(true);
        rerender({isScreenBlurred: true});
        expect(result.current.mode).toBe('visible');

        rerender({isScreenBlurred: false});
        expect(result.current.mode).toBe('visible');

        mockedUseIsWindowSizeChanging.mockReturnValue(false);
        rerender({isScreenBlurred: false});
        expect(result.current.mode).toBe('visible');

        firePendingCallbacks();
        rerender({isScreenBlurred: true});
        expect(result.current.mode).toBe('hidden');
    });
});
