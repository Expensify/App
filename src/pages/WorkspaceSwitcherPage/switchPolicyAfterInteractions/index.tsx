import {navigationRef} from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';

function switchPolicyAfterInteractions(newPolicyID: string | undefined) {
    navigationRef.dispatch({type: CONST.NAVIGATION.ACTION_TYPE.SWITCH_POLICY_ID, payload: {policyID: newPolicyID}});
}

export default switchPolicyAfterInteractions;
