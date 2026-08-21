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
 * state must follow the navigation state with no delay, while the mode deliberately lags behind on the reveal. A
 * screen is covered when another screen of its own navigator is on top of it (isScreenBlurred) or when the whole
 * navigator lost focus to a route higher in the tree (useIsFocused).
 *
 * A covered screen still renders visible on its first render, because React never mounts the effects of a hidden
 * Activity, so a screen that mounts while covered would never fetch its data. It also stays visible while the
 * window size is changing, so it lays itself out against the new size before it is revealed. The reveal itself
 * waits for the navigation transition to end, because revealing in the same commit as the navigation update
 * blocked the main thread for hundreds of milliseconds on a pop.
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

    return {
        mode: isKeptVisible || isShownAfterTransition ? 'visible' : 'hidden',
        isScreenCovered,
    };
}

export default useScreenActivityState;
