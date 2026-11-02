import type {NavigationState, PartialState} from '@react-navigation/native';
import {findFocusedRoute, StackActions, TabActions} from '@react-navigation/native';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';
import TransitionTracker from '@libs/Navigation/TransitionTracker';
import {isPendingDeletePolicy, shouldShowPolicy as shouldShowPolicyUtil} from '@libs/PolicyUtils';
import NAVIGATORS from '@src/NAVIGATORS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {Domain, Policy} from '@src/types/onyx';
import getActiveTabName from './getActiveTabName';
import {saveWorkspacesTabPathToSessionStorage} from './lastVisitedTabPathUtils';

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
    // TAB_NAVIGATOR on top of the existing one, which is wasteful. On cold start the slot has no
    // nested state yet; jumping focuses it and WorkspaceRouter.getInitialState reads the last-visited
    // sub-page from sessionStorage so the user still lands on it.
    const existingTabNavStateKey = (lastTabNavigatorRoute.state as NavigationState | undefined)?.key;

    interceptAnonymousUser(() => {
        // Cold start: no nested state yet. Jump to the Workspaces tab and let WorkspaceRouter.getInitialState
        // restore the last-visited sub-page (or fall back to WORKSPACES_LIST when there's nothing saved).
        if (!lastWorkspacesTabNavigatorRoute) {
            if (existingTabNavStateKey) {
                jumpToWorkspacesTab(existingTabNavStateKey);
                return;
            }
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
                if (shouldUseNarrowLayout && !isOnWorkspaceInitial) {
                    if (lastWorkspacesTabNavigatorRoute.state?.key) {
                        // Live state: pop the workspace split to WorkspaceInitialPage while the tab is
                        // still hidden, then jump to the tab. Resetting first prevents any sub-page from
                        // flashing before WorkspaceInitialPage appears.
                        navigationRef.dispatch({...StackActions.popToTop(), target: lastWorkspacesTabNavigatorRoute.state.key});
                        TransitionTracker.runAfterTransitions({callback: () => jumpToWorkspacesTab(existingTabNavStateKey), waitForUpcomingTransition: true});
                        return;
                    }
                    // Session-storage state: the WorkspaceSplitNavigator isn't mounted yet, so we can't
                    // dispatch popToTop. Overwrite the saved path with the workspace-initial URL so
                    // WorkspaceRouter/SplitRouter rehydrate to just WORKSPACE_INITIAL when they mount.
                    saveWorkspacesTabPathToSessionStorage(ROUTES.WORKSPACE_INITIAL.getRoute(policy.id));
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
