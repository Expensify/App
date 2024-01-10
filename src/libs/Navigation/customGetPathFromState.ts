import {getPathFromState} from '@react-navigation/native';
import SCREENS from '@src/SCREENS';
import getTopmostBottomTabRoute from './getTopmostBottomTabRoute';

const customGetPathFromState: typeof getPathFromState = (state, options) => {
    const topmostBottomTabRoute = getTopmostBottomTabRoute(state);

    const shouldAddPolicyIdToUrl =
        !!topmostBottomTabRoute &&
        !!topmostBottomTabRoute.params &&
        'policyID' in topmostBottomTabRoute.params &&
        !!topmostBottomTabRoute.params?.policyID &&
        topmostBottomTabRoute.name !== SCREENS.WORKSPACE.INITIAL;

    return `${shouldAddPolicyIdToUrl ? `/w/${topmostBottomTabRoute.params?.policyID}` : ''}${getPathFromState(state, options)}`;
};

export default customGetPathFromState;
