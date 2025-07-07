"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
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
var react_native_1 = require("react-native");
var ConnectionLayout_1 = require("@components/ConnectionLayout");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var OfflineWithFeedback_1 = require("@components/OfflineWithFeedback");
var useLocalize_1 = require("@hooks/useLocalize");
var usePermissions_1 = require("@hooks/usePermissions");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var NetSuiteCommands_1 = require("@libs/actions/connections/NetSuiteCommands");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var goBackFromExportConnection_1 = require("@navigation/helpers/goBackFromExportConnection");
var utils_1 = require("@pages/workspace/accounting/netsuite/utils");
var withPolicyConnections_1 = require("@pages/workspace/withPolicyConnections");
var ToggleSettingsOptionRow_1 = require("@pages/workspace/workflows/ToggleSettingsOptionRow");
var Policy_1 = require("@userActions/Policy/Policy");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
function NetSuiteExportConfigurationPage(_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    var policy = _a.policy;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var route = (0, native_1.useRoute)();
    var backTo = (_b = route === null || route === void 0 ? void 0 : route.params) === null || _b === void 0 ? void 0 : _b.backTo;
    var policyID = policy === null || policy === void 0 ? void 0 : policy.id;
    var policyOwner = (_c = policy === null || policy === void 0 ? void 0 : policy.owner) !== null && _c !== void 0 ? _c : '';
    var isBetaEnabled = (0, usePermissions_1.default)().isBetaEnabled;
    var config = (_e = (_d = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _d === void 0 ? void 0 : _d.netsuite) === null || _e === void 0 ? void 0 : _e.options.config;
    var shouldGoBackToSpecificRoute = 
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    (config === null || config === void 0 ? void 0 : config.reimbursableExpensesExportDestination) === CONST_1.default.NETSUITE_EXPORT_DESTINATION.EXPENSE_REPORT ||
        (config === null || config === void 0 ? void 0 : config.nonreimbursableExpensesExportDestination) === CONST_1.default.NETSUITE_EXPORT_DESTINATION.EXPENSE_REPORT;
    var goBack = (0, react_1.useCallback)(function () {
        return (0, goBackFromExportConnection_1.default)(shouldGoBackToSpecificRoute, backTo);
    }, [backTo, shouldGoBackToSpecificRoute]);
    var _m = (_j = (_h = (_g = (_f = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _f === void 0 ? void 0 : _f.netsuite) === null || _g === void 0 ? void 0 : _g.options) === null || _h === void 0 ? void 0 : _h.data) !== null && _j !== void 0 ? _j : {}, subsidiaryList = _m.subsidiaryList, receivableList = _m.receivableList, taxAccountsList = _m.taxAccountsList, items = _m.items;
    var selectedSubsidiary = (0, react_1.useMemo)(function () { return (subsidiaryList !== null && subsidiaryList !== void 0 ? subsidiaryList : []).find(function (subsidiary) { return subsidiary.internalID === (config === null || config === void 0 ? void 0 : config.subsidiaryID); }); }, [subsidiaryList, config === null || config === void 0 ? void 0 : config.subsidiaryID]);
    var selectedReceivable = (0, react_1.useMemo)(function () { return (0, PolicyUtils_1.findSelectedBankAccountWithDefaultSelect)(receivableList, config === null || config === void 0 ? void 0 : config.receivableAccount); }, [receivableList, config === null || config === void 0 ? void 0 : config.receivableAccount]);
    var selectedItem = (0, react_1.useMemo)(function () { return (0, PolicyUtils_1.findSelectedInvoiceItemWithDefaultSelect)(items, config === null || config === void 0 ? void 0 : config.invoiceItem); }, [items, config === null || config === void 0 ? void 0 : config.invoiceItem]);
    var invoiceItemValue = (0, react_1.useMemo)(function () {
        if (!(config === null || config === void 0 ? void 0 : config.invoiceItemPreference)) {
            return translate('workspace.netsuite.invoiceItem.values.create.label');
        }
        if (config.invoiceItemPreference === CONST_1.default.NETSUITE_INVOICE_ITEM_PREFERENCE.CREATE) {
            return translate('workspace.netsuite.invoiceItem.values.create.label');
        }
        if (!selectedItem) {
            return translate('workspace.netsuite.invoiceItem.values.select.label');
        }
        return selectedItem.name;
    }, [config === null || config === void 0 ? void 0 : config.invoiceItemPreference, selectedItem, translate]);
    var selectedTaxPostingAccount = (0, react_1.useMemo)(function () { return (0, PolicyUtils_1.findSelectedTaxAccountWithDefaultSelect)(taxAccountsList, config === null || config === void 0 ? void 0 : config.taxPostingAccount); }, [taxAccountsList, config === null || config === void 0 ? void 0 : config.taxPostingAccount]);
    var selectedProvTaxPostingAccount = (0, react_1.useMemo)(function () { return (0, PolicyUtils_1.findSelectedTaxAccountWithDefaultSelect)(taxAccountsList, config === null || config === void 0 ? void 0 : config.provincialTaxPostingAccount); }, [taxAccountsList, config === null || config === void 0 ? void 0 : config.provincialTaxPostingAccount]);
    var menuItems = [
        {
            type: 'menuitem',
            title: (_k = config === null || config === void 0 ? void 0 : config.exporter) !== null && _k !== void 0 ? _k : policyOwner,
            description: translate('workspace.accounting.preferredExporter'),
            onPress: !policyID
                ? undefined
                : function () {
                    Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_NETSUITE_PREFERRED_EXPORTER_SELECT.getRoute(policyID, Navigation_1.default.getActiveRoute()));
                },
            subscribedSettings: [CONST_1.default.NETSUITE_CONFIG.EXPORTER],
        },
        {
            type: 'divider',
            key: 'divider1',
        },
        {
            type: 'menuitem',
            title: (config === null || config === void 0 ? void 0 : config.exportDate)
                ? translate("workspace.netsuite.exportDate.values.".concat(config.exportDate, ".label"))
                : translate("workspace.netsuite.exportDate.values.".concat(CONST_1.default.NETSUITE_EXPORT_DATE.LAST_EXPENSE, ".label")),
            description: translate('workspace.accounting.exportDate'),
            onPress: function () { return (!policyID ? undefined : Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_NETSUITE_DATE_SELECT.getRoute(policyID, Navigation_1.default.getActiveRoute()))); },
            subscribedSettings: [CONST_1.default.NETSUITE_CONFIG.EXPORT_DATE],
        },
        {
            type: 'menuitem',
            title: (config === null || config === void 0 ? void 0 : config.reimbursableExpensesExportDestination) ? translate("workspace.netsuite.exportDestination.values.".concat(config.reimbursableExpensesExportDestination, ".label")) : undefined,
            description: translate('workspace.accounting.exportOutOfPocket'),
            onPress: !policyID
                ? undefined
                : function () { return Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_NETSUITE_EXPORT_EXPENSES.getRoute(policyID, CONST_1.default.NETSUITE_EXPENSE_TYPE.REIMBURSABLE, Navigation_1.default.getActiveRoute())); },
            subscribedSettings: __spreadArray(__spreadArray(__spreadArray(__spreadArray([
                CONST_1.default.NETSUITE_CONFIG.REIMBURSABLE_EXPENSES_EXPORT_DESTINATION
            ], (!(0, utils_1.shouldHideReimbursableDefaultVendor)(true, config) ? [CONST_1.default.NETSUITE_CONFIG.DEFAULT_VENDOR] : []), true), (!(0, utils_1.shouldHideNonReimbursableJournalPostingAccount)(true, config) ? [CONST_1.default.NETSUITE_CONFIG.PAYABLE_ACCT] : []), true), (!(0, utils_1.shouldHideReimbursableJournalPostingAccount)(true, config) ? [CONST_1.default.NETSUITE_CONFIG.REIMBURSABLE_PAYABLE_ACCOUNT] : []), true), (!(0, utils_1.shouldHideJournalPostingPreference)(true, config) ? [CONST_1.default.NETSUITE_CONFIG.JOURNAL_POSTING_PREFERENCE] : []), true),
        },
        {
            type: 'menuitem',
            title: (config === null || config === void 0 ? void 0 : config.nonreimbursableExpensesExportDestination)
                ? translate("workspace.netsuite.exportDestination.values.".concat(config.nonreimbursableExpensesExportDestination, ".label"))
                : undefined,
            description: translate('workspace.accounting.exportCompanyCard'),
            onPress: !policyID
                ? undefined
                : function () { return Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_NETSUITE_EXPORT_EXPENSES.getRoute(policyID, CONST_1.default.NETSUITE_EXPENSE_TYPE.NON_REIMBURSABLE, Navigation_1.default.getActiveRoute())); },
            subscribedSettings: __spreadArray(__spreadArray(__spreadArray(__spreadArray([
                CONST_1.default.NETSUITE_CONFIG.NON_REIMBURSABLE_EXPENSES_EXPORT_DESTINATION
            ], (!(0, utils_1.shouldHideReimbursableDefaultVendor)(false, config) ? [CONST_1.default.NETSUITE_CONFIG.DEFAULT_VENDOR] : []), true), (!(0, utils_1.shouldHideNonReimbursableJournalPostingAccount)(false, config) ? [CONST_1.default.NETSUITE_CONFIG.PAYABLE_ACCT] : []), true), (!(0, utils_1.shouldHideReimbursableJournalPostingAccount)(false, config) ? [CONST_1.default.NETSUITE_CONFIG.REIMBURSABLE_PAYABLE_ACCOUNT] : []), true), (!(0, utils_1.shouldHideJournalPostingPreference)(false, config) ? [CONST_1.default.NETSUITE_CONFIG.JOURNAL_POSTING_PREFERENCE] : []), true),
        },
        {
            type: 'divider',
            key: 'divider2',
        },
        {
            type: 'menuitem',
            title: selectedReceivable ? selectedReceivable.name : undefined,
            description: translate('workspace.netsuite.exportInvoices'),
            onPress: !policyID ? undefined : function () { return Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_NETSUITE_RECEIVABLE_ACCOUNT_SELECT.getRoute(policyID, Navigation_1.default.getActiveRoute())); },
            subscribedSettings: [CONST_1.default.NETSUITE_CONFIG.RECEIVABLE_ACCOUNT],
        },
        {
            type: 'menuitem',
            title: invoiceItemValue,
            description: translate('workspace.netsuite.invoiceItem.label'),
            onPress: !policyID ? undefined : function () { return Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_NETSUITE_INVOICE_ITEM_PREFERENCE_SELECT.getRoute(policyID, Navigation_1.default.getActiveRoute())); },
            subscribedSettings: __spreadArray([CONST_1.default.NETSUITE_CONFIG.INVOICE_ITEM_PREFERENCE], ((0, utils_1.shouldShowInvoiceItemMenuItem)(config) ? [CONST_1.default.NETSUITE_CONFIG.INVOICE_ITEM] : []), true),
        },
        {
            type: 'divider',
            key: 'divider3',
        },
        {
            type: 'menuitem',
            title: selectedProvTaxPostingAccount ? selectedProvTaxPostingAccount.name : undefined,
            description: translate('workspace.netsuite.journalEntriesProvTaxPostingAccount'),
            onPress: !policyID ? undefined : function () { return Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_NETSUITE_PROVINCIAL_TAX_POSTING_ACCOUNT_SELECT.getRoute(policyID)); },
            subscribedSettings: [CONST_1.default.NETSUITE_CONFIG.PROVINCIAL_TAX_POSTING_ACCOUNT],
            shouldHide: (0, utils_1.shouldHideProvincialTaxPostingAccountSelect)(selectedSubsidiary, config),
        },
        {
            type: 'menuitem',
            title: selectedTaxPostingAccount ? selectedTaxPostingAccount.name : undefined,
            description: translate('workspace.netsuite.journalEntriesTaxPostingAccount'),
            onPress: !policyID ? undefined : function () { return Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_NETSUITE_TAX_POSTING_ACCOUNT_SELECT.getRoute(policyID)); },
            subscribedSettings: [CONST_1.default.NETSUITE_CONFIG.TAX_POSTING_ACCOUNT],
            shouldHide: (0, utils_1.shouldHideTaxPostingAccountSelect)(isBetaEnabled(CONST_1.default.BETAS.NETSUITE_USA_TAX), selectedSubsidiary, config),
        },
        {
            type: 'toggle',
            title: translate('workspace.netsuite.foreignCurrencyAmount'),
            isActive: !!(config === null || config === void 0 ? void 0 : config.allowForeignCurrency),
            switchAccessibilityLabel: translate('workspace.netsuite.foreignCurrencyAmount'),
            onToggle: function () { return (!policyID ? null : (0, NetSuiteCommands_1.updateNetSuiteAllowForeignCurrency)(policyID, !(config === null || config === void 0 ? void 0 : config.allowForeignCurrency), config === null || config === void 0 ? void 0 : config.allowForeignCurrency)); },
            onCloseError: !policyID ? undefined : function () { return (0, Policy_1.clearNetSuiteErrorField)(policyID, CONST_1.default.NETSUITE_CONFIG.ALLOW_FOREIGN_CURRENCY); },
            pendingAction: (0, PolicyUtils_1.settingsPendingAction)([CONST_1.default.NETSUITE_CONFIG.ALLOW_FOREIGN_CURRENCY], config === null || config === void 0 ? void 0 : config.pendingFields),
            errors: (0, ErrorUtils_1.getLatestErrorField)(config, CONST_1.default.NETSUITE_CONFIG.ALLOW_FOREIGN_CURRENCY),
            shouldHide: (0, utils_1.shouldHideExportForeignCurrencyAmount)(config),
        },
        {
            type: 'toggle',
            title: translate('workspace.netsuite.exportToNextOpenPeriod'),
            isActive: !!(config === null || config === void 0 ? void 0 : config.exportToNextOpenPeriod),
            switchAccessibilityLabel: translate('workspace.netsuite.exportToNextOpenPeriod'),
            onCloseError: !policyID ? undefined : function () { return (0, Policy_1.clearNetSuiteErrorField)(policyID, CONST_1.default.NETSUITE_CONFIG.EXPORT_TO_NEXT_OPEN_PERIOD); },
            onToggle: function () { var _a; return (!policyID ? null : (0, NetSuiteCommands_1.updateNetSuiteExportToNextOpenPeriod)(policyID, !(config === null || config === void 0 ? void 0 : config.exportToNextOpenPeriod), (_a = config === null || config === void 0 ? void 0 : config.exportToNextOpenPeriod) !== null && _a !== void 0 ? _a : false)); },
            pendingAction: (0, PolicyUtils_1.settingsPendingAction)([CONST_1.default.NETSUITE_CONFIG.EXPORT_TO_NEXT_OPEN_PERIOD], config === null || config === void 0 ? void 0 : config.pendingFields),
            errors: (0, ErrorUtils_1.getLatestErrorField)(config, CONST_1.default.NETSUITE_CONFIG.EXPORT_TO_NEXT_OPEN_PERIOD),
        },
    ];
    return (<ConnectionLayout_1.default displayName={NetSuiteExportConfigurationPage.displayName} headerTitle="workspace.accounting.export" headerSubtitle={(_l = config === null || config === void 0 ? void 0 : config.subsidiary) !== null && _l !== void 0 ? _l : ''} title="workspace.netsuite.exportDescription" accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN]} policyID={policyID} onBackButtonPress={goBack} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED} contentContainerStyle={styles.pb2} titleStyle={styles.ph5} connectionName={CONST_1.default.POLICY.CONNECTIONS.NAME.NETSUITE}>
            {menuItems
            .filter(function (item) { return !item.shouldHide; })
            .map(function (item) {
            switch (item.type) {
                case 'divider':
                    return (<react_native_1.View key={item.key} style={styles.dividerLine}/>);
                case 'toggle':
                    // eslint-disable-next-line no-case-declarations
                    var type = item.type, shouldHide = item.shouldHide, rest = __rest(item, ["type", "shouldHide"]);
                    return (<ToggleSettingsOptionRow_1.default key={rest.title} 
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...rest} wrapperStyle={[styles.mv3, styles.ph5]}/>);
                default:
                    return (<OfflineWithFeedback_1.default key={item.description} pendingAction={(0, PolicyUtils_1.settingsPendingAction)(item.subscribedSettings, config === null || config === void 0 ? void 0 : config.pendingFields)}>
                                    <MenuItemWithTopDescription_1.default title={item.title} description={item.description} shouldShowRightIcon onPress={item === null || item === void 0 ? void 0 : item.onPress} brickRoadIndicator={(0, PolicyUtils_1.areSettingsInErrorFields)(item.subscribedSettings, config === null || config === void 0 ? void 0 : config.errorFields) ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}/>
                                </OfflineWithFeedback_1.default>);
            }
        })}
        </ConnectionLayout_1.default>);
}
NetSuiteExportConfigurationPage.displayName = 'NetSuiteExportConfigurationPage';
exports.default = (0, withPolicyConnections_1.default)(NetSuiteExportConfigurationPage);
