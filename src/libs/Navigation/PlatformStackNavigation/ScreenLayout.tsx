import TransitionTracker from '@libs/Navigation/TransitionTracker';
import type {TransitionHandle} from '@libs/Navigation/TransitionTracker';

import type {ParamListBase, ScreenLayoutArgs} from '@react-navigation/native';

import React, {useLayoutEffect, useRef} from 'react';

import type {PlatformSpecificNavigationOptions, PlatformStackNavigationOptions, PlatformStackNavigationProp} from './types';

// screenLayout is invoked as a render function (not JSX), so we need this wrapper to create a proper React component boundary for hooks.
function screenLayoutWrapper({navigation, ...rest}: ScreenLayoutArgs<ParamListBase, string, PlatformSpecificNavigationOptions | PlatformStackNavigationOptions, string>) {
    return (
        <ScreenLayout
            {...rest}
            // The type cast is needed because useNavigationBuilder hardcodes the Navigation generic to `string`.
            navigation={navigation as unknown as PlatformStackNavigationProp<ParamListBase>}
        />
    );
}

function ScreenLayout({
    children,
    navigation,
}: ScreenLayoutArgs<ParamListBase, string, PlatformSpecificNavigationOptions | PlatformStackNavigationOptions, PlatformStackNavigationProp<ParamListBase>>) {
    const transitionHandleRef = useRef<TransitionHandle | null>(null);
    // Net-count overlapping starts so a single handle spans rapid back/forward re-fires — no decrement-to-zero seam for `runAfterTransitions` to flush through, and `transitionEnd` for the wrong leg can't end the active one.
    const pendingTransitionsRef = useRef(0);

    useLayoutEffect(() => {
        const transitionStartListener = navigation.addListener('transitionStart', () => {
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

        return () => {
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
    }, [navigation]);

    return children;
}

export default screenLayoutWrapper;
