"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var ConnectionLayout_1 = require("@components/ConnectionLayout");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var OfflineWithFeedback_1 = require("@components/OfflineWithFeedback");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var QuickbooksDesktop_1 = require("@libs/actions/connections/QuickbooksDesktop");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var Navigation_1 = require("@navigation/Navigation");
var utils_1 = require("@pages/workspace/accounting/utils");
var withPolicyConnections_1 = require("@pages/workspace/withPolicyConnections");
var ToggleSettingsOptionRow_1 = require("@pages/workspace/workflows/ToggleSettingsOptionRow");
var Policy_1 = require("@userActions/Policy/Policy");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
var account = [CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.REIMBURSABLE_ACCOUNT];
var accountOrExportDestination = [CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.REIMBURSABLE, CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.REIMBURSABLE_ACCOUNT];
var markChecksToBePrintedOrExportDestination = [CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.REIMBURSABLE, CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.MARK_CHECKS_TO_BE_PRINTED];
function QuickbooksDesktopOutOfPocketExpenseConfigurationPage(_a) {
    var _b, _c, _d, _e, _f, _g;
    var policy = _a.policy;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var policyID = policy === null || policy === void 0 ? void 0 : policy.id;
    var qbdConfig = (_c = (_b = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _b === void 0 ? void 0 : _b.quickbooksDesktop) === null || _c === void 0 ? void 0 : _c.config;
    var reimbursable = qbdConfig === null || qbdConfig === void 0 ? void 0 : qbdConfig.export.reimbursable;
    var route = (0, native_1.useRoute)();
    var backTo = (_d = route.params) === null || _d === void 0 ? void 0 : _d.backTo;
    var _h = (0, react_1.useMemo)(function () {
        var _a;
        var hintText;
        var description;
        var accounts = (0, utils_1.getQBDReimbursableAccounts)((_a = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _a === void 0 ? void 0 : _a.quickbooksDesktop);
        switch (reimbursable) {
            case CONST_1.default.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK:
                hintText = translate('workspace.qbd.exportCheckDescription');
                description = translate('workspace.qbd.bankAccount');
                break;
            case CONST_1.default.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY:
                hintText = translate('workspace.qbd.exportJournalEntryDescription');
                description = translate('workspace.qbd.account');
                break;
            case CONST_1.default.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL:
                hintText = translate('workspace.qbd.exportVendorBillDescription');
                description = translate('workspace.qbd.accountsPayable');
                break;
            default:
                break;
        }
        return [hintText, description, accounts];
    }, [(_e = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _e === void 0 ? void 0 : _e.quickbooksDesktop, reimbursable, translate]), exportHintText = _h[0], accountDescription = _h[1], accountsList = _h[2];
    var sections = [
        {
            title: reimbursable ? translate("workspace.qbd.accounts.".concat(reimbursable)) : undefined,
            description: translate('workspace.accounting.exportAs'),
            onPress: function () { return Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_EXPORT_OUT_OF_POCKET_EXPENSES_SELECT.getRoute(policyID, Navigation_1.default.getActiveRoute())); },
            hintText: exportHintText,
            subscribedSettings: accountOrExportDestination,
            pendingAction: (0, PolicyUtils_1.settingsPendingAction)(accountOrExportDestination, qbdConfig === null || qbdConfig === void 0 ? void 0 : qbdConfig.pendingFields),
            brickRoadIndicator: (0, PolicyUtils_1.areSettingsInErrorFields)(accountOrExportDestination, qbdConfig === null || qbdConfig === void 0 ? void 0 : qbdConfig.errorFields) ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
        },
        {
            // We use the logical OR (||) here instead of ?? because `reimbursableAccount` can be an empty string
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            title: ((_f = accountsList.find(function (_a) {
                var id = _a.id;
                return (qbdConfig === null || qbdConfig === void 0 ? void 0 : qbdConfig.export.reimbursableAccount) === id;
            })) === null || _f === void 0 ? void 0 : _f.name) || ((_g = accountsList.at(0)) === null || _g === void 0 ? void 0 : _g.name) || translate('workspace.qbd.notConfigured'),
            description: accountDescription,
            onPress: function () { return Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_EXPORT_OUT_OF_POCKET_EXPENSES_ACCOUNT_SELECT.getRoute(policyID, Navigation_1.default.getActiveRoute())); },
            subscribedSettings: account,
            pendingAction: (0, PolicyUtils_1.settingsPendingAction)(account, qbdConfig === null || qbdConfig === void 0 ? void 0 : qbdConfig.pendingFields),
            brickRoadIndicator: (0, PolicyUtils_1.areSettingsInErrorFields)(account, qbdConfig === null || qbdConfig === void 0 ? void 0 : qbdConfig.errorFields) ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
        },
    ];
    return (<ConnectionLayout_1.default displayName={QuickbooksDesktopOutOfPocketExpenseConfigurationPage.displayName} headerTitle="workspace.accounting.exportOutOfPocket" title="workspace.qbd.exportOutOfPocketExpensesDescription" accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.CONTROL]} policyID={policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED} contentContainerStyle={styles.pb2} titleStyle={styles.ph5} connectionName={CONST_1.default.POLICY.CONNECTIONS.NAME.QBD} onBackButtonPress={function () { return Navigation_1.default.goBack(backTo !== null && backTo !== void 0 ? backTo : ROUTES_1.default.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_EXPORT.getRoute(policyID)); }}>
            {sections.map(function (section, index) { return (<OfflineWithFeedback_1.default pendingAction={section.pendingAction} 
        // eslint-disable-next-line react/no-array-index-key
        key={index}>
                    <MenuItemWithTopDescription_1.default title={section.title} description={section.description} onPress={section.onPress} shouldShowRightIcon brickRoadIndicator={section.brickRoadIndicator} hintText={section.hintText}/>
                </OfflineWithFeedback_1.default>); })}
            {reimbursable === CONST_1.default.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK && (<ToggleSettingsOptionRow_1.default key={translate('workspace.qbd.exportOutOfPocketExpensesCheckToggle')} title={translate('workspace.qbd.exportOutOfPocketExpensesCheckToggle')} switchAccessibilityLabel={translate('workspace.qbd.exportOutOfPocketExpensesCheckToggle')} shouldPlaceSubtitleBelowSwitch wrapperStyle={[styles.mv3, styles.ph5]} isActive={!!(qbdConfig === null || qbdConfig === void 0 ? void 0 : qbdConfig.markChecksToBePrinted)} onToggle={function () {
                if (!policyID) {
                    return;
                }
                (0, QuickbooksDesktop_1.updateQuickbooksDesktopMarkChecksToBePrinted)(policyID, !(qbdConfig === null || qbdConfig === void 0 ? void 0 : qbdConfig.markChecksToBePrinted));
            }} errors={(0, ErrorUtils_1.getLatestErrorField)(qbdConfig, CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.MARK_CHECKS_TO_BE_PRINTED)} pendingAction={(0, PolicyUtils_1.settingsPendingAction)(markChecksToBePrintedOrExportDestination, qbdConfig === null || qbdConfig === void 0 ? void 0 : qbdConfig.pendingFields)} onCloseError={function () {
                if (!policyID) {
                    return;
                }
                (0, Policy_1.clearQBDErrorField)(policyID, CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.MARK_CHECKS_TO_BE_PRINTED);
            }}/>)}
        </ConnectionLayout_1.default>);
}
QuickbooksDesktopOutOfPocketExpenseConfigurationPage.displayName = 'QuickbooksDesktopOutOfPocketExpenseConfigurationPage';
exports.default = (0, withPolicyConnections_1.default)(QuickbooksDesktopOutOfPocketExpenseConfigurationPage);
