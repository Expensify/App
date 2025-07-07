"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var expensify_common_1 = require("expensify-common");
var react_1 = require("react");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var OfflineWithFeedback_1 = require("@components/OfflineWithFeedback");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var QuickbooksOnline_1 = require("@libs/actions/connections/QuickbooksOnline");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var AccessOrNotFoundWrapper_1 = require("@pages/workspace/AccessOrNotFoundWrapper");
var withPolicyConnections_1 = require("@pages/workspace/withPolicyConnections");
var ToggleSettingsOptionRow_1 = require("@pages/workspace/workflows/ToggleSettingsOptionRow");
var Policy_1 = require("@userActions/Policy/Policy");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
function QuickbooksAutoSyncPage(_a) {
    var _b, _c, _d, _e, _f, _g;
    var policy = _a.policy, route = _a.route;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var config = (_c = (_b = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _b === void 0 ? void 0 : _b.quickbooksOnline) === null || _c === void 0 ? void 0 : _c.config;
    var policyID = route.params.policyID;
    var backTo = route.params.backTo;
    var accountingMethod = (_d = config === null || config === void 0 ? void 0 : config.accountingMethod) !== null && _d !== void 0 ? _d : expensify_common_1.CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH;
    var pendingAction = (_e = (0, PolicyUtils_1.settingsPendingAction)([CONST_1.default.QUICKBOOKS_CONFIG.AUTO_SYNC], config === null || config === void 0 ? void 0 : config.pendingFields)) !== null && _e !== void 0 ? _e : (0, PolicyUtils_1.settingsPendingAction)([CONST_1.default.QUICKBOOKS_CONFIG.ACCOUNTING_METHOD], config === null || config === void 0 ? void 0 : config.pendingFields);
    var goBack = (0, react_1.useCallback)(function () {
        Navigation_1.default.goBack(backTo !== null && backTo !== void 0 ? backTo : ROUTES_1.default.WORKSPACE_ACCOUNTING_QUICKBOOKS_ONLINE_ADVANCED.getRoute(policyID));
    }, [policyID, backTo]);
    return (<AccessOrNotFoundWrapper_1.default policyID={policyID} accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.PAID]} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_CATEGORIES_ENABLED}>
            <ScreenWrapper_1.default includeSafeAreaPaddingBottom={false} style={[styles.defaultModalContainer]} testID={QuickbooksAutoSyncPage.displayName} enableEdgeToEdgeBottomSafeAreaPadding>
                <HeaderWithBackButton_1.default title={translate('common.settings')} onBackButtonPress={goBack}/>
                <ToggleSettingsOptionRow_1.default title={translate('workspace.accounting.autoSync')} subtitle={translate('workspace.qbo.advancedConfig.autoSyncDescription')} isActive={!!((_f = config === null || config === void 0 ? void 0 : config.autoSync) === null || _f === void 0 ? void 0 : _f.enabled)} wrapperStyle={[styles.pv2, styles.mh5]} switchAccessibilityLabel={translate('workspace.qbo.advancedConfig.autoSyncDescription')} shouldPlaceSubtitleBelowSwitch onCloseError={function () { return (0, Policy_1.clearQuickbooksOnlineAutoSyncErrorField)(policyID); }} onToggle={function (isEnabled) { return (0, QuickbooksOnline_1.updateQuickbooksOnlineAutoSync)(policyID, isEnabled); }} pendingAction={pendingAction} errors={(0, ErrorUtils_1.getLatestErrorField)(config, CONST_1.default.QUICKBOOKS_CONFIG.AUTO_SYNC)}/>
                {!!((_g = config === null || config === void 0 ? void 0 : config.autoSync) === null || _g === void 0 ? void 0 : _g.enabled) && (<OfflineWithFeedback_1.default pendingAction={pendingAction}>
                        <MenuItemWithTopDescription_1.default title={accountingMethod === expensify_common_1.CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL
                ? translate("workspace.qbo.accountingMethods.values.".concat(expensify_common_1.CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL))
                : translate("workspace.qbo.accountingMethods.values.".concat(expensify_common_1.CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH))} description={translate('workspace.qbo.accountingMethods.label')} shouldShowRightIcon onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_ACCOUNTING_QUICKBOOKS_ONLINE_ACCOUNTING_METHOD.getRoute(policyID, backTo)); }}/>
                    </OfflineWithFeedback_1.default>)}
            </ScreenWrapper_1.default>
        </AccessOrNotFoundWrapper_1.default>);
}
QuickbooksAutoSyncPage.displayName = 'QuickbooksAutoSyncPage';
exports.default = (0, withPolicyConnections_1.default)(QuickbooksAutoSyncPage);
