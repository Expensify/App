import {getPathFromState} from '@react-navigation/native';
import _ from 'lodash';
import getPolicyIDFromState from '@libs/Navigation/getPolicyIDFromState';
import getTopmostBottomTabRoute from '@libs/Navigation/getTopmostBottomTabRoute';
import type {RootStackParamList, State} from '@libs/Navigation/types';
import SCREENS from '@src/SCREENS';

const removePolicyIDParamFromState = (state: State<RootStackParamList>) => {
    const stateCopy = _.cloneDeep(state);
    const bottomTabRoute = getTopmostBottomTabRoute(stateCopy);
    if (bottomTabRoute?.name === SCREENS.HOME && bottomTabRoute?.params && 'policyID' in bottomTabRoute?.params) {
        delete bottomTabRoute.params.policyID;
    }
    return stateCopy;
};

const customGetPathFromState: typeof getPathFromState = (state, options) => {
    // For the Home page we should remove policyID from the params,
    const path = getPathFromState(state, options);
    const policyIDFromState = getPolicyIDFromState(state as State<RootStackParamList>);
    return `${policyIDFromState ? `/w/${policyIDFromState}` : ''}${path}`;
};

export default customGetPathFromState;
