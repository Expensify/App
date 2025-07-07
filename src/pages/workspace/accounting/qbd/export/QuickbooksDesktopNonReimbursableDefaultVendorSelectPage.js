"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var BlockingView_1 = require("@components/BlockingViews/BlockingView");
var Illustrations = require("@components/Icon/Illustrations");
var RadioListItem_1 = require("@components/SelectionList/RadioListItem");
var SelectionScreen_1 = require("@components/SelectionScreen");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var QuickbooksDesktop = require("@libs/actions/connections/QuickbooksDesktop");
var ErrorUtils = require("@libs/ErrorUtils");
var PolicyUtils = require("@libs/PolicyUtils");
var Navigation_1 = require("@navigation/Navigation");
var withPolicyConnections_1 = require("@pages/workspace/withPolicyConnections");
var variables_1 = require("@styles/variables");
var Policy_1 = require("@userActions/Policy/Policy");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
function QuickbooksDesktopNonReimbursableDefaultVendorSelectPage(_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j, _k;
    var policy = _a.policy;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var vendors = ((_d = (_c = (_b = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _b === void 0 ? void 0 : _b.quickbooksDesktop) === null || _c === void 0 ? void 0 : _c.data) !== null && _d !== void 0 ? _d : {}).vendors;
    var qbdConfig = (_f = (_e = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _e === void 0 ? void 0 : _e.quickbooksDesktop) === null || _f === void 0 ? void 0 : _f.config;
    var nonReimbursableBillDefaultVendor = (_g = qbdConfig === null || qbdConfig === void 0 ? void 0 : qbdConfig.export) === null || _g === void 0 ? void 0 : _g.nonReimbursableBillDefaultVendor;
    var policyID = (_h = policy === null || policy === void 0 ? void 0 : policy.id) !== null && _h !== void 0 ? _h : '-1';
    var sections = (0, react_1.useMemo)(function () {
        var _a;
        var data = (_a = vendors === null || vendors === void 0 ? void 0 : vendors.map(function (vendor) {
            var _a;
            return ({
                value: vendor.id,
                text: vendor.name,
                keyForList: vendor.name,
                // We use the logical OR (||) here instead of ?? because `nonReimbursableBillDefaultVendor` can be an empty string
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                isSelected: vendor.id === (nonReimbursableBillDefaultVendor || ((_a = vendors.at(0)) === null || _a === void 0 ? void 0 : _a.id)),
            });
        })) !== null && _a !== void 0 ? _a : [];
        return data.length ? [{ data: data }] : [];
    }, [nonReimbursableBillDefaultVendor, vendors]);
    var selectVendor = (0, react_1.useCallback)(function (row) {
        if (row.value !== nonReimbursableBillDefaultVendor) {
            QuickbooksDesktop.updateQuickbooksDesktopNonReimbursableBillDefaultVendor(policyID, row.value, nonReimbursableBillDefaultVendor);
        }
        Navigation_1.default.goBack(ROUTES_1.default.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_COMPANY_CARD_EXPENSE_ACCOUNT.getRoute(policyID));
    }, [nonReimbursableBillDefaultVendor, policyID]);
    var listEmptyContent = (0, react_1.useMemo)(function () { return (<BlockingView_1.default icon={Illustrations.TeleScope} iconWidth={variables_1.default.emptyListIconWidth} iconHeight={variables_1.default.emptyListIconHeight} title={translate('workspace.qbd.noAccountsFound')} subtitle={translate('workspace.qbd.noAccountsFoundDescription')} containerStyle={styles.pb10}/>); }, [translate, styles.pb10]);
    return (<SelectionScreen_1.default policyID={policyID} accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.CONTROL]} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED} displayName={QuickbooksDesktopNonReimbursableDefaultVendorSelectPage.displayName} title="workspace.accounting.defaultVendor" sections={sections} listItem={RadioListItem_1.default} onSelectRow={selectVendor} shouldSingleExecuteRowSelect initiallyFocusedOptionKey={(_k = (_j = sections.at(0)) === null || _j === void 0 ? void 0 : _j.data.find(function (mode) { return mode.isSelected; })) === null || _k === void 0 ? void 0 : _k.keyForList} listEmptyContent={listEmptyContent} connectionName={CONST_1.default.POLICY.CONNECTIONS.NAME.QBD} onBackButtonPress={function () { return Navigation_1.default.goBack(ROUTES_1.default.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_COMPANY_CARD_EXPENSE_ACCOUNT.getRoute(policyID)); }} pendingAction={PolicyUtils.settingsPendingAction([CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.NON_REIMBURSABLE_BILL_DEFAULT_VENDOR], qbdConfig === null || qbdConfig === void 0 ? void 0 : qbdConfig.pendingFields)} errors={ErrorUtils.getLatestErrorField(qbdConfig, CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.NON_REIMBURSABLE_BILL_DEFAULT_VENDOR)} errorRowStyles={[styles.ph5, styles.pv3]} onClose={function () { return (0, Policy_1.clearQBDErrorField)(policyID, CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.NON_REIMBURSABLE_BILL_DEFAULT_VENDOR); }}/>);
}
QuickbooksDesktopNonReimbursableDefaultVendorSelectPage.displayName = 'QuickbooksDesktopNonReimbursableDefaultVendorSelectPage';
exports.default = (0, withPolicyConnections_1.default)(QuickbooksDesktopNonReimbursableDefaultVendorSelectPage);
