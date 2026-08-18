import {act, render, screen} from '@testing-library/react-native';

import ScreenActivityWrapper from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigatorComponent/ScreenActivityWrapper';
import useIsWindowSizeChanging from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigatorComponent/ScreenActivityWrapper/useIsWindowSizeChanging';
import {FIRST_RENDER_FALLBACK_DELAY_MS} from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigatorComponent/ScreenActivityWrapper/useScreenActivityState';

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

jest.mock('@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigatorComponent/ScreenActivityWrapper/useIsWindowSizeChanging', () => jest.fn());

jest.mock('@react-navigation/native', () => {
    const actual = jest.requireActual<Record<string, unknown>>('@react-navigation/native');
    return {
        ...actual,
        useIsFocused: jest.fn(),
    };
});

const transitionTracker = createTransitionTrackerHarness();
const mockedUseIsFocused = jest.mocked(useIsFocused);
const mockedUseIsWindowSizeChanging = jest.mocked(useIsWindowSizeChanging);

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

// The state logic is covered in useScreenActivityStateTest and the inert rendering in AlwaysPaintedViewTest.
// These tests pin only what the composition adds: a covered screen turns inert already on its first, still
// painted frame, and a hidden <Activity> really removes the content from the rendered output while the React
// tree stays mounted.
describe('ScreenActivityWrapper', () => {
    it('takes a covered screen out of accessibility on its first, still painted render', () => {
        renderWrapper(true);

        expect(screen.queryByTestId('content')).toBeNull();
        expect(screen.getByTestId('content', {includeHiddenElements: true})).toBeOnTheScreen();
    });

    it('hides a covered screen after its first render but keeps it mounted', () => {
        const {toJSON} = renderWrapper(true);
        completeFirstRender();

        expect(toJSON()).toBeNull();
        expect(screen.getByTestId('content', {includeHiddenElements: true})).toBeOnTheScreen();
    });
});
