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
var ConnectionUtils_1 = require("@libs/ConnectionUtils");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var Navigation_1 = require("@navigation/Navigation");
var utils_1 = require("@pages/workspace/accounting/utils");
var withPolicyConnections_1 = require("@pages/workspace/withPolicyConnections");
var variables_1 = require("@styles/variables");
var Policy_1 = require("@userActions/Policy/Policy");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
function QuickbooksDesktopCompanyCardExpenseAccountSelectPage(_a) {
    var _b, _c, _d, _e, _f, _g, _h;
    var policy = _a.policy;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var policyID = policy === null || policy === void 0 ? void 0 : policy.id;
    var qbdConfig = (_c = (_b = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _b === void 0 ? void 0 : _b.quickbooksDesktop) === null || _c === void 0 ? void 0 : _c.config;
    var nonReimbursable = (_d = qbdConfig === null || qbdConfig === void 0 ? void 0 : qbdConfig.export) === null || _d === void 0 ? void 0 : _d.nonReimbursable;
    var nonReimbursableAccount = (_e = qbdConfig === null || qbdConfig === void 0 ? void 0 : qbdConfig.export) === null || _e === void 0 ? void 0 : _e.nonReimbursableAccount;
    var route = (0, native_1.useRoute)();
    var backTo = (_f = route.params) === null || _f === void 0 ? void 0 : _f.backTo;
    var data = (0, react_1.useMemo)(function () {
        var _a;
        var accounts = (0, utils_1.getQBDReimbursableAccounts)((_a = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _a === void 0 ? void 0 : _a.quickbooksDesktop, nonReimbursable);
        return accounts.map(function (card) {
            var _a;
            return ({
                value: card,
                text: card.name,
                keyForList: card.name,
                // We use the logical OR (||) here instead of ?? because `nonReimbursableAccount` can be an empty string
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                isSelected: card.id === (nonReimbursableAccount || ((_a = accounts.at(0)) === null || _a === void 0 ? void 0 : _a.id)),
            });
        });
    }, [(_g = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _g === void 0 ? void 0 : _g.quickbooksDesktop, nonReimbursable, nonReimbursableAccount]);
    var goBack = (0, react_1.useCallback)(function () {
        Navigation_1.default.goBack(backTo !== null && backTo !== void 0 ? backTo : (policyID && ROUTES_1.default.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_COMPANY_CARD_EXPENSE_ACCOUNT.getRoute(policyID)));
    }, [policyID, backTo]);
    var selectExportAccount = (0, react_1.useCallback)(function (row) {
        if (row.value.id !== nonReimbursableAccount && policyID) {
            (0, QuickbooksDesktop_1.updateQuickbooksDesktopNonReimbursableExpensesAccount)(policyID, row.value.id, nonReimbursableAccount);
        }
        goBack();
    }, [nonReimbursableAccount, policyID, goBack]);
    var listEmptyContent = (0, react_1.useMemo)(function () { return (<BlockingView_1.default icon={Illustrations.TeleScope} iconWidth={variables_1.default.emptyListIconWidth} iconHeight={variables_1.default.emptyListIconHeight} title={translate('workspace.qbd.noAccountsFound')} subtitle={translate('workspace.qbd.noAccountsFoundDescription')} containerStyle={styles.pb10}/>); }, [translate, styles.pb10]);
    return (<SelectionScreen_1.default policyID={policyID} accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.CONTROL]} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED} displayName={QuickbooksDesktopCompanyCardExpenseAccountSelectPage.displayName} headerTitleAlreadyTranslated={(0, ConnectionUtils_1.getQBDNonReimbursableExportAccountType)(nonReimbursable)} headerContent={nonReimbursable ? <Text_1.default style={[styles.ph5, styles.pb5]}>{translate("workspace.qbd.accounts.".concat(nonReimbursable, "AccountDescription"))}</Text_1.default> : null} sections={data.length ? [{ data: data }] : []} listItem={RadioListItem_1.default} onSelectRow={selectExportAccount} shouldSingleExecuteRowSelect initiallyFocusedOptionKey={(_h = data.find(function (mode) { return mode.isSelected; })) === null || _h === void 0 ? void 0 : _h.keyForList} listEmptyContent={listEmptyContent} connectionName={CONST_1.default.POLICY.CONNECTIONS.NAME.QBD} onBackButtonPress={goBack} errors={(0, ErrorUtils_1.getLatestErrorField)(qbdConfig, CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.NON_REIMBURSABLE_ACCOUNT)} errorRowStyles={[styles.ph5, styles.pv3]} pendingAction={(0, PolicyUtils_1.settingsPendingAction)([CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.NON_REIMBURSABLE_ACCOUNT], qbdConfig === null || qbdConfig === void 0 ? void 0 : qbdConfig.pendingFields)} onClose={function () { return (0, Policy_1.clearQBDErrorField)(policyID, CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.NON_REIMBURSABLE_ACCOUNT); }}/>);
}
QuickbooksDesktopCompanyCardExpenseAccountSelectPage.displayName = 'QuickbooksDesktopCompanyCardExpenseAccountSelectPage';
exports.default = (0, withPolicyConnections_1.default)(QuickbooksDesktopCompanyCardExpenseAccountSelectPage);
