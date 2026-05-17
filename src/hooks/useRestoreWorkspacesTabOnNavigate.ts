import {getPreservedNavigatorState} from '@libs/Navigation/AppNavigator/createSplitNavigator/usePreserveNavigatorState';
import {isFullScreenName, isWorkspaceNavigatorRouteName} from '@libs/Navigation/helpers/isNavigatorName';
import {getWorkspacesTabStateFromSessionStorage} from '@libs/Navigation/helpers/lastVisitedTabPathUtils';
import navigateToWorkspacesPage from '@libs/Navigation/helpers/navigateToWorkspacesPage';
import {getTabState} from '@libs/Navigation/helpers/tabNavigatorUtils';
import navigationRef from '@libs/Navigation/navigationRef';
import type {DomainSplitNavigatorParamList, WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useOnyx from './useOnyx';
import useResponsiveLayout from './useResponsiveLayout';

/**
 * The Workspaces tab can show three things: the workspaces list, a specific workspace page,
 * or a specific domain page. When the user navigates away and comes back to the tab,
 * this hook ensures they return to whichever of those they had open last — not always the list.
 *
 * It resolves the last visited route from navigation state, fetches the matching policy/domain
 * from Onyx (to verify it's still accessible), and returns a callback that performs the navigation.
 *
 * Nav state is resolved at click time so the hook has no reactive subscriptions to navigation
 * — unrelated navigations (e.g. opening a report) don't trigger re-renders.
 */
function useRestoreWorkspacesTabOnNavigate() {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {login: currentUserLogin} = useCurrentUserPersonalDetails();
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [allDomains] = useOnyx(ONYXKEYS.COLLECTION.DOMAIN);

    return () => {
        // Find the last route the user had open in the Workspaces tab (workspace, domain, or list).
        // Priority: live nav state (root level) -> inside TabNavigator -> preserved state -> session storage.
        const rootState = navigationRef.isReady() ? navigationRef.getRootState() : undefined;
        const routeState = (() => {
            const topmostFullScreenRoute = rootState?.routes?.findLast((route) => isFullScreenName(route.name));
            if (!topmostFullScreenRoute) {
                return {};
            }

            // Multiple TAB_NAVIGATOR instances can coexist in the root stack — when navigation from
            // inside an RHP targets a tab, linkTo PUSHes a fresh TabNavigator above the modal, and that
            // new instance's WORKSPACE_NAVIGATOR slot starts empty. Older instances kept alive by
            // ensureTabNavigatorRoutes still hold the previous workspace state, so flatten every
            // workspace route from every TabNavigator in stack order and take the most recent one.
            const lastWorkspaceRoute = (rootState?.routes ?? [])
                .filter((route) => route.name === NAVIGATORS.TAB_NAVIGATOR)
                .flatMap((tabNavigatorRoute) => {
                    const workspaceNavigatorRoute = getTabState(tabNavigatorRoute)?.routes?.find((route) => route.name === NAVIGATORS.WORKSPACE_NAVIGATOR);
                    const workspaceNavigatorState = workspaceNavigatorRoute?.state ?? (workspaceNavigatorRoute?.key ? getPreservedNavigatorState(workspaceNavigatorRoute.key) : undefined);
                    return workspaceNavigatorState?.routes?.filter((route) => isWorkspaceNavigatorRouteName(route.name)) ?? [];
                })
                .at(-1);

            if (lastWorkspaceRoute) {
                const tabState = lastWorkspaceRoute.state ?? (lastWorkspaceRoute.key ? getPreservedNavigatorState(lastWorkspaceRoute.key) : undefined);
                return {lastWorkspacesTabNavigatorRoute: lastWorkspaceRoute, workspacesTabState: tabState, topmostFullScreenRoute};
            }

            // Fall back to session storage when no workspace route exists anywhere in the navigation tree.
            // getStateFromPath returns state rooted at TAB_NAVIGATOR, so we must drill into it first.
            const sessionTabNavigatorRoute = getWorkspacesTabStateFromSessionStorage()?.routes?.findLast((route) => route.name === NAVIGATORS.TAB_NAVIGATOR);
            const sessionRoute = getTabState(sessionTabNavigatorRoute)
                ?.routes?.findLast((route) => route.name === NAVIGATORS.WORKSPACE_NAVIGATOR)
                ?.state?.routes?.findLast((route) => isWorkspaceNavigatorRouteName(route.name));
            if (sessionRoute) {
                return {lastWorkspacesTabNavigatorRoute: sessionRoute, workspacesTabState: sessionRoute.state, topmostFullScreenRoute};
            }

            return {topmostFullScreenRoute};
        })();

        const {lastWorkspacesTabNavigatorRoute, workspacesTabState, topmostFullScreenRoute} = routeState;

        // If the last route was a specific workspace or domain, extract its ID from params
        const params = workspacesTabState?.routes?.at(0)?.params as
            | WorkspaceSplitNavigatorParamList[typeof SCREENS.WORKSPACE.INITIAL]
            | DomainSplitNavigatorParamList[typeof SCREENS.DOMAIN.INITIAL];
        const paramsPolicyID = params && 'policyID' in params ? params.policyID : undefined;
        const paramsDomainAccountID = params && 'domainAccountID' in params ? params.domainAccountID : undefined;

        // Fetch the policy/domain to verify it's still accessible (not deleted/hidden) before restoring
        const lastViewedPolicy =
            lastWorkspacesTabNavigatorRoute?.name === NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR && paramsPolicyID ? allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${paramsPolicyID}`] : undefined;
        const lastViewedDomain =
            lastWorkspacesTabNavigatorRoute?.name === NAVIGATORS.DOMAIN_SPLIT_NAVIGATOR && paramsDomainAccountID
                ? allDomains?.[`${ONYXKEYS.COLLECTION.DOMAIN}${paramsDomainAccountID}`]
                : undefined;

        navigateToWorkspacesPage({
            shouldUseNarrowLayout,
            currentUserLogin,
            policy: lastViewedPolicy,
            domain: lastViewedDomain,
            lastWorkspacesTabNavigatorRoute,
            topmostFullScreenRoute,
            workspacesTabState,
        });
    };
}

export default useRestoreWorkspacesTabOnNavigate;
