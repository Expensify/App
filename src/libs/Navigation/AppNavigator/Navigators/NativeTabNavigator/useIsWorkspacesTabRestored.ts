import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useOnyx from '@hooks/useOnyx';

import getFocusedLeafScreenName from '@libs/Navigation/helpers/getFocusedLeafScreenName';
import {isPendingDeletePolicy, shouldShowPolicy} from '@libs/PolicyUtils';

import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {Domain, Policy} from '@src/types/onyx';

import type {NavigationState, PartialState} from '@react-navigation/native';
import type {OnyxEntry} from 'react-native-onyx';

type WorkspacesTabRoute = {
    state?: NavigationState | PartialState<NavigationState>;
};

const domainExistsSelector = (domain: OnyxEntry<Domain>) => !!domain?.accountID;

/**
 * Whether the Workspaces tab shows what its JS tab button restores on narrow layouts, so a plain switch to the tab
 * lands on the same page: the workspaces list, the initial page of a workspace that is still shown, or a domain that
 * still exists. Any other page is replaced by the tab button, see navigateToWorkspacesPage.
 */
function useIsWorkspacesTabRestored(workspacesTabRoute: WorkspacesTabRoute | undefined) {
    const {login: currentUserLogin} = useCurrentUserPersonalDetails();
    const navigatorState = workspacesTabRoute?.state;
    const topRoute = navigatorState?.routes.at(navigatorState.index ?? -1);
    const splitRootParams = topRoute?.state?.routes.at(0)?.params;
    const policyID = topRoute?.name === NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR && splitRootParams && 'policyID' in splitRootParams ? String(splitRootParams.policyID) : undefined;
    const domainAccountID =
        topRoute?.name === NAVIGATORS.DOMAIN_SPLIT_NAVIGATOR && splitRootParams && 'domainAccountID' in splitRootParams ? String(splitRootParams.domainAccountID) : undefined;
    const isPolicyShownSelector = (policy: OnyxEntry<Policy>) => shouldShowPolicy(policy, false, currentUserLogin) && !isPendingDeletePolicy(policy);
    const [isPolicyShown = false] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {selector: isPolicyShownSelector});
    const [doesDomainExist = false] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {selector: domainExistsSelector});

    switch (topRoute?.name) {
        case SCREENS.WORKSPACES_LIST:
            return true;
        case NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR:
            return !!policyID && isPolicyShown && getFocusedLeafScreenName(topRoute.state) === SCREENS.WORKSPACE.INITIAL;
        case NAVIGATORS.DOMAIN_SPLIT_NAVIGATOR:
            return !!domainAccountID && doesDomainExist;
        default:
            return false;
    }
}

export default useIsWorkspacesTabRestored;
