"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountingContextProvider = AccountingContextProvider;
exports.useAccountingContext = useAccountingContext;
var react_1 = require("react");
var AccountingConnectionConfirmationModal_1 = require("@components/AccountingConnectionConfirmationModal");
var useLocalize_1 = require("@hooks/useLocalize");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var connections_1 = require("@libs/actions/connections");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
var utils_1 = require("./utils");
var popoverAnchorRefsInitialValue = Object.values(CONST_1.default.POLICY.CONNECTIONS.NAME).reduce(function (acc, key) {
    acc[key] = { current: null };
    return acc;
}, {});
var defaultAccountingContext = {
    activeIntegration: undefined,
    startIntegrationFlow: function () { },
    popoverAnchorRefs: {
        current: popoverAnchorRefsInitialValue,
    },
};
var AccountingContext = react_1.default.createContext(defaultAccountingContext);
function AccountingContextProvider(_a) {
    var children = _a.children, policy = _a.policy;
    var popoverAnchorRefs = (0, react_1.useRef)(defaultAccountingContext.popoverAnchorRefs.current);
    var _b = (0, react_1.useState)(), activeIntegration = _b[0], setActiveIntegration = _b[1];
    var translate = (0, useLocalize_1.default)().translate;
    var policyID = policy === null || policy === void 0 ? void 0 : policy.id;
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to allow QuickBooks Desktop setup to be shown only on large screens
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    var isSmallScreenWidth = (0, useResponsiveLayout_1.default)().isSmallScreenWidth;
    var startIntegrationFlow = react_1.default.useCallback(function (newActiveIntegration) {
        if (!policyID) {
            return;
        }
        var accountingIntegrationData = (0, utils_1.getAccountingIntegrationData)(newActiveIntegration.name, policyID, translate, undefined, undefined, newActiveIntegration.integrationToDisconnect, newActiveIntegration.shouldDisconnectIntegrationBeforeConnecting, undefined, isSmallScreenWidth);
        var workspaceUpgradeNavigationDetails = accountingIntegrationData === null || accountingIntegrationData === void 0 ? void 0 : accountingIntegrationData.workspaceUpgradeNavigationDetails;
        if (workspaceUpgradeNavigationDetails && !(0, PolicyUtils_1.isControlPolicy)(policy)) {
            Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_UPGRADE.getRoute(policyID, workspaceUpgradeNavigationDetails.integrationAlias, workspaceUpgradeNavigationDetails.backToAfterWorkspaceUpgradeRoute));
            return;
        }
        setActiveIntegration(__assign(__assign({}, newActiveIntegration), { key: Math.random() }));
    }, [isSmallScreenWidth, policy, policyID, translate]);
    var closeConfirmationModal = function () {
        setActiveIntegration(function (prev) {
            if (prev) {
                return __assign(__assign({}, prev), { shouldDisconnectIntegrationBeforeConnecting: false, integrationToDisconnect: undefined });
            }
            return undefined;
        });
    };
    var accountingContext = (0, react_1.useMemo)(function () { return ({
        activeIntegration: activeIntegration,
        startIntegrationFlow: startIntegrationFlow,
        popoverAnchorRefs: popoverAnchorRefs,
    }); }, [activeIntegration, startIntegrationFlow]);
    var renderActiveIntegration = function () {
        var _a;
        if (!policyID || !activeIntegration) {
            return null;
        }
        return (_a = (0, utils_1.getAccountingIntegrationData)(activeIntegration.name, policyID, translate, policy, activeIntegration.key)) === null || _a === void 0 ? void 0 : _a.setupConnectionFlow;
    };
    var shouldShowConfirmationModal = !!(activeIntegration === null || activeIntegration === void 0 ? void 0 : activeIntegration.shouldDisconnectIntegrationBeforeConnecting) && !!(activeIntegration === null || activeIntegration === void 0 ? void 0 : activeIntegration.integrationToDisconnect);
    return (<AccountingContext.Provider value={accountingContext}>
            {children}
            {!shouldShowConfirmationModal && renderActiveIntegration()}
            {shouldShowConfirmationModal && (<AccountingConnectionConfirmationModal_1.default onConfirm={function () {
                if (!policyID || !(activeIntegration === null || activeIntegration === void 0 ? void 0 : activeIntegration.integrationToDisconnect)) {
                    return;
                }
                (0, connections_1.removePolicyConnection)(policyID, activeIntegration === null || activeIntegration === void 0 ? void 0 : activeIntegration.integrationToDisconnect);
                closeConfirmationModal();
            }} integrationToConnect={activeIntegration === null || activeIntegration === void 0 ? void 0 : activeIntegration.name} onCancel={function () {
                setActiveIntegration(undefined);
            }}/>)}
        </AccountingContext.Provider>);
}
function useAccountingContext() {
    return (0, react_1.useContext)(AccountingContext);
}
exports.default = AccountingContext;
