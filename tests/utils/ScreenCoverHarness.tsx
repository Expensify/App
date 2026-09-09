import {render} from '@testing-library/react-native';

import type {ReactElement, ReactNode} from 'react';

import React, {Activity} from 'react';

import waitForBatchedUpdatesWithAct from './waitForBatchedUpdatesWithAct';

/**
 * How a covered screen behaves in the harness.
 *
 * `activity` mirrors `ScreenActivityWrapper`: a hidden `<Activity>` cleans up the subtree's effects and re-runs them
 * from scratch on reveal, while state and refs survive. `none` mirrors what the Home tab has on web today, where no
 * wrapper exists and a blurred tab keeps its effect tree mounted, so covering and uncovering never touches an effect.
 *
 * The default is `activity`, which is what CI checks. Setting the SCREEN_COVER_MODE env var to `none` runs the same
 * suite against today's behavior, which shows which expectations the migration actually changes.
 */
type CoverMode = 'activity' | 'none';

function getCoverMode(): CoverMode {
    return process.env.SCREEN_COVER_MODE === 'none' ? 'none' : 'activity';
}

function ScreenCover({isCovered, children}: {isCovered: boolean; children: ReactNode}) {
    if (getCoverMode() === 'none') {
        return children;
    }

    return <Activity mode={isCovered ? 'hidden' : 'visible'}>{children}</Activity>;
}

type RenderScreenWithCoverOptions = {
    /**
     * Mounts the screen already covered, the way a deep link or a pre-mounted destination mounts a screen underneath
     * the one the user is looking at. The mount lifecycle still runs in that case, because `ScreenActivityWrapper`
     * renders the first frame visible (`isKeptVisible = !hasCompletedFirstRender`) and React never mounts the effects
     * of a hidden `<Activity>`.
     */
    startCovered?: boolean;
};

/**
 * Renders `ui` as the content of a screen that can be covered and uncovered, the way another tab, a root-level modal
 * or an RHP covers the Home tab and reveals it again on the way back.
 */
function renderScreenWithCover(ui: ReactElement, {startCovered = false}: RenderScreenWithCoverOptions = {}) {
    // Cloning gives every pass a fresh element, so the subject re-renders the way a navigation state change
    // re-renders both screens instead of React bailing out on an identical element.
    const cover = (isCovered: boolean) => <ScreenCover isCovered={isCovered}>{React.cloneElement(ui)}</ScreenCover>;

    // The first frame is always visible, so the mount lifecycle runs before anything can hide the screen.
    const {rerender, unmount} = render(cover(false));

    const setCovered = async (isCovered: boolean) => {
        rerender(cover(isCovered));
        await waitForBatchedUpdatesWithAct();
    };

    if (startCovered) {
        rerender(cover(true));
    }

    return {
        hide: () => setCovered(true),
        reveal: () => setCovered(false),
        unmount,
    };
}

export default renderScreenWithCover;
export {getCoverMode, ScreenCover};
export type {CoverMode};
