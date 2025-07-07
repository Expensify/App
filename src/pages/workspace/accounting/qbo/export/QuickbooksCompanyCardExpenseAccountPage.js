"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var Accordion_1 = require("@components/Accordion");
var ConnectionLayout_1 = require("@components/ConnectionLayout");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var OfflineWithFeedback_1 = require("@components/OfflineWithFeedback");
var useAccordionAnimation_1 = require("@hooks/useAccordionAnimation");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var connections_1 = require("@libs/actions/connections");
var ConnectionUtils_1 = require("@libs/ConnectionUtils");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var Navigation_1 = require("@navigation/Navigation");
var withPolicyConnections_1 = require("@pages/workspace/withPolicyConnections");
var ToggleSettingsOptionRow_1 = require("@pages/workspace/workflows/ToggleSettingsOptionRow");
var Policy_1 = require("@userActions/Policy/Policy");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
function QuickbooksCompanyCardExpenseAccountPage(_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j;
    var policy = _a.policy;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var policyID = policy === null || policy === void 0 ? void 0 : policy.id;
    var qboConfig = (_c = (_b = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _b === void 0 ? void 0 : _b.quickbooksOnline) === null || _c === void 0 ? void 0 : _c.config;
    var vendors = ((_f = (_e = (_d = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _d === void 0 ? void 0 : _d.quickbooksOnline) === null || _e === void 0 ? void 0 : _e.data) !== null && _f !== void 0 ? _f : {}).vendors;
    var nonReimbursableBillDefaultVendorObject = vendors === null || vendors === void 0 ? void 0 : vendors.find(function (vendor) { return vendor.id === (qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.nonReimbursableBillDefaultVendor); });
    var route = (0, native_1.useRoute)();
    var backTo = (_g = route.params) === null || _g === void 0 ? void 0 : _g.backTo;
    var _k = (0, useAccordionAnimation_1.default)(!!(qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.autoCreateVendor)), isAccordionExpanded = _k.isAccordionExpanded, shouldAnimateAccordionSection = _k.shouldAnimateAccordionSection;
    var sections = [
        {
            title: (qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.nonReimbursableExpensesExportDestination) ? translate("workspace.qbo.accounts.".concat(qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.nonReimbursableExpensesExportDestination)) : undefined,
            description: translate('workspace.accounting.exportAs'),
            onPress: function () { return Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_COMPANY_CARD_EXPENSE_SELECT.getRoute(policyID, Navigation_1.default.getActiveRoute())); },
            hintText: (qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.nonReimbursableExpensesExportDestination) ? translate("workspace.qbo.accounts.".concat(qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.nonReimbursableExpensesExportDestination, "Description")) : undefined,
            subscribedSettings: [CONST_1.default.QUICKBOOKS_CONFIG.NON_REIMBURSABLE_EXPENSE_EXPORT_DESTINATION],
        },
        {
            title: (_j = (_h = qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.nonReimbursableExpensesAccount) === null || _h === void 0 ? void 0 : _h.name) !== null && _j !== void 0 ? _j : translate('workspace.qbo.notConfigured'),
            description: (0, ConnectionUtils_1.getQBONonReimbursableExportAccountType)(qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.nonReimbursableExpensesExportDestination),
            onPress: function () { return Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_COMPANY_CARD_EXPENSE_ACCOUNT_SELECT.getRoute(policyID, Navigation_1.default.getActiveRoute())); },
            subscribedSettings: [CONST_1.default.QUICKBOOKS_CONFIG.NON_REIMBURSABLE_EXPENSE_ACCOUNT],
        },
    ];
    return (<ConnectionLayout_1.default policyID={policyID} displayName={QuickbooksCompanyCardExpenseAccountPage.displayName} headerTitle="workspace.accounting.exportCompanyCard" title="workspace.qbo.exportCompanyCardsDescription" accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN]} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED} contentContainerStyle={styles.pb2} titleStyle={styles.ph5} connectionName={CONST_1.default.POLICY.CONNECTIONS.NAME.QBO} onBackButtonPress={function () { return Navigation_1.default.goBack(backTo !== null && backTo !== void 0 ? backTo : ROUTES_1.default.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_EXPORT.getRoute(policyID)); }}>
            {sections.map(function (section) { return (<OfflineWithFeedback_1.default key={section.title} pendingAction={(0, PolicyUtils_1.settingsPendingAction)(section.subscribedSettings, qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.pendingFields)}>
                    <MenuItemWithTopDescription_1.default title={section.title} description={section.description} onPress={section.onPress} brickRoadIndicator={(0, PolicyUtils_1.areSettingsInErrorFields)(section.subscribedSettings, qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.errorFields) ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined} shouldShowRightIcon hintText={section.hintText}/>
                </OfflineWithFeedback_1.default>); })}
            {(qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.nonReimbursableExpensesExportDestination) === CONST_1.default.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.VENDOR_BILL && (<>
                    <ToggleSettingsOptionRow_1.default title={translate('workspace.accounting.defaultVendor')} subtitle={translate('workspace.qbo.defaultVendorDescription')} switchAccessibilityLabel={translate('workspace.qbo.defaultVendorDescription')} wrapperStyle={[styles.ph5, styles.mb3, styles.mt1]} isActive={!!(qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.autoCreateVendor)} pendingAction={(0, PolicyUtils_1.settingsPendingAction)([CONST_1.default.QUICKBOOKS_CONFIG.AUTO_CREATE_VENDOR], qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.pendingFields)} errors={(0, ErrorUtils_1.getLatestErrorField)(qboConfig, CONST_1.default.QUICKBOOKS_CONFIG.AUTO_CREATE_VENDOR)} onToggle={function (isOn) {
                var _a, _b;
                var _c, _d, _e, _f, _g, _h, _j;
                return (0, connections_1.updateManyPolicyConnectionConfigs)(policyID, CONST_1.default.POLICY.CONNECTIONS.NAME.QBO, (_a = {},
                    _a[CONST_1.default.QUICKBOOKS_CONFIG.AUTO_CREATE_VENDOR] = isOn,
                    _a[CONST_1.default.QUICKBOOKS_CONFIG.NON_REIMBURSABLE_BILL_DEFAULT_VENDOR] = isOn
                        ? ((_h = (_g = (_f = (_e = (_d = (_c = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _c === void 0 ? void 0 : _c.quickbooksOnline) === null || _d === void 0 ? void 0 : _d.data) === null || _e === void 0 ? void 0 : _e.vendors) === null || _f === void 0 ? void 0 : _f[0]) === null || _g === void 0 ? void 0 : _g.id) !== null && _h !== void 0 ? _h : CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.NONE)
                        : CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.NONE,
                    _a), (_b = {},
                    _b[CONST_1.default.QUICKBOOKS_CONFIG.AUTO_CREATE_VENDOR] = qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.autoCreateVendor,
                    _b[CONST_1.default.QUICKBOOKS_CONFIG.NON_REIMBURSABLE_BILL_DEFAULT_VENDOR] = (_j = nonReimbursableBillDefaultVendorObject === null || nonReimbursableBillDefaultVendorObject === void 0 ? void 0 : nonReimbursableBillDefaultVendorObject.id) !== null && _j !== void 0 ? _j : CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.NONE,
                    _b));
            }} onCloseError={function () { return (0, Policy_1.clearQBOErrorField)(policyID, CONST_1.default.QUICKBOOKS_CONFIG.AUTO_CREATE_VENDOR); }} shouldPlaceSubtitleBelowSwitch/>
                    <Accordion_1.default isExpanded={isAccordionExpanded} isToggleTriggered={shouldAnimateAccordionSection}>
                        <OfflineWithFeedback_1.default pendingAction={(0, PolicyUtils_1.settingsPendingAction)([CONST_1.default.QUICKBOOKS_CONFIG.NON_REIMBURSABLE_BILL_DEFAULT_VENDOR], qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.pendingFields)}>
                            <MenuItemWithTopDescription_1.default title={nonReimbursableBillDefaultVendorObject === null || nonReimbursableBillDefaultVendorObject === void 0 ? void 0 : nonReimbursableBillDefaultVendorObject.name} description={translate('workspace.accounting.defaultVendor')} onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_NON_REIMBURSABLE_DEFAULT_VENDOR_SELECT.getRoute(policyID)); }} brickRoadIndicator={(0, PolicyUtils_1.areSettingsInErrorFields)([CONST_1.default.QUICKBOOKS_CONFIG.NON_REIMBURSABLE_BILL_DEFAULT_VENDOR], qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.errorFields)
                ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR
                : undefined} shouldShowRightIcon/>
                        </OfflineWithFeedback_1.default>
                    </Accordion_1.default>
                </>)}
        </ConnectionLayout_1.default>);
}
QuickbooksCompanyCardExpenseAccountPage.displayName = 'QuickbooksCompanyCardExpenseAccountPage';
exports.default = (0, withPolicyConnections_1.default)(QuickbooksCompanyCardExpenseAccountPage);
