"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var ConnectionLayout_1 = require("@components/ConnectionLayout");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var OfflineWithFeedback_1 = require("@components/OfflineWithFeedback");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var QuickbooksOnline = require("@libs/actions/connections/QuickbooksOnline");
var PolicyUtils = require("@libs/PolicyUtils");
var Navigation_1 = require("@navigation/Navigation");
var utils_1 = require("@pages/workspace/accounting/qbo/utils");
var withPolicyConnections_1 = require("@pages/workspace/withPolicyConnections");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
function QuickbooksImportPage(_a) {
    var _b, _c, _d, _e, _f, _g;
    var policy = _a.policy;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var policyID = (_b = policy === null || policy === void 0 ? void 0 : policy.id) !== null && _b !== void 0 ? _b : '-1';
    var qboConfig = (_d = (_c = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _c === void 0 ? void 0 : _c.quickbooksOnline) === null || _d === void 0 ? void 0 : _d.config;
    var _h = qboConfig !== null && qboConfig !== void 0 ? qboConfig : {}, syncClasses = _h.syncClasses, syncCustomers = _h.syncCustomers, syncLocations = _h.syncLocations, syncTax = _h.syncTax, pendingFields = _h.pendingFields, errorFields = _h.errorFields;
    // If we previously selected tags but now we have the line items restriction for locations, we need to switch to report fields
    (0, react_1.useEffect)(function () {
        if (!(0, utils_1.shouldSwitchLocationsToReportFields)(qboConfig)) {
            return;
        }
        QuickbooksOnline.updateQuickbooksOnlineSyncLocations(policyID, CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD, qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.syncLocations);
    }, [qboConfig, policyID]);
    var sections = [
        {
            description: translate('workspace.accounting.accounts'),
            action: function () { return Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_CHART_OF_ACCOUNTS.getRoute(policyID)); },
            title: translate('workspace.accounting.importAsCategory'),
            subscribedSettings: [CONST_1.default.QUICKBOOKS_CONFIG.ENABLE_NEW_CATEGORIES],
        },
        {
            description: translate('workspace.qbo.classes'),
            action: function () { return Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_CLASSES.getRoute(policyID)); },
            title: translate("workspace.accounting.importTypes.".concat(syncClasses !== null && syncClasses !== void 0 ? syncClasses : CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.NONE)),
            subscribedSettings: [CONST_1.default.QUICKBOOKS_CONFIG.SYNC_CLASSES],
        },
        {
            description: translate('workspace.qbo.customers'),
            action: function () { return Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_CUSTOMERS.getRoute(policyID)); },
            title: translate("workspace.accounting.importTypes.".concat(syncCustomers !== null && syncCustomers !== void 0 ? syncCustomers : CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.NONE)),
            subscribedSettings: [CONST_1.default.QUICKBOOKS_CONFIG.SYNC_CUSTOMERS],
        },
        {
            description: translate('workspace.qbo.locations'),
            action: function () { return Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_LOCATIONS.getRoute(policyID)); },
            title: translate("workspace.accounting.importTypes.".concat(syncLocations !== null && syncLocations !== void 0 ? syncLocations : CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.NONE)),
            subscribedSettings: [CONST_1.default.QUICKBOOKS_CONFIG.SYNC_LOCATIONS],
        },
    ];
    if (((_g = (_f = (_e = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _e === void 0 ? void 0 : _e.quickbooksOnline) === null || _f === void 0 ? void 0 : _f.data) === null || _g === void 0 ? void 0 : _g.country) !== CONST_1.default.COUNTRY.US) {
        sections.push({
            description: translate('workspace.accounting.taxes'),
            action: function () { return Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_TAXES.getRoute(policyID)); },
            title: translate(syncTax ? 'workspace.accounting.imported' : 'workspace.accounting.notImported'),
            subscribedSettings: [CONST_1.default.QUICKBOOKS_CONFIG.SYNC_TAX],
        });
    }
    return (<ConnectionLayout_1.default displayName={QuickbooksImportPage.displayName} headerTitle="workspace.accounting.import" title="workspace.qbo.importDescription" accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN]} policyID={policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED} contentContainerStyle={styles.pb2} titleStyle={styles.ph5} connectionName={CONST_1.default.POLICY.CONNECTIONS.NAME.QBO}>
            {sections.map(function (section) { return (<OfflineWithFeedback_1.default key={section.description} pendingAction={PolicyUtils.settingsPendingAction(section.subscribedSettings, pendingFields)}>
                    <MenuItemWithTopDescription_1.default title={section.title} description={section.description} shouldShowRightIcon onPress={section.action} brickRoadIndicator={PolicyUtils.areSettingsInErrorFields(section.subscribedSettings, errorFields) ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}/>
                </OfflineWithFeedback_1.default>); })}
        </ConnectionLayout_1.default>);
}
QuickbooksImportPage.displayName = 'QuickbooksImportPage';
exports.default = (0, withPolicyConnections_1.default)(QuickbooksImportPage);
