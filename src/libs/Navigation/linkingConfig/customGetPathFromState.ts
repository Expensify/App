import {getPathFromState} from '@react-navigation/native';
import type {RootStackParamList, State} from '@libs/Navigation/types';
import {removePolicyIDParamFromState} from '@libs/NavigationUtils';
import NAVIGATORS from '@src/NAVIGATORS';

const customGetPathFromState: typeof getPathFromState = (state, options) => {
    // For the Home page we should remove policyID from the params, because on small screens it's displayed twice in the URL
    const stateWithoutPolicyID = removePolicyIDParamFromState(state as State<RootStackParamList>);
    const path = getPathFromState(stateWithoutPolicyID, options);
    const topmostRoute = state.routes.at(-1);

    const shouldAddPolicyID = !!topmostRoute && topmostRoute?.name === NAVIGATORS.REPORTS_SPLIT_NAVIGATOR;

    if (!shouldAddPolicyID) {
        return path;
    }

    const policyID = topmostRoute.params && `policyID` in topmostRoute.params ? (topmostRoute.params.policyID as string) : undefined;

    return `${policyID ? `/w/${policyID}` : ''}${path}`;
};

export default customGetPathFromState;
