import {findFocusedRoute} from '@react-navigation/native';
import type {NavigationState, PartialState} from '@react-navigation/native';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';
import {isPendingDeletePolicy, shouldShowPolicy as shouldShowPolicyUtil} from '@libs/PolicyUtils';
import NAVIGATORS from '@src/NAVIGATORS';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {Domain, Policy} from '@src/types/onyx';
import getActiveTabName from './getActiveTabName';
import getPathFromState from './getPathFromState';

type RouteType = NavigationState['routes'][number] | PartialState<NavigationState>['routes'][number];

/**
 * Wraps a leaf navigation state in successive ancestor navigators (outermost first).
 * Used to reconstruct the linking-config hierarchy that `getPathFromState` walks when
 * resolving a state subtree to a URL.
 */
function wrapStateInNavigators(state: PartialState<NavigationState>, navigators: readonly string[]): PartialState<NavigationState> {
    return navigators.reduceRight<PartialState<NavigationState>>((acc, name) => ({routes: [{name, state: acc}], index: 0}), state);
}

type Params = {
    currentUserLogin?: string;
    shouldUseNarrowLayout: boolean;
    policy?: Policy;
    domain?: Domain;
    lastWorkspacesTabNavigatorRoute?: RouteType;
    topmostFullScreenRoute?: RouteType;
    /**
     * The full WorkspaceSplitNavigator inner state captured by the hook.
     * Wrapped in a synthetic outer node and fed to `getPathFromState` to reconstruct
     * the deep URL the user was on (e.g. `/workspaces/POLICY_ID/workflows`). Navigating
     * via that URL goes through `getStateFromPath` which produces a fully-formed
     * navigation state — bypassing custom router actions that don't seed nested state
     * when pushing a fresh TabNavigator on top of an existing fullscreen stack.
     */
    workspacesTabState?: NavigationState | PartialState<NavigationState>;
};

const navigateToWorkspacesPage = ({currentUserLogin, shouldUseNarrowLayout, policy, domain, lastWorkspacesTabNavigatorRoute, topmostFullScreenRoute, workspacesTabState}: Params) => {
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

            if (policy?.id) {
                // Synthesize a URL from the captured WorkspaceSplitNavigator inner state and navigate
                // to it. URL-based navigation goes through `getStateFromPath`, which produces a fully
                // formed nested state and reliably handles pushing a fresh TabNavigator on top of an
                // existing fullscreen stack. The state has to be wrapped with its full ancestor chain
                // (TAB_NAVIGATOR > WORKSPACE_NAVIGATOR > WORKSPACE_SPLIT_NAVIGATOR) so `getPathFromState`
                // can match the linking-config hierarchy and produce a real URL like
                // `/workspaces/POLICY_ID/workflows`; otherwise the resolver falls back to navigator
                // names as path segments and the result hits 404. Narrow layouts skip the deep-restore
                // and go to the workspace's initial page (mirrors mobile behavior).
                const wrappedState =
                    !shouldUseNarrowLayout && workspacesTabState
                        ? wrapStateInNavigators(workspacesTabState as PartialState<NavigationState>, [
                              NAVIGATORS.TAB_NAVIGATOR,
                              NAVIGATORS.WORKSPACE_NAVIGATOR,
                              NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR,
                          ])
                        : undefined;
                const targetPath = (wrappedState ? getPathFromState(wrappedState) : ROUTES.WORKSPACE_INITIAL.getRoute(policy.id)) as Route;
                Navigation.navigate(targetPath);
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
