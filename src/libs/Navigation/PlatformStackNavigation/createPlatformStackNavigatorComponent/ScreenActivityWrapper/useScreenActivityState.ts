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
 * Reports how a covered screen is presented, which the wrapper needs in two forms that do not change at the same
 * moment. The accessibility state has to follow the navigation state with no delay in either direction, because a
 * screen the user is already looking at must not stay out of the accessibility tree and the tab order for the
 * length of an animation. React Navigation 8 derives its `inert` flag the same way. The Activity mode deliberately
 * lags behind on the reveal instead, so the two are reported separately.
 *
 * A screen counts as covered in two ways. Another screen of its own navigator sits on top of it, which the caller
 * passes in as isScreenBlurred because only the navigator knows its own top route. Or the whole navigator lost
 * focus to a route higher in the tree, which useIsFocused reports here. The wrapper runs outside
 * descriptor.render(), so that focus is the focus of the navigator rather than of the screen, which covers cases
 * such as the search expense list while an RHP is open on top of it.
 *
 * A screen is deprioritized with React <Activity> for as long as it is covered. Two cases keep it visible whatever
 * the navigation state says:
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
