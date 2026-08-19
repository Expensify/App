import {act, renderHook} from '@testing-library/react-native';

import useIsWindowSizeChanging from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigatorComponent/ScreenActivityWrapper/useIsWindowSizeChanging';
import useScreenActivityState, {
    FIRST_RENDER_FALLBACK_DELAY_MS,
} from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigatorComponent/ScreenActivityWrapper/useScreenActivityState';

import {useIsFocused} from '@react-navigation/native';

import createTransitionTrackerHarness from '../../../utils/TransitionTrackerTestUtils';

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

const transitionTracker = createTransitionTrackerHarness();
const {firePendingCallbacks} = transitionTracker;
const mockedUseIsFocused = jest.mocked(useIsFocused);
const mockedUseIsWindowSizeChanging = jest.mocked(useIsWindowSizeChanging);

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
    transitionTracker.install();
    mockedUseIsFocused.mockReturnValue(true);
    mockedUseIsWindowSizeChanging.mockReturnValue(false);
});

afterEach(() => {
    jest.useRealTimers();
});

describe('useScreenActivityState', () => {
    it('keeps the top screen visible and not covered', () => {
        // Given a screen that nothing covers
        const {result} = renderHook(() => useScreenActivityState(false));

        // When the first-render window completes
        completeFirstRender();

        // Then it stays visible, so Activity never hides the top screen
        expect(result.current.mode).toBe('visible');
        expect(result.current.isScreenCovered).toBe(false);
    });

    it('renders the first frame of a covered screen visible, then hides it on the painted frame', () => {
        // Given the requested animation frame captured, so its callback can be fired on demand
        let paintFrame: FrameRequestCallback | undefined;
        const rafSpy = jest.spyOn(globalThis, 'requestAnimationFrame').mockImplementation((callback) => {
            paintFrame = callback;
            return 0;
        });

        // When a screen mounts already covered
        const {result} = renderHook(() => useScreenActivityState(true));

        // Then it renders visible first, because React never mounts the effects of a hidden Activity and a screen that mounts covered would never fetch its data
        expect(result.current.mode).toBe('visible');
        expect(result.current.isScreenCovered).toBe(true);

        if (!paintFrame) {
            throw new Error('The hook did not request an animation frame');
        }

        // When the animation frame callback fires
        const requestedFrame = paintFrame;
        act(() => {
            requestedFrame(0);
        });

        // Then the screen is hidden
        expect(result.current.mode).toBe('hidden');

        rafSpy.mockRestore();
    });

    it('falls back to the timeout when animation frames never fire', () => {
        // Given animation frames that never run, as in a background app or a hidden browser tab
        const rafSpy = jest.spyOn(globalThis, 'requestAnimationFrame').mockImplementation(() => 0);

        // When a screen mounts already covered
        const {result} = renderHook(() => useScreenActivityState(true));

        // Then it is still visible right before the fallback delay elapses
        act(() => {
            jest.advanceTimersByTime(FIRST_RENDER_FALLBACK_DELAY_MS - 1);
        });
        expect(result.current.mode).toBe('visible');

        // When the fallback delay elapses
        act(() => {
            jest.advanceTimersByTime(1);
        });

        // Then it is hidden anyway, so a screen never stays visible just because no frame arrived
        expect(result.current.mode).toBe('hidden');

        rafSpy.mockRestore();
    });

    it('treats a screen of an unfocused navigator as covered', () => {
        // Given a navigator that lost focus to a route above it
        mockedUseIsFocused.mockReturnValue(false);

        // When its own top screen renders, which is not blurred inside that navigator
        const {result} = renderHook(() => useScreenActivityState(false));
        completeFirstRender();

        // Then it still counts as covered, because the whole navigator is behind another route
        expect(result.current.mode).toBe('hidden');
        expect(result.current.isScreenCovered).toBe(true);
    });

    it('reveals an uncovered screen only after the navigation transition ends', () => {
        // Given a covered screen that settled into the hidden mode
        const {result, rerender} = renderHook(({isScreenBlurred}) => useScreenActivityState(isScreenBlurred), {initialProps: {isScreenBlurred: true}});
        completeFirstRender();
        expect(result.current.mode).toBe('hidden');

        // When it stops being covered
        rerender({isScreenBlurred: false});

        // Then it stays hidden until the transition ends, because revealing it in the same commit as the navigation update blocks the main thread on a pop
        expect(result.current.isScreenCovered).toBe(false);
        expect(result.current.mode).toBe('hidden');

        // When the transition ends
        firePendingCallbacks();

        // Then the screen is revealed
        expect(result.current.mode).toBe('visible');
    });

    it('keeps a covered screen visible while the window size is changing', () => {
        // Given a covered screen that settled into the hidden mode
        const {result, rerender} = renderHook(({isScreenBlurred}) => useScreenActivityState(isScreenBlurred), {initialProps: {isScreenBlurred: true}});
        completeFirstRender();
        expect(result.current.mode).toBe('hidden');

        // When the window size starts changing
        mockedUseIsWindowSizeChanging.mockReturnValue(true);
        rerender({isScreenBlurred: true});

        // Then it is painted again while it stays covered, so it measures the new layout instead of revealing a stale one later
        expect(result.current.mode).toBe('visible');
        expect(result.current.isScreenCovered).toBe(true);

        // When the size change settles
        mockedUseIsWindowSizeChanging.mockReturnValue(false);
        rerender({isScreenBlurred: true});

        // Then it goes back to hidden
        expect(result.current.mode).toBe('hidden');
    });

    it('does not hide an uncovered screen when the window size change ends before the transition', () => {
        // Given a covered screen that settled into the hidden mode
        const {result, rerender} = renderHook(({isScreenBlurred}) => useScreenActivityState(isScreenBlurred), {initialProps: {isScreenBlurred: true}});
        completeFirstRender();
        expect(result.current.mode).toBe('hidden');

        // Given a window size change that painted it again, and a reveal that started while that change was still running
        mockedUseIsWindowSizeChanging.mockReturnValue(true);
        rerender({isScreenBlurred: true});
        expect(result.current.mode).toBe('visible');
        rerender({isScreenBlurred: false});
        expect(result.current.mode).toBe('visible');

        // When the size change settles before the transition ended
        mockedUseIsWindowSizeChanging.mockReturnValue(false);
        rerender({isScreenBlurred: false});

        // Then the screen stays visible, because an uncovered screen must never be hidden again
        expect(result.current.mode).toBe('visible');

        // When the transition ends and the screen gets covered again
        firePendingCallbacks();
        rerender({isScreenBlurred: true});

        // Then it is hidden
        expect(result.current.mode).toBe('hidden');
    });
});
