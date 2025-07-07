"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var useOnyx_1 = require("./useOnyx");
function getPolicyIDOrDefault(policyID) {
    if (!policyID || policyID === CONST_1.default.POLICY.OWNER_EMAIL_FAKE) {
        return '-1';
    }
    return policyID;
}
function usePolicy(policyID) {
    var policy = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(getPolicyIDOrDefault(policyID)))[0];
    return policy;
}
exports.default = usePolicy;
