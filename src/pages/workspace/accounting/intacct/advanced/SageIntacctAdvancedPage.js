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
var ErrorUtils_1 = require("@libs/ErrorUtils");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var Navigation_1 = require("@navigation/Navigation");
var withPolicy_1 = require("@pages/workspace/withPolicy");
var ToggleSettingsOptionRow_1 = require("@pages/workspace/workflows/ToggleSettingsOptionRow");
var SageIntacct_1 = require("@userActions/connections/SageIntacct");
var Policy_1 = require("@userActions/Policy/Policy");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
function getReimbursedAccountName(bankAccounts, reimbursementAccountID) {
    var _a, _b;
    return (_b = (_a = bankAccounts.find(function (bankAccount) { return bankAccount.id === reimbursementAccountID; })) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : reimbursementAccountID;
}
function SageIntacctAdvancedPage(_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j;
    var policy = _a.policy;
    var translate = (0, useLocalize_1.default)().translate;
    var policyID = (_b = policy === null || policy === void 0 ? void 0 : policy.id) !== null && _b !== void 0 ? _b : '-1';
    var styles = (0, useThemeStyles_1.default)();
    var _k = (_e = (_d = (_c = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _c === void 0 ? void 0 : _c.intacct) === null || _d === void 0 ? void 0 : _d.config) !== null && _e !== void 0 ? _e : {}, importEmployees = _k.importEmployees, autoSync = _k.autoSync, sync = _k.sync, pendingFields = _k.pendingFields, errorFields = _k.errorFields;
    var _l = (_g = (_f = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _f === void 0 ? void 0 : _f.intacct) !== null && _g !== void 0 ? _g : {}, data = _l.data, config = _l.config;
    var _m = (0, useAccordionAnimation_1.default)(!!(sync === null || sync === void 0 ? void 0 : sync.syncReimbursedReports)), isAccordionExpanded = _m.isAccordionExpanded, shouldAnimateAccordionSection = _m.shouldAnimateAccordionSection;
    var toggleSections = (0, react_1.useMemo)(function () {
        var _a;
        return [
            {
                label: translate('workspace.sageIntacct.autoSync'),
                description: translate('workspace.sageIntacct.autoSyncDescription'),
                isActive: !!(autoSync === null || autoSync === void 0 ? void 0 : autoSync.enabled),
                onToggle: function (enabled) { return (0, SageIntacct_1.updateSageIntacctAutoSync)(policyID, enabled); },
                subscribedSettings: [CONST_1.default.SAGE_INTACCT_CONFIG.AUTO_SYNC_ENABLED],
                error: (0, ErrorUtils_1.getLatestErrorField)(config, CONST_1.default.SAGE_INTACCT_CONFIG.AUTO_SYNC_ENABLED),
                onCloseError: function () { return (0, Policy_1.clearSageIntacctErrorField)(policyID, CONST_1.default.SAGE_INTACCT_CONFIG.AUTO_SYNC_ENABLED); },
            },
            {
                label: translate('workspace.sageIntacct.inviteEmployees'),
                description: translate('workspace.sageIntacct.inviteEmployeesDescription'),
                isActive: !!importEmployees,
                onToggle: function (enabled) {
                    (0, SageIntacct_1.updateSageIntacctImportEmployees)(policyID, enabled);
                    (0, SageIntacct_1.updateSageIntacctApprovalMode)(policyID, enabled);
                },
                subscribedSettings: [CONST_1.default.SAGE_INTACCT_CONFIG.IMPORT_EMPLOYEES, CONST_1.default.SAGE_INTACCT_CONFIG.APPROVAL_MODE],
                error: (_a = (0, ErrorUtils_1.getLatestErrorField)(config !== null && config !== void 0 ? config : {}, CONST_1.default.SAGE_INTACCT_CONFIG.IMPORT_EMPLOYEES)) !== null && _a !== void 0 ? _a : (0, ErrorUtils_1.getLatestErrorField)(config !== null && config !== void 0 ? config : {}, CONST_1.default.SAGE_INTACCT_CONFIG.APPROVAL_MODE),
                onCloseError: function () {
                    (0, Policy_1.clearSageIntacctErrorField)(policyID, CONST_1.default.SAGE_INTACCT_CONFIG.IMPORT_EMPLOYEES);
                    (0, Policy_1.clearSageIntacctErrorField)(policyID, CONST_1.default.SAGE_INTACCT_CONFIG.APPROVAL_MODE);
                },
            },
            {
                label: translate('workspace.sageIntacct.syncReimbursedReports'),
                description: translate('workspace.sageIntacct.syncReimbursedReportsDescription'),
                isActive: !!(sync === null || sync === void 0 ? void 0 : sync.syncReimbursedReports),
                onToggle: function (enabled) {
                    var _a, _b;
                    (0, SageIntacct_1.updateSageIntacctSyncReimbursedReports)(policyID, enabled);
                    if (enabled && !(sync === null || sync === void 0 ? void 0 : sync.reimbursementAccountID)) {
                        var reimbursementAccountID = (_b = (_a = data === null || data === void 0 ? void 0 : data.bankAccounts[0]) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : '';
                        (0, SageIntacct_1.updateSageIntacctSyncReimbursementAccountID)(policyID, reimbursementAccountID);
                    }
                },
                subscribedSettings: [CONST_1.default.SAGE_INTACCT_CONFIG.SYNC_REIMBURSED_REPORTS],
                error: (0, ErrorUtils_1.getLatestErrorField)(config !== null && config !== void 0 ? config : {}, CONST_1.default.SAGE_INTACCT_CONFIG.SYNC_REIMBURSED_REPORTS),
                onCloseError: function () {
                    (0, Policy_1.clearSageIntacctErrorField)(policyID, CONST_1.default.SAGE_INTACCT_CONFIG.SYNC_REIMBURSED_REPORTS);
                },
            },
        ];
    }, [translate, autoSync === null || autoSync === void 0 ? void 0 : autoSync.enabled, config, importEmployees, sync === null || sync === void 0 ? void 0 : sync.syncReimbursedReports, sync === null || sync === void 0 ? void 0 : sync.reimbursementAccountID, policyID, data === null || data === void 0 ? void 0 : data.bankAccounts]);
    return (<ConnectionLayout_1.default displayName={SageIntacctAdvancedPage.displayName} headerTitle="workspace.accounting.advanced" headerSubtitle={(0, PolicyUtils_1.getCurrentSageIntacctEntityName)(policy, translate('workspace.common.topLevel'))} accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.PAID]} policyID={policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED} contentContainerStyle={styles.pb2} titleStyle={styles.ph5} connectionName={CONST_1.default.POLICY.CONNECTIONS.NAME.SAGE_INTACCT} onBackButtonPress={function () { return Navigation_1.default.goBack(ROUTES_1.default.POLICY_ACCOUNTING.getRoute(policyID)); }}>
            {toggleSections.map(function (section) { return (<ToggleSettingsOptionRow_1.default key={section.label} title={section.label} subtitle={section.description} shouldPlaceSubtitleBelowSwitch switchAccessibilityLabel={section.label} isActive={section.isActive} onToggle={section.onToggle} wrapperStyle={[styles.ph5, styles.pv3]} pendingAction={(0, PolicyUtils_1.settingsPendingAction)(section.subscribedSettings, pendingFields)} errors={section.error} onCloseError={section.onCloseError}/>); })}

            <Accordion_1.default isExpanded={isAccordionExpanded} isToggleTriggered={shouldAnimateAccordionSection}>
                <OfflineWithFeedback_1.default key={translate('workspace.sageIntacct.paymentAccount')} pendingAction={(0, PolicyUtils_1.settingsPendingAction)([CONST_1.default.SAGE_INTACCT_CONFIG.REIMBURSEMENT_ACCOUNT_ID], pendingFields)}>
                    <MenuItemWithTopDescription_1.default title={(_j = getReimbursedAccountName((_h = data === null || data === void 0 ? void 0 : data.bankAccounts) !== null && _h !== void 0 ? _h : [], sync === null || sync === void 0 ? void 0 : sync.reimbursementAccountID)) !== null && _j !== void 0 ? _j : translate('workspace.sageIntacct.notConfigured')} description={translate('workspace.sageIntacct.paymentAccount')} shouldShowRightIcon onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_SAGE_INTACCT_PAYMENT_ACCOUNT.getRoute(policyID)); }} brickRoadIndicator={(0, PolicyUtils_1.areSettingsInErrorFields)([CONST_1.default.SAGE_INTACCT_CONFIG.REIMBURSEMENT_ACCOUNT_ID], errorFields) ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}/>
                </OfflineWithFeedback_1.default>
            </Accordion_1.default>
        </ConnectionLayout_1.default>);
}
SageIntacctAdvancedPage.displayName = 'SageIntacctAdvancedPage';
exports.default = (0, withPolicy_1.default)(SageIntacctAdvancedPage);
