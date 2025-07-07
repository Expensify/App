"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var RadioListItem_1 = require("@components/SelectionList/RadioListItem");
var SelectionScreen_1 = require("@components/SelectionScreen");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var NetSuiteCommands_1 = require("@libs/actions/connections/NetSuiteCommands");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var Navigation_1 = require("@navigation/Navigation");
var withPolicyConnections_1 = require("@pages/workspace/withPolicyConnections");
var Policy_1 = require("@userActions/Policy/Policy");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
function NetSuiteExportExpensesJournalPostingPreferenceSelectPage(_a) {
    var _b, _c, _d, _e;
    var policy = _a.policy;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var policyID = policy === null || policy === void 0 ? void 0 : policy.id;
    var config = (_c = (_b = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _b === void 0 ? void 0 : _b.netsuite) === null || _c === void 0 ? void 0 : _c.options.config;
    var route = (0, native_1.useRoute)();
    var params = route.params;
    var backTo = params.backTo;
    var isReimbursable = params.expenseType === CONST_1.default.NETSUITE_EXPENSE_TYPE.REIMBURSABLE;
    var selectedValue = (_d = Object.values(CONST_1.default.NETSUITE_JOURNAL_POSTING_PREFERENCE).find(function (value) { return value === (config === null || config === void 0 ? void 0 : config.journalPostingPreference); })) !== null && _d !== void 0 ? _d : CONST_1.default.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_INDIVIDUAL_LINE;
    var data = Object.values(CONST_1.default.NETSUITE_JOURNAL_POSTING_PREFERENCE).map(function (postingPreference) { return ({
        value: postingPreference,
        text: translate("workspace.netsuite.journalPostingPreference.values.".concat(postingPreference)),
        keyForList: postingPreference,
        isSelected: selectedValue === postingPreference,
    }); });
    var goBack = (0, react_1.useCallback)(function () {
        Navigation_1.default.goBack(backTo !== null && backTo !== void 0 ? backTo : ROUTES_1.default.POLICY_ACCOUNTING_NETSUITE_EXPORT_EXPENSES.getRoute(policyID, params.expenseType));
    }, [policyID, params.expenseType, backTo]);
    var selectPostingPreference = (0, react_1.useCallback)(function (row) {
        if (row.value !== (config === null || config === void 0 ? void 0 : config.journalPostingPreference) && policyID) {
            (0, NetSuiteCommands_1.updateNetSuiteJournalPostingPreference)(policyID, row.value, config === null || config === void 0 ? void 0 : config.journalPostingPreference);
        }
        goBack();
    }, [config === null || config === void 0 ? void 0 : config.journalPostingPreference, goBack, policyID]);
    return (<SelectionScreen_1.default displayName={NetSuiteExportExpensesJournalPostingPreferenceSelectPage.displayName} title="workspace.netsuite.journalPostingPreference.label" sections={[{ data: data }]} listItem={RadioListItem_1.default} onSelectRow={function (selection) { return selectPostingPreference(selection); }} initiallyFocusedOptionKey={(_e = data.find(function (mode) { return mode.isSelected; })) === null || _e === void 0 ? void 0 : _e.keyForList} policyID={policyID} accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN]} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED} onBackButtonPress={goBack} connectionName={CONST_1.default.POLICY.CONNECTIONS.NAME.NETSUITE} shouldBeBlocked={isReimbursable
            ? (config === null || config === void 0 ? void 0 : config.reimbursableExpensesExportDestination) !== CONST_1.default.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY
            : (config === null || config === void 0 ? void 0 : config.nonreimbursableExpensesExportDestination) !== CONST_1.default.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY} pendingAction={(0, PolicyUtils_1.settingsPendingAction)([CONST_1.default.NETSUITE_CONFIG.JOURNAL_POSTING_PREFERENCE], config === null || config === void 0 ? void 0 : config.pendingFields)} errors={(0, ErrorUtils_1.getLatestErrorField)(config, CONST_1.default.NETSUITE_CONFIG.JOURNAL_POSTING_PREFERENCE)} errorRowStyles={[styles.ph5, styles.pv3]} onClose={function () { return (0, Policy_1.clearNetSuiteErrorField)(policyID, CONST_1.default.NETSUITE_CONFIG.JOURNAL_POSTING_PREFERENCE); }}/>);
}
NetSuiteExportExpensesJournalPostingPreferenceSelectPage.displayName = 'NetSuiteExportExpensesJournalPostingPreferenceSelectPage';
exports.default = (0, withPolicyConnections_1.default)(NetSuiteExportExpensesJournalPostingPreferenceSelectPage);
