"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var expensify_common_1 = require("expensify-common");
var react_1 = require("react");
var Accordion_1 = require("@components/Accordion");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var OfflineWithFeedback_1 = require("@components/OfflineWithFeedback");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var useAccordionAnimation_1 = require("@hooks/useAccordionAnimation");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var NetSuiteCommands_1 = require("@libs/actions/connections/NetSuiteCommands");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var AccessOrNotFoundWrapper_1 = require("@pages/workspace/AccessOrNotFoundWrapper");
var withPolicyConnections_1 = require("@pages/workspace/withPolicyConnections");
var ToggleSettingsOptionRow_1 = require("@pages/workspace/workflows/ToggleSettingsOptionRow");
var Policy_1 = require("@userActions/Policy/Policy");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
function NetSuiteAutoSyncPage(_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
    var policy = _a.policy, route = _a.route;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var config = (_d = (_c = (_b = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _b === void 0 ? void 0 : _b.netsuite) === null || _c === void 0 ? void 0 : _c.options) === null || _d === void 0 ? void 0 : _d.config;
    var autoSyncConfig = (_f = (_e = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _e === void 0 ? void 0 : _e.netsuite) === null || _f === void 0 ? void 0 : _f.config;
    var policyID = route.params.policyID;
    var backTo = route.params.backTo;
    var accountingMethod = (_k = (_j = (_h = (_g = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _g === void 0 ? void 0 : _g.netsuite) === null || _h === void 0 ? void 0 : _h.options) === null || _j === void 0 ? void 0 : _j.config) === null || _k === void 0 ? void 0 : _k.accountingMethod;
    var pendingAction = (_l = (0, PolicyUtils_1.settingsPendingAction)([CONST_1.default.NETSUITE_CONFIG.AUTO_SYNC], autoSyncConfig === null || autoSyncConfig === void 0 ? void 0 : autoSyncConfig.pendingFields)) !== null && _l !== void 0 ? _l : (0, PolicyUtils_1.settingsPendingAction)([CONST_1.default.NETSUITE_CONFIG.ACCOUNTING_METHOD], config === null || config === void 0 ? void 0 : config.pendingFields);
    var _p = (0, useAccordionAnimation_1.default)(!!((_m = autoSyncConfig === null || autoSyncConfig === void 0 ? void 0 : autoSyncConfig.autoSync) === null || _m === void 0 ? void 0 : _m.enabled)), isAccordionExpanded = _p.isAccordionExpanded, shouldAnimateAccordionSection = _p.shouldAnimateAccordionSection;
    var goBack = (0, react_1.useCallback)(function () {
        Navigation_1.default.goBack(backTo !== null && backTo !== void 0 ? backTo : ROUTES_1.default.POLICY_ACCOUNTING_NETSUITE_ADVANCED.getRoute(policyID));
    }, [policyID, backTo]);
    return (<AccessOrNotFoundWrapper_1.default policyID={policyID} accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.PAID]} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_CATEGORIES_ENABLED}>
            <ScreenWrapper_1.default style={[styles.defaultModalContainer]} testID={NetSuiteAutoSyncPage.displayName} offlineIndicatorStyle={styles.mtAuto}>
                <HeaderWithBackButton_1.default title={translate('common.settings')} onBackButtonPress={goBack}/>
                <ToggleSettingsOptionRow_1.default title={translate('workspace.accounting.autoSync')} 
    // wil be converted to translate and spanish translation too
    subtitle={translate('workspace.accounting.autoSyncDescription')} isActive={!!((_o = autoSyncConfig === null || autoSyncConfig === void 0 ? void 0 : autoSyncConfig.autoSync) === null || _o === void 0 ? void 0 : _o.enabled)} wrapperStyle={[styles.pv2, styles.mh5]} switchAccessibilityLabel={translate('workspace.netsuite.advancedConfig.autoSyncDescription')} shouldPlaceSubtitleBelowSwitch onCloseError={function () { return (0, Policy_1.clearNetSuiteAutoSyncErrorField)(policyID); }} onToggle={function (isEnabled) { return (0, NetSuiteCommands_1.updateNetSuiteAutoSync)(policyID, isEnabled); }} pendingAction={pendingAction} errors={(0, ErrorUtils_1.getLatestErrorField)(autoSyncConfig, CONST_1.default.NETSUITE_CONFIG.AUTO_SYNC)}/>

                <Accordion_1.default isExpanded={isAccordionExpanded} isToggleTriggered={shouldAnimateAccordionSection}>
                    <OfflineWithFeedback_1.default pendingAction={pendingAction}>
                        <MenuItemWithTopDescription_1.default title={accountingMethod === expensify_common_1.CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL
            ? translate("workspace.netsuite.advancedConfig.accountingMethods.values.".concat(expensify_common_1.CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL))
            : translate("workspace.netsuite.advancedConfig.accountingMethods.values.".concat(expensify_common_1.CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH))} description={translate('workspace.netsuite.advancedConfig.accountingMethods.label')} shouldShowRightIcon onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_NETSUITE_ACCOUNTING_METHOD.getRoute(policyID, backTo)); }}/>
                    </OfflineWithFeedback_1.default>
                </Accordion_1.default>
            </ScreenWrapper_1.default>
        </AccessOrNotFoundWrapper_1.default>);
}
NetSuiteAutoSyncPage.displayName = 'NetSuiteAutoSyncPage';
exports.default = (0, withPolicyConnections_1.default)(NetSuiteAutoSyncPage);
