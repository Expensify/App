"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var Expensicons = require("@components/Icon/Expensicons");
var PopoverMenu_1 = require("@components/PopoverMenu");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var connections_1 = require("@libs/actions/connections");
var Policy_1 = require("@libs/actions/Policy/Policy");
var Navigation_1 = require("@libs/Navigation/Navigation");
var AccountingContext_1 = require("@pages/workspace/accounting/AccountingContext");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
function ConnectToNetSuiteFlow(_a) {
    var _b, _c, _d;
    var policyID = _a.policyID;
    var translate = (0, useLocalize_1.default)().translate;
    var hasPoliciesConnectedToNetSuite = !!((_b = (0, Policy_1.getAdminPoliciesConnectedToNetSuite)()) === null || _b === void 0 ? void 0 : _b.length);
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to use the correct modal type
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    var isSmallScreenWidth = (0, useResponsiveLayout_1.default)().isSmallScreenWidth;
    var _e = (0, react_1.useState)(false), isReuseConnectionsPopoverOpen = _e[0], setIsReuseConnectionsPopoverOpen = _e[1];
    var _f = (0, react_1.useState)({ horizontal: 0, vertical: 0 }), reuseConnectionPopoverPosition = _f[0], setReuseConnectionPopoverPosition = _f[1];
    var popoverAnchorRefs = (0, AccountingContext_1.useAccountingContext)().popoverAnchorRefs;
    var policy = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID), { canBeMissing: true })[0];
    var shouldGoToCredentialsPage = (0, connections_1.isAuthenticationError)(policy, CONST_1.default.POLICY.CONNECTIONS.NAME.NETSUITE);
    var threeDotsMenuContainerRef = (_c = popoverAnchorRefs === null || popoverAnchorRefs === void 0 ? void 0 : popoverAnchorRefs.current) === null || _c === void 0 ? void 0 : _c[CONST_1.default.POLICY.CONNECTIONS.NAME.NETSUITE];
    var connectionOptions = [
        {
            icon: Expensicons.LinkCopy,
            text: translate('workspace.common.createNewConnection'),
            onSelected: function () {
                Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_NETSUITE_TOKEN_INPUT.getRoute(policyID));
                setIsReuseConnectionsPopoverOpen(false);
            },
        },
        {
            icon: Expensicons.Copy,
            text: translate('workspace.common.reuseExistingConnection'),
            onSelected: function () {
                Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_NETSUITE_EXISTING_CONNECTIONS.getRoute(policyID));
                setIsReuseConnectionsPopoverOpen(false);
            },
        },
    ];
    (0, react_1.useEffect)(function () {
        if (shouldGoToCredentialsPage || !hasPoliciesConnectedToNetSuite) {
            Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_NETSUITE_TOKEN_INPUT.getRoute(policyID));
            return;
        }
        setIsReuseConnectionsPopoverOpen(true);
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);
    if (threeDotsMenuContainerRef) {
        if (!isSmallScreenWidth) {
            (_d = threeDotsMenuContainerRef.current) === null || _d === void 0 ? void 0 : _d.measureInWindow(function (x, y, width, height) {
                var horizontal = x + width;
                var vertical = y + height;
                if (reuseConnectionPopoverPosition.horizontal !== horizontal || reuseConnectionPopoverPosition.vertical !== vertical) {
                    setReuseConnectionPopoverPosition({ horizontal: horizontal, vertical: vertical });
                }
            });
        }
        return (<PopoverMenu_1.default isVisible={isReuseConnectionsPopoverOpen} onClose={function () {
                setIsReuseConnectionsPopoverOpen(false);
            }} menuItems={connectionOptions} onItemSelected={function (item) {
                if (!(item === null || item === void 0 ? void 0 : item.onSelected)) {
                    return;
                }
                item.onSelected();
            }} anchorPosition={reuseConnectionPopoverPosition} anchorAlignment={{ horizontal: CONST_1.default.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT, vertical: CONST_1.default.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP }} anchorRef={threeDotsMenuContainerRef}/>);
    }
}
exports.default = ConnectToNetSuiteFlow;
