"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var ConnectionLayout_1 = require("@components/ConnectionLayout");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var OfflineWithFeedback_1 = require("@components/OfflineWithFeedback");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var PolicyUtils = require("@libs/PolicyUtils");
var Navigation_1 = require("@navigation/Navigation");
var withPolicyConnections_1 = require("@pages/workspace/withPolicyConnections");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
function QuickbooksDesktopImportPage(_a) {
    var _b, _c, _d, _e, _f, _g;
    var policy = _a.policy;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var policyID = (_b = policy === null || policy === void 0 ? void 0 : policy.id) !== null && _b !== void 0 ? _b : '-1';
    var _h = (_e = (_d = (_c = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _c === void 0 ? void 0 : _c.quickbooksDesktop) === null || _d === void 0 ? void 0 : _d.config) !== null && _e !== void 0 ? _e : {}, mappings = _h.mappings, pendingFields = _h.pendingFields, errorFields = _h.errorFields;
    var sections = [
        {
            description: translate('workspace.accounting.accounts'),
            action: function () { return Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_CHART_OF_ACCOUNTS.getRoute(policyID)); },
            title: translate('workspace.accounting.importAsCategory'),
            subscribedSettings: [CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.ENABLE_NEW_CATEGORIES],
        },
        {
            description: translate('workspace.qbd.classes'),
            action: function () { return Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_CLASSES.getRoute(policyID)); },
            title: translate("workspace.accounting.importTypes.".concat((_f = mappings === null || mappings === void 0 ? void 0 : mappings.classes) !== null && _f !== void 0 ? _f : CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.NONE)),
            subscribedSettings: [CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.MAPPINGS.CLASSES],
        },
        {
            description: translate('workspace.qbd.customers'),
            action: function () { return Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_CUSTOMERS.getRoute(policyID)); },
            title: translate("workspace.accounting.importTypes.".concat((_g = mappings === null || mappings === void 0 ? void 0 : mappings.customers) !== null && _g !== void 0 ? _g : CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.NONE)),
            subscribedSettings: [CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.MAPPINGS.CUSTOMERS],
        },
        {
            description: translate('workspace.qbd.items'),
            action: function () { return Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_ITEMS.getRoute(policyID)); },
            subscribedSettings: [CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.IMPORT_ITEMS],
        },
    ];
    return (<ConnectionLayout_1.default displayName={QuickbooksDesktopImportPage.displayName} headerTitle="workspace.accounting.import" title="workspace.qbd.importDescription" accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.CONTROL]} policyID={policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED} contentContainerStyle={styles.pb2} titleStyle={styles.ph5} connectionName={CONST_1.default.POLICY.CONNECTIONS.NAME.QBD} onBackButtonPress={function () { return Navigation_1.default.goBack(ROUTES_1.default.POLICY_ACCOUNTING.getRoute(policyID)); }}>
            {sections.map(function (section) { return (<OfflineWithFeedback_1.default key={section.description} pendingAction={PolicyUtils.settingsPendingAction(section.subscribedSettings, pendingFields)}>
                    <MenuItemWithTopDescription_1.default title={section.title} description={section.description} shouldShowRightIcon onPress={section.action} brickRoadIndicator={PolicyUtils.areSettingsInErrorFields(section.subscribedSettings, errorFields) ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}/>
                </OfflineWithFeedback_1.default>); })}
        </ConnectionLayout_1.default>);
}
QuickbooksDesktopImportPage.displayName = 'PolicyQuickbooksDesktopImportPage';
exports.default = (0, withPolicyConnections_1.default)(QuickbooksDesktopImportPage);
