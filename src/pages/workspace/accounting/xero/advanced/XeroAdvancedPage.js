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
var ErrorUtils = require("@libs/ErrorUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var PolicyUtils = require("@libs/PolicyUtils");
var withPolicyConnections_1 = require("@pages/workspace/withPolicyConnections");
var ToggleSettingsOptionRow_1 = require("@pages/workspace/workflows/ToggleSettingsOptionRow");
var Xero_1 = require("@userActions/connections/Xero");
var Policy = require("@userActions/Policy/Policy");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
function XeroAdvancedPage(_a) {
    var _b, _c, _d, _e, _f, _g;
    var policy = _a.policy;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var policyID = (_b = policy === null || policy === void 0 ? void 0 : policy.id) !== null && _b !== void 0 ? _b : '-1';
    var xeroConfig = (_d = (_c = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _c === void 0 ? void 0 : _c.xero) === null || _d === void 0 ? void 0 : _d.config;
    var _h = xeroConfig !== null && xeroConfig !== void 0 ? xeroConfig : {}, autoSync = _h.autoSync, pendingFields = _h.pendingFields, errorFields = _h.errorFields, sync = _h.sync;
    var bankAccounts = ((_g = (_f = (_e = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _e === void 0 ? void 0 : _e.xero) === null || _f === void 0 ? void 0 : _f.data) !== null && _g !== void 0 ? _g : {}).bankAccounts;
    var _j = sync !== null && sync !== void 0 ? sync : {}, invoiceCollectionsAccountID = _j.invoiceCollectionsAccountID, reimbursementAccountID = _j.reimbursementAccountID;
    var getSelectedAccountName = (0, react_1.useMemo)(function () { return function (accountID) {
        var _a;
        var selectedAccount = (bankAccounts !== null && bankAccounts !== void 0 ? bankAccounts : []).find(function (bank) { return bank.id === accountID; });
        return (_a = selectedAccount === null || selectedAccount === void 0 ? void 0 : selectedAccount.name) !== null && _a !== void 0 ? _a : translate('workspace.xero.notConfigured');
    }; }, [bankAccounts, translate]);
    var selectedBankAccountName = getSelectedAccountName(invoiceCollectionsAccountID !== null && invoiceCollectionsAccountID !== void 0 ? invoiceCollectionsAccountID : '-1');
    var selectedBillPaymentAccountName = getSelectedAccountName(reimbursementAccountID !== null && reimbursementAccountID !== void 0 ? reimbursementAccountID : '-1');
    var currentXeroOrganizationName = (0, react_1.useMemo)(function () { return (0, PolicyUtils_1.getCurrentXeroOrganizationName)(policy !== null && policy !== void 0 ? policy : undefined); }, [policy]);
    var _k = (0, useAccordionAnimation_1.default)(!!(sync === null || sync === void 0 ? void 0 : sync.syncReimbursedReports)), isAccordionExpanded = _k.isAccordionExpanded, shouldAnimateAccordionSection = _k.shouldAnimateAccordionSection;
    return (<ConnectionLayout_1.default displayName={XeroAdvancedPage.displayName} headerTitle="workspace.accounting.advanced" headerSubtitle={currentXeroOrganizationName} accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.PAID]} policyID={policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED} contentContainerStyle={[styles.pb2, styles.ph5]} connectionName={CONST_1.default.POLICY.CONNECTIONS.NAME.XERO}>
            <ToggleSettingsOptionRow_1.default key={translate('workspace.accounting.autoSync')} title={translate('workspace.accounting.autoSync')} subtitle={translate('workspace.xero.advancedConfig.autoSyncDescription')} switchAccessibilityLabel={translate('workspace.xero.advancedConfig.autoSyncDescription')} shouldPlaceSubtitleBelowSwitch wrapperStyle={styles.mv3} isActive={!!(autoSync === null || autoSync === void 0 ? void 0 : autoSync.enabled)} onToggle={function () {
            var _a;
            return (0, Xero_1.updateXeroAutoSync)(policyID, {
                enabled: !(autoSync === null || autoSync === void 0 ? void 0 : autoSync.enabled),
            }, { enabled: (_a = autoSync === null || autoSync === void 0 ? void 0 : autoSync.enabled) !== null && _a !== void 0 ? _a : undefined });
        }} pendingAction={(0, PolicyUtils_1.settingsPendingAction)([CONST_1.default.XERO_CONFIG.ENABLED], pendingFields)} errors={ErrorUtils.getLatestErrorField(xeroConfig !== null && xeroConfig !== void 0 ? xeroConfig : {}, CONST_1.default.XERO_CONFIG.ENABLED)} onCloseError={function () { return Policy.clearXeroErrorField(policyID, CONST_1.default.XERO_CONFIG.ENABLED); }}/>
            <ToggleSettingsOptionRow_1.default key={translate('workspace.accounting.reimbursedReports')} title={translate('workspace.accounting.reimbursedReports')} subtitle={translate('workspace.xero.advancedConfig.reimbursedReportsDescription')} switchAccessibilityLabel={translate('workspace.xero.advancedConfig.reimbursedReportsDescription')} shouldPlaceSubtitleBelowSwitch wrapperStyle={styles.mv3} isActive={!!(sync === null || sync === void 0 ? void 0 : sync.syncReimbursedReports)} onToggle={function () { return (0, Xero_1.updateXeroSyncSyncReimbursedReports)(policyID, !(sync === null || sync === void 0 ? void 0 : sync.syncReimbursedReports), sync === null || sync === void 0 ? void 0 : sync.syncReimbursedReports); }} pendingAction={(0, PolicyUtils_1.settingsPendingAction)([CONST_1.default.XERO_CONFIG.SYNC_REIMBURSED_REPORTS], pendingFields)} errors={ErrorUtils.getLatestErrorField(xeroConfig !== null && xeroConfig !== void 0 ? xeroConfig : {}, CONST_1.default.XERO_CONFIG.SYNC_REIMBURSED_REPORTS)} onCloseError={function () { return Policy.clearXeroErrorField(policyID, CONST_1.default.XERO_CONFIG.SYNC_REIMBURSED_REPORTS); }}/>
            <Accordion_1.default isExpanded={isAccordionExpanded} isToggleTriggered={shouldAnimateAccordionSection}>
                <>
                    <OfflineWithFeedback_1.default pendingAction={(0, PolicyUtils_1.settingsPendingAction)([CONST_1.default.XERO_CONFIG.REIMBURSEMENT_ACCOUNT_ID], pendingFields)}>
                        <MenuItemWithTopDescription_1.default shouldShowRightIcon title={String(selectedBillPaymentAccountName)} description={translate('workspace.xero.advancedConfig.xeroBillPaymentAccount')} key={translate('workspace.xero.advancedConfig.xeroBillPaymentAccount')} wrapperStyle={[styles.sectionMenuItemTopDescription]} onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_XERO_BILL_PAYMENT_ACCOUNT_SELECTOR.getRoute(policyID)); }} brickRoadIndicator={PolicyUtils.areSettingsInErrorFields([CONST_1.default.XERO_CONFIG.REIMBURSEMENT_ACCOUNT_ID], errorFields) ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}/>
                    </OfflineWithFeedback_1.default>
                    <OfflineWithFeedback_1.default pendingAction={(0, PolicyUtils_1.settingsPendingAction)([CONST_1.default.XERO_CONFIG.INVOICE_COLLECTIONS_ACCOUNT_ID], pendingFields)}>
                        <MenuItemWithTopDescription_1.default shouldShowRightIcon title={String(selectedBankAccountName)} description={translate('workspace.xero.advancedConfig.xeroInvoiceCollectionAccount')} key={translate('workspace.xero.advancedConfig.xeroInvoiceCollectionAccount')} wrapperStyle={[styles.sectionMenuItemTopDescription]} onPress={function () {
            Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_XERO_INVOICE_SELECTOR.getRoute(policyID));
        }} brickRoadIndicator={PolicyUtils.areSettingsInErrorFields([CONST_1.default.XERO_CONFIG.INVOICE_COLLECTIONS_ACCOUNT_ID], errorFields) ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}/>
                    </OfflineWithFeedback_1.default>
                </>
            </Accordion_1.default>
        </ConnectionLayout_1.default>);
}
XeroAdvancedPage.displayName = 'XeroAdvancedPage';
exports.default = (0, withPolicyConnections_1.default)(XeroAdvancedPage);
