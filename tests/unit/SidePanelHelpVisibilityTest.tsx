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

let mockIsExtraLargeScreenWidth = false;
jest.mock('@hooks/useResponsiveLayout', () => () => ({shouldUseNarrowLayout: false, isExtraLargeScreenWidth: mockIsExtraLargeScreenWidth}));

const mockUseSidePanelDisplayStatus = jest.mocked(useSidePanelDisplayStatus);

/** Drives the only input the provider's Help visibility logic reacts to, so the test needs no navigator and no viewport. */
function setSidePanelHidden(shouldHideSidePanel: boolean, shouldHideHelpButton = !shouldHideSidePanel) {
    mockUseSidePanelDisplayStatus.mockReturnValue({
        sidePanelNVP: {open: !shouldHideSidePanel, openNarrowScreen: false, forceConcierge: false},
        shouldHideSidePanel,
        isSidePanelHiddenOrLargeScreen: shouldHideSidePanel,
        shouldHideHelpButton,
        shouldHideSidePanelBackdrop: true,
    });
}

/**
 * Stands in for the slide animation. Under Jest the native driver never completes on its own, so the test holds the
 * end callback and fires it by hand. That is the only way to observe the window where the panel is still mounted.
 */
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

    /**
     * Hands back a completer bound to the animation that started most recently, so a later animation cannot steal it.
     * An interrupted close reports back only after the reopen has registered its own callback, so the test has to
     * capture the close callback while it is still the latest one.
     */
    return function takeLatestSlide() {
        const endCallback = latestEndCallback;
        if (!endCallback) {
            throw new Error('No slide animation has started, so there is no end callback to complete.');
        }
        return (finished: boolean) =>
            act(() => {
                endCallback({finished});
            });
    };
}

function wrapper({children}: PropsWithChildren) {
    return <SidePanelContextProvider>{children}</SidePanelContextProvider>;
}

describe('SidePanelContextProvider (Help visibility)', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
        jest.restoreAllMocks();
        mockIsExtraLargeScreenWidth = false;
        setSidePanelHidden(true);
    });

    it('keeps Help visible on initial mount while the hidden panel runs its initial animation', () => {
        // Given a hidden panel whose mount animation has not finished
        const takeLatestSlide = mockSlideAnimation();

        // When the provider mounts
        const {result} = renderHook(() => useSidePanelState(), {wrapper});

        // Then Help is visible both before and after that no-op animation
        expect(result.current.isSidePanelTransitionEnded).toBe(false);
        expect(result.current.shouldHideHelpButton).toBe(false);
        takeLatestSlide()(true);
        expect(result.current.shouldHideHelpButton).toBe(false);
    });

    it('keeps Help hidden for the whole close animation and shows it after completion', () => {
        // Given an open panel with its opening animation completed
        const takeLatestSlide = mockSlideAnimation();
        setSidePanelHidden(false);
        const {result, rerender} = renderHook(() => useSidePanelState(), {wrapper});
        takeLatestSlide()(true);

        // When Onyx marks the panel closed before the slide-out finishes
        setSidePanelHidden(true);
        rerender({});

        // Then Help stays hidden until the closing panel has left the screen
        expect(result.current.shouldHideSidePanel).toBe(true);
        expect(result.current.shouldHideHelpButton).toBe(true);
        takeLatestSlide()(true);
        expect(result.current.shouldHideHelpButton).toBe(false);
    });

    it('keeps Help visible when the hidden panel crosses the extra-large breakpoint', () => {
        // Given a hidden panel with Help visible
        const takeLatestSlide = mockSlideAnimation();
        const {result, rerender} = renderHook(() => useSidePanelState(), {wrapper});
        takeLatestSlide()(true);

        // When the viewport crosses the breakpoint without opening the panel
        mockIsExtraLargeScreenWidth = true;
        rerender({});

        // Then Help does not disappear on resize
        expect(result.current.shouldHideHelpButton).toBe(false);
    });

    it('does not let an interrupted slide reveal Help during a subsequent close', () => {
        // Given a close animation interrupted by reopening the panel
        const takeLatestSlide = mockSlideAnimation();
        setSidePanelHidden(false);
        const {result, rerender} = renderHook(() => useSidePanelState(), {wrapper});
        takeLatestSlide()(true);
        setSidePanelHidden(true);
        rerender({});
        const finishInterruptedClose = takeLatestSlide();
        setSidePanelHidden(false);
        rerender({});

        // When another close starts before the interrupted callback arrives
        setSidePanelHidden(true);
        rerender({});
        finishInterruptedClose(false);

        // Then only the completed current close can reveal Help
        expect(result.current.shouldHideHelpButton).toBe(true);
        takeLatestSlide()(true);
        expect(result.current.shouldHideHelpButton).toBe(false);
    });

    it('preserves the display hook restrictions after the close animation', () => {
        // Given an open panel on a screen where Help must remain hidden
        const takeLatestSlide = mockSlideAnimation();
        setSidePanelHidden(false);
        const {result, rerender} = renderHook(() => useSidePanelState(), {wrapper});
        takeLatestSlide()(true);

        // When the panel closes but another restriction still hides Help
        setSidePanelHidden(true, true);
        rerender({});
        takeLatestSlide()(true);

        // Then finishing the animation does not override the existing restriction
        expect(result.current.shouldHideHelpButton).toBe(true);
    });
});
