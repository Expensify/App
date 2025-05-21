import type {NavigationPartialRoute, RootNavigatorParamList, State} from '@libs/Navigation/types';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';
import extractPolicyIDFromQuery from './extractPolicyIDFromQuery';

/**
 * returns policyID value if one exists in navigation state
 *
 * PolicyID in this app can be stored on Search related screens as policyID filter inside `q` (SearchQuery) param (only for Search_Root)
 *
 */
const getPolicyIDFromState = (state: State<RootNavigatorParamList>): string | undefined => {
    const lastPolicyRoute = state?.routes?.findLast((route) => route.name === NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR);

    // Handle SEARCH navigator
    const lastSearchRoute = lastPolicyRoute?.state?.routes?.findLast((route) => route.name === SCREENS.SEARCH.ROOT);

    if (lastSearchRoute) {
        return extractPolicyIDFromQuery(lastSearchRoute as NavigationPartialRoute);
    }

    return undefined;
};

export default getPolicyIDFromState;
