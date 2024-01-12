import {getPathFromState} from '@react-navigation/native';
import SCREENS from '@src/SCREENS';
import getPolicyIdFromState from './getPolicyIdFromState';
import getTopmostBottomTabRoute from './getTopmostBottomTabRoute';

const customGetPathFromState: typeof getPathFromState = (state, options) => {
    const path = getPathFromState(state, options);
    const policyIDFromState = getPolicyIdFromState(state);
    const isWorkspaceSettingsOpened = getTopmostBottomTabRoute(state)?.name === SCREENS.WORKSPACE.INITIAL && path.includes('workspace');
    return `${policyIDFromState && !isWorkspaceSettingsOpened ? `/w/${policyIDFromState}` : ''}${path}`;
};

export default customGetPathFromState;
