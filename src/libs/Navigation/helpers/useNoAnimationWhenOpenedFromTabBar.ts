import {useEffect} from 'react';
import {workspaceOrDomainSplitsWithoutEnteringAnimation} from '@libs/Navigation/AppNavigator/createRootStackNavigator/GetStateForActionHandlers';
import Animations from '@libs/Navigation/PlatformStackNavigation/navigationOptions/animation';
import type {PlatformStackNavigationProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {AuthScreensParamList} from '@libs/Navigation/types';
import type NAVIGATORS from '@src/NAVIGATORS';

/**
 * Ensures that workspace/domain split navigator pages open without the animation
 * when accessing them by selecting the Workspace tab in the navigation tab bar,
 * to make it look like a bottom tab navigation.
 */
function useNoAnimationWhenOpenedFromTabBar(
    navigation: PlatformStackNavigationProp<AuthScreensParamList, typeof NAVIGATORS.DOMAIN_SPLIT_NAVIGATOR | typeof NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR, undefined>,
    routeKey: string,
) {
    useEffect(() => {
        const unsubscribe = navigation.addListener('transitionEnd', () => {
            // We want to call this function only once.
            unsubscribe();

            // If we open this screen from a different tab, then it won't have animation.
            if (!workspaceOrDomainSplitsWithoutEnteringAnimation.has(routeKey)) {
                return;
            }

            // We want to set animation after mounting so it will animate on going UP to the settings split.
            navigation.setOptions({animation: Animations.SLIDE_FROM_RIGHT});
        });

        return unsubscribe;
    }, [navigation, routeKey]);
}

export default useNoAnimationWhenOpenedFromTabBar;
