"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var ConnectionLayout_1 = require("@components/ConnectionLayout");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var OfflineWithFeedback_1 = require("@components/OfflineWithFeedback");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var goBackFromExportConnection_1 = require("@navigation/helpers/goBackFromExportConnection");
var withPolicyConnections_1 = require("@pages/workspace/withPolicyConnections");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
function SageIntacctExportPage(_a) {
    var _b, _c, _d, _e;
    var policy = _a.policy;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var policyID = policy === null || policy === void 0 ? void 0 : policy.id;
    var route = (0, native_1.useRoute)();
    var backTo = (_b = route === null || route === void 0 ? void 0 : route.params) === null || _b === void 0 ? void 0 : _b.backTo;
    var _f = (_e = (_d = (_c = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _c === void 0 ? void 0 : _c.intacct) === null || _d === void 0 ? void 0 : _d.config) !== null && _e !== void 0 ? _e : {}, exportConfig = _f.export, pendingFields = _f.pendingFields, errorFields = _f.errorFields;
    var shouldGoBackToSpecificRoute = (exportConfig === null || exportConfig === void 0 ? void 0 : exportConfig.reimbursable) === CONST_1.default.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.EXPENSE_REPORT;
    var goBack = (0, react_1.useCallback)(function () {
        return (0, goBackFromExportConnection_1.default)(shouldGoBackToSpecificRoute, backTo);
    }, [backTo, shouldGoBackToSpecificRoute]);
    var sections = (0, react_1.useMemo)(function () {
        var _a;
        return [
            {
                description: translate('workspace.sageIntacct.preferredExporter'),
                action: !policyID ? undefined : function () { return Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_SAGE_INTACCT_PREFERRED_EXPORTER.getRoute(policyID, Navigation_1.default.getActiveRoute())); },
                title: (_a = exportConfig === null || exportConfig === void 0 ? void 0 : exportConfig.exporter) !== null && _a !== void 0 ? _a : translate('workspace.sageIntacct.notConfigured'),
                subscribedSettings: [CONST_1.default.SAGE_INTACCT_CONFIG.EXPORTER],
            },
            {
                description: translate('workspace.sageIntacct.exportDate.label'),
                action: !policyID ? undefined : function () { return Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_SAGE_INTACCT_EXPORT_DATE.getRoute(policyID, Navigation_1.default.getActiveRoute())); },
                title: (exportConfig === null || exportConfig === void 0 ? void 0 : exportConfig.exportDate) ? translate("workspace.sageIntacct.exportDate.values.".concat(exportConfig.exportDate, ".label")) : translate("workspace.sageIntacct.notConfigured"),
                subscribedSettings: [CONST_1.default.SAGE_INTACCT_CONFIG.EXPORT_DATE],
            },
            {
                description: translate('workspace.accounting.exportOutOfPocket'),
                action: !policyID ? undefined : function () { return Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_SAGE_INTACCT_REIMBURSABLE_EXPENSES.getRoute(policyID, Navigation_1.default.getActiveRoute())); },
                title: (exportConfig === null || exportConfig === void 0 ? void 0 : exportConfig.reimbursable)
                    ? translate("workspace.sageIntacct.reimbursableExpenses.values.".concat(exportConfig.reimbursable))
                    : translate('workspace.sageIntacct.notConfigured'),
                subscribedSettings: [CONST_1.default.SAGE_INTACCT_CONFIG.REIMBURSABLE, CONST_1.default.SAGE_INTACCT_CONFIG.REIMBURSABLE_VENDOR],
            },
            {
                description: translate('workspace.accounting.exportCompanyCard'),
                action: !policyID ? undefined : function () { return Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_SAGE_INTACCT_NON_REIMBURSABLE_EXPENSES.getRoute(policyID, Navigation_1.default.getActiveRoute())); },
                title: (exportConfig === null || exportConfig === void 0 ? void 0 : exportConfig.nonReimbursable)
                    ? translate("workspace.sageIntacct.nonReimbursableExpenses.values.".concat(exportConfig.nonReimbursable))
                    : translate('workspace.sageIntacct.notConfigured'),
                subscribedSettings: [
                    CONST_1.default.SAGE_INTACCT_CONFIG.NON_REIMBURSABLE,
                    CONST_1.default.SAGE_INTACCT_CONFIG.NON_REIMBURSABLE_ACCOUNT,
                    (exportConfig === null || exportConfig === void 0 ? void 0 : exportConfig.nonReimbursable) === CONST_1.default.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL
                        ? CONST_1.default.SAGE_INTACCT_CONFIG.NON_REIMBURSABLE_VENDOR
                        : CONST_1.default.SAGE_INTACCT_CONFIG.NON_REIMBURSABLE_CREDIT_CARD_VENDOR,
                ],
            },
        ];
    }, [exportConfig, policyID, translate]);
    return (<ConnectionLayout_1.default displayName={SageIntacctExportPage.displayName} headerTitle="workspace.accounting.export" headerSubtitle={(0, PolicyUtils_1.getCurrentSageIntacctEntityName)(policy, translate('workspace.common.topLevel'))} title="workspace.sageIntacct.exportDescription" accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.PAID]} policyID={policyID} onBackButtonPress={goBack} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED} contentContainerStyle={styles.pb2} titleStyle={styles.ph5} connectionName={CONST_1.default.POLICY.CONNECTIONS.NAME.SAGE_INTACCT}>
            {sections.map(function (section) { return (<OfflineWithFeedback_1.default key={section.description} pendingAction={(0, PolicyUtils_1.settingsPendingAction)(section.subscribedSettings, pendingFields)}>
                    <MenuItemWithTopDescription_1.default title={section.title} description={section.description} shouldShowRightIcon onPress={section.action} brickRoadIndicator={(0, PolicyUtils_1.areSettingsInErrorFields)(section.subscribedSettings, errorFields) ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}/>
                </OfflineWithFeedback_1.default>); })}
        </ConnectionLayout_1.default>);
}
SageIntacctExportPage.displayName = 'SageIntacctExportPage';
exports.default = (0, withPolicyConnections_1.default)(SageIntacctExportPage);
