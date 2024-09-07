import {getPathFromState} from '@react-navigation/native';
import type {RootStackParamList, State} from '@libs/Navigation/types';
import {removePolicyIDParamFromState} from '@libs/NavigationUtils';
import NAVIGATORS from '@src/NAVIGATORS';

function getTopmostSplitNavigator(state: State<RootStackParamList> | undefined) {
    return state?.routes.findLast((route) => route.name.endsWith('SplitNavigator'));
}

const customGetPathFromState: typeof getPathFromState = (state, options) => {
    // For the Home and Settings pages we should remove policyID from the params, because on small screens it's displayed twice in the URL
    const stateWithoutPolicyID = removePolicyIDParamFromState(state as State<RootStackParamList>);
    const path = getPathFromState(stateWithoutPolicyID, options);
    const topmostSplitNavigator = getTopmostSplitNavigator(state as State<RootStackParamList>);
    const policyIDFromState = topmostSplitNavigator?.params?.policyID;
    const shouldAddPolicyID = !!topmostSplitNavigator && topmostSplitNavigator?.name === NAVIGATORS.REPORTS_SPLIT_NAVIGATOR;
    return `${policyIDFromState && shouldAddPolicyID ? `/w/${policyIDFromState}` : ''}${path}`;
};

export default customGetPathFromState;
