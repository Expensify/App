import {useCallback} from 'react';
import type {OnyxCollection} from 'react-native-onyx';
import {getPreservedNavigatorState} from '@libs/Navigation/AppNavigator/createSplitNavigator/usePreserveNavigatorState';
import {isFullScreenName, isWorkspaceNavigatorRouteName} from '@libs/Navigation/helpers/isNavigatorName';
import {getWorkspacesTabStateFromSessionStorage} from '@libs/Navigation/helpers/lastVisitedTabPathUtils';
import navigateToWorkspacesPage from '@libs/Navigation/helpers/navigateToWorkspacesPage';
import type {DomainSplitNavigatorParamList, WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {Domain, Policy} from '@src/types/onyx';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useOnyx from './useOnyx';
import useResponsiveLayout from './useResponsiveLayout';
import useRootNavigationState from './useRootNavigationState';

/**
 * The Workspaces tab can show three things: the workspaces list, a specific workspace page,
 * or a specific domain page. When the user navigates away and comes back to the tab,
 * this hook ensures they return to whichever of those they had open last — not always the list.
 *
 * It resolves the last visited route from navigation state, fetches the matching policy/domain
 * from Onyx (to verify it's still accessible), and returns a callback that performs the navigation.
 */
function useRestoreWorkspacesTabOnNavigate() {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {login: currentUserLogin} = useCurrentUserPersonalDetails();

    // Find the last route the user had open in the Workspaces tab (workspace, domain, or list).
    // Priority: live nav state -> preserved state (unmounted navigators) -> session storage.
    const routeState = useRootNavigationState((rootState) => {
        const topmostFullScreenRoute = rootState?.routes?.findLast((route) => isFullScreenName(route.name));
        if (!topmostFullScreenRoute) {
            return {};
        }

        if (topmostFullScreenRoute.name === NAVIGATORS.WORKSPACE_NAVIGATOR) {
            return {topmostFullScreenRoute, lastWorkspacesTabNavigatorRoute: topmostFullScreenRoute.state?.routes?.at(-1)};
        }

        const topmostWorkspaceNavigatorRoute = rootState?.routes?.findLast((route) => route.name === NAVIGATORS.WORKSPACE_NAVIGATOR);
        if (!topmostWorkspaceNavigatorRoute) {
            const sessionRoute = getWorkspacesTabStateFromSessionStorage()
                ?.routes?.findLast((route) => route.name === NAVIGATORS.WORKSPACE_NAVIGATOR)
                ?.state?.routes?.findLast((route) => isWorkspaceNavigatorRouteName(route.name));
            if (sessionRoute) {
                return {lastWorkspacesTabNavigatorRoute: sessionRoute, workspacesTabState: sessionRoute.state};
            }
            return {};
        }
        const workspaceNavigatorState =
            topmostWorkspaceNavigatorRoute.state ?? (topmostWorkspaceNavigatorRoute.key ? getPreservedNavigatorState(topmostWorkspaceNavigatorRoute.key) : undefined);
        const lastWorkspacesTabNavigatorRoute = workspaceNavigatorState?.routes.findLast((route) => isWorkspaceNavigatorRouteName(route.name));
        if (lastWorkspacesTabNavigatorRoute) {
            // Use route's own state, or fall back to preserved state for unmounted navigators
            const tabState = lastWorkspacesTabNavigatorRoute.state ?? (lastWorkspacesTabNavigatorRoute.key ? getPreservedNavigatorState(lastWorkspacesTabNavigatorRoute.key) : undefined);

            return {lastWorkspacesTabNavigatorRoute, workspacesTabState: tabState, topmostWorkspaceNavigatorRoute};
        }

        return {topmostWorkspaceNavigatorRoute};
    });

    const {lastWorkspacesTabNavigatorRoute, workspacesTabState, topmostFullScreenRoute} = routeState;

    // If the last route was a specific workspace or domain, extract its ID from params
    const params = workspacesTabState?.routes?.at(0)?.params as
        | WorkspaceSplitNavigatorParamList[typeof SCREENS.WORKSPACE.INITIAL]
        | DomainSplitNavigatorParamList[typeof SCREENS.DOMAIN.INITIAL];
    const paramsPolicyID = params && 'policyID' in params ? params.policyID : undefined;
    const paramsDomainAccountID = params && 'domainAccountID' in params ? params.domainAccountID : undefined;

    // Fetch the policy/domain to verify it's still accessible (not deleted/hidden) before restoring
    const lastViewedPolicySelector = useCallback(
        (policies: OnyxCollection<Policy>) => {
            if (lastWorkspacesTabNavigatorRoute?.name !== NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR || !paramsPolicyID) {
                return undefined;
            }
            return policies?.[`${ONYXKEYS.COLLECTION.POLICY}${paramsPolicyID}`];
        },
        [lastWorkspacesTabNavigatorRoute?.name, paramsPolicyID],
    );
    const [lastViewedPolicy] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: lastViewedPolicySelector});

    const lastViewedDomainSelector = useCallback(
        (domains: OnyxCollection<Domain>) => {
            if (lastWorkspacesTabNavigatorRoute?.name !== NAVIGATORS.DOMAIN_SPLIT_NAVIGATOR || !paramsDomainAccountID) {
                return undefined;
            }
            return domains?.[`${ONYXKEYS.COLLECTION.DOMAIN}${paramsDomainAccountID}`];
        },
        [lastWorkspacesTabNavigatorRoute?.name, paramsDomainAccountID],
    );
    const [lastViewedDomain] = useOnyx(ONYXKEYS.COLLECTION.DOMAIN, {selector: lastViewedDomainSelector});

    return useCallback(() => {
        navigateToWorkspacesPage({
            shouldUseNarrowLayout,
            currentUserLogin,
            policy: lastViewedPolicy,
            domain: lastViewedDomain,
            lastWorkspacesTabNavigatorRoute,
            topmostFullScreenRoute,
        });
    }, [shouldUseNarrowLayout, currentUserLogin, lastViewedPolicy, lastViewedDomain, lastWorkspacesTabNavigatorRoute, topmostFullScreenRoute]);
}

export default useRestoreWorkspacesTabOnNavigate;
