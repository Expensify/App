"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var Accordion_1 = require("@components/Accordion");
var ConnectionLayout_1 = require("@components/ConnectionLayout");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var OfflineWithFeedback_1 = require("@components/OfflineWithFeedback");
var useAccordionAnimation_1 = require("@hooks/useAccordionAnimation");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var QuickbooksDesktop = require("@libs/actions/connections/QuickbooksDesktop");
var ErrorUtils = require("@libs/ErrorUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils = require("@libs/PolicyUtils");
var withPolicyConnections_1 = require("@pages/workspace/withPolicyConnections");
var ToggleSettingsOptionRow_1 = require("@pages/workspace/workflows/ToggleSettingsOptionRow");
var Policy_1 = require("@userActions/Policy/Policy");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
function QuickbooksDesktopCustomersPage(_a) {
    var _b, _c, _d, _e, _f;
    var policy = _a.policy;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var policyID = (_b = policy === null || policy === void 0 ? void 0 : policy.id) !== null && _b !== void 0 ? _b : '-1';
    var qbdConfig = (_d = (_c = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _c === void 0 ? void 0 : _c.quickbooksDesktop) === null || _d === void 0 ? void 0 : _d.config;
    var isSwitchOn = !!(((_e = qbdConfig === null || qbdConfig === void 0 ? void 0 : qbdConfig.mappings) === null || _e === void 0 ? void 0 : _e.customers) && qbdConfig.mappings.customers !== CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.NONE);
    var isReportFieldsSelected = ((_f = qbdConfig === null || qbdConfig === void 0 ? void 0 : qbdConfig.mappings) === null || _f === void 0 ? void 0 : _f.customers) === CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD;
    var _g = (0, useAccordionAnimation_1.default)(isSwitchOn), isAccordionExpanded = _g.isAccordionExpanded, shouldAnimateAccordionSection = _g.shouldAnimateAccordionSection;
    return (<ConnectionLayout_1.default displayName={QuickbooksDesktopCustomersPage.displayName} headerTitle="workspace.qbd.customers" title="workspace.qbd.customersDescription" accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.CONTROL]} policyID={policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED} contentContainerStyle={[styles.pb2, styles.ph5]} connectionName={CONST_1.default.POLICY.CONNECTIONS.NAME.QBD} onBackButtonPress={function () { return Navigation_1.default.goBack(ROUTES_1.default.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_IMPORT.getRoute(policyID)); }}>
            <ToggleSettingsOptionRow_1.default title={translate('workspace.accounting.import')} switchAccessibilityLabel={translate('workspace.qbd.customers')} isActive={isSwitchOn} onToggle={function () {
            var _a;
            return QuickbooksDesktop.updateQuickbooksDesktopSyncCustomers(policyID, isSwitchOn ? CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.NONE : CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.TAG, (_a = qbdConfig === null || qbdConfig === void 0 ? void 0 : qbdConfig.mappings) === null || _a === void 0 ? void 0 : _a.classes);
        }} pendingAction={PolicyUtils.settingsPendingAction([CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.MAPPINGS.CUSTOMERS], qbdConfig === null || qbdConfig === void 0 ? void 0 : qbdConfig.pendingFields)} errors={ErrorUtils.getLatestErrorField(qbdConfig, CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.MAPPINGS.CUSTOMERS)} onCloseError={function () { return (0, Policy_1.clearQBDErrorField)(policyID, CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.MAPPINGS.CUSTOMERS); }}/>
            <Accordion_1.default isExpanded={isAccordionExpanded} isToggleTriggered={shouldAnimateAccordionSection}>
                <OfflineWithFeedback_1.default pendingAction={PolicyUtils.settingsPendingAction([CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.MAPPINGS.CUSTOMERS], qbdConfig === null || qbdConfig === void 0 ? void 0 : qbdConfig.pendingFields)}>
                    <MenuItemWithTopDescription_1.default title={isReportFieldsSelected ? translate('workspace.common.reportFields') : translate('workspace.common.tags')} description={translate('workspace.common.displayedAs')} wrapperStyle={[styles.sectionMenuItemTopDescription, styles.mt4]} shouldShowRightIcon onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_CUSTOMERS_DISPLAYED_AS.getRoute(policyID)); }} brickRoadIndicator={PolicyUtils.areSettingsInErrorFields([CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.MAPPINGS.CUSTOMERS], qbdConfig === null || qbdConfig === void 0 ? void 0 : qbdConfig.errorFields)
            ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR
            : undefined}/>
                </OfflineWithFeedback_1.default>
            </Accordion_1.default>
        </ConnectionLayout_1.default>);
}
QuickbooksDesktopCustomersPage.displayName = 'QuickbooksDesktopCustomersPage';
exports.default = (0, withPolicyConnections_1.default)(QuickbooksDesktopCustomersPage);
