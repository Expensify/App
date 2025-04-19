
exports.__esModule = true;
const navigationRef_1 = require('@libs/Navigation/navigationRef');
const CONST_1 = require('@src/CONST');

function switchPolicyID(newPolicyID) {
    navigationRef_1['default'].dispatch({type: CONST_1['default'].NAVIGATION.ACTION_TYPE.SWITCH_POLICY_ID, payload: {policyID: newPolicyID}});
}
exports['default'] = switchPolicyID;
