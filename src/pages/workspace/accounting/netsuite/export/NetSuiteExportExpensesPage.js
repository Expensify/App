"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var ConnectionLayout_1 = require("@components/ConnectionLayout");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var OfflineWithFeedback_1 = require("@components/OfflineWithFeedback");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Policy_1 = require("@libs/actions/Policy/Policy");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var utils_1 = require("@pages/workspace/accounting/netsuite/utils");
var withPolicyConnections_1 = require("@pages/workspace/withPolicyConnections");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
function NetSuiteExportExpensesPage(_a) {
    var _b, _c, _d, _e, _f, _g;
    var policy = _a.policy;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var policyID = policy === null || policy === void 0 ? void 0 : policy.id;
    var route = (0, native_1.useRoute)();
    var params = route.params;
    var isReimbursable = params.expenseType === CONST_1.default.NETSUITE_EXPENSE_TYPE.REIMBURSABLE;
    var config = (_c = (_b = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _b === void 0 ? void 0 : _b.netsuite) === null || _c === void 0 ? void 0 : _c.options.config;
    var exportDestinationSettingName = (0, utils_1.exportExpensesDestinationSettingName)(isReimbursable);
    var exportDestination = config === null || config === void 0 ? void 0 : config[exportDestinationSettingName];
    var helperTextType = isReimbursable ? 'reimbursableDescription' : 'nonReimbursableDescription';
    var _h = (_g = (_f = (_e = (_d = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _d === void 0 ? void 0 : _d.netsuite) === null || _e === void 0 ? void 0 : _e.options) === null || _f === void 0 ? void 0 : _f.data) !== null && _g !== void 0 ? _g : {}, vendors = _h.vendors, payableList = _h.payableList;
    var defaultVendor = (0, react_1.useMemo)(function () { return (0, PolicyUtils_1.findSelectedVendorWithDefaultSelect)(vendors, config === null || config === void 0 ? void 0 : config.defaultVendor); }, [vendors, config === null || config === void 0 ? void 0 : config.defaultVendor]);
    var selectedPayableAccount = (0, react_1.useMemo)(function () { return (0, PolicyUtils_1.findSelectedBankAccountWithDefaultSelect)(payableList, config === null || config === void 0 ? void 0 : config.payableAcct); }, [payableList, config === null || config === void 0 ? void 0 : config.payableAcct]);
    var selectedReimbursablePayableAccount = (0, react_1.useMemo)(function () { return (0, PolicyUtils_1.findSelectedBankAccountWithDefaultSelect)(payableList, config === null || config === void 0 ? void 0 : config.reimbursablePayableAccount); }, [payableList, config === null || config === void 0 ? void 0 : config.reimbursablePayableAccount]);
    var menuItems = [
        {
            description: translate('workspace.accounting.exportAs'),
            onPress: function () {
                if (!policyID) {
                    return;
                }
                Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_NETSUITE_EXPORT_EXPENSES_DESTINATION_SELECT.getRoute(policyID, params.expenseType, Navigation_1.default.getActiveRoute()));
            },
            title: exportDestination ? translate("workspace.netsuite.exportDestination.values.".concat(exportDestination, ".label")) : undefined,
            subscribedSettings: [exportDestinationSettingName],
            onCloseError: function () { return (0, Policy_1.clearNetSuiteErrorField)(policyID, exportDestinationSettingName); },
            helperText: exportDestination ? translate("workspace.netsuite.exportDestination.values.".concat(exportDestination, ".").concat(helperTextType)) : undefined,
            shouldParseHelperText: true,
        },
        {
            description: translate('workspace.accounting.defaultVendor'),
            onPress: function () {
                if (!policyID) {
                    return;
                }
                Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_NETSUITE_EXPORT_EXPENSES_VENDOR_SELECT.getRoute(policyID, params.expenseType, Navigation_1.default.getActiveRoute()));
            },
            title: defaultVendor ? defaultVendor.name : undefined,
            subscribedSettings: [CONST_1.default.NETSUITE_CONFIG.DEFAULT_VENDOR],
            onCloseError: function () { return (0, Policy_1.clearNetSuiteErrorField)(policyID, CONST_1.default.NETSUITE_CONFIG.DEFAULT_VENDOR); },
            shouldHide: (0, utils_1.shouldHideReimbursableDefaultVendor)(isReimbursable, config),
        },
        {
            description: translate('workspace.netsuite.nonReimbursableJournalPostingAccount'),
            onPress: function () {
                if (!policyID) {
                    return;
                }
                Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_NETSUITE_EXPORT_EXPENSES_PAYABLE_ACCOUNT_SELECT.getRoute(policyID, params.expenseType, Navigation_1.default.getActiveRoute()));
            },
            title: selectedPayableAccount ? selectedPayableAccount.name : undefined,
            subscribedSettings: [CONST_1.default.NETSUITE_CONFIG.PAYABLE_ACCT],
            onCloseError: function () { return (0, Policy_1.clearNetSuiteErrorField)(policyID, CONST_1.default.NETSUITE_CONFIG.PAYABLE_ACCT); },
            shouldHide: (0, utils_1.shouldHideNonReimbursableJournalPostingAccount)(isReimbursable, config),
        },
        {
            description: translate('workspace.netsuite.reimbursableJournalPostingAccount'),
            onPress: function () {
                if (!policyID) {
                    return;
                }
                Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_NETSUITE_EXPORT_EXPENSES_PAYABLE_ACCOUNT_SELECT.getRoute(policyID, params.expenseType, Navigation_1.default.getActiveRoute()));
            },
            title: selectedReimbursablePayableAccount ? selectedReimbursablePayableAccount.name : undefined,
            subscribedSettings: [CONST_1.default.NETSUITE_CONFIG.REIMBURSABLE_PAYABLE_ACCOUNT],
            onCloseError: function () { return (0, Policy_1.clearNetSuiteErrorField)(policyID, CONST_1.default.NETSUITE_CONFIG.REIMBURSABLE_PAYABLE_ACCOUNT); },
            shouldHide: (0, utils_1.shouldHideReimbursableJournalPostingAccount)(isReimbursable, config),
        },
        {
            description: translate('workspace.netsuite.journalPostingPreference.label'),
            onPress: function () {
                if (!policyID) {
                    return;
                }
                Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_NETSUITE_EXPORT_EXPENSES_JOURNAL_POSTING_PREFERENCE_SELECT.getRoute(policyID, params.expenseType, Navigation_1.default.getActiveRoute()));
            },
            title: (config === null || config === void 0 ? void 0 : config.journalPostingPreference)
                ? translate("workspace.netsuite.journalPostingPreference.values.".concat(config.journalPostingPreference))
                : translate("workspace.netsuite.journalPostingPreference.values.".concat(CONST_1.default.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_INDIVIDUAL_LINE)),
            subscribedSettings: [CONST_1.default.NETSUITE_CONFIG.JOURNAL_POSTING_PREFERENCE],
            onCloseError: function () { return (0, Policy_1.clearNetSuiteErrorField)(policyID, CONST_1.default.NETSUITE_CONFIG.JOURNAL_POSTING_PREFERENCE); },
            shouldHide: (0, utils_1.shouldHideJournalPostingPreference)(isReimbursable, config),
        },
    ];
    return (<ConnectionLayout_1.default displayName={NetSuiteExportExpensesPage.displayName} onBackButtonPress={function () { var _a; return Navigation_1.default.goBack((_a = params.backTo) !== null && _a !== void 0 ? _a : (policyID && ROUTES_1.default.POLICY_ACCOUNTING_NETSUITE_EXPORT.getRoute(policyID))); }} headerTitle={"workspace.accounting.".concat(isReimbursable ? 'exportOutOfPocket' : 'exportCompanyCard')} accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.CONTROL]} policyID={policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED} contentContainerStyle={styles.pb2} titleStyle={styles.ph5} connectionName={CONST_1.default.POLICY.CONNECTIONS.NAME.NETSUITE}>
            {menuItems
            .filter(function (item) { return !item.shouldHide; })
            .map(function (item) {
            var _a;
            return (<OfflineWithFeedback_1.default key={item.description} pendingAction={(0, PolicyUtils_1.settingsPendingAction)(item.subscribedSettings, config === null || config === void 0 ? void 0 : config.pendingFields)}>
                        <MenuItemWithTopDescription_1.default title={item.title} description={item.description} shouldShowRightIcon onPress={item === null || item === void 0 ? void 0 : item.onPress} brickRoadIndicator={(0, PolicyUtils_1.areSettingsInErrorFields)(item.subscribedSettings, config === null || config === void 0 ? void 0 : config.errorFields) ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined} helperText={item === null || item === void 0 ? void 0 : item.helperText} shouldParseHelperText={(_a = item.shouldParseHelperText) !== null && _a !== void 0 ? _a : false}/>
                    </OfflineWithFeedback_1.default>);
        })}
        </ConnectionLayout_1.default>);
}
NetSuiteExportExpensesPage.displayName = 'NetSuiteExportExpensesPage';
exports.default = (0, withPolicyConnections_1.default)(NetSuiteExportExpensesPage);
