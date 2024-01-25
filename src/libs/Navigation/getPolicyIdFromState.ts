import getTopmostBottomTabRoute from './getTopmostBottomTabRoute';
import type {RootStackParamList, State} from './types';

const getPolicyIdFromState = (state: State<RootStackParamList>): string | undefined => {
    const topmostBottomTabRoute = getTopmostBottomTabRoute(state);

    const shouldAddPolicyIdToUrl = !!topmostBottomTabRoute && !!topmostBottomTabRoute.params && 'policyID' in topmostBottomTabRoute.params && !!topmostBottomTabRoute.params?.policyID;

    if (!shouldAddPolicyIdToUrl) {
        return undefined;
    }

    return topmostBottomTabRoute.params?.policyID as string;
};

export default getPolicyIdFromState;
