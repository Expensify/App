import {render} from '@testing-library/react-native';

import HeaderLoadingBar from '@components/HeaderLoadingBar';
import LoadingBar from '@components/LoadingBar';

import {useLoadingBarVisibility} from '@hooks/useInFlightRequests';
import useResponsiveLayout from '@hooks/useResponsiveLayout';

import Accessibility from '@libs/Accessibility';

import React from 'react';
import {View} from 'react-native';

jest.mock('@hooks/useThemeStyles', () => () => ({progressBarWrapper: {}, progressBar: {width: '100%'}}));
jest.mock('@hooks/useInFlightRequests', () => ({useLoadingBarVisibility: jest.fn()}));
jest.mock('@hooks/useResponsiveLayout', () => jest.fn());

describe('LoadingBar', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('animates the indicator whenever mounted', () => {
        // Given motion is enabled, so a mounted loading bar should show progress
        jest.spyOn(Accessibility, 'useReducedMotion').mockReturnValue(false);

        // When the parent mounts the bar
        const result = render(<LoadingBar />);

        // Then the indicator loops after its initial delay, without any state in the bar
        expect(result.UNSAFE_getAllByType(View).at(-1)?.props.style).toEqual(
            expect.arrayContaining([expect.objectContaining({animationIterationCount: 'infinite', animationDelay: '300ms'})]),
        );
    });

    it('does not loop the indicator when reduced motion is enabled', () => {
        // Given the user has asked for reduced motion
        jest.spyOn(Accessibility, 'useReducedMotion').mockReturnValue(true);

        // When the parent mounts the bar
        const result = render(<LoadingBar />);

        // Then the indicator stays at zero width instead of looping
        expect(result.UNSAFE_getAllByType(View).at(-1)?.props.style).toEqual(expect.arrayContaining([{width: '0%'}]));
        expect(result.UNSAFE_getAllByType(View).at(-1)?.props.style).not.toEqual(expect.arrayContaining([expect.objectContaining({animationIterationCount: 'infinite'})]));
    });
});

describe('HeaderLoadingBar', () => {
    it.each([
        {isLoading: false, isNarrow: true, shouldMount: false},
        {isLoading: true, isNarrow: false, shouldMount: false},
        {isLoading: true, isNarrow: true, shouldMount: true},
    ])('mounts the bar only while loading in a narrow layout: loading $isLoading, narrow $isNarrow', ({isLoading, isNarrow, shouldMount}) => {
        // Given whether a request is loading and whether the layout is narrow
        jest.mocked(useLoadingBarVisibility).mockReturnValue(isLoading);
        jest.mocked(useResponsiveLayout).mockReturnValue({
            shouldUseNarrowLayout: isNarrow,
            isSmallScreenWidth: isNarrow,
            isInNarrowPaneModal: false,
            isExtraSmallScreenHeight: false,
            isExtraSmallScreenWidth: false,
            isMediumScreenWidth: false,
            onboardingIsMediumOrLargerScreenWidth: !isNarrow,
            isLargeScreenWidth: !isNarrow,
            isExtraLargeScreenWidth: false,
            isSmallScreen: isNarrow,
            isInLandscapeMode: false,
        });

        // When the header decides whether to render the bar
        const result = render(<HeaderLoadingBar />);

        // Then the bar is mounted only when it should be visible, so mounting and unmounting drive its fade-in and fade-out
        expect(result.UNSAFE_queryByType(LoadingBar) !== null).toBe(shouldMount);
    });
});
