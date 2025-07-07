"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var ConnectionLayout_1 = require("@components/ConnectionLayout");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var OfflineWithFeedback_1 = require("@components/OfflineWithFeedback");
var Text_1 = require("@components/Text");
var TextLink_1 = require("@components/TextLink");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var QuickbooksOnline_1 = require("@libs/actions/connections/QuickbooksOnline");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var goBackFromExportConnection_1 = require("@navigation/helpers/goBackFromExportConnection");
var Navigation_1 = require("@navigation/Navigation");
var withPolicyConnections_1 = require("@pages/workspace/withPolicyConnections");
var Link_1 = require("@userActions/Link");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
function QuickbooksExportConfigurationPage(_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j;
    var policy = _a.policy;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var route = (0, native_1.useRoute)();
    var backTo = (_b = route === null || route === void 0 ? void 0 : route.params) === null || _b === void 0 ? void 0 : _b.backTo;
    var policyID = policy === null || policy === void 0 ? void 0 : policy.id;
    var policyOwner = (_c = policy === null || policy === void 0 ? void 0 : policy.owner) !== null && _c !== void 0 ? _c : '';
    var qboConfig = (_e = (_d = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _d === void 0 ? void 0 : _d.quickbooksOnline) === null || _e === void 0 ? void 0 : _e.config;
    var errorFields = qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.errorFields;
    var shouldShowVendorMenuItems = (0, react_1.useMemo)(function () { return (qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.nonReimbursableExpensesExportDestination) === CONST_1.default.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.VENDOR_BILL; }, [qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.nonReimbursableExpensesExportDestination]);
    var goBack = (0, react_1.useCallback)(function () {
        return (0, goBackFromExportConnection_1.default)(shouldShowVendorMenuItems, backTo);
    }, [backTo, shouldShowVendorMenuItems]);
    var menuItems = [
        {
            description: translate('workspace.accounting.preferredExporter'),
            onPress: !policyID ? undefined : function () { return Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_PREFERRED_EXPORTER.getRoute(policyID, Navigation_1.default.getActiveRoute())); },
            title: (_g = (_f = qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.export) === null || _f === void 0 ? void 0 : _f.exporter) !== null && _g !== void 0 ? _g : policyOwner,
            subscribedSettings: [CONST_1.default.QUICKBOOKS_CONFIG.EXPORT],
        },
        {
            description: translate('workspace.qbo.date'),
            onPress: !policyID ? undefined : function () { return Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_EXPORT_DATE_SELECT.getRoute(policyID, Navigation_1.default.getActiveRoute())); },
            title: (qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.exportDate) ? translate("workspace.qbo.exportDate.values.".concat(qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.exportDate, ".label")) : undefined,
            subscribedSettings: [CONST_1.default.QUICKBOOKS_CONFIG.EXPORT_DATE],
        },
        {
            description: translate('workspace.accounting.exportOutOfPocket'),
            onPress: !policyID
                ? undefined
                : function () { return Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_EXPORT_OUT_OF_POCKET_EXPENSES.getRoute(policyID, Navigation_1.default.getActiveRoute())); },
            title: (qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.reimbursableExpensesExportDestination) ? translate("workspace.qbo.accounts.".concat(qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.reimbursableExpensesExportDestination)) : undefined,
            subscribedSettings: [CONST_1.default.QUICKBOOKS_CONFIG.REIMBURSABLE_EXPENSES_EXPORT_DESTINATION, CONST_1.default.QUICKBOOKS_CONFIG.REIMBURSABLE_EXPENSES_ACCOUNT],
        },
        {
            description: translate('workspace.qbo.exportInvoices'),
            onPress: !policyID ? undefined : function () { return Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_INVOICE_ACCOUNT_SELECT.getRoute(policyID, Navigation_1.default.getActiveRoute())); },
            title: (_h = qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.receivableAccount) === null || _h === void 0 ? void 0 : _h.name,
            subscribedSettings: [CONST_1.default.QUICKBOOKS_CONFIG.RECEIVABLE_ACCOUNT],
        },
        {
            description: translate('workspace.accounting.exportCompanyCard'),
            onPress: !policyID
                ? undefined
                : function () { return Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_COMPANY_CARD_EXPENSE_ACCOUNT.getRoute(policyID, Navigation_1.default.getActiveRoute())); },
            brickRoadIndicator: ((_j = qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.errorFields) === null || _j === void 0 ? void 0 : _j.exportCompanyCard) ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
            title: (qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.nonReimbursableExpensesExportDestination) ? translate("workspace.qbo.accounts.".concat(qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.nonReimbursableExpensesExportDestination)) : undefined,
            subscribedSettings: __spreadArray(__spreadArray([
                CONST_1.default.QUICKBOOKS_CONFIG.NON_REIMBURSABLE_EXPENSES_EXPORT_DESTINATION,
                CONST_1.default.QUICKBOOKS_CONFIG.NON_REIMBURSABLE_EXPENSE_ACCOUNT
            ], (shouldShowVendorMenuItems ? [CONST_1.default.QUICKBOOKS_CONFIG.AUTO_CREATE_VENDOR] : []), true), (shouldShowVendorMenuItems && (qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.autoCreateVendor) ? [CONST_1.default.QUICKBOOKS_CONFIG.NON_REIMBURSABLE_BILL_DEFAULT_VENDOR] : []), true),
        },
        {
            description: translate('workspace.qbo.exportExpensifyCard'),
            title: translate('workspace.qbo.accounts.credit_card'),
            shouldShowRightIcon: false,
            interactive: false,
        },
    ];
    return (<ConnectionLayout_1.default displayName={QuickbooksExportConfigurationPage.displayName} headerTitle="workspace.accounting.export" title="workspace.qbo.exportDescription" accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN]} policyID={policyID} onBackButtonPress={goBack} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED} contentContainerStyle={styles.pb2} titleStyle={styles.ph5} connectionName={CONST_1.default.POLICY.CONNECTIONS.NAME.QBO}>
            {menuItems.map(function (menuItem) {
            var _a, _b, _c;
            return (<OfflineWithFeedback_1.default key={menuItem.description} pendingAction={(0, PolicyUtils_1.settingsPendingAction)(menuItem === null || menuItem === void 0 ? void 0 : menuItem.subscribedSettings, qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.pendingFields)}>
                    <MenuItemWithTopDescription_1.default title={menuItem.title} interactive={(_a = menuItem === null || menuItem === void 0 ? void 0 : menuItem.interactive) !== null && _a !== void 0 ? _a : true} description={menuItem.description} shouldShowRightIcon={(_b = menuItem === null || menuItem === void 0 ? void 0 : menuItem.shouldShowRightIcon) !== null && _b !== void 0 ? _b : true} onPress={menuItem === null || menuItem === void 0 ? void 0 : menuItem.onPress} brickRoadIndicator={(0, PolicyUtils_1.areSettingsInErrorFields)(menuItem === null || menuItem === void 0 ? void 0 : menuItem.subscribedSettings, errorFields) ||
                    (((_c = menuItem.subscribedSettings) === null || _c === void 0 ? void 0 : _c.some(function (setting) { return setting === CONST_1.default.QUICKBOOKS_CONFIG.REIMBURSABLE_EXPENSES_EXPORT_DESTINATION; })) &&
                        (0, QuickbooksOnline_1.shouldShowQBOReimbursableExportDestinationAccountError)(policy))
                    ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR
                    : undefined}/>
                </OfflineWithFeedback_1.default>);
        })}
            <Text_1.default style={[styles.mutedNormalTextLabel, styles.ph5, styles.pb5, styles.mt2]}>
                <Text_1.default style={[styles.mutedNormalTextLabel]}>{"".concat(translate('workspace.qbo.deepDiveExpensifyCard'), " ")}</Text_1.default>
                <TextLink_1.default onPress={function () { return (0, Link_1.openExternalLink)(CONST_1.default.DEEP_DIVE_EXPENSIFY_CARD); }} style={[styles.mutedNormalTextLabel, styles.link]}>
                    {translate('workspace.qbo.deepDiveExpensifyCardIntegration')}
                </TextLink_1.default>
            </Text_1.default>
        </ConnectionLayout_1.default>);
}
QuickbooksExportConfigurationPage.displayName = 'QuickbooksExportConfigurationPage';
exports.default = (0, withPolicyConnections_1.default)(QuickbooksExportConfigurationPage);
