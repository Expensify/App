"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var BlockingView_1 = require("@components/BlockingViews/BlockingView");
var Illustrations_1 = require("@components/Icon/Illustrations");
var RadioListItem_1 = require("@components/SelectionList/RadioListItem");
var SelectionScreen_1 = require("@components/SelectionScreen");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var NetSuiteCommands_1 = require("@libs/actions/connections/NetSuiteCommands");
var Policy_1 = require("@libs/actions/Policy/Policy");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var withPolicyConnections_1 = require("@pages/workspace/withPolicyConnections");
var variables_1 = require("@styles/variables");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
function NetSuiteReceivableAccountSelectPage(_a) {
    var _b, _c;
    var policy = _a.policy;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var policyID = policy === null || policy === void 0 ? void 0 : policy.id;
    var route = (0, native_1.useRoute)();
    var config = (_c = (_b = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _b === void 0 ? void 0 : _b.netsuite) === null || _c === void 0 ? void 0 : _c.options.config;
    var netsuiteReceivableAccountOptions = (0, react_1.useMemo)(function () { return (0, PolicyUtils_1.getNetSuiteReceivableAccountOptions)(policy !== null && policy !== void 0 ? policy : undefined, config === null || config === void 0 ? void 0 : config.receivableAccount); }, [config === null || config === void 0 ? void 0 : config.receivableAccount, policy]);
    var initiallyFocusedOptionKey = (0, react_1.useMemo)(function () { var _a; return (_a = netsuiteReceivableAccountOptions === null || netsuiteReceivableAccountOptions === void 0 ? void 0 : netsuiteReceivableAccountOptions.find(function (mode) { return mode.isSelected; })) === null || _a === void 0 ? void 0 : _a.keyForList; }, [netsuiteReceivableAccountOptions]);
    var goBack = (0, react_1.useCallback)(function () {
        var _a;
        Navigation_1.default.goBack((_a = route.params.backTo) !== null && _a !== void 0 ? _a : (policyID && ROUTES_1.default.POLICY_ACCOUNTING_NETSUITE_EXPORT.getRoute(policyID)));
    }, [policyID, route.params.backTo]);
    var updateReceivableAccount = (0, react_1.useCallback)(function (_a) {
        var value = _a.value;
        if ((config === null || config === void 0 ? void 0 : config.receivableAccount) !== value && policyID) {
            (0, NetSuiteCommands_1.updateNetSuiteReceivableAccount)(policyID, value, config === null || config === void 0 ? void 0 : config.receivableAccount);
        }
        goBack();
    }, [policyID, config === null || config === void 0 ? void 0 : config.receivableAccount, goBack]);
    var listEmptyContent = (0, react_1.useMemo)(function () { return (<BlockingView_1.default icon={Illustrations_1.TeleScope} iconWidth={variables_1.default.emptyListIconWidth} iconHeight={variables_1.default.emptyListIconHeight} title={translate('workspace.netsuite.noAccountsFound')} subtitle={translate('workspace.netsuite.noAccountsFoundDescription')} containerStyle={styles.pb10}/>); }, [translate, styles.pb10]);
    return (<SelectionScreen_1.default policyID={policyID} accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.CONTROL]} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED} displayName={NetSuiteReceivableAccountSelectPage.displayName} sections={netsuiteReceivableAccountOptions.length ? [{ data: netsuiteReceivableAccountOptions }] : []} listItem={RadioListItem_1.default} onSelectRow={updateReceivableAccount} initiallyFocusedOptionKey={initiallyFocusedOptionKey} onBackButtonPress={goBack} title="workspace.netsuite.exportInvoices" listEmptyContent={listEmptyContent} connectionName={CONST_1.default.POLICY.CONNECTIONS.NAME.NETSUITE} pendingAction={(0, PolicyUtils_1.settingsPendingAction)([CONST_1.default.NETSUITE_CONFIG.RECEIVABLE_ACCOUNT], config === null || config === void 0 ? void 0 : config.pendingFields)} errors={(0, ErrorUtils_1.getLatestErrorField)(config, CONST_1.default.NETSUITE_CONFIG.RECEIVABLE_ACCOUNT)} errorRowStyles={[styles.ph5, styles.pv3]} onClose={function () { return (0, Policy_1.clearNetSuiteErrorField)(policyID, CONST_1.default.NETSUITE_CONFIG.RECEIVABLE_ACCOUNT); }}/>);
}
NetSuiteReceivableAccountSelectPage.displayName = 'NetSuiteReceivableAccountSelectPage';
exports.default = (0, withPolicyConnections_1.default)(NetSuiteReceivableAccountSelectPage);
