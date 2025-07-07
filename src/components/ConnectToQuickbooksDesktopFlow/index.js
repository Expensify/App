"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var Navigation_1 = require("@libs/Navigation/Navigation");
var ROUTES_1 = require("@src/ROUTES");
function ConnectToQuickbooksDesktopFlow(_a) {
    var policyID = _a.policyID;
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    var isSmallScreenWidth = (0, useResponsiveLayout_1.default)().isSmallScreenWidth;
    (0, react_1.useEffect)(function () {
        if (isSmallScreenWidth) {
            Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_SETUP_REQUIRED_DEVICE_MODAL.getRoute(policyID));
        }
        else {
            Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_SETUP_MODAL.getRoute(policyID));
        }
    }, [isSmallScreenWidth, policyID]);
    return null;
}
ConnectToQuickbooksDesktopFlow.displayName = 'ConnectToQuickbooksDesktopFlow';
exports.default = ConnectToQuickbooksDesktopFlow;
