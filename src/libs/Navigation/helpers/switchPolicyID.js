"use strict";
exports.__esModule = true;
var navigationRef_1 = require("@libs/Navigation/navigationRef");
var CONST_1 = require("@src/CONST");
function switchPolicyID(newPolicyID) {
    navigationRef_1["default"].dispatch({ type: CONST_1["default"].NAVIGATION.ACTION_TYPE.SWITCH_POLICY_ID, payload: { policyID: newPolicyID } });
}
exports["default"] = switchPolicyID;
