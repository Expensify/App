"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var RadioListItem_1 = require("@components/SelectionList/RadioListItem");
var SelectionScreen_1 = require("@components/SelectionScreen");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var QuickbooksDesktop_1 = require("@libs/actions/connections/QuickbooksDesktop");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var Navigation_1 = require("@navigation/Navigation");
var withPolicyConnections_1 = require("@pages/workspace/withPolicyConnections");
var Policy_1 = require("@userActions/Policy/Policy");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
function QuickbooksDesktopCompanyCardExpenseAccountSelectCardPage(_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
    var policy = _a.policy;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var policyID = policy === null || policy === void 0 ? void 0 : policy.id;
    var qbdConfig = (_c = (_b = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _b === void 0 ? void 0 : _b.quickbooksDesktop) === null || _c === void 0 ? void 0 : _c.config;
    var _o = (_f = (_e = (_d = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _d === void 0 ? void 0 : _d.quickbooksDesktop) === null || _e === void 0 ? void 0 : _e.data) !== null && _f !== void 0 ? _f : {}, creditCardAccounts = _o.creditCardAccounts, payableAccounts = _o.payableAccounts, vendors = _o.vendors, bankAccounts = _o.bankAccounts;
    var nonReimbursable = (_g = qbdConfig === null || qbdConfig === void 0 ? void 0 : qbdConfig.export) === null || _g === void 0 ? void 0 : _g.nonReimbursable;
    var nonReimbursableAccount = (_h = qbdConfig === null || qbdConfig === void 0 ? void 0 : qbdConfig.export) === null || _h === void 0 ? void 0 : _h.nonReimbursableAccount;
    var nonReimbursableBillDefaultVendor = (_j = qbdConfig === null || qbdConfig === void 0 ? void 0 : qbdConfig.export) === null || _j === void 0 ? void 0 : _j.nonReimbursableBillDefaultVendor;
    var route = (0, native_1.useRoute)();
    var backTo = (_k = route.params) === null || _k === void 0 ? void 0 : _k.backTo;
    var sections = (0, react_1.useMemo)(function () {
        var _a, _b;
        var options = [
            {
                text: translate("workspace.qbd.accounts.".concat(CONST_1.default.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD)),
                value: CONST_1.default.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD,
                keyForList: CONST_1.default.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD,
                isSelected: CONST_1.default.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD === nonReimbursable,
                accounts: creditCardAccounts !== null && creditCardAccounts !== void 0 ? creditCardAccounts : [],
                defaultVendor: CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.NONE,
            },
            {
                text: translate("workspace.qbd.accounts.".concat(CONST_1.default.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CHECK)),
                value: CONST_1.default.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CHECK,
                keyForList: CONST_1.default.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CHECK,
                isSelected: CONST_1.default.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CHECK === nonReimbursable,
                accounts: bankAccounts !== null && bankAccounts !== void 0 ? bankAccounts : [],
                defaultVendor: CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.NONE,
            },
            {
                text: translate("workspace.qbd.accounts.".concat(CONST_1.default.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.VENDOR_BILL)),
                value: CONST_1.default.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.VENDOR_BILL,
                keyForList: CONST_1.default.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.VENDOR_BILL,
                isSelected: CONST_1.default.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.VENDOR_BILL === nonReimbursable,
                accounts: payableAccounts !== null && payableAccounts !== void 0 ? payableAccounts : [],
                defaultVendor: (_b = (_a = vendors === null || vendors === void 0 ? void 0 : vendors[0]) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.NONE,
            },
        ];
        return [{ data: options }];
    }, [translate, nonReimbursable, creditCardAccounts, bankAccounts, payableAccounts, vendors]);
    var goBack = (0, react_1.useCallback)(function () {
        Navigation_1.default.goBack(backTo !== null && backTo !== void 0 ? backTo : (policyID && ROUTES_1.default.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_COMPANY_CARD_EXPENSE_ACCOUNT.getRoute(policyID)));
    }, [backTo, policyID]);
    var selectExportCompanyCard = (0, react_1.useCallback)(function (row) {
        var _a, _b;
        var _c;
        var account = (_c = row.accounts.at(0)) === null || _c === void 0 ? void 0 : _c.id;
        if (row.value !== nonReimbursable && policyID) {
            (0, QuickbooksDesktop_1.updateQuickbooksCompanyCardExpenseAccount)(policyID, (_a = {},
                _a[CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.NON_REIMBURSABLE] = row.value,
                _a[CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.NON_REIMBURSABLE_ACCOUNT] = account,
                _a[CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.NON_REIMBURSABLE_BILL_DEFAULT_VENDOR] = row.defaultVendor,
                _a), (_b = {},
                _b[CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.NON_REIMBURSABLE] = nonReimbursable,
                _b[CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.NON_REIMBURSABLE_ACCOUNT] = nonReimbursableAccount,
                _b[CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.NON_REIMBURSABLE_BILL_DEFAULT_VENDOR] = nonReimbursableBillDefaultVendor,
                _b));
        }
        goBack();
    }, [nonReimbursable, nonReimbursableAccount, nonReimbursableBillDefaultVendor, policyID, goBack]);
    return (<SelectionScreen_1.default policyID={policyID} accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.CONTROL]} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED} displayName={QuickbooksDesktopCompanyCardExpenseAccountSelectCardPage.displayName} title="workspace.accounting.exportAs" sections={sections} listItem={RadioListItem_1.default} onSelectRow={function (selection) { return selectExportCompanyCard(selection); }} shouldSingleExecuteRowSelect initiallyFocusedOptionKey={(_m = (_l = sections.at(0)) === null || _l === void 0 ? void 0 : _l.data.find(function (mode) { return mode.isSelected; })) === null || _m === void 0 ? void 0 : _m.keyForList} connectionName={CONST_1.default.POLICY.CONNECTIONS.NAME.QBD} onBackButtonPress={goBack} errors={(0, ErrorUtils_1.getLatestErrorField)(qbdConfig, CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.NON_REIMBURSABLE)} errorRowStyles={[styles.ph5, styles.pv3]} pendingAction={(0, PolicyUtils_1.settingsPendingAction)([CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.NON_REIMBURSABLE], qbdConfig === null || qbdConfig === void 0 ? void 0 : qbdConfig.pendingFields)} onClose={function () { return (0, Policy_1.clearQBDErrorField)(policyID, CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.NON_REIMBURSABLE); }}/>);
}
QuickbooksDesktopCompanyCardExpenseAccountSelectCardPage.displayName = 'QuickbooksDesktopCompanyCardExpenseAccountSelectCardPage';
exports.default = (0, withPolicyConnections_1.default)(QuickbooksDesktopCompanyCardExpenseAccountSelectCardPage);
