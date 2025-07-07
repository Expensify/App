"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_reanimated_1 = require("react-native-reanimated");
var Accordion_1 = require("@components/Accordion");
var ConnectionLayout_1 = require("@components/ConnectionLayout");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var OfflineWithFeedback_1 = require("@components/OfflineWithFeedback");
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
function QuickbooksCustomersPage(_a) {
    var _b, _c, _d;
    var policy = _a.policy;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var policyID = (_b = policy === null || policy === void 0 ? void 0 : policy.id) !== null && _b !== void 0 ? _b : '-1';
    var qboConfig = (_d = (_c = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _c === void 0 ? void 0 : _c.quickbooksOnline) === null || _d === void 0 ? void 0 : _d.config;
    var isSwitchOn = !!((qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.syncCustomers) && (qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.syncCustomers) !== CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.NONE);
    var isReportFieldsSelected = (qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.syncCustomers) === CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD;
    var isAccordionExpanded = (0, react_native_reanimated_1.useSharedValue)(isSwitchOn);
    var shouldAnimateAccordionSection = (0, react_native_reanimated_1.useSharedValue)(false);
    var hasMounted = (0, react_native_reanimated_1.useSharedValue)(false);
    (0, react_1.useEffect)(function () {
        isAccordionExpanded.set(isSwitchOn);
        if (hasMounted.get()) {
            shouldAnimateAccordionSection.set(true);
        }
        else {
            hasMounted.set(true);
        }
    }, [hasMounted, isAccordionExpanded, isSwitchOn, shouldAnimateAccordionSection]);
    return (<ConnectionLayout_1.default displayName={QuickbooksCustomersPage.displayName} headerTitle="workspace.qbo.customers" title="workspace.qbo.customersDescription" accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN]} policyID={policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED} contentContainerStyle={[styles.pb2, styles.ph5]} connectionName={CONST_1.default.POLICY.CONNECTIONS.NAME.QBO} onBackButtonPress={function () { return Navigation_1.default.goBack(ROUTES_1.default.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_IMPORT.getRoute(policyID)); }}>
            <ToggleSettingsOptionRow_1.default title={translate('workspace.accounting.import')} switchAccessibilityLabel={translate('workspace.qbo.customers')} isActive={isSwitchOn} onToggle={function () {
            return QuickbooksOnline.updateQuickbooksOnlineSyncCustomers(policyID, isSwitchOn ? CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.NONE : CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.TAG, qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.syncCustomers);
        }} pendingAction={(0, PolicyUtils_1.settingsPendingAction)([CONST_1.default.QUICKBOOKS_CONFIG.SYNC_CUSTOMERS], qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.pendingFields)} errors={ErrorUtils.getLatestErrorField(qboConfig, CONST_1.default.QUICKBOOKS_CONFIG.SYNC_CUSTOMERS)} onCloseError={function () { return (0, Policy_1.clearQBOErrorField)(policyID, CONST_1.default.QUICKBOOKS_CONFIG.SYNC_CUSTOMERS); }}/>

            <Accordion_1.default isExpanded={isAccordionExpanded} isToggleTriggered={shouldAnimateAccordionSection}>
                <OfflineWithFeedback_1.default pendingAction={(0, PolicyUtils_1.settingsPendingAction)([CONST_1.default.QUICKBOOKS_CONFIG.SYNC_CUSTOMERS], qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.pendingFields)}>
                    <MenuItemWithTopDescription_1.default title={isReportFieldsSelected ? translate('workspace.common.reportFields') : translate('workspace.common.tags')} description={translate('workspace.common.displayedAs')} onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_CUSTOMERS_DISPLAYED_AS.getRoute(policyID)); }} shouldShowRightIcon wrapperStyle={[styles.sectionMenuItemTopDescription, styles.mt4]} brickRoadIndicator={(0, PolicyUtils_1.areSettingsInErrorFields)([CONST_1.default.QUICKBOOKS_CONFIG.SYNC_CUSTOMERS], qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.errorFields) ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}/>
                </OfflineWithFeedback_1.default>
            </Accordion_1.default>
        </ConnectionLayout_1.default>);
}
QuickbooksCustomersPage.displayName = 'QuickbooksCustomersPage';
exports.default = (0, withPolicyConnections_1.default)(QuickbooksCustomersPage);
