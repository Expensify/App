"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var BlockingView_1 = require("@components/BlockingViews/BlockingView");
var Illustrations = require("@components/Icon/Illustrations");
var RadioListItem_1 = require("@components/SelectionList/RadioListItem");
var SelectionScreen_1 = require("@components/SelectionScreen");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var QuickbooksOnline = require("@libs/actions/connections/QuickbooksOnline");
var ErrorUtils = require("@libs/ErrorUtils");
var PolicyUtils = require("@libs/PolicyUtils");
var Navigation_1 = require("@navigation/Navigation");
var withPolicyConnections_1 = require("@pages/workspace/withPolicyConnections");
var variables_1 = require("@styles/variables");
var Policy_1 = require("@userActions/Policy/Policy");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
function QuickbooksNonReimbursableDefaultVendorSelectPage(_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j;
    var policy = _a.policy;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var vendors = ((_d = (_c = (_b = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _b === void 0 ? void 0 : _b.quickbooksOnline) === null || _c === void 0 ? void 0 : _c.data) !== null && _d !== void 0 ? _d : {}).vendors;
    var qboConfig = (_f = (_e = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _e === void 0 ? void 0 : _e.quickbooksOnline) === null || _f === void 0 ? void 0 : _f.config;
    var policyID = (_g = policy === null || policy === void 0 ? void 0 : policy.id) !== null && _g !== void 0 ? _g : '-1';
    var sections = (0, react_1.useMemo)(function () {
        var _a;
        var data = (_a = vendors === null || vendors === void 0 ? void 0 : vendors.map(function (vendor) { return ({
            value: vendor.id,
            text: vendor.name,
            keyForList: vendor.name,
            isSelected: vendor.id === (qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.nonReimbursableBillDefaultVendor),
        }); })) !== null && _a !== void 0 ? _a : [];
        return data.length ? [{ data: data }] : [];
    }, [qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.nonReimbursableBillDefaultVendor, vendors]);
    var selectVendor = (0, react_1.useCallback)(function (row) {
        if (row.value !== (qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.nonReimbursableBillDefaultVendor)) {
            QuickbooksOnline.updateQuickbooksOnlineNonReimbursableBillDefaultVendor(policyID, row.value, qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.nonReimbursableBillDefaultVendor);
        }
        Navigation_1.default.goBack(ROUTES_1.default.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_COMPANY_CARD_EXPENSE_ACCOUNT.getRoute(policyID));
    }, [qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.nonReimbursableBillDefaultVendor, policyID]);
    var listEmptyContent = (0, react_1.useMemo)(function () { return (<BlockingView_1.default icon={Illustrations.TeleScope} iconWidth={variables_1.default.emptyListIconWidth} iconHeight={variables_1.default.emptyListIconHeight} title={translate('workspace.qbo.noAccountsFound')} subtitle={translate('workspace.qbo.noAccountsFoundDescription')} containerStyle={styles.pb10}/>); }, [translate, styles.pb10]);
    return (<SelectionScreen_1.default policyID={policyID} accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN]} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED} displayName={QuickbooksNonReimbursableDefaultVendorSelectPage.displayName} title="workspace.accounting.defaultVendor" sections={sections} listItem={RadioListItem_1.default} onSelectRow={selectVendor} shouldSingleExecuteRowSelect initiallyFocusedOptionKey={(_j = (_h = sections.at(0)) === null || _h === void 0 ? void 0 : _h.data.find(function (mode) { return mode.isSelected; })) === null || _j === void 0 ? void 0 : _j.keyForList} listEmptyContent={listEmptyContent} connectionName={CONST_1.default.POLICY.CONNECTIONS.NAME.QBO} onBackButtonPress={function () { return Navigation_1.default.goBack(ROUTES_1.default.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_COMPANY_CARD_EXPENSE_ACCOUNT.getRoute(policyID)); }} pendingAction={PolicyUtils.settingsPendingAction([CONST_1.default.QUICKBOOKS_CONFIG.NON_REIMBURSABLE_BILL_DEFAULT_VENDOR], qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.pendingFields)} errors={ErrorUtils.getLatestErrorField(qboConfig, CONST_1.default.QUICKBOOKS_CONFIG.NON_REIMBURSABLE_BILL_DEFAULT_VENDOR)} errorRowStyles={[styles.ph5, styles.pv3]} onClose={function () { return (0, Policy_1.clearQBOErrorField)(policyID, CONST_1.default.QUICKBOOKS_CONFIG.NON_REIMBURSABLE_BILL_DEFAULT_VENDOR); }}/>);
}
QuickbooksNonReimbursableDefaultVendorSelectPage.displayName = 'QuickbooksNonReimbursableDefaultVendorSelectPage';
exports.default = (0, withPolicyConnections_1.default)(QuickbooksNonReimbursableDefaultVendorSelectPage);
