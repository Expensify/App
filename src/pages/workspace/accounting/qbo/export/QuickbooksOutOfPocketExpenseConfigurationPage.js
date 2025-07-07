"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var ConnectionLayout_1 = require("@components/ConnectionLayout");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var OfflineWithFeedback_1 = require("@components/OfflineWithFeedback");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var QuickbooksOnline_1 = require("@libs/actions/connections/QuickbooksOnline");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var Navigation_1 = require("@navigation/Navigation");
var withPolicyConnections_1 = require("@pages/workspace/withPolicyConnections");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
var account = [CONST_1.default.QUICKBOOKS_CONFIG.REIMBURSABLE_EXPENSES_ACCOUNT];
var accountOrExportDestination = [CONST_1.default.QUICKBOOKS_CONFIG.REIMBURSABLE_EXPENSES_EXPORT_DESTINATION, CONST_1.default.QUICKBOOKS_CONFIG.REIMBURSABLE_EXPENSES_ACCOUNT];
function QuickbooksOutOfPocketExpenseConfigurationPage(_a) {
    var _b;
    var _c, _d, _e, _f, _g;
    var policy = _a.policy;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var policyID = policy === null || policy === void 0 ? void 0 : policy.id;
    var qboConfig = (_d = (_c = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _c === void 0 ? void 0 : _c.quickbooksOnline) === null || _d === void 0 ? void 0 : _d.config;
    var isLocationEnabled = !!((qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.syncLocations) && (qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.syncLocations) !== CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.NONE);
    var isTaxesEnabled = !!(qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.syncTax);
    var route = (0, native_1.useRoute)();
    var backTo = (_e = route.params) === null || _e === void 0 ? void 0 : _e.backTo;
    var _h = (0, react_1.useMemo)(function () {
        var hintText;
        var description;
        switch (qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.reimbursableExpensesExportDestination) {
            case CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK:
                hintText = isLocationEnabled ? undefined : translate('workspace.qbo.exportCheckDescription');
                description = translate('workspace.qbo.bankAccount');
                break;
            case CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY:
                hintText = isTaxesEnabled ? undefined : translate('workspace.qbo.exportJournalEntryDescription');
                description = translate('workspace.qbo.account');
                break;
            case CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL:
                hintText = isLocationEnabled ? undefined : translate('workspace.qbo.exportVendorBillDescription');
                description = translate('workspace.qbo.accountsPayable');
                break;
            default:
                break;
        }
        return [hintText, description];
    }, [translate, qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.reimbursableExpensesExportDestination, isLocationEnabled, isTaxesEnabled]), exportHintText = _h[0], accountDescription = _h[1];
    var sections = [
        {
            title: (qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.reimbursableExpensesExportDestination) ? translate("workspace.qbo.accounts.".concat(qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.reimbursableExpensesExportDestination)) : undefined,
            description: translate('workspace.accounting.exportAs'),
            onPress: function () {
                if (!policyID) {
                    return;
                }
                Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_EXPORT_OUT_OF_POCKET_EXPENSES_SELECT.getRoute(policyID, Navigation_1.default.getActiveRoute()));
            },
            hintText: exportHintText,
            subscribedSettings: accountOrExportDestination,
            pendingAction: (0, PolicyUtils_1.settingsPendingAction)(accountOrExportDestination, qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.pendingFields),
            brickRoadIndicator: (0, PolicyUtils_1.areSettingsInErrorFields)(accountOrExportDestination, qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.errorFields) ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
        },
        {
            title: (_g = (_f = qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.reimbursableExpensesAccount) === null || _f === void 0 ? void 0 : _f.name) !== null && _g !== void 0 ? _g : translate('workspace.qbo.notConfigured'),
            description: accountDescription,
            onPress: function () {
                if (!policyID) {
                    return;
                }
                Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_EXPORT_OUT_OF_POCKET_EXPENSES_ACCOUNT_SELECT.getRoute(policyID, Navigation_1.default.getActiveRoute()));
            },
            subscribedSettings: account,
            pendingAction: (0, PolicyUtils_1.settingsPendingAction)(account, qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.pendingFields),
            brickRoadIndicator: (0, PolicyUtils_1.areSettingsInErrorFields)(account, qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.errorFields) ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
            errors: (0, QuickbooksOnline_1.shouldShowQBOReimbursableExportDestinationAccountError)(policy) && (qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.reimbursableExpensesExportDestination)
                ? (_b = {},
                    _b[CONST_1.default.QUICKBOOKS_CONFIG.REIMBURSABLE_EXPENSES_EXPORT_DESTINATION] = translate("workspace.qbo.exportDestinationAccountsMisconfigurationError.".concat(qboConfig.reimbursableExpensesExportDestination)),
                    _b) : undefined,
        },
    ];
    return (<ConnectionLayout_1.default displayName={QuickbooksOutOfPocketExpenseConfigurationPage.displayName} headerTitle="workspace.accounting.exportOutOfPocket" title="workspace.qbo.exportOutOfPocketExpensesDescription" accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN]} policyID={policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED} contentContainerStyle={styles.pb2} titleStyle={styles.ph5} connectionName={CONST_1.default.POLICY.CONNECTIONS.NAME.QBO} onBackButtonPress={function () { return Navigation_1.default.goBack(backTo !== null && backTo !== void 0 ? backTo : ROUTES_1.default.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_EXPORT.getRoute(policyID)); }}>
            {sections.map(function (section, index) { return (<OfflineWithFeedback_1.default pendingAction={section.pendingAction} 
        // eslint-disable-next-line react/no-array-index-key
        key={index} errors={section.errors} errorRowStyles={[styles.ph5]} canDismissError={false}>
                    <MenuItemWithTopDescription_1.default title={section.title} description={section.description} onPress={section.onPress} shouldShowRightIcon brickRoadIndicator={section.brickRoadIndicator} hintText={section.hintText}/>
                </OfflineWithFeedback_1.default>); })}
        </ConnectionLayout_1.default>);
}
QuickbooksOutOfPocketExpenseConfigurationPage.displayName = 'QuickbooksExportOutOfPocketExpensesPage';
exports.default = (0, withPolicyConnections_1.default)(QuickbooksOutOfPocketExpenseConfigurationPage);
