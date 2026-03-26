import type {ParamListBase} from '@react-navigation/native';
import {useEffect} from 'react';
import {workspaceOrDomainSplitsWithoutEnteringAnimation} from '@libs/Navigation/AppNavigator/createRootStackNavigator/GetStateForActionHandlers';
import Animations from '@libs/Navigation/PlatformStackNavigation/navigationOptions/animation';
import type {PlatformStackNavigationProp} from '@libs/Navigation/PlatformStackNavigation/types';

/**
 * Reenables animation for workspace/domain split navigators if they are opened from tab bar.
 * The animation is disabled in libs/Navigation/AppNavigator/AuthScreens.tsx, to not animate the entering
 * and then enabled here after navigation completes to animate going back to the workspaces page.
 */
function useEnableBackAnimationWhenOpenedFromTabBar(navigation: PlatformStackNavigationProp<ParamListBase>, routeKey: string) {
    useEffect(() => {
        const unsubscribe = navigation.addListener('transitionEnd', () => {
            // We want to call this function only once.
            unsubscribe();

            // If we open this screen not from a different tab, then it already has the animation enabled.
            if (!workspaceOrDomainSplitsWithoutEnteringAnimation.has(routeKey)) {
                return;
            }

            // We want to set animation after mounting so it will animate on going back.
            navigation.setOptions({animation: Animations.SLIDE_FROM_RIGHT});
        });

        return unsubscribe;
    }, [navigation, routeKey]);
}

export default useEnableBackAnimationWhenOpenedFromTabBar;
