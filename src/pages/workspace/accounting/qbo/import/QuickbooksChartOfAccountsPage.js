"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var ConnectionLayout_1 = require("@components/ConnectionLayout");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var QuickbooksOnline = require("@libs/actions/connections/QuickbooksOnline");
var ErrorUtils = require("@libs/ErrorUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var withPolicyConnections_1 = require("@pages/workspace/withPolicyConnections");
var ToggleSettingsOptionRow_1 = require("@pages/workspace/workflows/ToggleSettingsOptionRow");
var Policy_1 = require("@userActions/Policy/Policy");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
function QuickbooksChartOfAccountsPage(_a) {
    var _b, _c, _d;
    var policy = _a.policy;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var policyID = (_b = policy === null || policy === void 0 ? void 0 : policy.id) !== null && _b !== void 0 ? _b : '-1';
    var qboConfig = (_d = (_c = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _c === void 0 ? void 0 : _c.quickbooksOnline) === null || _d === void 0 ? void 0 : _d.config;
    return (<ConnectionLayout_1.default policyID={policyID} displayName={QuickbooksChartOfAccountsPage.displayName} headerTitle="workspace.accounting.accounts" title="workspace.qbo.accountsDescription" accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN]} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED} contentContainerStyle={[styles.pb2, styles.ph5]} connectionName={CONST_1.default.POLICY.CONNECTIONS.NAME.QBO} onBackButtonPress={function () { return Navigation_1.default.goBack(ROUTES_1.default.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_IMPORT.getRoute(policyID)); }}>
            <ToggleSettingsOptionRow_1.default title={translate('workspace.accounting.import')} switchAccessibilityLabel={translate('workspace.accounting.accounts')} shouldPlaceSubtitleBelowSwitch isActive onToggle={function () { }} disabled showLockIcon/>
            <MenuItemWithTopDescription_1.default interactive={false} title={translate('workspace.common.categories')} description={translate('workspace.common.displayedAs')} wrapperStyle={[styles.sectionMenuItemTopDescription, styles.mt2]}/>
            <Text_1.default style={styles.pv5}>{translate('workspace.qbo.accountsSwitchTitle')}</Text_1.default>
            <ToggleSettingsOptionRow_1.default title={translate('workspace.common.enabled')} subtitle={translate('workspace.qbo.accountsSwitchDescription')} switchAccessibilityLabel={translate('workspace.accounting.accounts')} shouldPlaceSubtitleBelowSwitch isActive={!!(qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.enableNewCategories)} onToggle={function () { return QuickbooksOnline.updateQuickbooksOnlineEnableNewCategories(policyID, !(qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.enableNewCategories)); }} pendingAction={(0, PolicyUtils_1.settingsPendingAction)([CONST_1.default.QUICKBOOKS_CONFIG.ENABLE_NEW_CATEGORIES], qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.pendingFields)} errors={ErrorUtils.getLatestErrorField(qboConfig, CONST_1.default.QUICKBOOKS_CONFIG.ENABLE_NEW_CATEGORIES)} onCloseError={function () { return (0, Policy_1.clearQBOErrorField)(policyID, CONST_1.default.QUICKBOOKS_CONFIG.ENABLE_NEW_CATEGORIES); }}/>
        </ConnectionLayout_1.default>);
}
QuickbooksChartOfAccountsPage.displayName = 'QuickbooksChartOfAccountsPage';
exports.default = (0, withPolicyConnections_1.default)(QuickbooksChartOfAccountsPage);
