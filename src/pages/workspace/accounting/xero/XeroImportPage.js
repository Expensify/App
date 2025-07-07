"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var ConnectionLayout_1 = require("@components/ConnectionLayout");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var OfflineWithFeedback_1 = require("@components/OfflineWithFeedback");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var PolicyUtils = require("@libs/PolicyUtils");
var withPolicy_1 = require("@pages/workspace/withPolicy");
var Xero_1 = require("@userActions/connections/Xero");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
function XeroImportPage(_a) {
    var _b, _c, _d, _e;
    var policy = _a.policy;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var policyID = (_b = policy === null || policy === void 0 ? void 0 : policy.id) !== null && _b !== void 0 ? _b : '-1';
    var _f = (_e = (_d = (_c = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _c === void 0 ? void 0 : _c.xero) === null || _d === void 0 ? void 0 : _d.config) !== null && _e !== void 0 ? _e : {}, importCustomers = _f.importCustomers, importTaxRates = _f.importTaxRates, importTrackingCategories = _f.importTrackingCategories, pendingFields = _f.pendingFields, errorFields = _f.errorFields;
    var currentXeroOrganizationName = (0, react_1.useMemo)(function () { return (0, PolicyUtils_1.getCurrentXeroOrganizationName)(policy !== null && policy !== void 0 ? policy : undefined); }, [policy]);
    var sections = (0, react_1.useMemo)(function () { return [
        {
            description: translate('workspace.accounting.accounts'),
            action: function () { return Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_XERO_CHART_OF_ACCOUNTS.getRoute(policyID)); },
            title: translate('workspace.accounting.importAsCategory'),
            subscribedSettings: [CONST_1.default.XERO_CONFIG.ENABLE_NEW_CATEGORIES],
        },
        {
            description: translate('workspace.xero.trackingCategories'),
            action: function () { return Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_XERO_TRACKING_CATEGORIES.getRoute(policyID)); },
            title: importTrackingCategories ? translate('workspace.accounting.imported') : translate('workspace.xero.notImported'),
            subscribedSettings: __spreadArray([
                CONST_1.default.XERO_CONFIG.IMPORT_TRACKING_CATEGORIES
            ], (0, Xero_1.getTrackingCategories)(policy).map(function (category) { return "".concat(CONST_1.default.XERO_CONFIG.TRACKING_CATEGORY_PREFIX).concat(category.id); }), true),
        },
        {
            description: translate('workspace.xero.customers'),
            action: function () {
                Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_XERO_CUSTOMER.getRoute(policyID));
            },
            title: importCustomers ? translate('workspace.accounting.importTypes.TAG') : translate('workspace.xero.notImported'),
            subscribedSettings: [CONST_1.default.XERO_CONFIG.IMPORT_CUSTOMERS],
        },
        {
            description: translate('workspace.accounting.taxes'),
            action: function () { return Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_XERO_TAXES.getRoute(policyID)); },
            title: importTaxRates ? translate('workspace.accounting.imported') : translate('workspace.xero.notImported'),
            subscribedSettings: [CONST_1.default.XERO_CONFIG.IMPORT_TAX_RATES],
        },
    ]; }, [translate, policy, importTrackingCategories, importCustomers, importTaxRates, policyID]);
    return (<ConnectionLayout_1.default displayName={XeroImportPage.displayName} headerTitle="workspace.accounting.import" headerSubtitle={currentXeroOrganizationName} accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.PAID]} policyID={policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED} contentContainerStyle={styles.pb2} titleStyle={styles.ph5} connectionName={CONST_1.default.POLICY.CONNECTIONS.NAME.XERO}>
            <Text_1.default style={[styles.ph5, styles.pb5]}>{translate('workspace.xero.importDescription')}</Text_1.default>

            {sections.map(function (section) { return (<OfflineWithFeedback_1.default key={section.description} pendingAction={PolicyUtils.settingsPendingAction(section.subscribedSettings, pendingFields)}>
                    <MenuItemWithTopDescription_1.default title={section.title} description={section.description} shouldShowRightIcon onPress={section.action} brickRoadIndicator={PolicyUtils.areSettingsInErrorFields(section.subscribedSettings, errorFields) ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}/>
                </OfflineWithFeedback_1.default>); })}
        </ConnectionLayout_1.default>);
}
XeroImportPage.displayName = 'PolicyXeroImportPage';
exports.default = (0, withPolicy_1.default)(XeroImportPage);
