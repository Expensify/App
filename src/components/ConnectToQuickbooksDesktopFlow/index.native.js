"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var Navigation_1 = require("@libs/Navigation/Navigation");
var ROUTES_1 = require("@src/ROUTES");
function ConnectToQuickbooksDesktopFlow(_a) {
    var policyID = _a.policyID;
    (0, react_1.useEffect)(function () {
        Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_SETUP_REQUIRED_DEVICE_MODAL.getRoute(policyID));
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);
    return null;
}
ConnectToQuickbooksDesktopFlow.displayName = 'ConnectToQuickbooksDesktopFlow';
exports.default = ConnectToQuickbooksDesktopFlow;
