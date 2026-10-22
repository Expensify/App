import TransitionTracker from '@libs/Navigation/TransitionTracker';
import type {TransitionHandle} from '@libs/Navigation/TransitionTracker';

import type {BottomTabNavigationOptions} from '@react-navigation/bottom-tabs';
import type {NativeBottomTabNavigationOptions} from '@react-navigation/bottom-tabs/unstable';
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

// Same as screenLayoutWrapper above, but for bottom-tab navigators, JS and native. No cast needed here - their
// `navigation` props' `addListener` structurally satisfies TransitionAwareNavigation.
function bottomTabScreenLayoutWrapper(props: ScreenLayoutProps) {
    return <ScreenLayout {...props} />;
}

type ScreenLayoutProps = ScreenLayoutArgs<
    ParamListBase,
    string,
    PlatformSpecificNavigationOptions | PlatformStackNavigationOptions | BottomTabNavigationOptions | NativeBottomTabNavigationOptions,
    TransitionAwareNavigation
>;

function ScreenLayout({children, navigation}: ScreenLayoutProps) {
    const transitionHandleRef = useRef<TransitionHandle | null>(null);

    useLayoutEffect(() => {
        const transitionStartListener = navigation.addListener('transitionStart', () => {
            const interruptedHandle = transitionHandleRef.current;
            // JS stacks suppress transitionEnd for interrupted animations. Register the replacement first so deferred work cannot flush between them.
            transitionHandleRef.current = TransitionTracker.startTransition('navigation');
            if (interruptedHandle) {
                TransitionTracker.endTransition(interruptedHandle);
            }
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
            const handleToEnd = transitionHandleRef.current;
            transitionHandleRef.current = null;
            if (!handleToEnd) {
                return;
            }
            // Defer one frame so the incoming screen's `transitionStart` bumps `activeNavigationCount` first; an unmount mid-rapid-back/forward would otherwise drop the count to zero and flush any queued `runAfterTransitions` callback before the new screen mounts.
            requestAnimationFrame(() => {
                TransitionTracker.endTransition(handleToEnd);
            });
        };
    }, [navigation]);

    return children;
}

export default screenLayoutWrapper;
export {bottomTabScreenLayoutWrapper};
