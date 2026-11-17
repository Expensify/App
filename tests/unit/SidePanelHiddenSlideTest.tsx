import {act, renderHook} from '@testing-library/react-native';

import SidePanelContextProvider from '@components/SidePanel/SidePanelContextProvider';

import useSidePanelDisplayStatus from '@hooks/useSidePanelDisplayStatus';
import useSidePanelState from '@hooks/useSidePanelState';

import ONYXKEYS from '@src/ONYXKEYS';

import type {PropsWithChildren} from 'react';

import React from 'react';
// The provider animates with Animated from 'react-native', so the test has to reach for the same module to drive it.
// eslint-disable-next-line no-restricted-imports
import {Animated} from 'react-native';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@hooks/useSidePanelDisplayStatus');

const DEFAULT_WIDTH = 375;
const DRAGGED_WIDTH = 800;
const CLAMPED_WIDTH = 600;

let mockSidePanelWidth = DRAGGED_WIDTH;
jest.mock('@hooks/useSidePanelWidth', () => () => ({width: mockSidePanelWidth, bounds: {min: 375, max: 1000}, isResizable: true}));

// A wide layout, where the panel has the dragged width rather than the window's.
jest.mock('@hooks/useResponsiveLayout', () => () => ({shouldUseNarrowLayout: false, isExtraLargeScreenWidth: false}));

const mockUseSidePanelDisplayStatus = jest.mocked(useSidePanelDisplayStatus);

/** Drives whether the panel is shown, so the test needs no navigator. */
function setSidePanelHidden(shouldHideSidePanel: boolean) {
    mockUseSidePanelDisplayStatus.mockReturnValue({
        sidePanelNVP: {open: !shouldHideSidePanel, openNarrowScreen: false, forceConcierge: false},
        shouldHideSidePanel,
        isSidePanelHiddenOrLargeScreen: shouldHideSidePanel,
        shouldHideHelpButton: !shouldHideSidePanel,
        shouldHideSidePanelBackdrop: true,
    });
}

/** Under Jest the native driver never completes on its own, so the test holds the slide's end callback and fires it by hand. */
function mockSlideAnimation() {
    let latestEndCallback: ((result: {finished: boolean}) => void) | undefined;
    const realParallel = Animated.parallel;
    jest.spyOn(Animated, 'parallel').mockImplementation((animations) => {
        const composite = realParallel(animations);
        composite.start = (callback?: (result: {finished: boolean}) => void) => {
            latestEndCallback = callback;
        };
        return composite;
    });

    return function finishLatestSlide() {
        const endCallback = latestEndCallback;
        if (!endCallback) {
            throw new Error('No slide animation has started, so there is no end callback to complete.');
        }
        act(() => {
            endCallback({finished: true});
        });
    };
}

/** Records the panel's slide distance each time it's set. */
function trackTranslateX(translateX: Animated.Value) {
    const tracked = {value: Number.NaN};
    translateX.addListener(({value}) => {
        tracked.value = value;
    });
    return tracked;
}

function wrapper({children}: PropsWithChildren) {
    return <SidePanelContextProvider>{children}</SidePanelContextProvider>;
}

describe('SidePanelContextProvider (hidden slide distance)', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
        jest.restoreAllMocks();
        mockSidePanelWidth = DRAGGED_WIDTH;
        setSidePanelHidden(true);
    });

    it('moves a hidden panel to its new width, so the next open slides in from just off-screen', () => {
        // Given a hidden panel waiting off-screen at its dragged width
        const finishLatestSlide = mockSlideAnimation();
        const {result, rerender} = renderHook(() => useSidePanelState(), {wrapper});
        finishLatestSlide();
        const translateX = trackTranslateX(result.current.sidePanelTranslateX.current);

        // When the window shrinks and re-clamps the width while the panel is hidden
        mockSidePanelWidth = CLAMPED_WIDTH;
        rerender({});

        // Then the panel waits at the new width. Left at the old one, it would stay fully off-screen for the first part of the next open.
        expect(translateX.value).toBe(CLAMPED_WIDTH);
    });

    it('lands a panel whose width changed while it slid out on the new width', () => {
        // Given an open panel at its dragged width
        const finishLatestSlide = mockSlideAnimation();
        const {result, rerender} = renderHook(() => useSidePanelState(), {wrapper});
        finishLatestSlide();
        setSidePanelHidden(false);
        rerender({});
        finishLatestSlide();
        const translateX = trackTranslateX(result.current.sidePanelTranslateX.current);

        // When it starts closing, and its width resets to the default before the slide ends
        setSidePanelHidden(true);
        rerender({});
        mockSidePanelWidth = DEFAULT_WIDTH;
        rerender({});
        finishLatestSlide();

        // Then it waits at the default width, so the next open doesn't start partly on screen
        expect(translateX.value).toBe(DEFAULT_WIDTH);
    });
});
