import type {NavigationState} from '@react-navigation/native';
import {findFocusedRoute} from '@react-navigation/native';
import useRootNavigationState from '@hooks/useRootNavigationState';
import {SPLIT_TO_SIDEBAR} from '@libs/Navigation/linkingConfig/RELATIONS';
import type {SplitNavigatorName} from '@libs/Navigation/types';

function useIsSidebarRouteActive(splitNavigatorName: SplitNavigatorName, isNarrowLayout: boolean) {
    const currentSplitNavigatorRoute = useRootNavigationState((rootState) => rootState?.routes.at(-1));

    if (currentSplitNavigatorRoute?.name !== splitNavigatorName) {
        return false;
    }

    const focusedRoute = findFocusedRoute(currentSplitNavigatorRoute?.state as NavigationState);
    const isSidebarRoute = focusedRoute?.name === SPLIT_TO_SIDEBAR[splitNavigatorName];

    // To check if the sidebar is active on a narrow layout, we need to check if the focused route is the sidebar route
    if (isNarrowLayout) {
        return isSidebarRoute;
    }

    // On a wide layout, the sidebar is always focused when the split navigator is opened
    return true;
}

export default useIsSidebarRouteActive;
