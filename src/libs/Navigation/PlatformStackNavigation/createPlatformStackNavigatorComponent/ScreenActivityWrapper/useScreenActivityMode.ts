import useDeferVisibleUntilFocusTransitionEnd from '@hooks/useDeferVisibleUntilFocusTransitionEnd';

import Log from '@libs/Log';

import type {ActivityProps} from 'react';

import {useIsFocused} from '@react-navigation/native';
import {useEffect, useRef, useState} from 'react';

import useIsWindowSizeChanging from './useIsWindowSizeChanging';

// requestAnimationFrame never fires while the app sits in the background or in a hidden browser tab, so a screen
// that mounts there would keep rendering at full priority until it comes back. Whichever fires first wins.
const FIRST_RENDER_FALLBACK_DELAY_MS = 100;

type ScreenActivityModeParams = {
    /** Whether the screen is covered by another screen inside its own navigator */
    isScreenBlurred: boolean;

    /** Key identifying this screen instance */
    routeKey: string;

    /** Name of the screen whose Activity state is being tracked */
    routeName: string;
};

/**
 * Decides whether a screen is deprioritized with React <Activity>. A screen is hidden when it is covered inside its
 * own navigator (blurred) or when the whole navigator lost focus to another route higher in the tree - useIsFocused
 * is chain-aware, so e.g. the search expense list hides while an RHP is open on top of it.
 *
 * Two cases keep a screen visible no matter what the navigation state says:
 *
 * - The first render always goes through. A screen that mounts while already covered would otherwise start hidden,
 *   and React never mounts the effects of a hidden Activity, so the screen would sit in the stack without ever
 *   fetching its data, subscribing or measuring itself. It goes back to being deprioritized one frame later, which
 *   gives its mount effects a frame to run. This matches how ScreenFreezeWrapper mounts unfrozen and freezes after.
 * - A window resize or an orientation change reveals every screen for the duration of the change, so hidden screens
 *   lay themselves out against the new size while they are still covered instead of doing it in front of the user.
 *
 * Hiding is urgent, revealing waits for the navigation transition to end. Revealing a hidden screen re-renders
 * its whole subtree and re-mounts every effect in it, and deriving the mode directly from the navigation state
 * would put all of that work into the same synchronous commit as the navigation update that revealed the screen.
 * On a pop that single commit blocked the main thread for hundreds of milliseconds before the browser could
 * paint. useDeferVisibleUntilFocusTransitionEnd holds the reveal until the transition completes instead, so the
 * pop commits cheaply and animates undisturbed, and a reveal that another navigation overtakes is cancelled
 * before it costs anything. The screen stays painted the whole time (CustomViewWrapper keeps hidden content
 * visible), so the user sees it immediately and only its updates arrive after the transition.
 */
function useScreenActivityMode({isScreenBlurred, routeKey, routeName}: ScreenActivityModeParams): ActivityProps['mode'] {
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

    const navigationMode: ActivityProps['mode'] = isScreenBlurred || !isFocused ? 'hidden' : 'visible';
    const isShownAfterTransition = useDeferVisibleUntilFocusTransitionEnd(navigationMode === 'visible');
    const isKeptVisible = !hasCompletedFirstRender || isWindowSizeChanging;
    const previousNavigationModeRef = useRef<ActivityProps['mode'] | null>(null);

    // Only navigation driven changes are logged here. The first render pass and window size changes flip every
    // deprioritized screen at once, and windowSizeChangeStore logs the latter once for all of them.
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
