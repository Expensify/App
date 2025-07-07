"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var BlockingView_1 = require("@components/BlockingViews/BlockingView");
var Illustrations_1 = require("@components/Icon/Illustrations");
var RadioListItem_1 = require("@components/SelectionList/RadioListItem");
var SelectionScreen_1 = require("@components/SelectionScreen");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var QuickbooksOnline_1 = require("@libs/actions/connections/QuickbooksOnline");
var ConnectionUtils_1 = require("@libs/ConnectionUtils");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var Navigation_1 = require("@navigation/Navigation");
var withPolicyConnections_1 = require("@pages/workspace/withPolicyConnections");
var variables_1 = require("@styles/variables");
var Policy_1 = require("@userActions/Policy/Policy");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
function QuickbooksCompanyCardExpenseAccountSelectPage(_a) {
    var _b, _c, _d, _e, _f, _g, _h;
    var policy = _a.policy;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var policyID = policy === null || policy === void 0 ? void 0 : policy.id;
    var _j = (_d = (_c = (_b = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _b === void 0 ? void 0 : _b.quickbooksOnline) === null || _c === void 0 ? void 0 : _c.data) !== null && _d !== void 0 ? _d : {}, creditCards = _j.creditCards, accountPayable = _j.accountPayable, bankAccounts = _j.bankAccounts;
    var qboConfig = (_f = (_e = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _e === void 0 ? void 0 : _e.quickbooksOnline) === null || _f === void 0 ? void 0 : _f.config;
    var route = (0, native_1.useRoute)();
    var backTo = (_g = route.params) === null || _g === void 0 ? void 0 : _g.backTo;
    var data = (0, react_1.useMemo)(function () {
        var accounts;
        switch (qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.nonReimbursableExpensesExportDestination) {
            case CONST_1.default.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD:
                accounts = creditCards !== null && creditCards !== void 0 ? creditCards : [];
                break;
            case CONST_1.default.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD:
                accounts = bankAccounts !== null && bankAccounts !== void 0 ? bankAccounts : [];
                break;
            case CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL:
                accounts = accountPayable !== null && accountPayable !== void 0 ? accountPayable : [];
                break;
            default:
                accounts = [];
        }
        return accounts.map(function (card) {
            var _a;
            return ({
                value: card,
                text: card.name,
                keyForList: card.name,
                isSelected: card.name === ((_a = qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.nonReimbursableExpensesAccount) === null || _a === void 0 ? void 0 : _a.name),
            });
        });
    }, [qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.nonReimbursableExpensesAccount, creditCards, bankAccounts, qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.nonReimbursableExpensesExportDestination, accountPayable]);
    var goBack = (0, react_1.useCallback)(function () {
        Navigation_1.default.goBack(backTo !== null && backTo !== void 0 ? backTo : (policyID && ROUTES_1.default.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_COMPANY_CARD_EXPENSE_ACCOUNT.getRoute(policyID)));
    }, [policyID, backTo]);
    var selectExportAccount = (0, react_1.useCallback)(function (row) {
        var _a;
        if (row.value.id !== ((_a = qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.nonReimbursableExpensesAccount) === null || _a === void 0 ? void 0 : _a.id) && policyID) {
            (0, QuickbooksOnline_1.updateQuickbooksOnlineNonReimbursableExpensesAccount)(policyID, row.value, qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.nonReimbursableExpensesAccount);
        }
        goBack();
    }, [qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.nonReimbursableExpensesAccount, policyID, goBack]);
    var listEmptyContent = (0, react_1.useMemo)(function () { return (<BlockingView_1.default icon={Illustrations_1.TeleScope} iconWidth={variables_1.default.emptyListIconWidth} iconHeight={variables_1.default.emptyListIconHeight} title={translate('workspace.qbo.noAccountsFound')} subtitle={translate('workspace.qbo.noAccountsFoundDescription')} containerStyle={styles.pb10}/>); }, [translate, styles.pb10]);
    return (<SelectionScreen_1.default policyID={policyID} accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN]} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED} displayName={QuickbooksCompanyCardExpenseAccountSelectPage.displayName} headerTitleAlreadyTranslated={(0, ConnectionUtils_1.getQBONonReimbursableExportAccountType)(qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.nonReimbursableExpensesExportDestination)} headerContent={(qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.nonReimbursableExpensesExportDestination) ? (<Text_1.default style={[styles.ph5, styles.pb5]}>{translate("workspace.qbo.accounts.".concat(qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.nonReimbursableExpensesExportDestination, "AccountDescription"))}</Text_1.default>) : null} sections={data.length ? [{ data: data }] : []} listItem={RadioListItem_1.default} onSelectRow={selectExportAccount} shouldSingleExecuteRowSelect initiallyFocusedOptionKey={(_h = data.find(function (mode) { return mode.isSelected; })) === null || _h === void 0 ? void 0 : _h.keyForList} listEmptyContent={listEmptyContent} connectionName={CONST_1.default.POLICY.CONNECTIONS.NAME.QBO} onBackButtonPress={goBack} errors={(0, ErrorUtils_1.getLatestErrorField)(qboConfig, CONST_1.default.QUICKBOOKS_CONFIG.NON_REIMBURSABLE_EXPENSES_ACCOUNT)} errorRowStyles={[styles.ph5, styles.pv3]} pendingAction={(0, PolicyUtils_1.settingsPendingAction)([CONST_1.default.QUICKBOOKS_CONFIG.NON_REIMBURSABLE_EXPENSES_ACCOUNT], qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.pendingFields)} onClose={function () { return (0, Policy_1.clearQBOErrorField)(policyID, CONST_1.default.QUICKBOOKS_CONFIG.NON_REIMBURSABLE_EXPENSES_ACCOUNT); }}/>);
}
QuickbooksCompanyCardExpenseAccountSelectPage.displayName = 'QuickbooksCompanyCardExpenseAccountSelectPage';
exports.default = (0, withPolicyConnections_1.default)(QuickbooksCompanyCardExpenseAccountSelectPage);
