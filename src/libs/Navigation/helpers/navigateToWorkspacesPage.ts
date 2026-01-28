import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import Log from '@libs/Log';
import {getPreservedNavigatorState} from '@libs/Navigation/AppNavigator/createSplitNavigator/usePreserveNavigatorState';
import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';
import {isPendingDeletePolicy, shouldShowPolicy as shouldShowPolicyUtil} from '@libs/PolicyUtils';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {Domain, Policy} from '@src/types/onyx';
import {isFullScreenName, isWorkspacesTabScreenName} from './isNavigatorName';
import {getLastVisitedWorkspaceTabScreen, getWorkspacesTabStateFromSessionStorage} from './lastVisitedTabPathUtils';

type Params = {
    currentUserLogin?: string;
    shouldUseNarrowLayout: boolean;
    policy?: Policy;
    domain?: Domain;
};

// Gets the latest workspace navigation state, restoring from session or preserved state if needed.
const getWorkspaceNavigationRouteState = () => {
    if (!navigationRef.isReady()) {
        Log.warn('[src/libs/Navigation/helpers/navigateToWorkspacesPage.ts] NavigationRef is not ready. Returning empty object.');
        return {};
    }

    const rootState = navigationRef.getRootState();

    // Only consider main (fullscreen) routes for top-level navigation context.
    const topmostFullScreenRoute = rootState?.routes?.findLast((route) => isFullScreenName(route.name));
    if (!topmostFullScreenRoute) {
        // No fullscreen route: not in a workspace context.
        return {};
    }

    // Prefer restoring workspace tab state from sessionStorage for accurate restoration.
    const workspacesTabStateFromSessionStorage = getWorkspacesTabStateFromSessionStorage() ?? rootState;
    const lastWorkspacesTabNavigatorRoute = workspacesTabStateFromSessionStorage?.routes.findLast((route) => isWorkspacesTabScreenName(route.name));
    let workspacesTabState = lastWorkspacesTabNavigatorRoute?.state;

    // Use preserved state if live state is missing (e.g. after a pop).
    if (!workspacesTabState && lastWorkspacesTabNavigatorRoute?.key) {
        workspacesTabState = getPreservedNavigatorState(lastWorkspacesTabNavigatorRoute.key);
    }

    return {lastWorkspacesTabNavigatorRoute, workspacesTabState, topmostFullScreenRoute};
};

// Navigates to the appropriate workspace tab or workspace list page.
const navigateToWorkspacesPage = ({currentUserLogin, shouldUseNarrowLayout, policy, domain}: Params) => {
    const {lastWorkspacesTabNavigatorRoute, topmostFullScreenRoute} = getWorkspaceNavigationRouteState();

    if (!topmostFullScreenRoute || topmostFullScreenRoute.name === SCREENS.WORKSPACES_LIST) {
        // Not in a main workspace navigation context or the workspaces list page is already displayed, so do nothing.
        return;
    }

    if (topmostFullScreenRoute.name === NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR) {
        // Already inside a workspace: go back to the list.
        Navigation.goBack(ROUTES.WORKSPACES_LIST.route);
        return;
    }

    interceptAnonymousUser(() => {
        // No workspace found in nav state: go to list.
        if (!lastWorkspacesTabNavigatorRoute) {
            Navigation.navigate(ROUTES.WORKSPACES_LIST.route);
            return;
        }

        // Workspace route found: try to restore last workspace screen.
        if (lastWorkspacesTabNavigatorRoute.name === NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR) {
            const shouldShowPolicy = shouldShowPolicyUtil(policy, false, currentUserLogin);
            const isPendingDelete = isPendingDeletePolicy(policy);

            // Workspace is not accessible or is being deleted: go to list.
            if (!shouldShowPolicy || isPendingDelete) {
                Navigation.navigate(ROUTES.WORKSPACES_LIST.route);
                return;
            }

            // Restore to last-visited workspace tab or show initial tab
            if (policy?.id) {
                const workspaceScreenName = !shouldUseNarrowLayout ? getLastVisitedWorkspaceTabScreen() : SCREENS.WORKSPACE.INITIAL;
                navigationRef.dispatch({
                    type: CONST.NAVIGATION.ACTION_TYPE.OPEN_WORKSPACE_SPLIT,
                    payload: {policyID: policy.id, screenName: workspaceScreenName},
                });
            }
            return;
        }

        // Domain route found: try to restore last domain screen.
        if (lastWorkspacesTabNavigatorRoute.name === NAVIGATORS.DOMAIN_SPLIT_NAVIGATOR) {
            // Restore to last-visited domain tab or show initial tab
            if (domain?.accountID !== undefined) {
                const domainScreenName = !shouldUseNarrowLayout ? getLastVisitedWorkspaceTabScreen() : SCREENS.DOMAIN.INITIAL;

                return navigationRef.dispatch({
                    type: CONST.NAVIGATION.ACTION_TYPE.OPEN_DOMAIN_SPLIT,
                    payload: {domainAccountID: domain.accountID, screenName: domainScreenName},
                });
            }
        }

        // Fallback: any other state, go to the list.
        Navigation.navigate(ROUTES.WORKSPACES_LIST.route);
    });
};

export default navigateToWorkspacesPage;
export {getWorkspaceNavigationRouteState};
