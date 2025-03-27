import type {NavigationPartialRoute, RootNavigatorParamList, State} from '@libs/Navigation/types';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';
import extractPolicyIDFromQuery from './extractPolicyIDFromQuery';

/**
 * returns policyID value if one exists in navigation state
 *
 * PolicyID in this app can be stored in two ways:
 *  - on NAVIGATORS.REPORTS_SPLIT_NAVIGATOR as `policyID` param
 *  - on Search related screens as policyID filter inside `q` (SearchQuery) param (only for Search_Root)
 */
const getPolicyIDFromState = (state: State<RootNavigatorParamList>): string | undefined => {
    const lastPolicyRoute = state?.routes?.findLast((route) => route.name === NAVIGATORS.REPORTS_SPLIT_NAVIGATOR || route.name === NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR);
    if (lastPolicyRoute?.params && 'policyID' in lastPolicyRoute.params) {
        return lastPolicyRoute?.params?.policyID;
    }

    // Handle SEARCH navigator
    const lastSearchRoute = lastPolicyRoute?.state?.routes?.findLast((route) => route.name === SCREENS.SEARCH.ROOT);

    if (lastSearchRoute) {
        return extractPolicyIDFromQuery(lastSearchRoute as NavigationPartialRoute);
    }

    return undefined;
};

export default getPolicyIDFromState;
