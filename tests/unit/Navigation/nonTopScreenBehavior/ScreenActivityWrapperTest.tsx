import type {RenderAPI} from '@testing-library/react-native';
import {act, render, screen} from '@testing-library/react-native';

import ScreenActivityWrapper from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigatorComponent/ScreenActivityWrapper';
import useIsWindowSizeChanging from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigatorComponent/ScreenActivityWrapper/useIsWindowSizeChanging';
import {FIRST_RENDER_FALLBACK_DELAY_MS} from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigatorComponent/ScreenActivityWrapper/useScreenActivityState';
import TransitionTracker from '@libs/Navigation/TransitionTracker';

import {useIsFocused} from '@react-navigation/native';
import React from 'react';
import {StyleSheet, View} from 'react-native';

jest.mock('@hooks/useThemeStyles', () => () => ({
    flex1: {flex: 1},
}));

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

function renderWrapper(isScreenBlurred: boolean) {
    return render(
        <ScreenActivityWrapper isScreenBlurred={isScreenBlurred}>
            <View testID="content" />
        </ScreenActivityWrapper>,
    );
}

function rerenderWrapper(rerender: RenderAPI['rerender'], isScreenBlurred: boolean) {
    rerender(
        <ScreenActivityWrapper isScreenBlurred={isScreenBlurred}>
            <View testID="content" />
        </ScreenActivityWrapper>,
    );
}

// A hidden Activity removes its host nodes from the rendered output, so a painted screen has a non-null tree.
function getWrappers(toJSON: RenderAPI['toJSON']) {
    const outer = toJSON();
    if (!outer || Array.isArray(outer)) {
        throw new Error('ScreenActivityWrapper did not render the expected wrapper pair');
    }

    const inner = outer.children?.[0];
    if (!inner || typeof inner === 'string') {
        throw new Error('ScreenActivityWrapper did not render the expected inner wrapper');
    }

    return {inner, outer};
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

describe('ScreenActivityWrapper', () => {
    it('renders the top screen layout-neutral and accessible', () => {
        const {toJSON} = renderWrapper(false);
        completeFirstRender();

        expect(screen.getByTestId('content')).toBeOnTheScreen();

        const {inner, outer} = getWrappers(toJSON);
        expect(StyleSheet.flatten(outer.props.style)).toEqual({display: 'contents'});
        expect(inner.props['aria-hidden']).toBe(false);
        expect(StyleSheet.flatten(inner.props.style)).toEqual({flex: 1, pointerEvents: 'box-none'});
    });

    it('takes a covered screen out of accessibility and touch handling on its first, still painted render', () => {
        const {toJSON} = renderWrapper(true);

        expect(screen.queryByTestId('content')).toBeNull();
        expect(screen.getByTestId('content', {includeHiddenElements: true})).toBeOnTheScreen();

        const {inner} = getWrappers(toJSON);
        expect(inner.props['aria-hidden']).toBe(true);
        expect(StyleSheet.flatten(inner.props.style)).toEqual({flex: 1, pointerEvents: 'none'});
    });

    it('hides a covered screen after its first render but keeps it mounted', () => {
        const {toJSON} = renderWrapper(true);
        completeFirstRender();

        expect(toJSON()).toBeNull();
        expect(screen.getByTestId('content', {includeHiddenElements: true})).toBeOnTheScreen();
    });

    it('reveals an uncovered screen only after the navigation transition ends', () => {
        const {rerender, toJSON} = renderWrapper(true);
        completeFirstRender();
        expect(toJSON()).toBeNull();

        rerenderWrapper(rerender, false);

        expect(toJSON()).toBeNull();

        firePendingCallbacks();

        expect(screen.getByTestId('content')).toBeOnTheScreen();
        const {inner, outer} = getWrappers(toJSON);
        expect(StyleSheet.flatten(outer.props.style)).toEqual({display: 'contents'});
        expect(inner.props['aria-hidden']).toBe(false);
    });

    it('keeps a covered screen painted while the window size is changing so it lays out against the new size', () => {
        const {rerender, toJSON} = renderWrapper(true);
        completeFirstRender();
        expect(toJSON()).toBeNull();

        mockedUseIsWindowSizeChanging.mockReturnValue(true);
        rerenderWrapper(rerender, true);

        const {inner} = getWrappers(toJSON);
        expect(inner.props['aria-hidden']).toBe(true);

        mockedUseIsWindowSizeChanging.mockReturnValue(false);
        rerenderWrapper(rerender, true);

        expect(toJSON()).toBeNull();
    });
});
