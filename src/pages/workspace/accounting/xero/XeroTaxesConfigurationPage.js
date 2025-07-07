"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var ConnectionLayout_1 = require("@components/ConnectionLayout");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Xero = require("@libs/actions/connections/Xero");
var ErrorUtils = require("@libs/ErrorUtils");
var PolicyUtils = require("@libs/PolicyUtils");
var withPolicyConnections_1 = require("@pages/workspace/withPolicyConnections");
var ToggleSettingsOptionRow_1 = require("@pages/workspace/workflows/ToggleSettingsOptionRow");
var Policy = require("@userActions/Policy/Policy");
var CONST_1 = require("@src/CONST");
function XeroTaxesConfigurationPage(_a) {
    var _b, _c, _d;
    var policy = _a.policy;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var policyID = (_b = policy === null || policy === void 0 ? void 0 : policy.id) !== null && _b !== void 0 ? _b : '-1';
    var xeroConfig = (_d = (_c = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _c === void 0 ? void 0 : _c.xero) === null || _d === void 0 ? void 0 : _d.config;
    var isSwitchOn = !!(xeroConfig === null || xeroConfig === void 0 ? void 0 : xeroConfig.importTaxRates);
    return (<ConnectionLayout_1.default displayName={XeroTaxesConfigurationPage.displayName} headerTitle="workspace.accounting.taxes" title="workspace.xero.taxesDescription" accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN]} policyID={policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED} contentContainerStyle={[styles.pb2, styles.ph5]} connectionName={CONST_1.default.POLICY.CONNECTIONS.NAME.XERO}>
            <ToggleSettingsOptionRow_1.default title={translate('workspace.accounting.import')} switchAccessibilityLabel={translate('workspace.xero.customers')} isActive={isSwitchOn} onToggle={function () { return Xero.updateXeroImportTaxRates(policyID, !(xeroConfig === null || xeroConfig === void 0 ? void 0 : xeroConfig.importTaxRates), xeroConfig === null || xeroConfig === void 0 ? void 0 : xeroConfig.importTaxRates); }} errors={ErrorUtils.getLatestErrorField(xeroConfig !== null && xeroConfig !== void 0 ? xeroConfig : {}, CONST_1.default.XERO_CONFIG.IMPORT_TAX_RATES)} onCloseError={function () { return Policy.clearXeroErrorField(policyID, CONST_1.default.XERO_CONFIG.IMPORT_TAX_RATES); }} pendingAction={PolicyUtils.settingsPendingAction([CONST_1.default.XERO_CONFIG.IMPORT_TAX_RATES], xeroConfig === null || xeroConfig === void 0 ? void 0 : xeroConfig.pendingFields)}/>
        </ConnectionLayout_1.default>);
}
XeroTaxesConfigurationPage.displayName = 'XeroTaxesConfigurationPage';
exports.default = (0, withPolicyConnections_1.default)(XeroTaxesConfigurationPage);
