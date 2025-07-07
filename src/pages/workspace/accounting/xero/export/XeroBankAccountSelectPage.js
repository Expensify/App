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
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Policy_1 = require("@libs/actions/Policy/Policy");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var withPolicyConnections_1 = require("@pages/workspace/withPolicyConnections");
var variables_1 = require("@styles/variables");
var Xero_1 = require("@userActions/connections/Xero");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
function XeroBankAccountSelectPage(_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j;
    var policy = _a.policy;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var policyID = policy === null || policy === void 0 ? void 0 : policy.id;
    var config = ((_c = (_b = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _b === void 0 ? void 0 : _b.xero) !== null && _c !== void 0 ? _c : {}).config;
    var bankAccounts = ((_f = (_e = (_d = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _d === void 0 ? void 0 : _d.xero) === null || _e === void 0 ? void 0 : _e.data) !== null && _f !== void 0 ? _f : {}).bankAccounts;
    var xeroSelectorOptions = (0, react_1.useMemo)(
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    function () { var _a, _b; return (0, PolicyUtils_1.getXeroBankAccounts)(policy !== null && policy !== void 0 ? policy : undefined, ((_a = config === null || config === void 0 ? void 0 : config.export) === null || _a === void 0 ? void 0 : _a.nonReimbursableAccount) || ((_b = bankAccounts === null || bankAccounts === void 0 ? void 0 : bankAccounts[0]) === null || _b === void 0 ? void 0 : _b.id)); }, [(_g = config === null || config === void 0 ? void 0 : config.export) === null || _g === void 0 ? void 0 : _g.nonReimbursableAccount, policy, bankAccounts]);
    var route = (0, native_1.useRoute)();
    var backTo = (_h = route.params) === null || _h === void 0 ? void 0 : _h.backTo;
    var goBack = (0, react_1.useCallback)(function () {
        Navigation_1.default.goBack(backTo !== null && backTo !== void 0 ? backTo : (policyID && ROUTES_1.default.POLICY_ACCOUNTING_XERO_EXPORT.getRoute(policyID)));
    }, [policyID, backTo]);
    var listHeaderComponent = (0, react_1.useMemo)(function () { return (<react_native_1.View style={[styles.pb2, styles.ph5]}>
                <Text_1.default style={[styles.pb5, styles.textNormal]}>{translate('workspace.xero.xeroBankAccountDescription')}</Text_1.default>
            </react_native_1.View>); }, [translate, styles.pb2, styles.ph5, styles.pb5, styles.textNormal]);
    var initiallyFocusedOptionKey = (0, react_1.useMemo)(function () { var _a; return (_a = xeroSelectorOptions === null || xeroSelectorOptions === void 0 ? void 0 : xeroSelectorOptions.find(function (mode) { return mode.isSelected; })) === null || _a === void 0 ? void 0 : _a.keyForList; }, [xeroSelectorOptions]);
    var updateBankAccount = (0, react_1.useCallback)(function (_a) {
        var _b;
        var value = _a.value;
        if (initiallyFocusedOptionKey !== value && policyID) {
            (0, Xero_1.updateXeroExportNonReimbursableAccount)(policyID, value, (_b = config === null || config === void 0 ? void 0 : config.export) === null || _b === void 0 ? void 0 : _b.nonReimbursableAccount);
        }
        goBack();
    }, [initiallyFocusedOptionKey, policyID, (_j = config === null || config === void 0 ? void 0 : config.export) === null || _j === void 0 ? void 0 : _j.nonReimbursableAccount, goBack]);
    var listEmptyContent = (0, react_1.useMemo)(function () { return (<BlockingView_1.default icon={Illustrations_1.TeleScope} iconWidth={variables_1.default.emptyListIconWidth} iconHeight={variables_1.default.emptyListIconHeight} title={translate('workspace.xero.noAccountsFound')} subtitle={translate('workspace.xero.noAccountsFoundDescription')} containerStyle={styles.pb10}/>); }, [translate, styles.pb10]);
    return (<SelectionScreen_1.default policyID={policyID} accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.PAID]} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED} displayName={XeroBankAccountSelectPage.displayName} sections={xeroSelectorOptions.length ? [{ data: xeroSelectorOptions }] : []} listItem={RadioListItem_1.default} onSelectRow={updateBankAccount} initiallyFocusedOptionKey={initiallyFocusedOptionKey} headerContent={listHeaderComponent} onBackButtonPress={goBack} title="workspace.xero.xeroBankAccount" listEmptyContent={listEmptyContent} connectionName={CONST_1.default.POLICY.CONNECTIONS.NAME.XERO} pendingAction={(0, PolicyUtils_1.settingsPendingAction)([CONST_1.default.XERO_CONFIG.NON_REIMBURSABLE_ACCOUNT], config === null || config === void 0 ? void 0 : config.pendingFields)} errors={(0, ErrorUtils_1.getLatestErrorField)(config !== null && config !== void 0 ? config : {}, CONST_1.default.XERO_CONFIG.NON_REIMBURSABLE_ACCOUNT)} errorRowStyles={[styles.ph5, styles.pv3]} onClose={function () { return (0, Policy_1.clearXeroErrorField)(policyID, CONST_1.default.XERO_CONFIG.NON_REIMBURSABLE_ACCOUNT); }}/>);
}
XeroBankAccountSelectPage.displayName = 'XeroBankAccountSelectPage';
exports.default = (0, withPolicyConnections_1.default)(XeroBankAccountSelectPage);
