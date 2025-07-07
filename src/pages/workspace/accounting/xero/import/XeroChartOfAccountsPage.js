"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var ConnectionLayout_1 = require("@components/ConnectionLayout");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var Switch_1 = require("@components/Switch");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ErrorUtils = require("@libs/ErrorUtils");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var withPolicyConnections_1 = require("@pages/workspace/withPolicyConnections");
var ToggleSettingsOptionRow_1 = require("@pages/workspace/workflows/ToggleSettingsOptionRow");
var variables_1 = require("@styles/variables");
var Xero_1 = require("@userActions/connections/Xero");
var Policy = require("@userActions/Policy/Policy");
var CONST_1 = require("@src/CONST");
function XeroChartOfAccountsPage(_a) {
    var _b, _c, _d;
    var policy = _a.policy;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var policyID = (_b = policy === null || policy === void 0 ? void 0 : policy.id) !== null && _b !== void 0 ? _b : '-1';
    var xeroConfig = (_d = (_c = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _c === void 0 ? void 0 : _c.xero) === null || _d === void 0 ? void 0 : _d.config;
    return (<ConnectionLayout_1.default displayName={XeroChartOfAccountsPage.displayName} headerTitle="workspace.accounting.accounts" title="workspace.xero.accountsDescription" accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN]} policyID={policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED} contentContainerStyle={[styles.pb2, styles.ph5]} connectionName={CONST_1.default.POLICY.CONNECTIONS.NAME.XERO}>
            <react_native_1.View style={[styles.flexRow, styles.mb4, styles.alignItemsCenter, styles.justifyContentBetween]}>
                <react_native_1.View style={styles.flex1}>
                    <Text_1.default fontSize={variables_1.default.fontSizeNormal}>{translate('workspace.accounting.import')}</Text_1.default>
                </react_native_1.View>
                <react_native_1.View style={[styles.flex1, styles.alignItemsEnd, styles.pl3]}>
                    <Switch_1.default accessibilityLabel={translate('workspace.accounting.accounts')} isOn disabled onToggle={function () { }}/>
                </react_native_1.View>
            </react_native_1.View>
            <MenuItemWithTopDescription_1.default interactive={false} title={translate('workspace.common.categories')} description={translate('workspace.common.displayedAs')} wrapperStyle={styles.sectionMenuItemTopDescription}/>
            <Text_1.default style={styles.pv5}>{translate('workspace.xero.accountsSwitchTitle')}</Text_1.default>
            <ToggleSettingsOptionRow_1.default title={translate('workspace.common.enabled')} subtitle={translate('workspace.xero.accountsSwitchDescription')} switchAccessibilityLabel={translate('workspace.xero.accountsSwitchDescription')} shouldPlaceSubtitleBelowSwitch isActive={!!(xeroConfig === null || xeroConfig === void 0 ? void 0 : xeroConfig.enableNewCategories)} onToggle={function () { return (0, Xero_1.updateXeroEnableNewCategories)(policyID, !(xeroConfig === null || xeroConfig === void 0 ? void 0 : xeroConfig.enableNewCategories), xeroConfig === null || xeroConfig === void 0 ? void 0 : xeroConfig.enableNewCategories); }} pendingAction={(0, PolicyUtils_1.settingsPendingAction)([CONST_1.default.XERO_CONFIG.ENABLE_NEW_CATEGORIES], xeroConfig === null || xeroConfig === void 0 ? void 0 : xeroConfig.pendingFields)} errors={ErrorUtils.getLatestErrorField(xeroConfig !== null && xeroConfig !== void 0 ? xeroConfig : {}, CONST_1.default.XERO_CONFIG.ENABLE_NEW_CATEGORIES)} onCloseError={function () { return Policy.clearXeroErrorField(policyID, CONST_1.default.XERO_CONFIG.ENABLE_NEW_CATEGORIES); }}/>
        </ConnectionLayout_1.default>);
}
XeroChartOfAccountsPage.displayName = 'XeroChartOfAccountsPage';
exports.default = (0, withPolicyConnections_1.default)(XeroChartOfAccountsPage);
