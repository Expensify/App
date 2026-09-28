import AlwaysPaintedView from '@components/AlwaysPaintedView';

import useDeferVisibleUntilFocusTransitionEnd from '@hooks/useDeferVisibleUntilFocusTransitionEnd';

import type NonTopScreenWrapperProps from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigatorComponent/nonTopScreenWrapperTypes';

import {useIsFocused} from '@react-navigation/native';
import React, {Activity, useEffect, useState, useSyncExternalStore} from 'react';

import DevStrictModeMountGate from './StrictModeMountGate';
import {getIsWindowSizeChanging, subscribeToWindowSizeChange} from './windowSizeChangeStore';

// requestAnimationFrame never fires in a background app or a hidden browser tab, where a screen that mounts would
// otherwise keep rendering at full priority. Whichever fires first wins.
const FIRST_RENDER_FALLBACK_DELAY_MS = 100;

/**
 * Deprioritizes rendering of a covered screen with React <Activity>. Unlike react-freeze, a hidden Activity keeps
 * processing updates at background priority and runs effect cleanups, so a modal that is still dismissing when the
 * screen gets covered always finishes its close chain. AlwaysPaintedView keeps the hidden content painted, so a
 * covered screen that is still shown (for example dimmed under the RHP overlay) does not disappear, and it takes
 * that content out of accessibility and touch handling while it is covered.
 *
 * StrictMode is the qualification gate for screens that opt into Activity. Its double effect mount in dev exercises
 * the same cleanup and re-run lifecycle as a hide and reveal cycle, so an effect that would misbehave under a cover
 * fails during development instead. StrictModeMountGate commits StrictMode one commit ahead of the screen content,
 * which is what makes React run that cycle for a StrictMode nested below the root.
 *
 * The mode does not simply mirror the covered state, because a covered screen sometimes has to render as visible.
 * Each case commented below compensates for a specific property of a hidden Activity.
 */
function ScreenActivityWrapper({isScreenBlurred, children}: NonTopScreenWrapperProps) {
    const isFocused = useIsFocused();
    const isWindowSizeChanging = useSyncExternalStore(subscribeToWindowSizeChange, getIsWindowSizeChanging, getIsWindowSizeChanging);
    const [hasCompletedFirstRender, setHasCompletedFirstRender] = useState(false);
    const [isRevealLatched, setIsRevealLatched] = useState(false);

    useEffect(() => {
        const rafID = requestAnimationFrame(() => setHasCompletedFirstRender(true));
        const timeoutID = setTimeout(() => setHasCompletedFirstRender(true), FIRST_RENDER_FALLBACK_DELAY_MS);
        return () => {
            cancelAnimationFrame(rafID);
            clearTimeout(timeoutID);
        };
    }, []);

    // A screen is covered when another screen of its own navigator is on top of it (isScreenBlurred) or when the whole
    // navigator lost focus to a route higher in the tree (useIsFocused). The accessibility state follows this with no
    // delay, while the mode below deliberately lags behind it.
    const isScreenCovered = isScreenBlurred || !isFocused;

    // A reveal applies in a single commit, so it is deferred until the navigation transition ends. Revealing together
    // with the navigation update used to block the main thread for hundreds of milliseconds during a pop.
    const isShownAfterTransition = useDeferVisibleUntilFocusTransitionEnd(!isScreenCovered);

    // React never mounts the effects of a hidden Activity, so a screen that mounts while covered would start its mount
    // work, such as its openReport fetch, only in the reveal commit, and the reveal would show a loading screen. The
    // first frame of a covered screen therefore renders visible, which runs the mount lifecycle at mount time, so the
    // fetched data reaches the Onyx cache while the screen is hidden and the reveal re-runs the effects against warm
    // data. Pre-mounted destinations (usePreMountDestination) and deep-linked stacks depend on this prewarming.
    // A hidden Activity also cannot follow a window size change, because the effects that would listen to it are
    // unmounted and its updates run at background priority, so the screen switches to visible for the duration of
    // the resize and lays itself out for the new size before it is revealed.
    const isKeptVisible = !hasCompletedFirstRender || isWindowSizeChanging;

    // An uncovered screen must never be hidden again, because hiding would clean up its effects and demote its
    // updates to background priority while the user can already interact with it. When one of the cases above
    // renders a screen as visible while it is already uncovered, this latch holds that mode until the deferred
    // reveal takes over.
    if (isScreenCovered && isRevealLatched) {
        setIsRevealLatched(false);
    } else if (!isScreenCovered && isKeptVisible && !isShownAfterTransition && !isRevealLatched) {
        setIsRevealLatched(true);
    }

    const mode = isKeptVisible || isShownAfterTransition || (!isScreenCovered && isRevealLatched) ? 'visible' : 'hidden';

    return (
        <Activity mode={mode}>
            <AlwaysPaintedView inert={isScreenCovered}>
                <DevStrictModeMountGate>{children}</DevStrictModeMountGate>
            </AlwaysPaintedView>
        </Activity>
    );
}

export default ScreenActivityWrapper;
export {FIRST_RENDER_FALLBACK_DELAY_MS};
