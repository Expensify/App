import getTopmostBottomTabRoute from './getTopmostBottomTabRoute';
import type {State} from './types';

const getPolicyIdFromState = (state: State) => {
    const topmostBottomTabRoute = getTopmostBottomTabRoute(state);

    const shouldAddPolicyIdToUrl = !!topmostBottomTabRoute && !!topmostBottomTabRoute.params && 'policyID' in topmostBottomTabRoute.params && !!topmostBottomTabRoute.params?.policyID;

    return shouldAddPolicyIdToUrl ? (topmostBottomTabRoute.params?.policyID as string) : '';
};

export default getPolicyIdFromState;
