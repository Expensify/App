import {getPathFromState} from '@react-navigation/native';
import getPolicyIdFromState from '@libs/Navigation/getPolicyIdFromState';
import getTopmostBottomTabRoute from '@libs/Navigation/getTopmostBottomTabRoute';
import type {RootStackParamList, State} from '@libs/Navigation/types';
import SCREENS from '@src/SCREENS';

const customGetPathFromState: typeof getPathFromState = (state, options) => {
    const path = getPathFromState(state, options);
    const policyIDFromState = getPolicyIdFromState(state);
    const isWorkspaceSettingsOpened = getTopmostBottomTabRoute(state as State<RootStackParamList>)?.name === SCREENS.WORKSPACE.INITIAL && path.includes('workspace');
    return `${policyIDFromState && !isWorkspaceSettingsOpened ? `/w/${policyIDFromState}` : ''}${path}`;
};

export default customGetPathFromState;
