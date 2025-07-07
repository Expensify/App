"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var react_native_1 = require("react-native");
var RadioListItem_1 = require("@components/SelectionList/RadioListItem");
var SelectionScreen_1 = require("@components/SelectionScreen");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var connections_1 = require("@libs/actions/connections");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var Navigation_1 = require("@navigation/Navigation");
var withPolicyConnections_1 = require("@pages/workspace/withPolicyConnections");
var Policy_1 = require("@userActions/Policy/Policy");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
function Footer(_a) {
    var isTaxEnabled = _a.isTaxEnabled;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    if (!isTaxEnabled) {
        return null;
    }
    return (<react_native_1.View style={[styles.gap2, styles.mt2, styles.ph5]}>
            {isTaxEnabled && <Text_1.default style={styles.mutedNormalTextLabel}>{translate('workspace.qbo.outOfPocketTaxEnabledDescription')}</Text_1.default>}
        </react_native_1.View>);
}
function QuickbooksOutOfPocketExpenseEntitySelectPage(_a) {
    var _b;
    var _c, _d, _e, _f, _g, _h, _j, _k;
    var policy = _a.policy;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var qboConfig = (_d = (_c = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _c === void 0 ? void 0 : _c.quickbooksOnline) === null || _d === void 0 ? void 0 : _d.config;
    var _l = (_g = (_f = (_e = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _e === void 0 ? void 0 : _e.quickbooksOnline) === null || _f === void 0 ? void 0 : _f.data) !== null && _g !== void 0 ? _g : {}, bankAccounts = _l.bankAccounts, accountPayable = _l.accountPayable, journalEntryAccounts = _l.journalEntryAccounts;
    var isTaxesEnabled = !!(qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.syncTax);
    var shouldShowTaxError = isTaxesEnabled && (qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.reimbursableExpensesExportDestination) === CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY;
    var hasErrors = !!((_h = qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.errorFields) === null || _h === void 0 ? void 0 : _h.reimbursableExpensesExportDestination) && shouldShowTaxError;
    var policyID = policy === null || policy === void 0 ? void 0 : policy.id;
    var route = (0, native_1.useRoute)();
    var backTo = (_j = route.params) === null || _j === void 0 ? void 0 : _j.backTo;
    var _m = (0, react_1.useState)(null), selectedExportDestinationError = _m[0], setSelectedExportDestinationError = _m[1];
    var data = (0, react_1.useMemo)(function () { return [
        {
            value: CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK,
            text: translate("workspace.qbo.accounts.check"),
            keyForList: CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK,
            isSelected: (qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.reimbursableExpensesExportDestination) === CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK,
            isShown: (qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.syncLocations) !== CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.TAG,
            accounts: bankAccounts !== null && bankAccounts !== void 0 ? bankAccounts : [],
        },
        {
            value: CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY,
            text: translate("workspace.qbo.accounts.journal_entry"),
            keyForList: CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY,
            isSelected: (qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.reimbursableExpensesExportDestination) === CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY,
            isShown: !isTaxesEnabled,
            accounts: journalEntryAccounts !== null && journalEntryAccounts !== void 0 ? journalEntryAccounts : [],
        },
        {
            value: CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL,
            text: translate("workspace.qbo.accounts.bill"),
            keyForList: CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL,
            isSelected: (qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.reimbursableExpensesExportDestination) === CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL,
            isShown: (qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.syncLocations) !== CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.TAG,
            accounts: accountPayable !== null && accountPayable !== void 0 ? accountPayable : [],
        },
    ]; }, [qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.reimbursableExpensesExportDestination, qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.syncLocations, translate, bankAccounts, accountPayable, journalEntryAccounts, isTaxesEnabled]);
    var sections = (0, react_1.useMemo)(function () { return [{ data: data.filter(function (item) { return item.isShown; }) }]; }, [data]);
    var goBack = (0, react_1.useCallback)(function () {
        Navigation_1.default.goBack(backTo !== null && backTo !== void 0 ? backTo : (policyID && ROUTES_1.default.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_EXPORT_OUT_OF_POCKET_EXPENSES.getRoute(policyID)));
    }, [policyID, backTo]);
    var selectExportEntity = (0, react_1.useCallback)(function (row) {
        var _a, _b, _c;
        if (!row.accounts.at(0)) {
            setSelectedExportDestinationError((_a = {},
                _a[CONST_1.default.QUICKBOOKS_CONFIG.REIMBURSABLE_EXPENSES_EXPORT_DESTINATION] = translate("workspace.qbo.exportDestinationSetupAccountsInfo.".concat(row.value)),
                _a));
            return;
        }
        if (row.value !== (qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.reimbursableExpensesExportDestination)) {
            setSelectedExportDestinationError(null);
            (0, connections_1.updateManyPolicyConnectionConfigs)(policyID, CONST_1.default.POLICY.CONNECTIONS.NAME.QBO, (_b = {},
                _b[CONST_1.default.QUICKBOOKS_CONFIG.REIMBURSABLE_EXPENSES_EXPORT_DESTINATION] = row.value,
                _b[CONST_1.default.QUICKBOOKS_CONFIG.REIMBURSABLE_EXPENSES_ACCOUNT] = row.accounts.at(0),
                _b), (_c = {},
                _c[CONST_1.default.QUICKBOOKS_CONFIG.REIMBURSABLE_EXPENSES_EXPORT_DESTINATION] = qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.reimbursableExpensesExportDestination,
                _c[CONST_1.default.QUICKBOOKS_CONFIG.REIMBURSABLE_EXPENSES_ACCOUNT] = qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.reimbursableExpensesAccount,
                _c));
        }
        goBack();
    }, [qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.reimbursableExpensesExportDestination, policyID, qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.reimbursableExpensesAccount, goBack, translate]);
    var errors = hasErrors && (qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.reimbursableExpensesExportDestination)
        ? (_b = {}, _b[CONST_1.default.QUICKBOOKS_CONFIG.REIMBURSABLE_EXPENSES_EXPORT_DESTINATION] = translate("workspace.qbo.accounts.".concat(qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.reimbursableExpensesExportDestination, "Error")), _b) : (0, ErrorUtils_1.getLatestErrorField)(qboConfig, CONST_1.default.QUICKBOOKS_CONFIG.REIMBURSABLE_EXPENSES_EXPORT_DESTINATION);
    return (<SelectionScreen_1.default policyID={policyID} accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN]} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED} displayName={QuickbooksOutOfPocketExpenseEntitySelectPage.displayName} sections={sections} listItem={RadioListItem_1.default} onBackButtonPress={goBack} onSelectRow={function (selection) { return selectExportEntity(selection); }} shouldSingleExecuteRowSelect initiallyFocusedOptionKey={(_k = data.find(function (mode) { return mode.isSelected; })) === null || _k === void 0 ? void 0 : _k.keyForList} title="workspace.accounting.exportAs" connectionName={CONST_1.default.POLICY.CONNECTIONS.NAME.QBO} pendingAction={(0, PolicyUtils_1.settingsPendingAction)([CONST_1.default.QUICKBOOKS_CONFIG.REIMBURSABLE_EXPENSES_EXPORT_DESTINATION, CONST_1.default.QUICKBOOKS_CONFIG.REIMBURSABLE_EXPENSES_ACCOUNT], qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.pendingFields)} errors={selectedExportDestinationError !== null && selectedExportDestinationError !== void 0 ? selectedExportDestinationError : errors} errorRowStyles={[styles.ph5, styles.pv3]} onClose={function () {
            setSelectedExportDestinationError(null);
            (0, Policy_1.clearQBOErrorField)(policyID, CONST_1.default.QUICKBOOKS_CONFIG.REIMBURSABLE_EXPENSES_EXPORT_DESTINATION);
        }} listFooterContent={<Footer isTaxEnabled={isTaxesEnabled}/>}/>);
}
QuickbooksOutOfPocketExpenseEntitySelectPage.displayName = 'QuickbooksOutOfPocketExpenseEntitySelectPage';
exports.default = (0, withPolicyConnections_1.default)(QuickbooksOutOfPocketExpenseEntitySelectPage);
