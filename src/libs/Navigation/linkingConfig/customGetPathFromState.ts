import {getPathFromState} from '@react-navigation/native';
import type {NavigationPartialRoute, RootStackParamList, State} from '@libs/Navigation/types';
import {isFullScreenRoute, removePolicyIDParamFromState} from '@libs/NavigationUtils';
import NAVIGATORS from '@src/NAVIGATORS';

const customGetPathFromState: typeof getPathFromState = (state, options) => {
    // For the Home page we should remove policyID from the params, because on small screens it's displayed twice in the URL
    const stateWithoutPolicyID = removePolicyIDParamFromState(state as State<RootStackParamList>);
    const path = getPathFromState(stateWithoutPolicyID, options);
    const topmostSplitOrSearchRoute = state.routes.findLast((route) => isFullScreenRoute(route as NavigationPartialRoute));

    const shouldAddPolicyID = topmostSplitOrSearchRoute?.name === NAVIGATORS.REPORTS_SPLIT_NAVIGATOR;

    if (!shouldAddPolicyID) {
        return path;
    }

    const policyID = topmostSplitOrSearchRoute.params && `policyID` in topmostSplitOrSearchRoute.params ? (topmostSplitOrSearchRoute.params.policyID as string) : undefined;

    return `${policyID ? `/w/${policyID}` : ''}${path}`;
};

export default customGetPathFromState;
