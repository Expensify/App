import type {NavigationState} from '@react-navigation/native';
import {findFocusedRoute} from '@react-navigation/native';
import useRootNavigationState from '@hooks/useRootNavigationState';
import {SPLIT_TO_SIDEBAR} from '@libs/Navigation/linkingConfig/RELATIONS';
import type {SplitNavigatorName} from '@libs/Navigation/types';
import NAVIGATORS from '@src/NAVIGATORS';

function useIsSidebarRouteActive(splitNavigatorName: SplitNavigatorName, isNarrowLayout: boolean) {
    const currentSplitNavigatorRoute = useRootNavigationState((rootState) => {
        const lastRoute = rootState?.routes.at(-1);
        // Split navigators (Settings/Reports/Search/Workspace) live one level inside TAB_NAVIGATOR
        // on the root stack. Drill into the active tab so we can match against splitNavigatorName.
        // When a modal (RHP, etc.) is layered on top, lastRoute is the modal — fall through to
        // preserve the "not focused" behavior from #63231.
        if (lastRoute?.name === NAVIGATORS.TAB_NAVIGATOR && lastRoute.state) {
            const tabState = lastRoute.state as NavigationState;
            return tabState.routes.at(tabState.index);
        }
        return lastRoute;
    });

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
