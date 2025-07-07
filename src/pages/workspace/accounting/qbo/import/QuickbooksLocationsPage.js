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
var QuickbooksOnline = require("@libs/actions/connections/QuickbooksOnline");
var ErrorUtils = require("@libs/ErrorUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils = require("@libs/PolicyUtils");
var utils_1 = require("@pages/workspace/accounting/qbo/utils");
var withPolicyConnections_1 = require("@pages/workspace/withPolicyConnections");
var ToggleSettingsOptionRow_1 = require("@pages/workspace/workflows/ToggleSettingsOptionRow");
var Policy_1 = require("@userActions/Policy/Policy");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
function QuickbooksLocationsPage(_a) {
    var _b, _c, _d;
    var policy = _a.policy;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var policyID = (_b = policy === null || policy === void 0 ? void 0 : policy.id) !== null && _b !== void 0 ? _b : '-1';
    var qboConfig = (_d = (_c = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _c === void 0 ? void 0 : _c.quickbooksOnline) === null || _d === void 0 ? void 0 : _d.config;
    var isSwitchOn = !!((qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.syncLocations) && (qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.syncLocations) !== CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.NONE);
    var isTagsSelected = (qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.syncLocations) === CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.TAG;
    var shouldShowLineItemsRestriction = (0, utils_1.shouldShowLocationsLineItemsRestriction)(qboConfig);
    var _e = (0, useAccordionAnimation_1.default)(isSwitchOn), isAccordionExpanded = _e.isAccordionExpanded, shouldAnimateAccordionSection = _e.shouldAnimateAccordionSection;
    var updateQuickbooksOnlineSyncLocations = (0, react_1.useCallback)(function (settingValue) {
        if (settingValue === CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD && !PolicyUtils.isControlPolicy(policy)) {
            Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_UPGRADE.getRoute(policyID, CONST_1.default.REPORT_FIELDS_FEATURE.qbo.locations, ROUTES_1.default.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_LOCATIONS.getRoute(policyID)));
            return;
        }
        QuickbooksOnline.updateQuickbooksOnlineSyncLocations(policyID, settingValue, qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.syncLocations);
    }, [policy, policyID, qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.syncLocations]);
    // If we previously selected tags but now we have the line items restriction, we need to switch to report fields
    (0, react_1.useEffect)(function () {
        if (!(0, utils_1.shouldSwitchLocationsToReportFields)(qboConfig)) {
            return;
        }
        updateQuickbooksOnlineSyncLocations(CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD);
    }, [qboConfig, updateQuickbooksOnlineSyncLocations]);
    return (<ConnectionLayout_1.default displayName={QuickbooksLocationsPage.displayName} headerTitle="workspace.qbo.locations" title="workspace.qbo.locationsDescription" accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN]} policyID={policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED} contentContainerStyle={[[styles.pb2, styles.ph5]]} connectionName={CONST_1.default.POLICY.CONNECTIONS.NAME.QBO} onBackButtonPress={function () { return Navigation_1.default.goBack(ROUTES_1.default.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_IMPORT.getRoute(policyID)); }}>
            <ToggleSettingsOptionRow_1.default title={translate('workspace.accounting.import')} switchAccessibilityLabel={translate('workspace.qbo.locations')} isActive={isSwitchOn} onToggle={function () {
            return updateQuickbooksOnlineSyncLocations(
            // eslint-disable-next-line no-nested-ternary
            isSwitchOn
                ? CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.NONE
                : shouldShowLineItemsRestriction
                    ? CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD
                    : CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.TAG);
        }} errors={ErrorUtils.getLatestErrorField(qboConfig, CONST_1.default.QUICKBOOKS_CONFIG.SYNC_LOCATIONS)} onCloseError={function () { return (0, Policy_1.clearQBOErrorField)(policyID, CONST_1.default.QUICKBOOKS_CONFIG.SYNC_LOCATIONS); }} pendingAction={PolicyUtils.settingsPendingAction([CONST_1.default.QUICKBOOKS_CONFIG.SYNC_LOCATIONS], qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.pendingFields)}/>
            <Accordion_1.default isExpanded={isAccordionExpanded} isToggleTriggered={shouldAnimateAccordionSection}>
                <OfflineWithFeedback_1.default pendingAction={PolicyUtils.settingsPendingAction([CONST_1.default.QUICKBOOKS_CONFIG.SYNC_LOCATIONS], qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.pendingFields)}>
                    <MenuItemWithTopDescription_1.default interactive={!shouldShowLineItemsRestriction} title={!isTagsSelected ? translate('workspace.common.reportFields') : translate('workspace.common.tags')} description={translate('workspace.common.displayedAs')} onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_LOCATIONS_DISPLAYED_AS.getRoute(policyID)); }} shouldShowRightIcon={!shouldShowLineItemsRestriction} wrapperStyle={[styles.sectionMenuItemTopDescription, styles.mt4]} brickRoadIndicator={PolicyUtils.areSettingsInErrorFields([CONST_1.default.QUICKBOOKS_CONFIG.SYNC_LOCATIONS], qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.errorFields) ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined} hintText={translate('workspace.qbo.locationsLineItemsRestrictionDescription')}/>
                </OfflineWithFeedback_1.default>
            </Accordion_1.default>
        </ConnectionLayout_1.default>);
}
QuickbooksLocationsPage.displayName = 'QuickbooksLocationsPage';
exports.default = (0, withPolicyConnections_1.default)(QuickbooksLocationsPage);
