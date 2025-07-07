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
function XeroExportConfigurationPage(_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    var policy = _a.policy;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var policyID = policy === null || policy === void 0 ? void 0 : policy.id;
    var route = (0, native_1.useRoute)();
    var backTo = (_b = route === null || route === void 0 ? void 0 : route.params) === null || _b === void 0 ? void 0 : _b.backTo;
    var policyOwner = (_c = policy === null || policy === void 0 ? void 0 : policy.owner) !== null && _c !== void 0 ? _c : '';
    var _m = (_f = (_e = (_d = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _d === void 0 ? void 0 : _d.xero) === null || _e === void 0 ? void 0 : _e.config) !== null && _f !== void 0 ? _f : {}, exportConfiguration = _m.export, errorFields = _m.errorFields, pendingFields = _m.pendingFields;
    var shouldGoBackToSpecificRoute = !(exportConfiguration === null || exportConfiguration === void 0 ? void 0 : exportConfiguration.nonReimbursableAccount);
    var goBack = (0, react_1.useCallback)(function () {
        return (0, goBackFromExportConnection_1.default)(shouldGoBackToSpecificRoute, backTo);
    }, [backTo, shouldGoBackToSpecificRoute]);
    var bankAccounts = ((_j = (_h = (_g = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _g === void 0 ? void 0 : _g.xero) === null || _h === void 0 ? void 0 : _h.data) !== null && _j !== void 0 ? _j : {}).bankAccounts;
    var selectedBankAccountName = (0, react_1.useMemo)(function () {
        var _a, _b, _c;
        var selectedAccount = (bankAccounts !== null && bankAccounts !== void 0 ? bankAccounts : []).find(function (bank) { return bank.id === (exportConfiguration === null || exportConfiguration === void 0 ? void 0 : exportConfiguration.nonReimbursableAccount); });
        return (_c = (_a = selectedAccount === null || selectedAccount === void 0 ? void 0 : selectedAccount.name) !== null && _a !== void 0 ? _a : (_b = bankAccounts === null || bankAccounts === void 0 ? void 0 : bankAccounts[0]) === null || _b === void 0 ? void 0 : _b.name) !== null && _c !== void 0 ? _c : '';
    }, [bankAccounts, exportConfiguration === null || exportConfiguration === void 0 ? void 0 : exportConfiguration.nonReimbursableAccount]);
    var currentXeroOrganizationName = (0, react_1.useMemo)(function () { return (0, PolicyUtils_1.getCurrentXeroOrganizationName)(policy !== null && policy !== void 0 ? policy : undefined); }, [policy]);
    var menuItems = [
        {
            description: translate('workspace.accounting.preferredExporter'),
            onPress: !policyID
                ? undefined
                : function () {
                    Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_XERO_PREFERRED_EXPORTER_SELECT.getRoute(policyID, Navigation_1.default.getActiveRoute()));
                },
            title: (_k = exportConfiguration === null || exportConfiguration === void 0 ? void 0 : exportConfiguration.exporter) !== null && _k !== void 0 ? _k : policyOwner,
            subscribedSettings: [CONST_1.default.XERO_CONFIG.EXPORTER],
        },
        {
            description: translate('workspace.accounting.exportOutOfPocket'),
            title: translate('workspace.xero.purchaseBill'),
            interactive: false,
            shouldShowRightIcon: false,
            helperText: translate('workspace.xero.exportExpensesDescription'),
        },
        {
            description: translate('workspace.xero.purchaseBillDate'),
            onPress: !policyID ? undefined : function () { return Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_XERO_EXPORT_PURCHASE_BILL_DATE_SELECT.getRoute(policyID, Navigation_1.default.getActiveRoute())); },
            title: (exportConfiguration === null || exportConfiguration === void 0 ? void 0 : exportConfiguration.billDate) ? translate("workspace.xero.exportDate.values.".concat(exportConfiguration.billDate, ".label")) : undefined,
            subscribedSettings: [CONST_1.default.XERO_CONFIG.BILL_DATE],
        },
        {
            description: translate('workspace.xero.advancedConfig.purchaseBillStatusTitle'),
            onPress: !policyID ? undefined : function () { return Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_XERO_BILL_STATUS_SELECTOR.getRoute(policyID, Navigation_1.default.getActiveRoute())); },
            title: ((_l = exportConfiguration === null || exportConfiguration === void 0 ? void 0 : exportConfiguration.billStatus) === null || _l === void 0 ? void 0 : _l.purchase) ? translate("workspace.xero.invoiceStatus.values.".concat(exportConfiguration.billStatus.purchase)) : undefined,
            subscribedSettings: [CONST_1.default.XERO_CONFIG.BILL_STATUS],
        },
        {
            description: translate('workspace.xero.exportInvoices'),
            title: translate('workspace.xero.salesInvoice'),
            interactive: false,
            shouldShowRightIcon: false,
            helperText: translate('workspace.xero.exportInvoicesDescription'),
        },
        {
            description: translate('workspace.accounting.exportCompanyCard'),
            title: translate('workspace.xero.bankTransactions'),
            shouldShowRightIcon: false,
            interactive: false,
            helperText: translate('workspace.xero.exportDeepDiveCompanyCard'),
        },
        {
            description: translate('workspace.xero.xeroBankAccount'),
            onPress: function () { return (!policyID ? undefined : Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_XERO_EXPORT_BANK_ACCOUNT_SELECT.getRoute(policyID, Navigation_1.default.getActiveRoute()))); },
            title: selectedBankAccountName,
            subscribedSettings: [CONST_1.default.XERO_CONFIG.NON_REIMBURSABLE_ACCOUNT],
        },
    ];
    return (<ConnectionLayout_1.default displayName={XeroExportConfigurationPage.displayName} headerTitle="workspace.accounting.export" headerSubtitle={currentXeroOrganizationName} title="workspace.xero.exportDescription" accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN]} policyID={policyID} onBackButtonPress={goBack} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED} contentContainerStyle={styles.pb2} titleStyle={styles.ph5} connectionName={CONST_1.default.POLICY.CONNECTIONS.NAME.XERO}>
            {menuItems.map(function (menuItem) {
            var _a, _b, _c, _d;
            return (<OfflineWithFeedback_1.default key={menuItem.description} pendingAction={(0, PolicyUtils_1.settingsPendingAction)((_a = menuItem === null || menuItem === void 0 ? void 0 : menuItem.subscribedSettings) !== null && _a !== void 0 ? _a : [], pendingFields)}>
                    <MenuItemWithTopDescription_1.default title={menuItem.title} interactive={(_b = menuItem === null || menuItem === void 0 ? void 0 : menuItem.interactive) !== null && _b !== void 0 ? _b : true} description={menuItem.description} shouldShowRightIcon={(_c = menuItem === null || menuItem === void 0 ? void 0 : menuItem.shouldShowRightIcon) !== null && _c !== void 0 ? _c : true} onPress={menuItem === null || menuItem === void 0 ? void 0 : menuItem.onPress} brickRoadIndicator={(0, PolicyUtils_1.areSettingsInErrorFields)((_d = menuItem === null || menuItem === void 0 ? void 0 : menuItem.subscribedSettings) !== null && _d !== void 0 ? _d : [], errorFields) ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined} helperText={menuItem === null || menuItem === void 0 ? void 0 : menuItem.helperText}/>
                </OfflineWithFeedback_1.default>);
        })}
        </ConnectionLayout_1.default>);
}
XeroExportConfigurationPage.displayName = 'XeroExportConfigurationPage';
exports.default = (0, withPolicyConnections_1.default)(XeroExportConfigurationPage);
