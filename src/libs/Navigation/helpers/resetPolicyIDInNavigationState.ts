import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import type {AuthScreensParamList} from '@libs/Navigation/types';
import * as SearchQueryUtils from '@libs/SearchQueryUtils';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

/**
 * Reset the policyID stored in the navigation state to undefined.
 * It is necessary to reset this id after deleting the policy which is currently selected in the app.
 */
function resetPolicyIDInNavigationState() {
    const rootState = navigationRef.getRootState();
    const lastPolicyRoute = rootState?.routes?.findLast((route) => route.name === NAVIGATORS.REPORTS_SPLIT_NAVIGATOR || route.name === SCREENS.SEARCH.CENTRAL_PANE);

    if (!lastPolicyRoute) {
        return;
    }

    if (lastPolicyRoute.params && 'policyID' in lastPolicyRoute.params) {
        Navigation.setParams({policyID: undefined}, lastPolicyRoute.key);
        return;
    }

    const {q, ...rest} = lastPolicyRoute.params as AuthScreensParamList[typeof SCREENS.SEARCH.CENTRAL_PANE];
    const queryJSON = SearchQueryUtils.buildSearchQueryJSON(q);
    if (!queryJSON || !queryJSON.policyID) {
        return;
    }

    delete queryJSON.policyID;
    Navigation.setParams({q: SearchQueryUtils.buildSearchQueryString(queryJSON), ...rest}, lastPolicyRoute.key);
}

export default resetPolicyIDInNavigationState;
