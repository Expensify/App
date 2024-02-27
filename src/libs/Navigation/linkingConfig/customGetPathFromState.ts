import {getPathFromState} from '@react-navigation/native';
import _ from 'lodash';
import getPolicyIDFromState from '@libs/Navigation/getPolicyIDFromState';
import getTopmostBottomTabRoute from '@libs/Navigation/getTopmostBottomTabRoute';
import type {RootStackParamList, State} from '@libs/Navigation/types';
import SCREENS from '@src/SCREENS';

const removePolicyIDParamFromState = (state: State<RootStackParamList>) => {
    const stateCopy = _.cloneDeep(state);
    const bottomTabRoute = getTopmostBottomTabRoute(stateCopy);
    if (bottomTabRoute?.name === SCREENS.HOME && bottomTabRoute?.params && 'policyID' in bottomTabRoute.params) {
        delete bottomTabRoute.params.policyID;
    }
    return stateCopy;
};

const customGetPathFromState: typeof getPathFromState = (state, options) => {
    const stateWithoutPolicyID = removePolicyIDParamFromState(state as State<RootStackParamList>);

    // For the Home page we should remove policyID from the params,
    const path = getPathFromState(stateWithoutPolicyID, options);
    const policyIDFromState = getPolicyIDFromState(state as State<RootStackParamList>);
    const isWorkspaceSettingsOpened = getTopmostBottomTabRoute(state as State<RootStackParamList>)?.name === SCREENS.WORKSPACE.INITIAL && path.includes('workspace');
    return `${policyIDFromState && !isWorkspaceSettingsOpened ? `/w/${policyIDFromState}` : ''}${path}`;
};

export default customGetPathFromState;
