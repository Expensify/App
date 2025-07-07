"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var BlockingView_1 = require("@components/BlockingViews/BlockingView");
var Illustrations = require("@components/Icon/Illustrations");
var RadioListItem_1 = require("@components/SelectionList/RadioListItem");
var SelectionScreen_1 = require("@components/SelectionScreen");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var QuickbooksOnline = require("@libs/actions/connections/QuickbooksOnline");
var ErrorUtils = require("@libs/ErrorUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var withPolicyConnections_1 = require("@pages/workspace/withPolicyConnections");
var variables_1 = require("@styles/variables");
var Policy_1 = require("@userActions/Policy/Policy");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
function QuickbooksAccountSelectPage(_a) {
    var _b, _c, _d, _e, _f, _g;
    var policy = _a.policy;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var policyID = (_b = policy === null || policy === void 0 ? void 0 : policy.id) !== null && _b !== void 0 ? _b : '-1';
    var _h = (_e = (_d = (_c = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _c === void 0 ? void 0 : _c.quickbooksOnline) === null || _d === void 0 ? void 0 : _d.data) !== null && _e !== void 0 ? _e : {}, bankAccounts = _h.bankAccounts, creditCards = _h.creditCards;
    var qboConfig = (_g = (_f = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _f === void 0 ? void 0 : _f.quickbooksOnline) === null || _g === void 0 ? void 0 : _g.config;
    var accountOptions = (0, react_1.useMemo)(function () { return __spreadArray(__spreadArray([], (bankAccounts !== null && bankAccounts !== void 0 ? bankAccounts : []), true), (creditCards !== null && creditCards !== void 0 ? creditCards : []), true); }, [bankAccounts, creditCards]);
    var qboOnlineSelectorOptions = (0, react_1.useMemo)(function () {
        return accountOptions === null || accountOptions === void 0 ? void 0 : accountOptions.map(function (_a) {
            var id = _a.id, name = _a.name;
            return ({
                value: id,
                text: name,
                keyForList: id,
                isSelected: (qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.reimbursementAccountID) === id,
            });
        });
    }, [qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.reimbursementAccountID, accountOptions]);
    var listHeaderComponent = (0, react_1.useMemo)(function () { return (<react_native_1.View style={[styles.pb2, styles.ph5]}>
                <Text_1.default style={[styles.pb5, styles.textNormal]}>{translate('workspace.qbo.advancedConfig.accountSelectDescription')}</Text_1.default>
            </react_native_1.View>); }, [translate, styles.pb2, styles.ph5, styles.pb5, styles.textNormal]);
    var initiallyFocusedOptionKey = (0, react_1.useMemo)(function () { var _a; return (_a = qboOnlineSelectorOptions === null || qboOnlineSelectorOptions === void 0 ? void 0 : qboOnlineSelectorOptions.find(function (mode) { return mode.isSelected; })) === null || _a === void 0 ? void 0 : _a.keyForList; }, [qboOnlineSelectorOptions]);
    var saveSelection = (0, react_1.useCallback)(function (_a) {
        var value = _a.value;
        QuickbooksOnline.updateQuickbooksOnlineReimbursementAccountID(policyID, value, qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.reimbursementAccountID);
        Navigation_1.default.goBack(ROUTES_1.default.WORKSPACE_ACCOUNTING_QUICKBOOKS_ONLINE_ADVANCED.getRoute(policyID));
    }, [policyID, qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.reimbursementAccountID]);
    var listEmptyContent = (0, react_1.useMemo)(function () { return (<BlockingView_1.default icon={Illustrations.TeleScope} iconWidth={variables_1.default.emptyListIconWidth} iconHeight={variables_1.default.emptyListIconHeight} title={translate('workspace.qbo.noAccountsFound')} subtitle={translate('workspace.qbo.noAccountsFoundDescription')} containerStyle={styles.pb10}/>); }, [translate, styles.pb10]);
    return (<SelectionScreen_1.default policyID={policyID} accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.PAID]} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED} displayName={QuickbooksAccountSelectPage.displayName} sections={qboOnlineSelectorOptions.length ? [{ data: qboOnlineSelectorOptions }] : []} listItem={RadioListItem_1.default} headerContent={listHeaderComponent} onSelectRow={saveSelection} shouldSingleExecuteRowSelect initiallyFocusedOptionKey={initiallyFocusedOptionKey} listEmptyContent={listEmptyContent} title="workspace.qbo.advancedConfig.qboBillPaymentAccount" connectionName={CONST_1.default.POLICY.CONNECTIONS.NAME.QBO} onBackButtonPress={function () { return Navigation_1.default.goBack(ROUTES_1.default.WORKSPACE_ACCOUNTING_QUICKBOOKS_ONLINE_ADVANCED.getRoute(policyID)); }} pendingAction={(0, PolicyUtils_1.settingsPendingAction)([CONST_1.default.QUICKBOOKS_CONFIG.REIMBURSEMENT_ACCOUNT_ID], qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.pendingFields)} errors={ErrorUtils.getLatestErrorField(qboConfig, CONST_1.default.QUICKBOOKS_CONFIG.REIMBURSEMENT_ACCOUNT_ID)} errorRowStyles={[styles.ph5, styles.mv3]} onClose={function () { return (0, Policy_1.clearQBOErrorField)(policyID, CONST_1.default.QUICKBOOKS_CONFIG.REIMBURSEMENT_ACCOUNT_ID); }}/>);
}
QuickbooksAccountSelectPage.displayName = 'QuickbooksAccountSelectPage';
exports.default = (0, withPolicyConnections_1.default)(QuickbooksAccountSelectPage);
