import useDeferVisibleUntilFocusTransitionEnd from '@hooks/useDeferVisibleUntilFocusTransitionEnd';

import Log from '@libs/Log';

import type {ActivityProps} from 'react';

import {useEffect, useRef, useState} from 'react';

import useIsWindowSizeChanging from './useIsWindowSizeChanging';

// requestAnimationFrame never fires in a background app or a hidden browser tab, where a screen that mounts would
// otherwise keep rendering at full priority. Whichever fires first wins.
const FIRST_RENDER_FALLBACK_DELAY_MS = 100;

type ScreenActivityModeParams = {
    /** Whether the screen is covered right now, as useIsScreenCovered reports it */
    isScreenCovered: boolean;

    /** Key identifying this screen instance */
    routeKey: string;

    /** Name of the screen whose Activity state is being tracked */
    routeName: string;
};

/**
 * Decides whether a screen is deprioritized with React <Activity>. A screen is hidden as long as it is covered.
 * The covered state is passed in rather than read here, because the accessibility state has to follow it with no
 * delay while this mode deliberately lags behind it on the reveal.
 *
 * Two cases keep a screen visible whatever the navigation state says:
 *
 * - The first render always goes through, because React never mounts the effects of a hidden Activity, so a screen
 *   that mounts while already covered would sit in the stack without ever fetching its data, subscribing or
 *   measuring itself. It is deprioritized one frame later, the same way ScreenFreezeWrapper mounts unfrozen.
 * - A window resize or an orientation change reveals every screen for the duration of the change, so hidden screens
 *   lay themselves out against the new size instead of doing it in front of the user.
 *
 * Hiding is urgent, revealing waits for the navigation transition to end. A reveal re-renders the whole subtree and
 * re-mounts every effect in it, and taking the mode straight from the navigation state put all of that into the
 * same commit as the navigation update, which blocked the main thread for hundreds of milliseconds on a pop.
 * useDeferVisibleUntilFocusTransitionEnd holds the reveal until the transition completes, so the pop commits
 * cheaply and a reveal that another navigation overtakes is cancelled before it costs anything. The screen stays
 * painted the whole time, so only its updates arrive after the transition.
 */
function useScreenActivityMode({isScreenCovered, routeKey, routeName}: ScreenActivityModeParams): ActivityProps['mode'] {
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

    const navigationMode: ActivityProps['mode'] = isScreenCovered ? 'hidden' : 'visible';
    const isShownAfterTransition = useDeferVisibleUntilFocusTransitionEnd(navigationMode === 'visible');
    const isKeptVisible = !hasCompletedFirstRender || isWindowSizeChanging;
    const previousNavigationModeRef = useRef<ActivityProps['mode'] | null>(null);

    // Only navigation driven changes are logged. The first render and window size changes flip every deprioritized
    // screen at once, and windowSizeChangeStore logs those once for all of them.
    useEffect(() => {
        if (previousNavigationModeRef.current === navigationMode) {
            return;
        }

        const isFirstMount = previousNavigationModeRef.current === null;
        previousNavigationModeRef.current = navigationMode;
        Log.info(`[ScreenActivityWrapper] ${isFirstMount ? 'Activity mounted' : 'Activity state changed'}`, false, {
            routeKey,
            routeName,
            navigationMode,
        });
    }, [navigationMode, routeKey, routeName]);

    if (isKeptVisible) {
        return 'visible';
    }
    return isShownAfterTransition ? 'visible' : 'hidden';
}

export default useScreenActivityMode;
