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
var QuickbooksDesktop_1 = require("@libs/actions/connections/QuickbooksDesktop");
var ConnectionUtils_1 = require("@libs/ConnectionUtils");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var Navigation_1 = require("@navigation/Navigation");
var utils_1 = require("@pages/workspace/accounting/utils");
var withPolicyConnections_1 = require("@pages/workspace/withPolicyConnections");
var ToggleSettingsOptionRow_1 = require("@pages/workspace/workflows/ToggleSettingsOptionRow");
var Policy_1 = require("@userActions/Policy/Policy");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
function QuickbooksDesktopCompanyCardExpenseAccountPage(_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j, _k;
    var policy = _a.policy;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var policyID = policy === null || policy === void 0 ? void 0 : policy.id;
    var qbdConfig = (_c = (_b = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _b === void 0 ? void 0 : _b.quickbooksDesktop) === null || _c === void 0 ? void 0 : _c.config;
    var vendors = ((_f = (_e = (_d = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _d === void 0 ? void 0 : _d.quickbooksDesktop) === null || _e === void 0 ? void 0 : _e.data) !== null && _f !== void 0 ? _f : {}).vendors;
    var nonReimbursableBillDefaultVendorObject = vendors === null || vendors === void 0 ? void 0 : vendors.find(function (vendor) { var _a; return vendor.id === ((_a = qbdConfig === null || qbdConfig === void 0 ? void 0 : qbdConfig.export) === null || _a === void 0 ? void 0 : _a.nonReimbursableBillDefaultVendor); });
    var nonReimbursable = (_g = qbdConfig === null || qbdConfig === void 0 ? void 0 : qbdConfig.export) === null || _g === void 0 ? void 0 : _g.nonReimbursable;
    var nonReimbursableAccount = (_h = qbdConfig === null || qbdConfig === void 0 ? void 0 : qbdConfig.export) === null || _h === void 0 ? void 0 : _h.nonReimbursableAccount;
    var route = (0, native_1.useRoute)();
    var backTo = (_j = route.params) === null || _j === void 0 ? void 0 : _j.backTo;
    var accountName = (0, react_1.useMemo)(function () {
        var _a, _b, _c;
        var qbdReimbursableAccounts = (0, utils_1.getQBDReimbursableAccounts)((_a = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _a === void 0 ? void 0 : _a.quickbooksDesktop, nonReimbursable);
        // We use the logical OR (||) here instead of ?? because `nonReimbursableAccount` can be an empty string
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        return ((_b = qbdReimbursableAccounts.find(function (_a) {
            var id = _a.id;
            return nonReimbursableAccount === id;
        })) === null || _b === void 0 ? void 0 : _b.name) || ((_c = qbdReimbursableAccounts.at(0)) === null || _c === void 0 ? void 0 : _c.name) || translate('workspace.qbd.notConfigured');
    }, [(_k = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _k === void 0 ? void 0 : _k.quickbooksDesktop, nonReimbursable, translate, nonReimbursableAccount]);
    var _l = (0, useAccordionAnimation_1.default)(!!(qbdConfig === null || qbdConfig === void 0 ? void 0 : qbdConfig.shouldAutoCreateVendor)), isAccordionExpanded = _l.isAccordionExpanded, shouldAnimateAccordionSection = _l.shouldAnimateAccordionSection;
    var sections = [
        {
            title: nonReimbursable ? translate("workspace.qbd.accounts.".concat(nonReimbursable)) : undefined,
            description: translate('workspace.accounting.exportAs'),
            onPress: function () { return Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_COMPANY_CARD_EXPENSE_SELECT.getRoute(policyID, Navigation_1.default.getActiveRoute())); },
            hintText: nonReimbursable ? translate("workspace.qbd.accounts.".concat(nonReimbursable, "Description")) : undefined,
            subscribedSettings: [CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.NON_REIMBURSABLE],
            keyForList: translate('workspace.accounting.exportAs'),
        },
        {
            title: accountName,
            description: (0, ConnectionUtils_1.getQBDNonReimbursableExportAccountType)(nonReimbursable),
            onPress: function () { return Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_COMPANY_CARD_EXPENSE_ACCOUNT_SELECT.getRoute(policyID, Navigation_1.default.getActiveRoute())); },
            subscribedSettings: [CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.NON_REIMBURSABLE_ACCOUNT],
            keyForList: (0, ConnectionUtils_1.getQBDNonReimbursableExportAccountType)(nonReimbursable),
        },
    ];
    return (<ConnectionLayout_1.default policyID={policyID} displayName={QuickbooksDesktopCompanyCardExpenseAccountPage.displayName} headerTitle="workspace.accounting.exportCompanyCard" title="workspace.qbd.exportCompanyCardsDescription" accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.CONTROL]} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED} contentContainerStyle={styles.pb2} titleStyle={styles.ph5} connectionName={CONST_1.default.POLICY.CONNECTIONS.NAME.QBD} onBackButtonPress={function () { return Navigation_1.default.goBack(backTo !== null && backTo !== void 0 ? backTo : ROUTES_1.default.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_EXPORT.getRoute(policyID)); }}>
            {sections.map(function (section) { return (<OfflineWithFeedback_1.default key={section.keyForList} pendingAction={(0, PolicyUtils_1.settingsPendingAction)(section.subscribedSettings, qbdConfig === null || qbdConfig === void 0 ? void 0 : qbdConfig.pendingFields)}>
                    <MenuItemWithTopDescription_1.default title={section.title} description={section.description} onPress={section.onPress} brickRoadIndicator={(0, PolicyUtils_1.areSettingsInErrorFields)(section.subscribedSettings, qbdConfig === null || qbdConfig === void 0 ? void 0 : qbdConfig.errorFields) ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined} shouldShowRightIcon hintText={section.hintText}/>
                </OfflineWithFeedback_1.default>); })}
            {nonReimbursable === CONST_1.default.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.VENDOR_BILL && (<>
                    <ToggleSettingsOptionRow_1.default title={translate('workspace.accounting.defaultVendor')} subtitle={translate('workspace.qbd.defaultVendorDescription')} switchAccessibilityLabel={translate('workspace.qbd.defaultVendorDescription')} shouldPlaceSubtitleBelowSwitch wrapperStyle={[styles.ph5, styles.mb3, styles.mt1]} isActive={!!(qbdConfig === null || qbdConfig === void 0 ? void 0 : qbdConfig.shouldAutoCreateVendor)} pendingAction={(0, PolicyUtils_1.settingsPendingAction)([CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.SHOULD_AUTO_CREATE_VENDOR, CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.NON_REIMBURSABLE], qbdConfig === null || qbdConfig === void 0 ? void 0 : qbdConfig.pendingFields)} errors={(0, ErrorUtils_1.getLatestErrorField)(qbdConfig, CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.SHOULD_AUTO_CREATE_VENDOR)} onToggle={function (isOn) {
                if (!policyID) {
                    return;
                }
                (0, QuickbooksDesktop_1.updateQuickbooksDesktopShouldAutoCreateVendor)(policyID, isOn);
            }} onCloseError={function () {
                if (!policyID) {
                    return;
                }
                (0, Policy_1.clearQBDErrorField)(policyID, CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.SHOULD_AUTO_CREATE_VENDOR);
            }}/>

                    <Accordion_1.default isExpanded={isAccordionExpanded} isToggleTriggered={shouldAnimateAccordionSection}>
                        <OfflineWithFeedback_1.default pendingAction={(0, PolicyUtils_1.settingsPendingAction)([CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.NON_REIMBURSABLE_BILL_DEFAULT_VENDOR, CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.SHOULD_AUTO_CREATE_VENDOR], qbdConfig === null || qbdConfig === void 0 ? void 0 : qbdConfig.pendingFields)}>
                            <MenuItemWithTopDescription_1.default title={nonReimbursableBillDefaultVendorObject === null || nonReimbursableBillDefaultVendorObject === void 0 ? void 0 : nonReimbursableBillDefaultVendorObject.name} description={translate('workspace.accounting.defaultVendor')} onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_DEFAULT_VENDOR_SELECT.getRoute(policyID)); }} brickRoadIndicator={(0, PolicyUtils_1.areSettingsInErrorFields)([CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.NON_REIMBURSABLE_BILL_DEFAULT_VENDOR], qbdConfig === null || qbdConfig === void 0 ? void 0 : qbdConfig.errorFields)
                ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR
                : undefined} shouldShowRightIcon/>
                        </OfflineWithFeedback_1.default>
                    </Accordion_1.default>
                </>)}
        </ConnectionLayout_1.default>);
}
QuickbooksDesktopCompanyCardExpenseAccountPage.displayName = 'QuickbooksDesktopCompanyCardExpenseAccountPage';
exports.default = (0, withPolicyConnections_1.default)(QuickbooksDesktopCompanyCardExpenseAccountPage);
