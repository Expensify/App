import {findFocusedRoute} from '@react-navigation/native';
import type {NavigationState, PartialState} from '@react-navigation/native';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';
import {isPendingDeletePolicy, shouldShowPolicy as shouldShowPolicyUtil} from '@libs/PolicyUtils';
import NAVIGATORS from '@src/NAVIGATORS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {Domain, Policy} from '@src/types/onyx';
import getActiveTabName from './getActiveTabName';

type RouteType = NavigationState['routes'][number] | PartialState<NavigationState>['routes'][number];

type Params = {
    currentUserLogin?: string;
    shouldUseNarrowLayout: boolean;
    policy?: Policy;
    domain?: Domain;
    lastWorkspacesTabNavigatorRoute?: RouteType;
    topmostFullScreenRoute?: RouteType;
};

// Navigates to the appropriate workspace tab or workspace list page.
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- shouldUseNarrowLayout kept for API compat with callers
const navigateToWorkspacesPage = ({currentUserLogin, shouldUseNarrowLayout, policy, domain, lastWorkspacesTabNavigatorRoute, topmostFullScreenRoute}: Params) => {
    const rootState = navigationRef.getRootState();
    const focusedRoute = rootState ? findFocusedRoute(rootState) : undefined;
    const isOnWorkspacesList = focusedRoute?.name === SCREENS.WORKSPACES_LIST;

    if (!topmostFullScreenRoute || isOnWorkspacesList) {
        // Not in a main workspace navigation context or the workspaces list page is already displayed, so do nothing.
        return;
    }

    // Check if user is already on a workspace or domain inside WORKSPACE_NAVIGATOR (within TabNavigator)
    const isWorkspaceOrDomainOnTop =
        lastWorkspacesTabNavigatorRoute?.name === NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR || lastWorkspacesTabNavigatorRoute?.name === NAVIGATORS.DOMAIN_SPLIT_NAVIGATOR;
    const activeTabName = topmostFullScreenRoute.name === NAVIGATORS.TAB_NAVIGATOR ? getActiveTabName(topmostFullScreenRoute as Parameters<typeof getActiveTabName>[0]) : undefined;
    if (activeTabName === NAVIGATORS.WORKSPACE_NAVIGATOR && isWorkspaceOrDomainOnTop) {
        // Already inside a workspace or domain: go back to the list.
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

            // Restore to last-visited workspace — navigate through standard routing which switches the tab
            if (policy?.id) {
                Navigation.navigate(ROUTES.WORKSPACE_INITIAL.getRoute(policy.id));
            }
            return;
        }

        // Domain route found: try to restore last domain screen.
        if (lastWorkspacesTabNavigatorRoute.name === NAVIGATORS.DOMAIN_SPLIT_NAVIGATOR) {
            if (domain?.accountID !== undefined) {
                Navigation.navigate(ROUTES.DOMAIN_INITIAL.getRoute(domain.accountID));
                return;
            }
        }

        // Fallback: any other state, go to the list.
        Navigation.navigate(ROUTES.WORKSPACES_LIST.route);
    });
};

export default navigateToWorkspacesPage;
