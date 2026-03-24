import {getPreservedNavigatorState} from '@libs/Navigation/AppNavigator/createSplitNavigator/usePreserveNavigatorState';
import {isFullScreenName, isWorkspacesTabScreenName} from '@libs/Navigation/helpers/isNavigatorName';
import {getWorkspacesTabStateFromSessionStorage} from '@libs/Navigation/helpers/lastVisitedTabPathUtils';
import useRootNavigationState from './useRootNavigationState';

function useWorkspaceNavigationRouteState() {
    return useRootNavigationState((rootState) => {
        const topmostFullScreenRoute = rootState?.routes?.findLast((route) => isFullScreenName(route.name));
        if (!topmostFullScreenRoute) {
            return {};
        }

        // Try navigation state first, fall back to session storage
        const stateToSearch = rootState;
        const lastWorkspacesTabNavigatorRoute = stateToSearch?.routes.findLast((route) => isWorkspacesTabScreenName(route.name));

        if (lastWorkspacesTabNavigatorRoute) {
            let workspacesTabState = lastWorkspacesTabNavigatorRoute.state;

            if (!workspacesTabState && lastWorkspacesTabNavigatorRoute.key) {
                workspacesTabState = getPreservedNavigatorState(lastWorkspacesTabNavigatorRoute.key);
            }

            return {lastWorkspacesTabNavigatorRoute, workspacesTabState, topmostFullScreenRoute};
        }

        // Fall back to session storage
        const sessionState = getWorkspacesTabStateFromSessionStorage();
        if (sessionState) {
            const sessionRoute = sessionState.routes.findLast((route) => isWorkspacesTabScreenName(route.name));
            if (sessionRoute) {
                return {lastWorkspacesTabNavigatorRoute: sessionRoute, workspacesTabState: sessionRoute.state, topmostFullScreenRoute};
            }
        }

        return {topmostFullScreenRoute};
    });
}

export default useWorkspaceNavigationRouteState;
