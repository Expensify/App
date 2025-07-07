"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var expensify_common_1 = require("expensify-common");
var react_1 = require("react");
var react_native_1 = require("react-native");
var RadioListItem_1 = require("@components/SelectionList/RadioListItem");
var SelectionScreen_1 = require("@components/SelectionScreen");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var QuickbooksOnline_1 = require("@libs/actions/connections/QuickbooksOnline");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var Navigation_1 = require("@navigation/Navigation");
var withPolicyConnections_1 = require("@pages/workspace/withPolicyConnections");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
function QuickbooksAccountingMethodPage(_a) {
    var _b, _c, _d, _e, _f;
    var policy = _a.policy, route = _a.route;
    var translate = (0, useLocalize_1.default)().translate;
    var policyID = policy === null || policy === void 0 ? void 0 : policy.id;
    var backTo = route.params.backTo;
    var styles = (0, useThemeStyles_1.default)();
    var config = (_c = (_b = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _b === void 0 ? void 0 : _b.quickbooksOnline) === null || _c === void 0 ? void 0 : _c.config;
    var accountingMethod = (_d = config === null || config === void 0 ? void 0 : config.accountingMethod) !== null && _d !== void 0 ? _d : expensify_common_1.CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH;
    var data = Object.values(expensify_common_1.CONST.INTEGRATIONS.ACCOUNTING_METHOD).map(function (accountingMethodType) { return ({
        value: accountingMethodType,
        text: translate("workspace.qbo.accountingMethods.values.".concat(accountingMethodType)),
        alternateText: translate("workspace.qbo.accountingMethods.alternateText.".concat(accountingMethodType)),
        keyForList: accountingMethodType,
        isSelected: accountingMethod === accountingMethodType,
    }); });
    var pendingAction = (_e = (0, PolicyUtils_1.settingsPendingAction)([CONST_1.default.QUICKBOOKS_CONFIG.AUTO_SYNC], config === null || config === void 0 ? void 0 : config.pendingFields)) !== null && _e !== void 0 ? _e : (0, PolicyUtils_1.settingsPendingAction)([CONST_1.default.QUICKBOOKS_CONFIG.ACCOUNTING_METHOD], config === null || config === void 0 ? void 0 : config.pendingFields);
    var headerContent = (0, react_1.useMemo)(function () { return (<react_native_1.View>
                <Text_1.default style={[styles.ph5, styles.pb5]}>{translate('workspace.qbo.accountingMethods.description')}</Text_1.default>
            </react_native_1.View>); }, [translate, styles.pb5, styles.ph5]);
    var selectExpenseReportApprovalLevel = (0, react_1.useCallback)(function (row) {
        var _a;
        if (row.value !== (config === null || config === void 0 ? void 0 : config.accountingMethod)) {
            (0, QuickbooksOnline_1.updateQuickbooksOnlineAccountingMethod)(policyID, row.value, (_a = config === null || config === void 0 ? void 0 : config.accountingMethod) !== null && _a !== void 0 ? _a : expensify_common_1.CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH);
        }
        Navigation_1.default.goBack(ROUTES_1.default.WORKSPACE_ACCOUNTING_QUICKBOOKS_ONLINE_AUTO_SYNC.getRoute(policyID, backTo));
    }, [config === null || config === void 0 ? void 0 : config.accountingMethod, policyID, backTo]);
    return (<SelectionScreen_1.default displayName={QuickbooksAccountingMethodPage.displayName} headerTitleAlreadyTranslated={translate('workspace.qbo.accountingMethods.label')} headerContent={headerContent} sections={[{ data: data }]} listItem={RadioListItem_1.default} onSelectRow={function (selection) { return selectExpenseReportApprovalLevel(selection); }} initiallyFocusedOptionKey={(_f = data.find(function (mode) { return mode.isSelected; })) === null || _f === void 0 ? void 0 : _f.keyForList} policyID={policyID} accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN]} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED} onBackButtonPress={function () { return Navigation_1.default.goBack(ROUTES_1.default.WORKSPACE_ACCOUNTING_QUICKBOOKS_ONLINE_AUTO_SYNC.getRoute(policyID, backTo)); }} connectionName={CONST_1.default.POLICY.CONNECTIONS.NAME.QBO} pendingAction={pendingAction}/>);
}
QuickbooksAccountingMethodPage.displayName = 'QuickbooksAccountingMethodPage';
exports.default = (0, withPolicyConnections_1.default)(QuickbooksAccountingMethodPage);
