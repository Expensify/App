import {getPathFromState} from '@react-navigation/native';
import SCREENS from '@src/SCREENS';
import getPolicyIdFromState from './getPolicyIdFromState';
import getTopmostBottomTabRoute from './getTopmostBottomTabRoute';

const customGetPathFromState: typeof getPathFromState = (state, options) => {
    const policyIDFromState = getPolicyIdFromState(state);
    const isWorkspaceSettingsOpened = getTopmostBottomTabRoute(state)?.name !== SCREENS.WORKSPACE.INITIAL;

    return `${policyIDFromState && isWorkspaceSettingsOpened ? `/w/${policyIDFromState}` : ''}${getPathFromState(state, options)}`;
};

export default customGetPathFromState;
