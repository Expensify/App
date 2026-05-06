import type {NavigationState, PartialState} from '@react-navigation/native';
import {findFocusedRoute, StackActions, TabActions} from '@react-navigation/native';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';
// eslint-disable-next-line no-restricted-imports
import TransitionTracker from '@libs/Navigation/TransitionTracker';
import {isPendingDeletePolicy, shouldShowPolicy as shouldShowPolicyUtil} from '@libs/PolicyUtils';
import NAVIGATORS from '@src/NAVIGATORS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {Domain, Policy} from '@src/types/onyx';
import getActiveTabName from './getActiveTabName';

type RouteType = NavigationState['routes'][number] | PartialState<NavigationState>['routes'][number];

function jumpToWorkspacesTab(tabNavStateKey: string) {
    navigationRef.dispatch({
        ...TabActions.jumpTo(NAVIGATORS.WORKSPACE_NAVIGATOR),
        target: tabNavStateKey,
    });
}

type Params = {
    currentUserLogin?: string;
    shouldUseNarrowLayout: boolean;
    policy?: Policy;
    domain?: Domain;
    lastWorkspacesTabNavigatorRoute?: RouteType;
    lastTabNavigatorRoute?: RouteType;
};

const navigateToWorkspacesPage = ({currentUserLogin, shouldUseNarrowLayout, policy, domain, lastWorkspacesTabNavigatorRoute, lastTabNavigatorRoute}: Params) => {
    const rootState = navigationRef.getRootState();
    const focusedRoute = rootState ? findFocusedRoute(rootState) : undefined;
    const isOnWorkspacesList = focusedRoute?.name === SCREENS.WORKSPACES_LIST;

    if (!lastTabNavigatorRoute || isOnWorkspacesList) {
        // Not in a main workspace navigation context or the workspaces list page is already displayed, so do nothing.
        return;
    }

    // Check if user is already on a workspace or domain inside WORKSPACE_NAVIGATOR (within TabNavigator)
    const isWorkspaceOrDomainOnTop =
        lastWorkspacesTabNavigatorRoute?.name === NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR || lastWorkspacesTabNavigatorRoute?.name === NAVIGATORS.DOMAIN_SPLIT_NAVIGATOR;
    const activeTabName = getActiveTabName(lastTabNavigatorRoute as Parameters<typeof getActiveTabName>[0]);
    if (activeTabName === NAVIGATORS.WORKSPACE_NAVIGATOR && isWorkspaceOrDomainOnTop) {
        // Already inside a workspace or domain: go back to the list.
        Navigation.goBack(ROUTES.WORKSPACES_LIST.route);
        return;
    }

    // Restore WORKSPACE_SPLIT_NAVIGATOR / DOMAIN_SPLIT_NAVIGATOR by jumping to the WORKSPACE_NAVIGATOR
    // tab in-place. URL-based navigation would go through `getStateFromPath` and push a brand-new
    // TAB_NAVIGATOR on top of the existing one, which is wasteful.
    const existingTabNavStateKey = (lastTabNavigatorRoute.state as NavigationState | undefined)?.key;

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

            if (policy?.id && existingTabNavStateKey) {
                const focusedWorkspaceSplitRouteName = lastWorkspacesTabNavigatorRoute.state ? findFocusedRoute(lastWorkspacesTabNavigatorRoute.state)?.name : undefined;
                const isOnWorkspaceInitial = focusedWorkspaceSplitRouteName === SCREENS.WORKSPACE.INITIAL;
                if (shouldUseNarrowLayout && lastWorkspacesTabNavigatorRoute.state?.key && !isOnWorkspaceInitial) {
                    // On narrow layout, pop the workspace split to WorkspaceInitialPage while the tab is
                    // still hidden, then jump to the tab. Resetting first prevents any sub-page from
                    // flashing before WorkspaceInitialPage appears.
                    navigationRef.dispatch({...StackActions.popToTop(), target: lastWorkspacesTabNavigatorRoute.state.key});
                    TransitionTracker.runAfterTransitions({callback: () => jumpToWorkspacesTab(existingTabNavStateKey), waitForUpcomingTransition: true});
                    return;
                }
                jumpToWorkspacesTab(existingTabNavStateKey);
                return;
            }
        }

        // Domain route found: try to restore last domain screen.
        if (lastWorkspacesTabNavigatorRoute.name === NAVIGATORS.DOMAIN_SPLIT_NAVIGATOR) {
            if (domain?.accountID && existingTabNavStateKey) {
                jumpToWorkspacesTab(existingTabNavStateKey);
                return;
            }
        }

        // Fallback: any other state, go to the list.
        Navigation.navigate(ROUTES.WORKSPACES_LIST.route);
    });
};

export default navigateToWorkspacesPage;
