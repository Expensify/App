import {getPathFromState} from '@react-navigation/native';
import NAVIGATORS from '@src/NAVIGATORS';
import {isFullScreenName} from './isNavigatorName';

// This function adds the policyID param to the url.
const customGetPathFromState: typeof getPathFromState = (state, options) => {
    const path = getPathFromState(state, options);
    const fullScreenRoute = state.routes.findLast((route) => isFullScreenName(route.name));

    const shouldAddPolicyID = fullScreenRoute?.name === NAVIGATORS.REPORTS_SPLIT_NAVIGATOR;

    if (!shouldAddPolicyID) {
        return path;
    }

    const policyID = fullScreenRoute.params && `policyID` in fullScreenRoute.params ? (fullScreenRoute.params.policyID as string) : undefined;

    return `${policyID ? `/w/${policyID}` : ''}${path}`;
};

export default customGetPathFromState;
