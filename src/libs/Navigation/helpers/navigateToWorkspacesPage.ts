import type {NavigationState, PartialState} from '@react-navigation/native';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';
import {isPendingDeletePolicy, shouldShowPolicy as shouldShowPolicyUtil} from '@libs/PolicyUtils';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {Domain, Policy} from '@src/types/onyx';
import {getLastVisitedWorkspaceTabScreen} from './lastVisitedTabPathUtils';

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
const navigateToWorkspacesPage = ({currentUserLogin, shouldUseNarrowLayout, policy, domain, lastWorkspacesTabNavigatorRoute, topmostFullScreenRoute}: Params) => {
    const isCurrentlyOnWorkspacesTab = topmostFullScreenRoute?.name === NAVIGATORS.WORKSPACE_NAVIGATOR;
    const isWorkspaceOrDomainOnTop =
        lastWorkspacesTabNavigatorRoute?.name === NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR || lastWorkspacesTabNavigatorRoute?.name === NAVIGATORS.DOMAIN_SPLIT_NAVIGATOR;
    if (isCurrentlyOnWorkspacesTab && isWorkspaceOrDomainOnTop) {
        // Already in the workspace or domain navigator: go back to the list.
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
