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
var NetSuiteCommands_1 = require("@libs/actions/connections/NetSuiteCommands");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var withPolicyConnections_1 = require("@pages/workspace/withPolicyConnections");
var variables_1 = require("@styles/variables");
var Policy_1 = require("@userActions/Policy/Policy");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
function NetSuiteExportExpensesPayableAccountSelectPage(_a) {
    var _b, _c, _d;
    var policy = _a.policy;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var policyID = policy === null || policy === void 0 ? void 0 : policy.id;
    var route = (0, native_1.useRoute)();
    var params = route.params;
    var backTo = params.backTo;
    var isReimbursable = params.expenseType === CONST_1.default.NETSUITE_EXPENSE_TYPE.REIMBURSABLE;
    var config = (_c = (_b = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _b === void 0 ? void 0 : _b.netsuite) === null || _c === void 0 ? void 0 : _c.options.config;
    var currentSettingName = isReimbursable ? CONST_1.default.NETSUITE_CONFIG.REIMBURSABLE_PAYABLE_ACCOUNT : CONST_1.default.NETSUITE_CONFIG.PAYABLE_ACCT;
    var currentPayableAccountID = (_d = config === null || config === void 0 ? void 0 : config[currentSettingName]) !== null && _d !== void 0 ? _d : CONST_1.default.NETSUITE_PAYABLE_ACCOUNT_DEFAULT_VALUE;
    var netsuitePayableAccountOptions = (0, react_1.useMemo)(function () { return (0, PolicyUtils_1.getNetSuitePayableAccountOptions)(policy !== null && policy !== void 0 ? policy : undefined, currentPayableAccountID); }, [currentPayableAccountID, policy]);
    var initiallyFocusedOptionKey = (0, react_1.useMemo)(function () { var _a; return (_a = netsuitePayableAccountOptions === null || netsuitePayableAccountOptions === void 0 ? void 0 : netsuitePayableAccountOptions.find(function (mode) { return mode.isSelected; })) === null || _a === void 0 ? void 0 : _a.keyForList; }, [netsuitePayableAccountOptions]);
    var goBack = (0, react_1.useCallback)(function () {
        Navigation_1.default.goBack(backTo !== null && backTo !== void 0 ? backTo : ROUTES_1.default.POLICY_ACCOUNTING_NETSUITE_EXPORT_EXPENSES.getRoute(policyID, params.expenseType));
    }, [policyID, params.expenseType, backTo]);
    var updatePayableAccount = (0, react_1.useCallback)(function (_a) {
        var value = _a.value;
        if (currentPayableAccountID !== value && policyID) {
            if (isReimbursable) {
                (0, NetSuiteCommands_1.updateNetSuiteReimbursablePayableAccount)(policyID, value, currentPayableAccountID);
            }
            else {
                (0, NetSuiteCommands_1.updateNetSuitePayableAcct)(policyID, value, currentPayableAccountID);
            }
        }
        goBack();
    }, [currentPayableAccountID, policyID, goBack, isReimbursable]);
    var listEmptyContent = (0, react_1.useMemo)(function () { return (<BlockingView_1.default icon={Illustrations_1.TeleScope} iconWidth={variables_1.default.emptyListIconWidth} iconHeight={variables_1.default.emptyListIconHeight} title={translate('workspace.netsuite.noAccountsFound')} subtitle={translate('workspace.netsuite.noAccountsFoundDescription')} containerStyle={styles.pb10}/>); }, [translate, styles.pb10]);
    return (<SelectionScreen_1.default policyID={policyID} accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.CONTROL]} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED} displayName={NetSuiteExportExpensesPayableAccountSelectPage.displayName} sections={netsuitePayableAccountOptions.length ? [{ data: netsuitePayableAccountOptions }] : []} listItem={RadioListItem_1.default} onSelectRow={updatePayableAccount} initiallyFocusedOptionKey={initiallyFocusedOptionKey} onBackButtonPress={goBack} title={isReimbursable ? 'workspace.netsuite.reimbursableJournalPostingAccount' : 'workspace.netsuite.nonReimbursableJournalPostingAccount'} listEmptyContent={listEmptyContent} connectionName={CONST_1.default.POLICY.CONNECTIONS.NAME.NETSUITE} shouldBeBlocked={isReimbursable
            ? (config === null || config === void 0 ? void 0 : config.reimbursableExpensesExportDestination) !== CONST_1.default.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY
            : (config === null || config === void 0 ? void 0 : config.nonreimbursableExpensesExportDestination) !== CONST_1.default.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY} pendingAction={(0, PolicyUtils_1.settingsPendingAction)([currentSettingName], config === null || config === void 0 ? void 0 : config.pendingFields)} errors={(0, ErrorUtils_1.getLatestErrorField)(config, currentSettingName)} errorRowStyles={[styles.ph5, styles.pv3]} onClose={function () { return (0, Policy_1.clearNetSuiteErrorField)(policyID, currentSettingName); }}/>);
}
NetSuiteExportExpensesPayableAccountSelectPage.displayName = 'NetSuiteExportExpensesPayableAccountSelectPage';
exports.default = (0, withPolicyConnections_1.default)(NetSuiteExportExpensesPayableAccountSelectPage);
