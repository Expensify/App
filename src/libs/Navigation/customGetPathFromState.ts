import {getPathFromState} from '@react-navigation/native';
import NAVIGATORS from '@src/NAVIGATORS';
import {State} from './types';

const extractPolicyIdFromState = (state: State) => state.routes.find((route) => route.name === NAVIGATORS.BOTTOM_TAB_NAVIGATOR)?.state?.routes.at(-1)?.params?.policyID;

const customGetPathFromState: typeof getPathFromState = (state, options) => {
    const extractedPolicyID = extractPolicyIdFromState(state);
    return `${extractedPolicyID ? `/w/${extractedPolicyID}` : ''}${getPathFromState(state, options)}`;
};

export default customGetPathFromState;
