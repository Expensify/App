import type {ParamListBase, StackNavigationState} from '@react-navigation/native';
import {useEffect} from 'react';
import usePrevious from '@hooks/usePrevious';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import isRoutePreloaded from '@libs/Navigation/helpers/isRoutePreloaded';
import navigationRef from '@libs/Navigation/navigationRef';
import type {CustomEffectsHookProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {NavigationPartialRoute} from '@libs/Navigation/types';
import NAVIGATORS from '@src/NAVIGATORS';

/**
 * This hook resets the navigation root state when changing the layout size, resetting the state calls the getRehydratedState method in CustomFullScreenRouter.tsx.
 * It is also called when the navigator is created to set the initial state correctly.
 * When the screen size is changed, it is necessary to check whether the application displays the content correctly.
 * When the app is opened on a small layout and the user resizes it to wide, a second screen has to be present in the navigation state to fill the space.
 */
function useNavigationResetOnLayoutChange({navigation}: CustomEffectsHookProps<ParamListBase>) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const previousShouldUseNarrowLayout = usePrevious(shouldUseNarrowLayout);
    const hasLayoutBeenExpanded = previousShouldUseNarrowLayout && !shouldUseNarrowLayout;

    useEffect(() => {
        if (!navigationRef.isReady()) {
            return;
        }

        // If the ReportsSplitNavigator has been preloaded on a narrow layout, the Report page won't be displayed on a wide screen.
        if (hasLayoutBeenExpanded && isRoutePreloaded(NAVIGATORS.REPORTS_SPLIT_NAVIGATOR)) {
            const currentState = navigation.getState() as StackNavigationState<ParamListBase> & {preloadedRoutes?: NavigationPartialRoute[]};
            const stateWithoutPreloadedInbox = {
                ...currentState,
                preloadedRoutes: currentState.preloadedRoutes?.filter((route: NavigationPartialRoute) => route.name !== NAVIGATORS.REPORTS_SPLIT_NAVIGATOR),
            };
            navigation.reset(stateWithoutPreloadedInbox);
            return;
        }

        navigation.reset(navigation.getState());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shouldUseNarrowLayout]);
}

export default useNavigationResetOnLayoutChange;
