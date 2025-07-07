"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var useEnvironment_1 = require("@hooks/useEnvironment");
var QuickbooksOnline_1 = require("@libs/actions/connections/QuickbooksOnline");
var Link = require("@userActions/Link");
var PolicyAction = require("@userActions/Policy/Policy");
function ConnectToQuickbooksOnlineFlow(_a) {
    var policyID = _a.policyID;
    var environmentURL = (0, useEnvironment_1.default)().environmentURL;
    (0, react_1.useEffect)(function () {
        // Since QBO doesn't support Taxes, we should disable them from the LHN when connecting to QBO
        PolicyAction.enablePolicyTaxes(policyID, false);
        Link.openLink((0, QuickbooksOnline_1.getQuickbooksOnlineSetupLink)(policyID), environmentURL);
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);
    return null;
}
ConnectToQuickbooksOnlineFlow.displayName = 'ConnectToQuickbooksOnlineFlow';
exports.default = ConnectToQuickbooksOnlineFlow;
