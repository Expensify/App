import {act, render, screen} from '@testing-library/react-native';

import ScreenActivityWrapper, {FIRST_RENDER_FALLBACK_DELAY_MS} from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigatorComponent/ScreenActivityWrapper';
import {
    getIsWindowSizeChanging,
    subscribeToWindowSizeChange,
} from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigatorComponent/ScreenActivityWrapper/windowSizeChangeStore';

import {useIsFocused} from '@react-navigation/native';
import React from 'react';
import {View} from 'react-native';

import createTransitionTrackerHarness from '../../../utils/TransitionTrackerTestUtils';

jest.mock('@hooks/useThemeStyles', () => () => ({
    flex1: {flex: 1},
}));

jest.mock('@libs/Navigation/TransitionTracker', () => ({
    runAfterTransitions: jest.fn(),
}));

jest.mock('@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigatorComponent/ScreenActivityWrapper/windowSizeChangeStore', () => ({
    subscribeToWindowSizeChange: jest.fn(),
    getIsWindowSizeChanging: jest.fn(),
}));

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
const mockedGetIsWindowSizeChanging = jest.mocked(getIsWindowSizeChanging);
const mockedSubscribeToWindowSizeChange = jest.mocked(subscribeToWindowSizeChange);

// The component keeps a freshly mounted screen visible until a frame was painted, so tests flush that first-render
// window before asserting the steady state.
function completeFirstRender() {
    act(() => {
        jest.advanceTimersByTime(FIRST_RENDER_FALLBACK_DELAY_MS);
    });
}

function wrapper(isScreenBlurred: boolean) {
    return (
        <ScreenActivityWrapper isScreenBlurred={isScreenBlurred}>
            <View testID="content" />
        </ScreenActivityWrapper>
    );
}

function renderWrapper(isScreenBlurred: boolean) {
    const {toJSON, rerender} = render(wrapper(isScreenBlurred));
    return {
        toJSON,
        rerenderWith: (nextIsScreenBlurred: boolean) => rerender(wrapper(nextIsScreenBlurred)),
    };
}

// A hidden <Activity> renders nothing, so an empty output is what the hidden mode looks like from the outside, while
// the content stays findable among the hidden elements as long as the React tree is mounted.
function expectHidden(toJSON: () => unknown) {
    expect(toJSON()).toBeNull();
    expect(screen.getByTestId('content', {includeHiddenElements: true})).toBeOnTheScreen();
}

function expectVisible(toJSON: () => unknown) {
    expect(toJSON()).not.toBeNull();
}

// An inert AlwaysPaintedView keeps its content painted but out of accessibility, so a covered screen that still
// renders is findable only among the hidden elements.
function expectContentUnreachable() {
    expect(screen.queryByTestId('content')).toBeNull();
    expect(screen.getByTestId('content', {includeHiddenElements: true})).toBeOnTheScreen();
}

function expectContentReachable() {
    expect(screen.getByTestId('content')).toBeOnTheScreen();
}

beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    transitionTracker.install();
    mockedUseIsFocused.mockReturnValue(true);
    mockedSubscribeToWindowSizeChange.mockImplementation(() => () => {});
    mockedGetIsWindowSizeChanging.mockReturnValue(false);
});

afterEach(() => {
    jest.useRealTimers();
});

describe('ScreenActivityWrapper', () => {
    it('keeps the top screen visible and not covered', () => {
        // Given a screen that nothing covers
        const {toJSON} = renderWrapper(false);

        // When the first-render window completes
        completeFirstRender();

        // Then it stays visible and reachable, so Activity never hides the top screen
        expectVisible(toJSON);
        expectContentReachable();
    });

    it('takes a covered screen out of accessibility on its first, still painted render', () => {
        // Given a screen wrapped for the activity behavior
        // When it mounts already covered by another screen
        const {toJSON} = renderWrapper(true);

        // Then it still renders that first frame, because React never mounts the effects of a hidden Activity and a
        // screen that mounts covered would never fetch its data, while its content is already unreachable
        expectVisible(toJSON);
        expectContentUnreachable();
    });

    it('hides a covered screen on the painted frame', () => {
        // Given the requested animation frame captured, so its callback can be fired on demand
        let paintFrame: FrameRequestCallback | undefined;
        const rafSpy = jest.spyOn(globalThis, 'requestAnimationFrame').mockImplementation((callback) => {
            paintFrame = callback;
            return 0;
        });

        // Given a screen that mounted already covered
        const {toJSON} = renderWrapper(true);
        expectVisible(toJSON);

        if (!paintFrame) {
            throw new Error('The component did not request an animation frame');
        }

        // When the animation frame callback fires
        const requestedFrame = paintFrame;
        act(() => {
            requestedFrame(0);
        });

        // Then the screen is hidden
        expectHidden(toJSON);

        rafSpy.mockRestore();
    });

    it('falls back to the timeout when animation frames never fire', () => {
        // Given animation frames that never run, as in a background app or a hidden browser tab
        const rafSpy = jest.spyOn(globalThis, 'requestAnimationFrame').mockImplementation(() => 0);

        // Given a screen that mounted already covered
        const {toJSON} = renderWrapper(true);

        // When the fallback delay has almost elapsed
        act(() => {
            jest.advanceTimersByTime(FIRST_RENDER_FALLBACK_DELAY_MS - 1);
        });

        // Then it is still visible
        expectVisible(toJSON);

        // When the rest of the fallback delay elapses
        act(() => {
            jest.advanceTimersByTime(1);
        });

        // Then it is hidden anyway, so a screen never stays visible just because no frame arrived
        expectHidden(toJSON);

        rafSpy.mockRestore();
    });

    it('hides a covered screen after its first render but keeps it mounted', () => {
        // Given a screen that mounted already covered
        const {toJSON} = renderWrapper(true);

        // When the first-render window completes
        completeFirstRender();

        // Then nothing of it is rendered any more, while its tree stays mounted so revealing it does not remount the children
        expectHidden(toJSON);
    });

    it('treats a screen of an unfocused navigator as covered', () => {
        // Given a navigator that lost focus to a route above it
        mockedUseIsFocused.mockReturnValue(false);

        // When its own top screen renders, which is not blurred inside that navigator
        const {toJSON} = renderWrapper(false);

        // Then it still counts as covered, because the whole navigator is behind another route
        expectContentUnreachable();

        // When the first-render window completes
        completeFirstRender();

        // Then it is hidden like any other covered screen
        expectHidden(toJSON);
    });

    it('reveals an uncovered screen only after the navigation transition ends', () => {
        // Given a covered screen that settled into the hidden mode
        const {toJSON, rerenderWith} = renderWrapper(true);
        completeFirstRender();
        expectHidden(toJSON);

        // When it stops being covered
        rerenderWith(false);

        // Then it stays hidden until the transition ends, because revealing it in the same commit as the navigation update blocks the main thread on a pop
        expectHidden(toJSON);

        // When the transition ends
        firePendingCallbacks();

        // Then the screen is revealed
        expectVisible(toJSON);
        expectContentReachable();
    });

    it('keeps a covered screen visible while the window size is changing', () => {
        // Given a covered screen that settled into the hidden mode
        const {toJSON, rerenderWith} = renderWrapper(true);
        completeFirstRender();
        expectHidden(toJSON);

        // When the window size starts changing
        mockedGetIsWindowSizeChanging.mockReturnValue(true);
        rerenderWith(true);

        // Then it is painted again while it stays covered, so it measures the new layout instead of revealing a stale one later
        expectVisible(toJSON);
        expectContentUnreachable();

        // When the size change settles
        mockedGetIsWindowSizeChanging.mockReturnValue(false);
        rerenderWith(true);

        // Then it goes back to hidden
        expectHidden(toJSON);
    });

    it('does not hide an uncovered screen when the window size change ends before the transition', () => {
        // Given a covered screen that settled into the hidden mode
        const {toJSON, rerenderWith} = renderWrapper(true);
        completeFirstRender();
        expectHidden(toJSON);

        // Given a window size change that painted it again, and a reveal that started while that change was still running
        mockedGetIsWindowSizeChanging.mockReturnValue(true);
        rerenderWith(true);
        expectVisible(toJSON);
        rerenderWith(false);
        expectVisible(toJSON);

        // When the size change settles before the transition ended
        mockedGetIsWindowSizeChanging.mockReturnValue(false);
        rerenderWith(false);

        // Then the screen stays visible, because an uncovered screen must never be hidden again
        expectVisible(toJSON);

        // When the transition ends and the screen gets covered again
        firePendingCallbacks();
        rerenderWith(true);

        // Then it is hidden
        expectHidden(toJSON);
    });
});
