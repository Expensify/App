"use strict";
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
var ErrorUtils = require("@libs/ErrorUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var withPolicyConnections_1 = require("@pages/workspace/withPolicyConnections");
var variables_1 = require("@styles/variables");
var Xero_1 = require("@userActions/connections/Xero");
var Policy = require("@userActions/Policy/Policy");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
function XeroBillPaymentAccountSelectorPage(_a) {
    var _b, _c, _d, _e, _f, _g;
    var policy = _a.policy;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var policyID = (_b = policy === null || policy === void 0 ? void 0 : policy.id) !== null && _b !== void 0 ? _b : '-1';
    var config = ((_d = (_c = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _c === void 0 ? void 0 : _c.xero) !== null && _d !== void 0 ? _d : {}).config;
    var _h = (_g = (_f = (_e = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _e === void 0 ? void 0 : _e.xero) === null || _f === void 0 ? void 0 : _f.config.sync) !== null && _g !== void 0 ? _g : {}, reimbursementAccountID = _h.reimbursementAccountID, syncReimbursedReports = _h.syncReimbursedReports;
    var xeroSelectorOptions = (0, react_1.useMemo)(function () { return (0, PolicyUtils_1.getXeroBankAccounts)(policy !== null && policy !== void 0 ? policy : undefined, reimbursementAccountID); }, [reimbursementAccountID, policy]);
    var listHeaderComponent = (0, react_1.useMemo)(function () { return (<react_native_1.View style={[styles.pb2, styles.ph5]}>
                <Text_1.default style={[styles.pb5, styles.textNormal]}>{translate('workspace.xero.advancedConfig.xeroBillPaymentAccountDescription')}</Text_1.default>
            </react_native_1.View>); }, [translate, styles.pb2, styles.ph5, styles.pb5, styles.textNormal]);
    var initiallyFocusedOptionKey = (0, react_1.useMemo)(function () { var _a; return (_a = xeroSelectorOptions === null || xeroSelectorOptions === void 0 ? void 0 : xeroSelectorOptions.find(function (mode) { return mode.isSelected; })) === null || _a === void 0 ? void 0 : _a.keyForList; }, [xeroSelectorOptions]);
    var updateAccount = (0, react_1.useCallback)(function (_a) {
        var value = _a.value;
        (0, Xero_1.updateXeroSyncReimbursementAccountID)(policyID, value, reimbursementAccountID);
        Navigation_1.default.goBack(ROUTES_1.default.POLICY_ACCOUNTING_XERO_ADVANCED.getRoute(policyID));
    }, [policyID, reimbursementAccountID]);
    var listEmptyContent = (0, react_1.useMemo)(function () { return (<BlockingView_1.default icon={Illustrations.TeleScope} iconWidth={variables_1.default.emptyListIconWidth} iconHeight={variables_1.default.emptyListIconHeight} title={translate('workspace.xero.noAccountsFound')} subtitle={translate('workspace.xero.noAccountsFoundDescription')} containerStyle={styles.pb10}/>); }, [translate, styles.pb10]);
    return (<SelectionScreen_1.default policyID={policyID} accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.PAID]} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED} displayName={XeroBillPaymentAccountSelectorPage.displayName} sections={xeroSelectorOptions.length ? [{ data: xeroSelectorOptions }] : []} listItem={RadioListItem_1.default} connectionName={CONST_1.default.POLICY.CONNECTIONS.NAME.XERO} shouldBeBlocked={!syncReimbursedReports} onSelectRow={updateAccount} initiallyFocusedOptionKey={initiallyFocusedOptionKey} headerContent={listHeaderComponent} onBackButtonPress={function () { return Navigation_1.default.goBack(ROUTES_1.default.POLICY_ACCOUNTING_XERO_ADVANCED.getRoute(policyID)); }} title="workspace.xero.advancedConfig.xeroBillPaymentAccount" listEmptyContent={listEmptyContent} pendingAction={(0, PolicyUtils_1.settingsPendingAction)([CONST_1.default.XERO_CONFIG.REIMBURSEMENT_ACCOUNT_ID], config === null || config === void 0 ? void 0 : config.pendingFields)} errors={ErrorUtils.getLatestErrorField(config !== null && config !== void 0 ? config : {}, CONST_1.default.XERO_CONFIG.REIMBURSEMENT_ACCOUNT_ID)} errorRowStyles={[styles.ph5, styles.pv3]} onClose={function () { return Policy.clearXeroErrorField(policyID, CONST_1.default.XERO_CONFIG.REIMBURSEMENT_ACCOUNT_ID); }}/>);
}
XeroBillPaymentAccountSelectorPage.displayName = 'XeroBillPaymentAccountSelectorPage';
exports.default = (0, withPolicyConnections_1.default)(XeroBillPaymentAccountSelectorPage);
