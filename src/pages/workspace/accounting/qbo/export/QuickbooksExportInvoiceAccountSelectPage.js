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
var QuickbooksOnline_1 = require("@libs/actions/connections/QuickbooksOnline");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var Navigation_1 = require("@navigation/Navigation");
var withPolicyConnections_1 = require("@pages/workspace/withPolicyConnections");
var variables_1 = require("@styles/variables");
var Policy_1 = require("@userActions/Policy/Policy");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
function QuickbooksExportInvoiceAccountSelectPage(_a) {
    var _b, _c, _d, _e, _f, _g, _h;
    var policy = _a.policy;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var accountsReceivable = ((_d = (_c = (_b = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _b === void 0 ? void 0 : _b.quickbooksOnline) === null || _c === void 0 ? void 0 : _c.data) !== null && _d !== void 0 ? _d : {}).accountsReceivable;
    var qboConfig = (_f = (_e = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _e === void 0 ? void 0 : _e.quickbooksOnline) === null || _f === void 0 ? void 0 : _f.config;
    var route = (0, native_1.useRoute)();
    var backTo = (_g = route.params) === null || _g === void 0 ? void 0 : _g.backTo;
    var policyID = policy === null || policy === void 0 ? void 0 : policy.id;
    var data = (0, react_1.useMemo)(function () {
        var _a;
        return (_a = accountsReceivable === null || accountsReceivable === void 0 ? void 0 : accountsReceivable.map(function (account) {
            var _a;
            return ({
                value: account,
                text: account.name,
                keyForList: account.name,
                isSelected: account.id === ((_a = qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.receivableAccount) === null || _a === void 0 ? void 0 : _a.id),
            });
        })) !== null && _a !== void 0 ? _a : [];
    }, [qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.receivableAccount, accountsReceivable]);
    var goBack = (0, react_1.useCallback)(function () {
        Navigation_1.default.goBack(backTo !== null && backTo !== void 0 ? backTo : ROUTES_1.default.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_EXPORT.getRoute(policyID));
    }, [policyID, backTo]);
    var selectExportInvoice = (0, react_1.useCallback)(function (row) {
        var _a;
        if (row.value.id !== ((_a = qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.receivableAccount) === null || _a === void 0 ? void 0 : _a.id)) {
            (0, QuickbooksOnline_1.updateQuickbooksOnlineReceivableAccount)(policyID, row.value, qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.receivableAccount);
        }
        goBack();
    }, [qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.receivableAccount, policyID, goBack]);
    var listEmptyContent = (0, react_1.useMemo)(function () { return (<BlockingView_1.default icon={Illustrations.TeleScope} iconWidth={variables_1.default.emptyListIconWidth} iconHeight={variables_1.default.emptyListIconHeight} title={translate('workspace.qbo.noAccountsFound')} subtitle={translate('workspace.qbo.noAccountsFoundDescription')} containerStyle={styles.pb10}/>); }, [translate, styles.pb10]);
    return (<SelectionScreen_1.default policyID={policyID} accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN]} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED} displayName={QuickbooksExportInvoiceAccountSelectPage.displayName} sections={data.length ? [{ data: data }] : []} listItem={RadioListItem_1.default} headerContent={<Text_1.default style={[styles.ph5, styles.pb5]}>{translate('workspace.qbo.exportInvoicesDescription')}</Text_1.default>} onBackButtonPress={goBack} onSelectRow={selectExportInvoice} initiallyFocusedOptionKey={(_h = data.find(function (mode) { return mode.isSelected; })) === null || _h === void 0 ? void 0 : _h.keyForList} title="workspace.qbo.exportInvoices" connectionName={CONST_1.default.POLICY.CONNECTIONS.NAME.QBO} pendingAction={(0, PolicyUtils_1.settingsPendingAction)([CONST_1.default.QUICKBOOKS_CONFIG.RECEIVABLE_ACCOUNT], qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.pendingFields)} errors={(0, ErrorUtils_1.getLatestErrorField)(qboConfig, CONST_1.default.QUICKBOOKS_CONFIG.RECEIVABLE_ACCOUNT)} errorRowStyles={[styles.ph5, styles.pv3]} onClose={function () { return (0, Policy_1.clearQBOErrorField)(policyID, CONST_1.default.QUICKBOOKS_CONFIG.RECEIVABLE_ACCOUNT); }} listEmptyContent={listEmptyContent} shouldSingleExecuteRowSelect/>);
}
QuickbooksExportInvoiceAccountSelectPage.displayName = 'QuickbooksExportInvoiceAccountSelectPage';
exports.default = (0, withPolicyConnections_1.default)(QuickbooksExportInvoiceAccountSelectPage);
