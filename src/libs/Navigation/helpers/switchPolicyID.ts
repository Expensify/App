import navigationRef from '@libs/Navigation/navigationRef';
import CONST from '@src/CONST';

export default function switchPolicyID(newPolicyID: string | undefined) {
    navigationRef.dispatch({type: CONST.NAVIGATION.ACTION_TYPE.SWITCH_POLICY_ID, payload: {policyID: newPolicyID}});
}
