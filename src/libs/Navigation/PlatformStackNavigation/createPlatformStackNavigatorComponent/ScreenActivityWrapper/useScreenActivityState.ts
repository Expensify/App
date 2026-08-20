import useDeferVisibleUntilFocusTransitionEnd from '@hooks/useDeferVisibleUntilFocusTransitionEnd';

import type {ActivityProps} from 'react';

import {useIsFocused} from '@react-navigation/native';
import {useEffect, useState} from 'react';

import useIsWindowSizeChanging from './useIsWindowSizeChanging';

// requestAnimationFrame never fires in a background app or a hidden browser tab, where a screen that mounts would
// otherwise keep rendering at full priority. Whichever fires first wins.
const FIRST_RENDER_FALLBACK_DELAY_MS = 100;

type ScreenActivityState = {
    /** Activity mode the screen renders with */
    mode: ActivityProps['mode'];

    /** Whether the screen is covered right now, which is what its accessibility state follows */
    isScreenCovered: boolean;
};

/**
 * Returns the Activity mode of a screen and whether it is covered. The two are separate because the accessibility
 * state must follow the navigation state with no delay, while the mode deliberately lags behind it. A
 * screen is covered when another screen of its own navigator is on top of it (isScreenBlurred) or when the whole
 * navigator lost focus to a route higher in the tree (useIsFocused).
 *
 * The mode does not simply mirror the covered state, because a covered screen sometimes has to render as visible.
 * Each of the cases below compensates for a specific property of a hidden Activity:
 *
 * - React never mounts the effects of a hidden Activity, so a screen that mounts while covered would start its
 *   mount work, such as its openReport fetch, only in the reveal commit, and the reveal would show a loading
 *   screen. The first frame of a covered screen therefore renders visible, which runs the mount lifecycle at
 *   mount time, so the fetched data reaches the Onyx cache while the screen is hidden and the reveal re-runs
 *   the effects against warm data. Pre-mounted destinations (usePreMountDestination) and deep-linked stacks
 *   depend on this prewarming.
 * - A hidden Activity may not update its layout when the window size changes, so the mode switches to visible
 *   for the duration of the resize, which lets the screen render its new layout before it is revealed.
 * - A reveal applies in a single commit, so it is deferred until the navigation transition ends. Revealing
 *   together with the navigation update used to block the main thread for hundreds of milliseconds during a pop.
 */
function useScreenActivityState(isScreenBlurred: boolean): ScreenActivityState {
    const isFocused = useIsFocused();
    const isWindowSizeChanging = useIsWindowSizeChanging();
    const [hasCompletedFirstRender, setHasCompletedFirstRender] = useState(false);

    useEffect(() => {
        const rafID = requestAnimationFrame(() => setHasCompletedFirstRender(true));
        const timeoutID = setTimeout(() => setHasCompletedFirstRender(true), FIRST_RENDER_FALLBACK_DELAY_MS);
        return () => {
            cancelAnimationFrame(rafID);
            clearTimeout(timeoutID);
        };
    }, []);

    const isScreenCovered = isScreenBlurred || !isFocused;
    const isShownAfterTransition = useDeferVisibleUntilFocusTransitionEnd(!isScreenCovered);
    const isKeptVisible = !hasCompletedFirstRender || isWindowSizeChanging;
    const [isRevealLatched, setIsRevealLatched] = useState(false);

    if (isScreenCovered && isRevealLatched) {
        setIsRevealLatched(false);
    } else if (!isScreenCovered && isKeptVisible && !isShownAfterTransition && !isRevealLatched) {
        setIsRevealLatched(true);
    }

    return {
        mode: isKeptVisible || isShownAfterTransition || (!isScreenCovered && isRevealLatched) ? 'visible' : 'hidden',
        isScreenCovered,
    };
}

export default useScreenActivityState;
export {FIRST_RENDER_FALLBACK_DELAY_MS};
