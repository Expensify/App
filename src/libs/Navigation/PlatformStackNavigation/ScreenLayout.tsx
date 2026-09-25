import {markScreenClosing, markScreenSettled} from '@libs/Navigation/closingScreens';
import TransitionTracker from '@libs/Navigation/TransitionTracker';
import type {TransitionHandle} from '@libs/Navigation/TransitionTracker';

import type {BottomTabNavigationOptions, BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import type {NativeBottomTabNavigationOptions, NativeBottomTabNavigationProp} from '@react-navigation/bottom-tabs/unstable';
import type {ParamListBase, ScreenLayoutArgs} from '@react-navigation/native';

import React, {useLayoutEffect, useRef} from 'react';

import type {PlatformSpecificNavigationOptions, PlatformStackNavigationOptions} from './types';

// The only navigation capability ScreenLayout actually needs, regardless of which navigator (stack, bottom-tabs, ...)
// it's used with. Keeping this minimal means passing a real (properly-typed) navigation prop into it - e.g. from
// bottomTabScreenLayoutWrapper below - needs no unsafe cast, since every navigator's `addListener` structurally satisfies it.
type TransitionAwareNavigation = {
    addListener(type: 'transitionStart' | 'transitionEnd', callback: (event: {data?: {closing?: boolean}}) => void): () => void;
};

// screenLayout is invoked as a render function (not JSX), so we need this wrapper to create a proper React component boundary for hooks.
function screenLayoutWrapper({navigation, ...rest}: ScreenLayoutArgs<ParamListBase, string, PlatformSpecificNavigationOptions | PlatformStackNavigationOptions, string>) {
    return (
        <ScreenLayout
            {...rest}
            // The type cast is needed because useNavigationBuilder hardcodes the Navigation generic to `string`.
            navigation={navigation as unknown as TransitionAwareNavigation}
        />
    );
}

// Same as screenLayoutWrapper above, but for bottom-tab navigators. No cast needed here - `navigation` is already
// properly typed as BottomTabNavigationProp, and its `addListener` structurally satisfies TransitionAwareNavigation.
function bottomTabScreenLayoutWrapper({navigation, ...rest}: ScreenLayoutArgs<ParamListBase, string, BottomTabNavigationOptions, BottomTabNavigationProp<ParamListBase>>) {
    return (
        <ScreenLayout
            {...rest}
            navigation={navigation}
        />
    );
}

// Same again for the native bottom tab navigator, whose options type differs while its navigation prop still
// carries the `addListener` that ScreenLayout needs.
function nativeBottomTabScreenLayoutWrapper({navigation, ...rest}: ScreenLayoutArgs<ParamListBase, string, NativeBottomTabNavigationOptions, NativeBottomTabNavigationProp<ParamListBase>>) {
    return (
        <ScreenLayout
            {...rest}
            navigation={navigation}
        />
    );
}

type ScreenLayoutProps = ScreenLayoutArgs<
    ParamListBase,
    string,
    PlatformSpecificNavigationOptions | PlatformStackNavigationOptions | BottomTabNavigationOptions | NativeBottomTabNavigationOptions,
    TransitionAwareNavigation
>;

function ScreenLayout({children, navigation, route}: ScreenLayoutProps) {
    const transitionHandleRef = useRef<TransitionHandle | null>(null);
    // Net-count overlapping starts so a single handle spans rapid back/forward re-fires — no decrement-to-zero seam for `runAfterTransitions` to flush through, and `transitionEnd` for the wrong leg can't end the active one.
    const pendingTransitionsRef = useRef(0);

    useLayoutEffect(() => {
        const transitionStartListener = navigation.addListener('transitionStart', (event) => {
            // A closing transition starts as soon as an interactive swipe does, which is the only chance anything
            // drawn outside the screens has to react before the pop commits.
            if (event.data?.closing) {
                markScreenClosing(route.key);
            } else {
                markScreenSettled(route.key);
            }
            pendingTransitionsRef.current += 1;
            if (!transitionHandleRef.current) {
                transitionHandleRef.current = TransitionTracker.startTransition('navigation');
            }
        });
        const transitionEndListener = navigation.addListener('transitionEnd', () => {
            markScreenSettled(route.key);
            if (pendingTransitionsRef.current > 0) {
                pendingTransitionsRef.current -= 1;
            }
            if (pendingTransitionsRef.current === 0 && transitionHandleRef.current) {
                TransitionTracker.endTransition(transitionHandleRef.current);
                transitionHandleRef.current = null;
            }
        });

        return () => {
            transitionStartListener();
            transitionEndListener();
            markScreenSettled(route.key);
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
    }, [navigation, route.key]);

    return children;
}

export default screenLayoutWrapper;
export {bottomTabScreenLayoutWrapper, nativeBottomTabScreenLayoutWrapper};
