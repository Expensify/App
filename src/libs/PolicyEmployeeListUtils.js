"use strict";
exports.__esModule = true;
var react_native_onyx_1 = require("react-native-onyx");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var Report_1 = require("./actions/Report");
var PolicyUtils_1 = require("./PolicyUtils");
var allPolicies = {};
react_native_onyx_1["default"].connect({
    key: ONYXKEYS_1["default"].COLLECTION.POLICY,
    waitForCollectionCallback: true,
    callback: function (value) { return (allPolicies = value); }
});
function getPolicyEmployeeAccountIDs(policyID) {
    if (!policyID) {
        return [];
    }
    var currentUserAccountID = Report_1.getCurrentUserAccountID();
    return PolicyUtils_1.getPolicyEmployeeListByIdWithoutCurrentUser(allPolicies, policyID, currentUserAccountID);
}
exports["default"] = getPolicyEmployeeAccountIDs;
