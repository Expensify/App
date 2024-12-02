import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';
import extractPolicyIDFromQuery from './extractPolicyIDFromQuery';
import type {NavigationPartialRoute, RootStackParamList, State} from './types';

/**
 * returns policyID value if one exists in navigation state
 *
 * PolicyID in this app can be stored in two ways:
 *  - on most screens but NOT Search as `policyID` param (on bottom tab screens)
 *  - on Search related screens as policyID filter inside `q` (SearchQuery) param (only for SEARCH_CENTRAL_PANE)
 */
const getPolicyIDFromState = (state: State<RootStackParamList>): string | undefined => {
    const lastPolicyRoute = state?.routes?.findLast((route) => route.name === NAVIGATORS.REPORTS_SPLIT_NAVIGATOR || route.name === SCREENS.SEARCH.CENTRAL_PANE);
    if (lastPolicyRoute?.params && 'policyID' in lastPolicyRoute.params) {
        return lastPolicyRoute?.params?.policyID;
    }

    if (lastPolicyRoute) {
        return extractPolicyIDFromQuery(lastPolicyRoute as NavigationPartialRoute<string>);
    }

    return undefined;
};

export default getPolicyIDFromState;
