"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var BlockingView_1 = require("@components/BlockingViews/BlockingView");
var Illustrations = require("@components/Icon/Illustrations");
var RadioListItem_1 = require("@components/SelectionList/RadioListItem");
var SelectionScreen_1 = require("@components/SelectionScreen");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ErrorUtils = require("@libs/ErrorUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var withPolicyConnections_1 = require("@pages/workspace/withPolicyConnections");
var variables_1 = require("@styles/variables");
var SageIntacct_1 = require("@userActions/connections/SageIntacct");
var Policy = require("@userActions/Policy/Policy");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
function SageIntacctPaymentAccountPage(_a) {
    var _b, _c, _d, _e, _f, _g;
    var policy = _a.policy;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var policyID = (_b = policy === null || policy === void 0 ? void 0 : policy.id) !== null && _b !== void 0 ? _b : '-1';
    var config = ((_d = (_c = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _c === void 0 ? void 0 : _c.intacct) !== null && _d !== void 0 ? _d : {}).config;
    var vendorSelectorOptions = (0, react_1.useMemo)(function () { var _a; return (0, PolicyUtils_1.getSageIntacctBankAccounts)(policy, (_a = config === null || config === void 0 ? void 0 : config.sync) === null || _a === void 0 ? void 0 : _a.reimbursementAccountID); }, [policy, (_e = config === null || config === void 0 ? void 0 : config.sync) === null || _e === void 0 ? void 0 : _e.reimbursementAccountID]);
    var updateDefaultVendor = (0, react_1.useCallback)(function (_a) {
        var _b, _c;
        var value = _a.value;
        if (value !== ((_b = config === null || config === void 0 ? void 0 : config.sync) === null || _b === void 0 ? void 0 : _b.reimbursementAccountID)) {
            (0, SageIntacct_1.updateSageIntacctSyncReimbursementAccountID)(policyID, value, (_c = config === null || config === void 0 ? void 0 : config.sync) === null || _c === void 0 ? void 0 : _c.reimbursementAccountID);
        }
        Navigation_1.default.goBack(ROUTES_1.default.POLICY_ACCOUNTING_SAGE_INTACCT_ADVANCED.getRoute(policyID));
    }, [policyID, (_f = config === null || config === void 0 ? void 0 : config.sync) === null || _f === void 0 ? void 0 : _f.reimbursementAccountID]);
    var listEmptyContent = (0, react_1.useMemo)(function () { return (<BlockingView_1.default icon={Illustrations.TeleScope} iconWidth={variables_1.default.emptyListIconWidth} iconHeight={variables_1.default.emptyListIconHeight} title={translate('workspace.sageIntacct.noAccountsFound')} subtitle={translate('workspace.sageIntacct.noAccountsFoundDescription')}/>); }, [translate]);
    return (<SelectionScreen_1.default policyID={policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED} displayName={SageIntacctPaymentAccountPage.displayName} sections={vendorSelectorOptions.length ? [{ data: vendorSelectorOptions }] : []} listItem={RadioListItem_1.default} onSelectRow={updateDefaultVendor} initiallyFocusedOptionKey={(_g = vendorSelectorOptions.find(function (mode) { return mode.isSelected; })) === null || _g === void 0 ? void 0 : _g.keyForList} onBackButtonPress={function () { return Navigation_1.default.goBack(ROUTES_1.default.POLICY_ACCOUNTING_SAGE_INTACCT_ADVANCED.getRoute(policyID)); }} title="workspace.sageIntacct.paymentAccount" listEmptyContent={listEmptyContent} connectionName={CONST_1.default.POLICY.CONNECTIONS.NAME.SAGE_INTACCT} pendingAction={(0, PolicyUtils_1.settingsPendingAction)([CONST_1.default.SAGE_INTACCT_CONFIG.REIMBURSEMENT_ACCOUNT_ID], config === null || config === void 0 ? void 0 : config.pendingFields)} errors={ErrorUtils.getLatestErrorField(config !== null && config !== void 0 ? config : {}, CONST_1.default.SAGE_INTACCT_CONFIG.REIMBURSEMENT_ACCOUNT_ID)} errorRowStyles={[styles.ph5, styles.pv3]} onClose={function () { return Policy.clearSageIntacctErrorField(policyID, CONST_1.default.SAGE_INTACCT_CONFIG.REIMBURSEMENT_ACCOUNT_ID); }}/>);
}
SageIntacctPaymentAccountPage.displayName = 'SageIntacctPaymentAccountPage';
exports.default = (0, withPolicyConnections_1.default)(SageIntacctPaymentAccountPage);
