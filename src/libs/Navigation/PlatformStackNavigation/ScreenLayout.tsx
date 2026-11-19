import HorizontalSafeArea from '@components/HorizontalSafeArea';

import {setRevealedUnderRouteKey} from '@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/tabRootRevealStore';
import {isTabRootScreen} from '@libs/Navigation/helpers/isTabRouteAtRoot';
import TransitionTracker from '@libs/Navigation/TransitionTracker';
import type {TransitionHandle} from '@libs/Navigation/TransitionTracker';

import NAVIGATORS from '@src/NAVIGATORS';

import type {BottomTabNavigationOptions} from '@react-navigation/bottom-tabs';
import type {NativeBottomTabNavigationOptions} from '@react-navigation/bottom-tabs/unstable';
import type {NavigationState, ParamListBase, ScreenLayoutArgs} from '@react-navigation/native';

import React, {useLayoutEffect, useRef} from 'react';

import type {PlatformSpecificNavigationOptions, PlatformStackNavigationOptions} from './types';

const NAVIGATOR_NAMES = new Set<string>(Object.values(NAVIGATORS));

// The only navigation capabilities ScreenLayout actually needs, regardless of which navigator (stack, bottom-tabs, ...)
// it's used with. Keeping this minimal means passing a real (properly-typed) navigation prop into it - e.g. from
// bottomTabScreenLayoutWrapper below - needs no unsafe cast, since every navigator's `addListener` and `getState` structurally satisfy it.
type TransitionAwareNavigation = {
    addListener(type: 'transitionStart' | 'transitionEnd' | 'gestureCancel', callback: (event: {data?: {closing?: boolean}}) => void): () => void;
    getState(): NavigationState;
};

/**
 * A screen named after a navigator hosts one and spans the whole window: a stack clips the screen it slides in or out,
 * so it has to be laid out across the window rather than inside the safe area. Every other screen keeps out of the
 * horizontal safe area itself, which is a no-op under a screen that already does.
 */
function keepOutOfHorizontalSafeArea(routeName: string, screen: React.ReactElement) {
    return NAVIGATOR_NAMES.has(routeName) ? screen : <HorizontalSafeArea>{screen}</HorizontalSafeArea>;
}

// screenLayout is invoked as a render function (not JSX), so we need this wrapper to create a proper React component boundary for hooks.
function screenLayoutWrapper({navigation, ...rest}: ScreenLayoutArgs<ParamListBase, string, PlatformSpecificNavigationOptions, string>) {
    // The type cast is needed because useNavigationBuilder hardcodes the Navigation generic to `string`.
    const transitionAwareNavigation = navigation as unknown as TransitionAwareNavigation;
    return keepOutOfHorizontalSafeArea(
        rest.route.name,
        <ScreenLayout
            {...rest}
            navigation={transitionAwareNavigation}
        />,
    );
}

// Same as screenLayoutWrapper above, but for bottom-tab navigators, JS and native. No cast needed here - their
// `navigation` props' `addListener` structurally satisfies TransitionAwareNavigation.
function bottomTabScreenLayoutWrapper(props: ScreenLayoutProps) {
    return keepOutOfHorizontalSafeArea(props.route.name, <ScreenLayout {...props} />);
}

type ScreenLayoutProps = ScreenLayoutArgs<
    ParamListBase,
    string,
    PlatformSpecificNavigationOptions | PlatformStackNavigationOptions | BottomTabNavigationOptions | NativeBottomTabNavigationOptions,
    TransitionAwareNavigation
>;

function ScreenLayout({children, navigation, route}: ScreenLayoutProps) {
    const routeKey = route.key;
    const transitionHandleRef = useRef<TransitionHandle | null>(null);
    // Net-count overlapping starts so a single handle spans rapid back/forward re-fires — no decrement-to-zero seam for `runAfterTransitions` to flush through, and `transitionEnd` for the wrong leg can't end the active one.
    const pendingTransitionsRef = useRef(0);

    useLayoutEffect(() => {
        const transitionStartListener = navigation.addListener('transitionStart', (event) => {
            const state = navigation.getState();
            const isFocusedInStack = state.routes.at(state.index)?.key === routeKey;
            // A back swipe starts closing the screen while it is still focused, since the pop only lands once the swipe ends.
            if (event.data?.closing && isFocusedInStack && state.index > 0 && isTabRootScreen(state.routes.at(state.index - 1)?.name)) {
                setRevealedUnderRouteKey(routeKey);
            }
            pendingTransitionsRef.current += 1;
            if (!transitionHandleRef.current) {
                transitionHandleRef.current = TransitionTracker.startTransition('navigation');
            }
        });
        const transitionEndListener = navigation.addListener('transitionEnd', () => {
            if (pendingTransitionsRef.current > 0) {
                pendingTransitionsRef.current -= 1;
            }
            if (pendingTransitionsRef.current === 0 && transitionHandleRef.current) {
                TransitionTracker.endTransition(transitionHandleRef.current);
                transitionHandleRef.current = null;
            }
        });
        // A cancelled back swipe leaves the screen in place, so the bar has to hide again.
        const gestureCancelListener = navigation.addListener('gestureCancel', () => {
            setRevealedUnderRouteKey(undefined);
        });

        return () => {
            gestureCancelListener();
            transitionStartListener();
            transitionEndListener();
            const handleToEnd = transitionHandleRef.current;
            transitionHandleRef.current = null;
            pendingTransitionsRef.current = 0;
            if (!handleToEnd) {
                return;
            }
            // Defer one frame so the incoming screen's `transitionStart` bumps `activeNavigationCount` first; an unmount mid-rapid-back/forward would otherwise drop the count to zero and flush any queued `runAfterTransitions` callback before the new screen mounts.
            requestAnimationFrame(() => {
                TransitionTracker.endTransition(handleToEnd);
            });
        };
    }, [navigation, routeKey]);

    return children;
}

export default screenLayoutWrapper;
export {bottomTabScreenLayoutWrapper};
