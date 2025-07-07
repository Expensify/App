"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var BlockingView_1 = require("@components/BlockingViews/BlockingView");
var Illustrations_1 = require("@components/Icon/Illustrations");
var RadioListItem_1 = require("@components/SelectionList/RadioListItem");
var SelectionScreen_1 = require("@components/SelectionScreen");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Policy_1 = require("@libs/actions/Policy/Policy");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var withPolicyConnections_1 = require("@pages/workspace/withPolicyConnections");
var variables_1 = require("@styles/variables");
var SageIntacct_1 = require("@userActions/connections/SageIntacct");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
function SageIntacctNonReimbursableCreditCardAccountPage(_a) {
    var _b, _c, _d, _e, _f, _g;
    var policy = _a.policy;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var policyID = policy === null || policy === void 0 ? void 0 : policy.id;
    var config = ((_c = (_b = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _b === void 0 ? void 0 : _b.intacct) !== null && _c !== void 0 ? _c : {}).config;
    var exportConfig = ((_f = (_e = (_d = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _d === void 0 ? void 0 : _d.intacct) === null || _e === void 0 ? void 0 : _e.config) !== null && _f !== void 0 ? _f : {}).export;
    var route = (0, native_1.useRoute)();
    var backTo = route.params.backTo;
    var goBack = (0, react_1.useCallback)(function () {
        Navigation_1.default.goBack(backTo !== null && backTo !== void 0 ? backTo : (policyID && ROUTES_1.default.POLICY_ACCOUNTING_SAGE_INTACCT_NON_REIMBURSABLE_EXPENSES.getRoute(policyID)));
    }, [backTo, policyID]);
    var creditCardSelectorOptions = (0, react_1.useMemo)(function () { return (0, PolicyUtils_1.getSageIntacctCreditCards)(policy, exportConfig === null || exportConfig === void 0 ? void 0 : exportConfig.nonReimbursableAccount); }, [exportConfig === null || exportConfig === void 0 ? void 0 : exportConfig.nonReimbursableAccount, policy]);
    var updateCreditCardAccount = (0, react_1.useCallback)(function (_a) {
        var value = _a.value;
        if (value !== (exportConfig === null || exportConfig === void 0 ? void 0 : exportConfig.nonReimbursableAccount) && policyID) {
            (0, SageIntacct_1.updateSageIntacctNonreimbursableExpensesExportAccount)(policyID, value, exportConfig === null || exportConfig === void 0 ? void 0 : exportConfig.nonReimbursableAccount);
        }
        goBack();
    }, [policyID, exportConfig === null || exportConfig === void 0 ? void 0 : exportConfig.nonReimbursableAccount, goBack]);
    var listEmptyContent = (0, react_1.useMemo)(function () { return (<BlockingView_1.default icon={Illustrations_1.TeleScope} iconWidth={variables_1.default.emptyListIconWidth} iconHeight={variables_1.default.emptyListIconHeight} title={translate('workspace.sageIntacct.noAccountsFound')} subtitle={translate('workspace.sageIntacct.noAccountsFoundDescription')} containerStyle={styles.pb10}/>); }, [translate, styles.pb10]);
    return (<SelectionScreen_1.default policyID={policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED} displayName={SageIntacctNonReimbursableCreditCardAccountPage.displayName} sections={creditCardSelectorOptions.length ? [{ data: creditCardSelectorOptions }] : []} listItem={RadioListItem_1.default} onSelectRow={updateCreditCardAccount} initiallyFocusedOptionKey={(_g = creditCardSelectorOptions.find(function (mode) { return mode.isSelected; })) === null || _g === void 0 ? void 0 : _g.keyForList} onBackButtonPress={goBack} title="workspace.sageIntacct.creditCardAccount" listEmptyContent={listEmptyContent} accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.PAID]} connectionName={CONST_1.default.POLICY.CONNECTIONS.NAME.SAGE_INTACCT} pendingAction={(0, PolicyUtils_1.settingsPendingAction)([CONST_1.default.SAGE_INTACCT_CONFIG.NON_REIMBURSABLE_ACCOUNT], config === null || config === void 0 ? void 0 : config.pendingFields)} errors={(0, ErrorUtils_1.getLatestErrorField)(config !== null && config !== void 0 ? config : {}, CONST_1.default.SAGE_INTACCT_CONFIG.NON_REIMBURSABLE_ACCOUNT)} errorRowStyles={[styles.ph5, styles.pv3]} onClose={function () { return (0, Policy_1.clearSageIntacctErrorField)(policyID, CONST_1.default.SAGE_INTACCT_CONFIG.NON_REIMBURSABLE_ACCOUNT); }}/>);
}
SageIntacctNonReimbursableCreditCardAccountPage.displayName = 'SageIntacctNonReimbursableCreditCardAccountPage';
exports.default = (0, withPolicyConnections_1.default)(SageIntacctNonReimbursableCreditCardAccountPage);
