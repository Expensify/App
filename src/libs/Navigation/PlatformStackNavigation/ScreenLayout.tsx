import type {ParamListBase, ScreenLayoutArgs} from '@react-navigation/native';
import React, {useLayoutEffect} from 'react';
import TransitionTracker from '@libs/Navigation/TransitionTracker';
import type {PlatformSpecificNavigationOptions, PlatformStackNavigationOptions, PlatformStackNavigationProp} from './types';

// screenLayout is invoked as a render function (not JSX), so we need this wrapper to create a proper React component boundary for hooks.
function screenLayoutWrapper({navigation, ...rest}: ScreenLayoutArgs<ParamListBase, string, PlatformSpecificNavigationOptions | PlatformStackNavigationOptions, string>) {
    return (
        <ScreenLayout
            // eslint-disable-next-line react/jsx-props-no-spreading
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
    useLayoutEffect(() => {
        const transitionStartListener = navigation.addListener('transitionStart', () => {
            TransitionTracker.startTransition();
        });
        const transitionEndListener = navigation.addListener('transitionEnd', () => {
            TransitionTracker.endTransition();
        });

        return () => {
            transitionStartListener();
            transitionEndListener();
        };
    }, [navigation]);

    return children;
}

export default screenLayoutWrapper;
