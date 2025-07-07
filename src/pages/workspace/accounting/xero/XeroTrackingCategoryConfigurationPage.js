"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Accordion_1 = require("@components/Accordion");
var ConnectionLayout_1 = require("@components/ConnectionLayout");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var OfflineWithFeedback_1 = require("@components/OfflineWithFeedback");
var useAccordionAnimation_1 = require("@hooks/useAccordionAnimation");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Xero = require("@libs/actions/connections/Xero");
var ErrorUtils = require("@libs/ErrorUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var StringUtils_1 = require("@libs/StringUtils");
var withPolicyConnections_1 = require("@pages/workspace/withPolicyConnections");
var ToggleSettingsOptionRow_1 = require("@pages/workspace/workflows/ToggleSettingsOptionRow");
var Policy = require("@userActions/Policy/Policy");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
function XeroTrackingCategoryConfigurationPage(_a) {
    var _b, _c, _d;
    var policy = _a.policy;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var policyID = (_b = policy === null || policy === void 0 ? void 0 : policy.id) !== null && _b !== void 0 ? _b : '-1';
    var xeroConfig = (_d = (_c = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _c === void 0 ? void 0 : _c.xero) === null || _d === void 0 ? void 0 : _d.config;
    var isSwitchOn = !!(xeroConfig === null || xeroConfig === void 0 ? void 0 : xeroConfig.importTrackingCategories);
    var _e = (0, useAccordionAnimation_1.default)(!!(xeroConfig === null || xeroConfig === void 0 ? void 0 : xeroConfig.importTrackingCategories)), isAccordionExpanded = _e.isAccordionExpanded, shouldAnimateAccordionSection = _e.shouldAnimateAccordionSection;
    var menuItems = (0, react_1.useMemo)(function () {
        var trackingCategories = Xero.getTrackingCategories(policy);
        return trackingCategories.map(function (category) { return ({
            id: category.id,
            description: translate('workspace.xero.mapTrackingCategoryTo', { categoryName: category.name }),
            onPress: function () { return Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_XERO_TRACKING_CATEGORIES_MAP.getRoute(policyID, category.id, category.name)); },
            title: translate("workspace.xero.trackingCategoriesOptions.".concat(!StringUtils_1.default.isEmptyString(category.value) ? category.value.toUpperCase() : CONST_1.default.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.DEFAULT)),
        }); });
    }, [translate, policy, policyID]);
    return (<ConnectionLayout_1.default displayName={XeroTrackingCategoryConfigurationPage.displayName} headerTitle="workspace.xero.trackingCategories" title="workspace.xero.trackingCategoriesDescription" accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN]} policyID={policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED} contentContainerStyle={[styles.pb2, styles.ph5]} connectionName={CONST_1.default.POLICY.CONNECTIONS.NAME.XERO}>
            <ToggleSettingsOptionRow_1.default title={translate('workspace.accounting.import')} switchAccessibilityLabel={translate('workspace.xero.trackingCategories')} isActive={isSwitchOn} wrapperStyle={styles.mv3} onToggle={function () { return Xero.updateXeroImportTrackingCategories(policyID, !(xeroConfig === null || xeroConfig === void 0 ? void 0 : xeroConfig.importTrackingCategories), xeroConfig === null || xeroConfig === void 0 ? void 0 : xeroConfig.importTrackingCategories); }} pendingAction={(0, PolicyUtils_1.settingsPendingAction)([CONST_1.default.XERO_CONFIG.IMPORT_TRACKING_CATEGORIES], xeroConfig === null || xeroConfig === void 0 ? void 0 : xeroConfig.pendingFields)} errors={ErrorUtils.getLatestErrorField(xeroConfig !== null && xeroConfig !== void 0 ? xeroConfig : {}, CONST_1.default.XERO_CONFIG.IMPORT_TRACKING_CATEGORIES)} onCloseError={function () { return Policy.clearXeroErrorField(policyID, CONST_1.default.XERO_CONFIG.IMPORT_TRACKING_CATEGORIES); }}/>
            <Accordion_1.default isExpanded={isAccordionExpanded} isToggleTriggered={shouldAnimateAccordionSection}>
                <react_native_1.View>
                    {menuItems.map(function (menuItem) { return (<OfflineWithFeedback_1.default key={menuItem.id} pendingAction={(0, PolicyUtils_1.settingsPendingAction)(["".concat(CONST_1.default.XERO_CONFIG.TRACKING_CATEGORY_PREFIX).concat(menuItem.id)], xeroConfig === null || xeroConfig === void 0 ? void 0 : xeroConfig.pendingFields)}>
                            <MenuItemWithTopDescription_1.default title={menuItem.title} description={menuItem.description} shouldShowRightIcon onPress={menuItem.onPress} wrapperStyle={styles.sectionMenuItemTopDescription} brickRoadIndicator={(0, PolicyUtils_1.areSettingsInErrorFields)(["".concat(CONST_1.default.XERO_CONFIG.TRACKING_CATEGORY_PREFIX).concat(menuItem.id)], xeroConfig === null || xeroConfig === void 0 ? void 0 : xeroConfig.errorFields) ? 'error' : undefined}/>
                        </OfflineWithFeedback_1.default>); })}
                </react_native_1.View>
            </Accordion_1.default>
        </ConnectionLayout_1.default>);
}
XeroTrackingCategoryConfigurationPage.displayName = 'XeroTrackCategoriesPage';
exports.default = (0, withPolicyConnections_1.default)(XeroTrackingCategoryConfigurationPage);
