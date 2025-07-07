"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var react_native_1 = require("react-native");
var BlockingView_1 = require("@components/BlockingViews/BlockingView");
var Illustrations_1 = require("@components/Icon/Illustrations");
var RadioListItem_1 = require("@components/SelectionList/RadioListItem");
var SelectionScreen_1 = require("@components/SelectionScreen");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var usePolicy_1 = require("@hooks/usePolicy");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Policy_1 = require("@libs/actions/Policy/Policy");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var variables_1 = require("@styles/variables");
var SageIntacct_1 = require("@userActions/connections/SageIntacct");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
function SageIntacctDefaultVendorPage() {
    var _a, _b, _c, _d, _e, _f;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var route = (0, native_1.useRoute)();
    var policyID = route.params.policyID;
    var policy = (0, usePolicy_1.default)(policyID);
    var config = ((_b = (_a = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _a === void 0 ? void 0 : _a.intacct) !== null && _b !== void 0 ? _b : {}).config;
    var exportConfig = ((_e = (_d = (_c = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _c === void 0 ? void 0 : _c.intacct) === null || _d === void 0 ? void 0 : _d.config) !== null && _e !== void 0 ? _e : {}).export;
    var backTo = route.params.backTo;
    var isReimbursable = route.params.reimbursable === CONST_1.default.SAGE_INTACCT_CONFIG.REIMBURSABLE;
    var goBack = (0, react_1.useCallback)(function () {
        Navigation_1.default.goBack(backTo !== null && backTo !== void 0 ? backTo : (isReimbursable
            ? ROUTES_1.default.POLICY_ACCOUNTING_SAGE_INTACCT_REIMBURSABLE_EXPENSES.getRoute(policyID)
            : ROUTES_1.default.POLICY_ACCOUNTING_SAGE_INTACCT_NON_REIMBURSABLE_EXPENSES.getRoute(policyID)));
    }, [backTo, policyID, isReimbursable]);
    var defaultVendor;
    var settingName;
    if (!isReimbursable) {
        var nonReimbursable = (exportConfig !== null && exportConfig !== void 0 ? exportConfig : {}).nonReimbursable;
        defaultVendor = (0, PolicyUtils_1.getSageIntacctNonReimbursableActiveDefaultVendor)(policy);
        settingName =
            nonReimbursable === CONST_1.default.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.CREDIT_CARD_CHARGE
                ? CONST_1.default.SAGE_INTACCT_CONFIG.NON_REIMBURSABLE_CREDIT_CARD_VENDOR
                : CONST_1.default.SAGE_INTACCT_CONFIG.NON_REIMBURSABLE_VENDOR;
    }
    else {
        var reimbursableExpenseReportDefaultVendor = (exportConfig !== null && exportConfig !== void 0 ? exportConfig : {}).reimbursableExpenseReportDefaultVendor;
        defaultVendor = reimbursableExpenseReportDefaultVendor;
        settingName = CONST_1.default.SAGE_INTACCT_CONFIG.REIMBURSABLE_VENDOR;
    }
    var vendorSelectorOptions = (0, react_1.useMemo)(function () { return (0, PolicyUtils_1.getSageIntacctVendors)(policy, defaultVendor); }, [defaultVendor, policy]);
    var listHeaderComponent = (0, react_1.useMemo)(function () { return (<react_native_1.View style={[styles.pb2, styles.ph5]}>
                <Text_1.default style={[styles.pb5, styles.textNormal]}>{translate('workspace.sageIntacct.defaultVendorDescription', { isReimbursable: isReimbursable })}</Text_1.default>
            </react_native_1.View>); }, [translate, styles.pb2, styles.ph5, styles.pb5, styles.textNormal, isReimbursable]);
    var updateDefaultVendor = (0, react_1.useCallback)(function (_a) {
        var value = _a.value;
        if (value !== defaultVendor) {
            (0, SageIntacct_1.updateSageIntacctDefaultVendor)(policyID, settingName, value, defaultVendor);
        }
        goBack();
    }, [defaultVendor, policyID, settingName, goBack]);
    var listEmptyContent = (0, react_1.useMemo)(function () { return (<BlockingView_1.default icon={Illustrations_1.TeleScope} iconWidth={variables_1.default.emptyListIconWidth} iconHeight={variables_1.default.emptyListIconHeight} title={translate('workspace.sageIntacct.noAccountsFound')} subtitle={translate('workspace.sageIntacct.noAccountsFoundDescription')} containerStyle={styles.pb10}/>); }, [translate, styles.pb10]);
    return (<SelectionScreen_1.default policyID={policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED} displayName={SageIntacctDefaultVendorPage.displayName} sections={vendorSelectorOptions.length ? [{ data: vendorSelectorOptions }] : []} listItem={RadioListItem_1.default} onSelectRow={updateDefaultVendor} initiallyFocusedOptionKey={(_f = vendorSelectorOptions.find(function (mode) { return mode.isSelected; })) === null || _f === void 0 ? void 0 : _f.keyForList} headerContent={listHeaderComponent} onBackButtonPress={goBack} title="workspace.sageIntacct.defaultVendor" listEmptyContent={listEmptyContent} accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.PAID]} connectionName={CONST_1.default.POLICY.CONNECTIONS.NAME.SAGE_INTACCT} pendingAction={(0, PolicyUtils_1.settingsPendingAction)([settingName], config === null || config === void 0 ? void 0 : config.pendingFields)} errors={(0, ErrorUtils_1.getLatestErrorField)(config, settingName)} errorRowStyles={[styles.ph5, styles.pv3]} onClose={function () { return (0, Policy_1.clearSageIntacctErrorField)(policyID, settingName); }}/>);
}
SageIntacctDefaultVendorPage.displayName = 'SageIntacctDefaultVendorPage';
exports.default = SageIntacctDefaultVendorPage;
