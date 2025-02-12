import SCREENS from '@src/SCREENS';
import extractPolicyIDFromQuery from './extractPolicyIDFromQuery';
import getTopmostBottomTabRoute from './getTopmostBottomTabRoute';
import getTopmostCentralPaneRoute from './getTopmostCentralPaneRoute';
import type {RootStackParamList, State} from './types';

/**
 * returns policyID value if one exists in navigation state
 *
 * PolicyID in this app can be stored in two ways:
 *  - on most screens but NOT Search as `policyID` param (on bottom tab screens)
 *  - on Search related screens as policyID filter inside `q` (SearchQuery) param (only for SEARCH_CENTRAL_PANE)
 */
const getPolicyIDFromState = (state: State<RootStackParamList>): string | undefined => {
    const topmostBottomTabRoute = getTopmostBottomTabRoute(state);

    if (!topmostBottomTabRoute) {
        return;
    }

    if (topmostBottomTabRoute.name === SCREENS.SEARCH.BOTTOM_TAB) {
        const topmostCentralPaneRoute = getTopmostCentralPaneRoute(state);
        return extractPolicyIDFromQuery(topmostCentralPaneRoute);
    }

    const policyID = topmostBottomTabRoute && topmostBottomTabRoute.params && 'policyID' in topmostBottomTabRoute.params && topmostBottomTabRoute.params?.policyID;
    return policyID ? (topmostBottomTabRoute.params?.policyID as string) : undefined;
};

export default getPolicyIDFromState;
