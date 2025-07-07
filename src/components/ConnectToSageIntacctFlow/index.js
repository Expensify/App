"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var useOnyx_1 = require("@hooks/useOnyx");
var connections_1 = require("@libs/actions/connections");
var Policy_1 = require("@libs/actions/Policy/Policy");
var Navigation_1 = require("@libs/Navigation/Navigation");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
function ConnectToSageIntacctFlow(_a) {
    var policyID = _a.policyID;
    var hasPoliciesConnectedToSageIntacct = !!(0, Policy_1.getAdminPoliciesConnectedToSageIntacct)().length;
    var policy = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID))[0];
    var shouldGoToEnterCredentials = (0, connections_1.isAuthenticationError)(policy, CONST_1.default.POLICY.CONNECTIONS.NAME.SAGE_INTACCT);
    (0, react_1.useEffect)(function () {
        if (shouldGoToEnterCredentials) {
            Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_SAGE_INTACCT_ENTER_CREDENTIALS.getRoute(policyID));
            return;
        }
        if (!hasPoliciesConnectedToSageIntacct) {
            Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_SAGE_INTACCT_PREREQUISITES.getRoute(policyID));
            return;
        }
        Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_SAGE_INTACCT_EXISTING_CONNECTIONS.getRoute(policyID));
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);
    return null;
}
exports.default = ConnectToSageIntacctFlow;
