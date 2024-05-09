import {getPathFromState} from '@react-navigation/native';
import _ from 'lodash';
import getPolicyIDFromState from '@libs/Navigation/getPolicyIDFromState';
import getTopmostBottomTabRoute from '@libs/Navigation/getTopmostBottomTabRoute';
import type {RootStackParamList, State} from '@libs/Navigation/types';
import SCREENS from '@src/SCREENS';

const removePolicyIDParamFromState = (state: State<RootStackParamList>) => {
    const stateCopy = _.cloneDeep(state);
    const bottomTabRoute = getTopmostBottomTabRoute(stateCopy);
    if (bottomTabRoute?.params && 'policyID' in bottomTabRoute.params) {
        delete bottomTabRoute.params.policyID;
    }
    return stateCopy;
};

const customGetPathFromState: typeof getPathFromState = (state, options) => {
    // For the Home and Settings pages we should remove policyID from the params, because on small screens it's displayed twice in the URL
    const stateWithoutPolicyID = removePolicyIDParamFromState(state as State<RootStackParamList>);
    const path = getPathFromState(stateWithoutPolicyID, options);
    const policyIDFromState = getPolicyIDFromState(state as State<RootStackParamList>);
    const isHomeOpened = getTopmostBottomTabRoute(state as State<RootStackParamList>)?.name === SCREENS.HOME;
    return `${policyIDFromState && isHomeOpened ? `/w/${policyIDFromState}` : ''}${path}`;
};

export default customGetPathFromState;
