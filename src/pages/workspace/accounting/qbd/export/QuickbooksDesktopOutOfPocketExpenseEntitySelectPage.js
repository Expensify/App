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
var utils_1 = require("@pages/workspace/accounting/utils");
var withPolicyConnections_1 = require("@pages/workspace/withPolicyConnections");
var Policy_1 = require("@userActions/Policy/Policy");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
function QuickbooksDesktopOutOfPocketExpenseEntitySelectPage(_a) {
    var _b;
    var _c, _d, _e, _f, _g, _h, _j;
    var policy = _a.policy;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var qbdConfig = (_d = (_c = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _c === void 0 ? void 0 : _c.quickbooksDesktop) === null || _d === void 0 ? void 0 : _d.config;
    var reimbursable = qbdConfig === null || qbdConfig === void 0 ? void 0 : qbdConfig.export.reimbursable;
    var hasErrors = !!((_e = qbdConfig === null || qbdConfig === void 0 ? void 0 : qbdConfig.errorFields) === null || _e === void 0 ? void 0 : _e.reimbursable);
    var policyID = policy === null || policy === void 0 ? void 0 : policy.id;
    var route = (0, native_1.useRoute)();
    var backTo = (_f = route.params) === null || _f === void 0 ? void 0 : _f.backTo;
    var goBack = (0, react_1.useCallback)(function () {
        Navigation_1.default.goBack(backTo !== null && backTo !== void 0 ? backTo : (policyID && ROUTES_1.default.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_EXPORT_OUT_OF_POCKET_EXPENSES.getRoute(policyID)));
    }, [policyID, backTo]);
    var data = (0, react_1.useMemo)(function () {
        var _a, _b, _c;
        return [
            {
                value: CONST_1.default.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK,
                text: translate("workspace.qbd.accounts.".concat(CONST_1.default.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK)),
                keyForList: CONST_1.default.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK,
                isSelected: reimbursable === CONST_1.default.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK,
                isShown: true,
                accounts: (0, utils_1.getQBDReimbursableAccounts)((_a = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _a === void 0 ? void 0 : _a.quickbooksDesktop, CONST_1.default.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK),
            },
            {
                value: CONST_1.default.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY,
                text: translate("workspace.qbd.accounts.".concat(CONST_1.default.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY)),
                keyForList: CONST_1.default.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY,
                isSelected: reimbursable === CONST_1.default.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY,
                isShown: true,
                accounts: (0, utils_1.getQBDReimbursableAccounts)((_b = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _b === void 0 ? void 0 : _b.quickbooksDesktop, CONST_1.default.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY),
            },
            {
                value: CONST_1.default.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL,
                text: translate("workspace.qbd.accounts.".concat(CONST_1.default.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL)),
                keyForList: CONST_1.default.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL,
                isSelected: reimbursable === CONST_1.default.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL,
                isShown: true,
                accounts: (0, utils_1.getQBDReimbursableAccounts)((_c = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _c === void 0 ? void 0 : _c.quickbooksDesktop, CONST_1.default.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL),
            },
        ];
    }, [translate, reimbursable, (_g = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _g === void 0 ? void 0 : _g.quickbooksDesktop]);
    var sections = (0, react_1.useMemo)(function () { return [{ data: data.filter(function (item) { return item.isShown; }) }]; }, [data]);
    var selectExportEntity = (0, react_1.useCallback)(function (row) {
        var _a, _b;
        var _c, _d, _e;
        var account = (_d = (_c = row === null || row === void 0 ? void 0 : row.accounts) === null || _c === void 0 ? void 0 : _c.at(0)) === null || _d === void 0 ? void 0 : _d.id;
        if (row.value !== reimbursable && policyID) {
            (0, QuickbooksDesktop_1.updateQuickbooksDesktopExpensesExportDestination)(policyID, (_a = {},
                _a[CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.REIMBURSABLE] = row.value,
                _a[CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.REIMBURSABLE_ACCOUNT] = account,
                _a), (_b = {},
                _b[CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.REIMBURSABLE] = reimbursable,
                _b[CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.REIMBURSABLE_ACCOUNT] = (_e = qbdConfig === null || qbdConfig === void 0 ? void 0 : qbdConfig.export) === null || _e === void 0 ? void 0 : _e.reimbursableAccount,
                _b));
        }
        goBack();
    }, [reimbursable, policyID, (_h = qbdConfig === null || qbdConfig === void 0 ? void 0 : qbdConfig.export) === null || _h === void 0 ? void 0 : _h.reimbursableAccount, goBack]);
    return (<SelectionScreen_1.default policyID={policyID} accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.CONTROL]} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED} displayName={QuickbooksDesktopOutOfPocketExpenseEntitySelectPage.displayName} sections={sections} listItem={RadioListItem_1.default} onBackButtonPress={goBack} onSelectRow={function (selection) { return selectExportEntity(selection); }} shouldSingleExecuteRowSelect initiallyFocusedOptionKey={(_j = data.find(function (mode) { return mode.isSelected; })) === null || _j === void 0 ? void 0 : _j.keyForList} title="workspace.accounting.exportAs" connectionName={CONST_1.default.POLICY.CONNECTIONS.NAME.QBD} pendingAction={(0, PolicyUtils_1.settingsPendingAction)([CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.REIMBURSABLE, CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.REIMBURSABLE_ACCOUNT], qbdConfig === null || qbdConfig === void 0 ? void 0 : qbdConfig.pendingFields)} errors={hasErrors && reimbursable
            ? (_b = {},
                _b[CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.REIMBURSABLE] = translate("workspace.qbd.accounts.".concat(reimbursable, "Error")),
                _b) : (0, ErrorUtils_1.getLatestErrorField)(qbdConfig, CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.REIMBURSABLE)} errorRowStyles={[styles.ph5, styles.pv3]} onClose={function () { return (0, Policy_1.clearQBDErrorField)(policyID, CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.REIMBURSABLE); }}/>);
}
QuickbooksDesktopOutOfPocketExpenseEntitySelectPage.displayName = 'QuickbooksDesktopOutOfPocketExpenseEntitySelectPage';
exports.default = (0, withPolicyConnections_1.default)(QuickbooksDesktopOutOfPocketExpenseEntitySelectPage);
