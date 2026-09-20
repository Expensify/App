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
 * end callback and fires it by hand — that is the only way to observe the window where the panel is still mounted.
 */
function mockSlideAnimation() {
    let endCallback: ((result: {finished: boolean}) => void) | undefined;
    const realParallel = Animated.parallel;
    jest.spyOn(Animated, 'parallel').mockImplementation((animations) => {
        const composite = realParallel(animations);
        composite.start = (callback?: (result: {finished: boolean}) => void) => {
            endCallback = callback;
        };
        return composite;
    });
    return (finished: boolean) =>
        act(() => {
            endCallback?.({finished});
        });
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
        const endSlide = mockSlideAnimation();
        const {result, rerender} = renderHook(() => useSidePanelState(), {wrapper});
        setSidePanelHidden(false);
        rerender({});
        endSlide(true);
        const openSessionStartTime = result.current.sessionStartTime;
        expect(openSessionStartTime).not.toBeNull();

        // When the panel starts closing
        setSidePanelHidden(true);
        rerender({});

        // Then the session survives while the panel is still mounted and sliding out. Clearing it here is what made
        // the Concierge message list filter every action out mid-animation, collapsing the panel content.
        expect(result.current.isSidePanelTransitionEnded).toBe(false);
        expect(result.current.sessionStartTime).toBe(openSessionStartTime);

        // And it is cleared once the animation completes, in the same commit that unmounts the panel
        endSlide(true);
        expect(result.current.isSidePanelTransitionEnded).toBe(true);
        expect(result.current.sessionStartTime).toBeNull();
    });

    it('does not let an interrupted close wipe the session when the panel is reopened mid-animation', () => {
        // Given an open Side Panel with an established Concierge session
        const endSlide = mockSlideAnimation();
        const {result, rerender} = renderHook(() => useSidePanelState(), {wrapper});
        setSidePanelHidden(false);
        rerender({});
        endSlide(true);
        const openSessionStartTime = result.current.sessionStartTime;
        expect(openSessionStartTime).not.toBeNull();

        // When the panel is closed and reopened before the close animation finishes
        setSidePanelHidden(true);
        rerender({});
        setSidePanelHidden(false);
        rerender({});

        // Then the interrupted close reports back unfinished and leaves the session intact
        endSlide(false);
        expect(result.current.sessionStartTime).toBe(openSessionStartTime);
    });
});
