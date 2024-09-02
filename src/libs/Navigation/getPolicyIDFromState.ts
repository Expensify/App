import extractPolicyIDFromQuery from './extractPolicyIDFromQuery';
import getTopmostBottomTabRoute from './getTopmostBottomTabRoute';
import type {RootStackParamList, State} from './types';

/**
 * returns policyID value if one exists in navigation state
 *
 * PolicyID in this app can be stored in two ways:
 *  - on most screens but NOT Search as `policyID` param
 *  - on Search related screens as policyID filter inside `q` (SearchQuery) param
 */
const getPolicyIDFromState = (state: State<RootStackParamList>): string | undefined => {
    const topmostBottomTabRoute = getTopmostBottomTabRoute(state);

    const policyID = topmostBottomTabRoute && topmostBottomTabRoute.params && 'policyID' in topmostBottomTabRoute.params && topmostBottomTabRoute.params?.policyID;
    if (policyID) {
        return topmostBottomTabRoute.params?.policyID as string;
    }

    return extractPolicyIDFromQuery(topmostBottomTabRoute);
};

export default getPolicyIDFromState;
