import getTopmostBottomTabRoute from './getTopmostBottomTabRoute';
import type {RootStackParamList, State} from './types';

const getPolicyIDFromState = (state: State<RootStackParamList>): string | undefined => {
    const topmostBottomTabRoute = getTopmostBottomTabRoute(state);

    const shouldAddPolicyIDToUrl = !!topmostBottomTabRoute && !!topmostBottomTabRoute.params && 'policyID' in topmostBottomTabRoute.params && !!topmostBottomTabRoute.params?.policyID;

    if (!shouldAddPolicyIDToUrl) {
        return undefined;
    }

    return topmostBottomTabRoute.params?.policyID as string;
};

export default getPolicyIDFromState;
