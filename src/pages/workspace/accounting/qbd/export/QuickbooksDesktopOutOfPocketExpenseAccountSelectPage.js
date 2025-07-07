"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var BlockingView_1 = require("@components/BlockingViews/BlockingView");
var Illustrations = require("@components/Icon/Illustrations");
var RadioListItem_1 = require("@components/SelectionList/RadioListItem");
var SelectionScreen_1 = require("@components/SelectionScreen");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var QuickbooksDesktop_1 = require("@libs/actions/connections/QuickbooksDesktop");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var Navigation_1 = require("@navigation/Navigation");
var utils_1 = require("@pages/workspace/accounting/utils");
var withPolicyConnections_1 = require("@pages/workspace/withPolicyConnections");
var variables_1 = require("@styles/variables");
var Policy_1 = require("@userActions/Policy/Policy");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
function QuickbooksDesktopOutOfPocketExpenseAccountSelectPage(_a) {
    var _b, _c, _d, _e, _f, _g, _h;
    var policy = _a.policy;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var qbdConfig = (_c = (_b = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _b === void 0 ? void 0 : _b.quickbooksDesktop) === null || _c === void 0 ? void 0 : _c.config;
    var route = (0, native_1.useRoute)();
    var backTo = (_d = route.params) === null || _d === void 0 ? void 0 : _d.backTo;
    var _j = (0, react_1.useMemo)(function () {
        var titleText;
        var descriptionText;
        switch (qbdConfig === null || qbdConfig === void 0 ? void 0 : qbdConfig.export.reimbursable) {
            case CONST_1.default.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK:
                titleText = 'workspace.qbd.bankAccount';
                descriptionText = translate('workspace.qbd.bankAccountDescription');
                break;
            case CONST_1.default.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY:
                titleText = 'workspace.qbd.account';
                descriptionText = translate('workspace.qbd.accountDescription');
                break;
            case CONST_1.default.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL:
                titleText = 'workspace.qbd.accountsPayable';
                descriptionText = translate('workspace.qbd.accountsPayableDescription');
                break;
            default:
                break;
        }
        return [titleText, descriptionText];
    }, [qbdConfig === null || qbdConfig === void 0 ? void 0 : qbdConfig.export.reimbursable, translate]), title = _j[0], description = _j[1];
    var data = (0, react_1.useMemo)(function () {
        var _a;
        var accounts = (0, utils_1.getQBDReimbursableAccounts)((_a = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _a === void 0 ? void 0 : _a.quickbooksDesktop);
        return accounts.map(function (account) {
            var _a, _b;
            return ({
                value: account,
                text: account.name,
                keyForList: account.name,
                // We use the logical OR (||) here instead of ?? because `reimbursableAccount` can be an empty string
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                isSelected: account.id === (((_a = qbdConfig === null || qbdConfig === void 0 ? void 0 : qbdConfig.export) === null || _a === void 0 ? void 0 : _a.reimbursableAccount) || ((_b = accounts.at(0)) === null || _b === void 0 ? void 0 : _b.id)),
            });
        });
    }, [(_e = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _e === void 0 ? void 0 : _e.quickbooksDesktop, (_f = qbdConfig === null || qbdConfig === void 0 ? void 0 : qbdConfig.export) === null || _f === void 0 ? void 0 : _f.reimbursableAccount]);
    var policyID = policy === null || policy === void 0 ? void 0 : policy.id;
    var goBack = (0, react_1.useCallback)(function () {
        Navigation_1.default.goBack(backTo !== null && backTo !== void 0 ? backTo : (policyID && ROUTES_1.default.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_EXPORT_OUT_OF_POCKET_EXPENSES.getRoute(policyID)));
    }, [policyID, backTo]);
    var selectExportAccount = (0, react_1.useCallback)(function (row) {
        var _a, _b;
        if (row.value.id !== ((_a = qbdConfig === null || qbdConfig === void 0 ? void 0 : qbdConfig.export) === null || _a === void 0 ? void 0 : _a.reimbursableAccount) && policyID) {
            (0, QuickbooksDesktop_1.updateQuickbooksDesktopReimbursableExpensesAccount)(policyID, row.value.id, (_b = qbdConfig === null || qbdConfig === void 0 ? void 0 : qbdConfig.export) === null || _b === void 0 ? void 0 : _b.reimbursableAccount);
        }
        goBack();
    }, [(_g = qbdConfig === null || qbdConfig === void 0 ? void 0 : qbdConfig.export) === null || _g === void 0 ? void 0 : _g.reimbursableAccount, policyID, goBack]);
    var listEmptyContent = (0, react_1.useMemo)(function () { return (<BlockingView_1.default icon={Illustrations.TeleScope} iconWidth={variables_1.default.emptyListIconWidth} iconHeight={variables_1.default.emptyListIconHeight} title={translate('workspace.qbd.noAccountsFound')} subtitle={translate('workspace.qbd.noAccountsFoundDescription')} containerStyle={styles.pb10}/>); }, [translate, styles.pb10]);
    return (<SelectionScreen_1.default policyID={policyID} accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.CONTROL]} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED} displayName={QuickbooksDesktopOutOfPocketExpenseAccountSelectPage.displayName} sections={data.length ? [{ data: data }] : []} listItem={RadioListItem_1.default} headerContent={<Text_1.default style={[styles.ph5, styles.pb5]}>{description}</Text_1.default>} onBackButtonPress={goBack} onSelectRow={selectExportAccount} initiallyFocusedOptionKey={(_h = data.find(function (mode) { return mode.isSelected; })) === null || _h === void 0 ? void 0 : _h.keyForList} title={title} connectionName={CONST_1.default.POLICY.CONNECTIONS.NAME.QBD} pendingAction={(0, PolicyUtils_1.settingsPendingAction)([CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.REIMBURSABLE_ACCOUNT], qbdConfig === null || qbdConfig === void 0 ? void 0 : qbdConfig.pendingFields)} errors={(0, ErrorUtils_1.getLatestErrorField)(qbdConfig, CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.REIMBURSABLE_ACCOUNT)} errorRowStyles={[styles.ph5, styles.pv3]} onClose={function () { return (0, Policy_1.clearQBDErrorField)(policyID, CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.REIMBURSABLE_ACCOUNT); }} listEmptyContent={listEmptyContent} shouldSingleExecuteRowSelect/>);
}
QuickbooksDesktopOutOfPocketExpenseAccountSelectPage.displayName = 'QuickbooksDesktopOutOfPocketExpenseAccountSelectPage';
exports.default = (0, withPolicyConnections_1.default)(QuickbooksDesktopOutOfPocketExpenseAccountSelectPage);
