import navigationRef from '@libs/Navigation/navigationRef';
import TransitionTracker from '@libs/Navigation/TransitionTracker';
import type {TransitionHandle} from '@libs/Navigation/TransitionTracker';

import type {BottomTabNavigationOptions, BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import type {ParamListBase, ScreenLayoutArgs} from '@react-navigation/native';

import React, {useLayoutEffect, useRef} from 'react';

import type {PlatformSpecificNavigationOptions, PlatformStackNavigationOptions} from './types';

// The only navigation capability ScreenLayout actually needs, regardless of which navigator (stack, bottom-tabs, ...)
// it's used with. Keeping this minimal means passing a real (properly-typed) navigation prop into it - e.g. from
// bottomTabScreenLayoutWrapper below - needs no unsafe cast, since every navigator's `addListener` structurally satisfies it.
type TransitionAwareNavigation = {
    addListener(type: 'transitionStart' | 'transitionEnd', callback: () => void): () => void;
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
            isTabScreen
        />
    );
}

type ScreenLayoutProps = ScreenLayoutArgs<
    ParamListBase,
    string,
    PlatformSpecificNavigationOptions | PlatformStackNavigationOptions | BottomTabNavigationOptions,
    TransitionAwareNavigation
> & {
    /** Whether this instance belongs to a bottom-tab navigator's screenLayout. Tab routes can host their own
     *  nested navigator, so only the currently focused leaf route inside it should register with TransitionTracker -
     *  the tab route's own transitionStart/transitionEnd would otherwise be redundant with the nested screen's. */
    isTabScreen?: boolean;
};

function ScreenLayout({children, navigation, route, isTabScreen}: ScreenLayoutProps) {
    const transitionHandleRef = useRef<TransitionHandle | null>(null);

    useLayoutEffect(() => {
        const transitionStartListener = navigation.addListener('transitionStart', () => {
            if (isTabScreen && navigationRef.isReady() && navigationRef.getCurrentRoute()?.key !== route.key) {
                return;
            }
            transitionHandleRef.current = TransitionTracker.startTransition();
        });
        const transitionEndListener = navigation.addListener('transitionEnd', () => {
            if (!transitionHandleRef.current) {
                return;
            }
            TransitionTracker.endTransition(transitionHandleRef.current);
            transitionHandleRef.current = null;
        });

        return () => {
            transitionStartListener();
            transitionEndListener();

            // If this screen unmounts before its own transitionEnd fires (e.g. it was popped/reset
            // away mid-transition), the handle would otherwise sit in TransitionTracker until its
            // safety timeout, needlessly delaying anything waiting via runAfterTransitions.
            if (transitionHandleRef.current) {
                TransitionTracker.endTransition(transitionHandleRef.current);
                transitionHandleRef.current = null;
            }
        };
    }, [navigation, route.key, isTabScreen]);

    return children;
}

export default screenLayoutWrapper;
export {bottomTabScreenLayoutWrapper};
