"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
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
function QuickbooksCompanyCardExpenseAccountSelectCardPage(_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j;
    var policy = _a.policy;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var policyID = policy === null || policy === void 0 ? void 0 : policy.id;
    var qboConfig = (_c = (_b = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _b === void 0 ? void 0 : _b.quickbooksOnline) === null || _c === void 0 ? void 0 : _c.config;
    var _k = (_f = (_e = (_d = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _d === void 0 ? void 0 : _d.quickbooksOnline) === null || _e === void 0 ? void 0 : _e.data) !== null && _f !== void 0 ? _f : {}, creditCards = _k.creditCards, bankAccounts = _k.bankAccounts, accountPayable = _k.accountPayable, vendors = _k.vendors;
    var isLocationEnabled = !!((qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.syncLocations) && (qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.syncLocations) !== CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.NONE);
    var route = (0, native_1.useRoute)();
    var backTo = (_g = route.params) === null || _g === void 0 ? void 0 : _g.backTo;
    var sections = (0, react_1.useMemo)(function () {
        var _a, _b;
        var options = [
            {
                text: translate("workspace.qbo.accounts.credit_card"),
                value: CONST_1.default.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD,
                keyForList: CONST_1.default.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD,
                isSelected: CONST_1.default.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD === (qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.nonReimbursableExpensesExportDestination),
                accounts: creditCards !== null && creditCards !== void 0 ? creditCards : [],
                defaultVendor: CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.NONE,
            },
            {
                text: translate("workspace.qbo.accounts.debit_card"),
                value: CONST_1.default.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD,
                keyForList: CONST_1.default.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD,
                isSelected: CONST_1.default.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD === (qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.nonReimbursableExpensesExportDestination),
                accounts: bankAccounts !== null && bankAccounts !== void 0 ? bankAccounts : [],
                defaultVendor: CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.NONE,
            },
        ];
        if (!isLocationEnabled) {
            options.push({
                text: translate("workspace.qbo.accounts.bill"),
                value: CONST_1.default.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.VENDOR_BILL,
                keyForList: CONST_1.default.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.VENDOR_BILL,
                isSelected: CONST_1.default.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.VENDOR_BILL === (qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.nonReimbursableExpensesExportDestination),
                accounts: accountPayable !== null && accountPayable !== void 0 ? accountPayable : [],
                defaultVendor: (_b = (_a = vendors === null || vendors === void 0 ? void 0 : vendors[0]) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.NONE,
            });
        }
        return [{ data: options }];
    }, [translate, qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.nonReimbursableExpensesExportDestination, isLocationEnabled, accountPayable, bankAccounts, creditCards, vendors]);
    var goBack = (0, react_1.useCallback)(function () {
        Navigation_1.default.goBack(backTo !== null && backTo !== void 0 ? backTo : (policyID && ROUTES_1.default.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_COMPANY_CARD_EXPENSE_ACCOUNT.getRoute(policyID)));
    }, [backTo, policyID]);
    var selectExportCompanyCard = (0, react_1.useCallback)(function (row) {
        var _a, _b;
        if (row.value !== (qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.nonReimbursableExpensesExportDestination)) {
            (0, connections_1.updateManyPolicyConnectionConfigs)(policyID, CONST_1.default.POLICY.CONNECTIONS.NAME.QBO, (_a = {},
                _a[CONST_1.default.QUICKBOOKS_CONFIG.NON_REIMBURSABLE_EXPENSES_EXPORT_DESTINATION] = row.value,
                _a[CONST_1.default.QUICKBOOKS_CONFIG.NON_REIMBURSABLE_EXPENSES_ACCOUNT] = row.accounts.at(0),
                _a[CONST_1.default.QUICKBOOKS_CONFIG.NON_REIMBURSABLE_BILL_DEFAULT_VENDOR] = row.defaultVendor,
                _a), (_b = {},
                _b[CONST_1.default.QUICKBOOKS_CONFIG.NON_REIMBURSABLE_EXPENSES_EXPORT_DESTINATION] = qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.nonReimbursableExpensesExportDestination,
                _b[CONST_1.default.QUICKBOOKS_CONFIG.NON_REIMBURSABLE_EXPENSES_ACCOUNT] = qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.nonReimbursableExpensesAccount,
                _b[CONST_1.default.QUICKBOOKS_CONFIG.NON_REIMBURSABLE_BILL_DEFAULT_VENDOR] = qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.nonReimbursableBillDefaultVendor,
                _b));
        }
        goBack();
    }, [qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.nonReimbursableExpensesExportDestination, policyID, qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.nonReimbursableExpensesAccount, qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.nonReimbursableBillDefaultVendor, goBack]);
    return (<SelectionScreen_1.default policyID={policyID} accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN]} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED} displayName={QuickbooksCompanyCardExpenseAccountSelectCardPage.displayName} title="workspace.accounting.exportAs" sections={sections} listItem={RadioListItem_1.default} onSelectRow={function (selection) { return selectExportCompanyCard(selection); }} shouldSingleExecuteRowSelect initiallyFocusedOptionKey={(_j = (_h = sections.at(0)) === null || _h === void 0 ? void 0 : _h.data.find(function (mode) { return mode.isSelected; })) === null || _j === void 0 ? void 0 : _j.keyForList} connectionName={CONST_1.default.POLICY.CONNECTIONS.NAME.QBO} onBackButtonPress={goBack} listFooterContent={isLocationEnabled ? <Text_1.default style={[styles.mutedNormalTextLabel, styles.ph5, styles.pv3]}>{translate('workspace.qbo.companyCardsLocationEnabledDescription')}</Text_1.default> : undefined} errors={(0, ErrorUtils_1.getLatestErrorField)(qboConfig, CONST_1.default.QUICKBOOKS_CONFIG.NON_REIMBURSABLE_EXPENSES_EXPORT_DESTINATION)} errorRowStyles={[styles.ph5, styles.pv3]} pendingAction={(0, PolicyUtils_1.settingsPendingAction)([CONST_1.default.QUICKBOOKS_CONFIG.NON_REIMBURSABLE_EXPENSES_EXPORT_DESTINATION], qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.pendingFields)} onClose={function () { return (0, Policy_1.clearQBOErrorField)(policyID, CONST_1.default.QUICKBOOKS_CONFIG.NON_REIMBURSABLE_EXPENSES_EXPORT_DESTINATION); }}/>);
}
QuickbooksCompanyCardExpenseAccountSelectCardPage.displayName = 'QuickbooksCompanyCardExpenseAccountSelectCardPage';
exports.default = (0, withPolicyConnections_1.default)(QuickbooksCompanyCardExpenseAccountSelectCardPage);
