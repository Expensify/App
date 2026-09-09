import TransitionTracker from '@libs/Navigation/TransitionTracker';
import type {TransitionHandle} from '@libs/Navigation/TransitionTracker';

import type {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import type {ParamListBase, ScreenLayoutArgs} from '@react-navigation/native';
import type {ReactElement} from 'react';

import React, {useLayoutEffect, useRef} from 'react';

import type {BottomTabScreenOptions, PlatformSpecificNavigationOptions, PlatformStackNavigationOptions} from './types';

import ScreenActivityWrapper from './createPlatformStackNavigatorComponent/ScreenActivityWrapper';

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

// A tab is never covered by a screen of its own navigator, so it is not blurred in that sense. It counts as covered
// while another tab is focused and while the whole tab navigator is behind another route, which the wrapper reads
// from useIsFocused.
function wrapBottomTabScreenContent(nonTopScreenBehavior: BottomTabScreenOptions['nonTopScreenBehavior'], children: ReactElement) {
    if (nonTopScreenBehavior !== 'activity') {
        return children;
    }
    return <ScreenActivityWrapper isScreenBlurred={false}>{children}</ScreenActivityWrapper>;
}

// Same as screenLayoutWrapper above, but for bottom-tab navigators. No cast needed here - `navigation` is already
// properly typed as BottomTabNavigationProp, and its `addListener` structurally satisfies TransitionAwareNavigation.
// The wrapper goes around the content only, so the transition listeners of ScreenLayout stay mounted while a hidden
// Activity has its effects cleaned up.
function bottomTabScreenLayoutWrapper({navigation, options, children, ...rest}: ScreenLayoutArgs<ParamListBase, string, BottomTabScreenOptions, BottomTabNavigationProp<ParamListBase>>) {
    return (
        <ScreenLayout
            {...rest}
            options={options}
            navigation={navigation}
        >
            {wrapBottomTabScreenContent(options.nonTopScreenBehavior, children)}
        </ScreenLayout>
    );
}

type ScreenLayoutProps = ScreenLayoutArgs<ParamListBase, string, PlatformSpecificNavigationOptions | PlatformStackNavigationOptions | BottomTabScreenOptions, TransitionAwareNavigation>;

function ScreenLayout({children, navigation}: ScreenLayoutProps) {
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
export {bottomTabScreenLayoutWrapper};
