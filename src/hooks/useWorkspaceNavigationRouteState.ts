import type {OnyxCollection} from 'react-native-onyx';
import {getPreservedNavigatorState} from '@libs/Navigation/AppNavigator/createSplitNavigator/usePreserveNavigatorState';
import {isFullScreenName, isWorkspacesTabScreenName} from '@libs/Navigation/helpers/isNavigatorName';
import {getWorkspacesTabStateFromSessionStorage} from '@libs/Navigation/helpers/lastVisitedTabPathUtils';
import type {DomainSplitNavigatorParamList, WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {Domain, Policy} from '@src/types/onyx';
import useOnyx from './useOnyx';
import useRootNavigationState from './useRootNavigationState';

function useWorkspaceNavigationRouteState() {
    const routeState = useRootNavigationState((rootState) => {
        const topmostFullScreenRoute = rootState?.routes?.findLast((route) => isFullScreenName(route.name));
        if (!topmostFullScreenRoute) {
            return {};
        }

        // Try navigation state first
        const lastWorkspacesTabNavigatorRoute = rootState?.routes.findLast((route) => isWorkspacesTabScreenName(route.name));

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

    const {lastWorkspacesTabNavigatorRoute, workspacesTabState, topmostFullScreenRoute} = routeState;

    const params = workspacesTabState?.routes?.at(0)?.params as
        | WorkspaceSplitNavigatorParamList[typeof SCREENS.WORKSPACE.INITIAL]
        | DomainSplitNavigatorParamList[typeof SCREENS.DOMAIN.INITIAL];

    const paramsPolicyID = params && 'policyID' in params ? params.policyID : undefined;
    const paramsDomainAccountID = params && 'domainAccountID' in params ? params.domainAccountID : undefined;

    const lastViewedPolicySelector = (policies: OnyxCollection<Policy>) => {
        if (!lastWorkspacesTabNavigatorRoute || lastWorkspacesTabNavigatorRoute.name !== NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR || !paramsPolicyID) {
            return undefined;
        }
        return policies?.[`${ONYXKEYS.COLLECTION.POLICY}${paramsPolicyID}`];
    };
    const [lastViewedPolicy] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: lastViewedPolicySelector}, [lastWorkspacesTabNavigatorRoute, paramsPolicyID]);

    const lastViewedDomainSelector = (domains: OnyxCollection<Domain>) => {
        if (!lastWorkspacesTabNavigatorRoute || lastWorkspacesTabNavigatorRoute.name !== NAVIGATORS.DOMAIN_SPLIT_NAVIGATOR || !paramsDomainAccountID) {
            return undefined;
        }
        return domains?.[`${ONYXKEYS.COLLECTION.DOMAIN}${paramsDomainAccountID}`];
    };
    const [lastViewedDomain] = useOnyx(ONYXKEYS.COLLECTION.DOMAIN, {selector: lastViewedDomainSelector}, [lastWorkspacesTabNavigatorRoute, paramsDomainAccountID]);

    return {lastWorkspacesTabNavigatorRoute, topmostFullScreenRoute, lastViewedPolicy, lastViewedDomain};
}

export default useWorkspaceNavigationRouteState;
