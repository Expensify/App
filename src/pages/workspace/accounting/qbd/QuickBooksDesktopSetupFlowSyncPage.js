"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var useOnyx_1 = require("@hooks/useOnyx");
var connections_1 = require("@libs/actions/connections");
var Navigation_1 = require("@libs/Navigation/Navigation");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
function QuickBooksDesktopSetupFlowSyncPage(_a) {
    var route = _a.route;
    var policyID = route.params.policyID;
    var policy = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID !== null && policyID !== void 0 ? policyID : '-1'))[0];
    var connectionSyncProgress = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS).concat(policyID !== null && policyID !== void 0 ? policyID : '-1'))[0];
    (0, react_1.useEffect)(function () {
        if (!policyID) {
            return;
        }
        var isSyncInProgress = (0, connections_1.isConnectionInProgress)(connectionSyncProgress, policy);
        if (!isSyncInProgress) {
            (0, connections_1.syncConnection)(policy, CONST_1.default.POLICY.CONNECTIONS.NAME.QBD, true);
        }
        Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_ACCOUNTING.getRoute(policyID));
        // disabling this rule, as we want this to run only on the first render
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);
    return null;
}
QuickBooksDesktopSetupFlowSyncPage.displayName = 'QuickBooksDesktopSetupFlowSyncPage';
exports.default = QuickBooksDesktopSetupFlowSyncPage;
