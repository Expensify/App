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

const mockUseSidePanelDisplayStatus = jest.mocked(useSidePanelDisplayStatus);

/** Drives the only input the provider's session logic reacts to, so the test needs no navigator and no viewport. */
function setSidePanelHidden(shouldHideSidePanel: boolean) {
    mockUseSidePanelDisplayStatus.mockReturnValue({
        sidePanelNVP: {open: !shouldHideSidePanel, openNarrowScreen: false, forceConcierge: false},
        shouldHideSidePanel,
        isSidePanelHiddenOrLargeScreen: shouldHideSidePanel,
        shouldHideHelpButton: !shouldHideSidePanel,
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

describe('SidePanelContextProvider (Concierge session lifetime)', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
        jest.restoreAllMocks();
        setSidePanelHidden(true);
    });

    it('keeps the session alive for the whole close animation, then clears it once the panel unmounts', () => {
        // Given an open Side Panel with an established Concierge session
        const takeLatestSlide = mockSlideAnimation();
        const {result, rerender} = renderHook(() => useSidePanelState(), {wrapper});
        setSidePanelHidden(false);
        rerender({});
        takeLatestSlide()(true);
        const openSessionStartTime = result.current.sessionStartTime;
        expect(openSessionStartTime).not.toBeNull();

        // When the panel starts closing
        setSidePanelHidden(true);
        rerender({});
        const finishClose = takeLatestSlide();

        // Then the session survives while the panel is still mounted and sliding out. Clearing it here is what made
        // the Concierge message list filter every action out mid-animation, collapsing the panel content.
        expect(result.current.isSidePanelTransitionEnded).toBe(false);
        expect(result.current.sessionStartTime).toBe(openSessionStartTime);

        // And it is cleared once the animation completes, in the same commit that unmounts the panel
        finishClose(true);
        expect(result.current.isSidePanelTransitionEnded).toBe(true);
        expect(result.current.sessionStartTime).toBeNull();
    });

    it('does not let an interrupted close wipe the session when the panel is reopened mid-animation', () => {
        // Given an open Side Panel with an established Concierge session
        const takeLatestSlide = mockSlideAnimation();
        const {result, rerender} = renderHook(() => useSidePanelState(), {wrapper});
        setSidePanelHidden(false);
        rerender({});
        takeLatestSlide()(true);
        const openSessionStartTime = result.current.sessionStartTime;
        expect(openSessionStartTime).not.toBeNull();

        // When the panel is closed, its close callback is captured, and the panel is reopened before that close
        // animation gets to finish. Capturing it first is what keeps the reopen from taking its place.
        setSidePanelHidden(true);
        rerender({});
        const finishInterruptedClose = takeLatestSlide();
        setSidePanelHidden(false);
        rerender({});

        // Then the superseded close reports back unfinished and leaves the reopened session intact. Without the
        // `finished` guard this stale callback would wipe the session the reopen just established.
        finishInterruptedClose(false);
        expect(result.current.sessionStartTime).toBe(openSessionStartTime);
    });
});
