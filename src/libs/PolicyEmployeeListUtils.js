
exports.__esModule = true;
const react_native_onyx_1 = require('react-native-onyx');
const ONYXKEYS_1 = require('@src/ONYXKEYS');
const Report_1 = require('./actions/Report');
const PolicyUtils_1 = require('./PolicyUtils');

let allPolicies = {};
react_native_onyx_1['default'].connect({
    key: ONYXKEYS_1['default'].COLLECTION.POLICY,
    waitForCollectionCallback: true,
    callback (value) {
        return (allPolicies = value);
    },
});
function getPolicyEmployeeAccountIDs(policyID) {
    if (!policyID) {
        return [];
    }
    const currentUserAccountID = Report_1.getCurrentUserAccountID();
    return PolicyUtils_1.getPolicyEmployeeListByIdWithoutCurrentUser(allPolicies, policyID, currentUserAccountID);
}
exports['default'] = getPolicyEmployeeAccountIDs;
