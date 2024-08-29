import {getPathFromState} from '@react-navigation/native';
import getPolicyIDFromState from '@libs/Navigation/getPolicyIDFromState';
import getTopmostBottomTabRoute from '@libs/Navigation/getTopmostBottomTabRoute';
import type {BottomTabName, RootStackParamList, State} from '@libs/Navigation/types';
import {removePolicyIDParamFromState} from '@libs/NavigationUtils';
import SCREENS from '@src/SCREENS';

// The policy ID parameter should be included in the URL when any of these pages is opened in the bottom tab.
const SCREENS_WITH_POLICY_ID_IN_URL: BottomTabName[] = [SCREENS.HOME] as const;

const customGetPathFromState: typeof getPathFromState = (state, options) => {
    // For the Home and Settings pages we should remove policyID from the params, because on small screens it's displayed twice in the URL
    const stateWithoutPolicyID = removePolicyIDParamFromState(state as State<RootStackParamList>);
    const path = getPathFromState(stateWithoutPolicyID, options);
    const policyIDFromState = getPolicyIDFromState(state as State<RootStackParamList>);
    const topmostBottomTabRouteName = getTopmostBottomTabRoute(state as State<RootStackParamList>)?.name;
    const shouldAddPolicyID = !!topmostBottomTabRouteName && SCREENS_WITH_POLICY_ID_IN_URL.includes(topmostBottomTabRouteName);
    return `${policyIDFromState && shouldAddPolicyID ? `/w/${policyIDFromState}` : ''}${path}`;
};

export default customGetPathFromState;
