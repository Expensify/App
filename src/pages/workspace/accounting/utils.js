"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
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
exports.getAccountingIntegrationData = getAccountingIntegrationData;
exports.getSynchronizationErrorMessage = getSynchronizationErrorMessage;
exports.getQBDReimbursableAccounts = getQBDReimbursableAccounts;
var react_1 = require("react");
var ConnectToNetSuiteFlow_1 = require("@components/ConnectToNetSuiteFlow");
var ConnectToQuickbooksDesktopFlow_1 = require("@components/ConnectToQuickbooksDesktopFlow");
var ConnectToQuickbooksOnlineFlow_1 = require("@components/ConnectToQuickbooksOnlineFlow");
var ConnectToSageIntacctFlow_1 = require("@components/ConnectToSageIntacctFlow");
var ConnectToXeroFlow_1 = require("@components/ConnectToXeroFlow");
var Expensicons = require("@components/Icon/Expensicons");
var Text_1 = require("@components/Text");
var TextLink_1 = require("@components/TextLink");
var connections_1 = require("@libs/actions/connections");
var Policy_1 = require("@libs/actions/Policy/Policy");
var Localize_1 = require("@libs/Localize");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var Navigation_1 = require("@navigation/Navigation");
var Xero_1 = require("@userActions/connections/Xero");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var utils_1 = require("./netsuite/utils");
function getAccountingIntegrationData(connectionName, policyID, translate, policy, key, integrationToDisconnect, shouldDisconnectIntegrationBeforeConnecting, canUseNetSuiteUSATax, isSmallScreenWidth) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16, _17, _18, _19, _20, _21, _22, _23, _24, _25, _26, _27, _28, _29;
    var qboConfig = (_b = (_a = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _a === void 0 ? void 0 : _a.quickbooksOnline) === null || _b === void 0 ? void 0 : _b.config;
    var netsuiteConfig = (_e = (_d = (_c = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _c === void 0 ? void 0 : _c.netsuite) === null || _d === void 0 ? void 0 : _d.options) === null || _e === void 0 ? void 0 : _e.config;
    var netsuiteSelectedSubsidiary = ((_k = (_j = (_h = (_g = (_f = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _f === void 0 ? void 0 : _f.netsuite) === null || _g === void 0 ? void 0 : _g.options) === null || _h === void 0 ? void 0 : _h.data) === null || _j === void 0 ? void 0 : _j.subsidiaryList) !== null && _k !== void 0 ? _k : []).find(function (subsidiary) { return subsidiary.internalID === (netsuiteConfig === null || netsuiteConfig === void 0 ? void 0 : netsuiteConfig.subsidiaryID); });
    var hasPoliciesConnectedToSageIntacct = !!(0, Policy_1.getAdminPoliciesConnectedToSageIntacct)().length;
    var getBackToAfterWorkspaceUpgradeRouteForIntacct = function () {
        if (integrationToDisconnect) {
            return ROUTES_1.default.POLICY_ACCOUNTING.getRoute(policyID, connectionName, integrationToDisconnect, shouldDisconnectIntegrationBeforeConnecting);
        }
        if (hasPoliciesConnectedToSageIntacct) {
            return ROUTES_1.default.POLICY_ACCOUNTING_SAGE_INTACCT_EXISTING_CONNECTIONS.getRoute(policyID);
        }
        return ROUTES_1.default.POLICY_ACCOUNTING_SAGE_INTACCT_PREREQUISITES.getRoute(policyID);
    };
    var getBackToAfterWorkspaceUpgradeRouteForQBD = function () {
        if (integrationToDisconnect) {
            return ROUTES_1.default.POLICY_ACCOUNTING.getRoute(policyID, connectionName, integrationToDisconnect, shouldDisconnectIntegrationBeforeConnecting);
        }
        if (isSmallScreenWidth) {
            return ROUTES_1.default.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_SETUP_REQUIRED_DEVICE_MODAL.getRoute(policyID);
        }
        return ROUTES_1.default.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_SETUP_MODAL.getRoute(policyID);
    };
    switch (connectionName) {
        case CONST_1.default.POLICY.CONNECTIONS.NAME.QBO:
            return {
                title: translate('workspace.accounting.qbo'),
                icon: Expensicons.QBOSquare,
                setupConnectionFlow: (<ConnectToQuickbooksOnlineFlow_1.default policyID={policyID} key={key}/>),
                onImportPagePress: function () { return Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_IMPORT.getRoute(policyID)); },
                subscribedImportSettings: [
                    CONST_1.default.QUICKBOOKS_CONFIG.ENABLE_NEW_CATEGORIES,
                    CONST_1.default.QUICKBOOKS_CONFIG.SYNC_CLASSES,
                    CONST_1.default.QUICKBOOKS_CONFIG.SYNC_CUSTOMERS,
                    CONST_1.default.QUICKBOOKS_CONFIG.SYNC_LOCATIONS,
                    CONST_1.default.QUICKBOOKS_CONFIG.SYNC_TAX,
                ],
                onExportPagePress: function () { return Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_EXPORT.getRoute(policyID)); },
                subscribedExportSettings: __spreadArray(__spreadArray([
                    CONST_1.default.QUICKBOOKS_CONFIG.EXPORT,
                    CONST_1.default.QUICKBOOKS_CONFIG.EXPORT_DATE,
                    CONST_1.default.QUICKBOOKS_CONFIG.REIMBURSABLE_EXPENSES_EXPORT_DESTINATION,
                    CONST_1.default.QUICKBOOKS_CONFIG.REIMBURSABLE_EXPENSES_ACCOUNT,
                    CONST_1.default.QUICKBOOKS_CONFIG.RECEIVABLE_ACCOUNT,
                    CONST_1.default.QUICKBOOKS_CONFIG.NON_REIMBURSABLE_EXPENSES_EXPORT_DESTINATION,
                    CONST_1.default.QUICKBOOKS_CONFIG.NON_REIMBURSABLE_EXPENSE_ACCOUNT
                ], ((qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.nonReimbursableExpensesExportDestination) === CONST_1.default.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.VENDOR_BILL
                    ? [CONST_1.default.QUICKBOOKS_CONFIG.AUTO_CREATE_VENDOR]
                    : []), true), ((qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.nonReimbursableExpensesExportDestination) === CONST_1.default.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.VENDOR_BILL &&
                    ((_o = (_m = (_l = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _l === void 0 ? void 0 : _l.quickbooksOnline) === null || _m === void 0 ? void 0 : _m.config) === null || _o === void 0 ? void 0 : _o.autoCreateVendor)
                    ? [CONST_1.default.QUICKBOOKS_CONFIG.NON_REIMBURSABLE_BILL_DEFAULT_VENDOR]
                    : []), true),
                onCardReconciliationPagePress: function () { return Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_ACCOUNTING_CARD_RECONCILIATION.getRoute(policyID, CONST_1.default.POLICY.CONNECTIONS.ROUTE.QBO)); },
                onAdvancedPagePress: function () { return Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_ACCOUNTING_QUICKBOOKS_ONLINE_ADVANCED.getRoute(policyID)); },
                subscribedAdvancedSettings: __spreadArray([
                    CONST_1.default.QUICKBOOKS_CONFIG.COLLECTION_ACCOUNT_ID,
                    CONST_1.default.QUICKBOOKS_CONFIG.AUTO_SYNC,
                    CONST_1.default.QUICKBOOKS_CONFIG.SYNC_PEOPLE,
                    CONST_1.default.QUICKBOOKS_CONFIG.AUTO_CREATE_VENDOR
                ], ((qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.collectionAccountID) ? [CONST_1.default.QUICKBOOKS_CONFIG.REIMBURSEMENT_ACCOUNT_ID, CONST_1.default.QUICKBOOKS_CONFIG.COLLECTION_ACCOUNT_ID] : []), true),
                pendingFields: __assign(__assign({}, qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.pendingFields), (_r = (_q = (_p = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _p === void 0 ? void 0 : _p.quickbooksOnline) === null || _q === void 0 ? void 0 : _q.config) === null || _r === void 0 ? void 0 : _r.pendingFields),
                errorFields: __assign(__assign({}, qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.errorFields), (_u = (_t = (_s = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _s === void 0 ? void 0 : _s.quickbooksOnline) === null || _t === void 0 ? void 0 : _t.config) === null || _u === void 0 ? void 0 : _u.errorFields),
            };
        case CONST_1.default.POLICY.CONNECTIONS.NAME.XERO:
            return {
                title: translate('workspace.accounting.xero'),
                icon: Expensicons.XeroSquare,
                setupConnectionFlow: (<ConnectToXeroFlow_1.default policyID={policyID} key={key}/>),
                onImportPagePress: function () { return Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_XERO_IMPORT.getRoute(policyID)); },
                subscribedImportSettings: __spreadArray([
                    CONST_1.default.XERO_CONFIG.ENABLE_NEW_CATEGORIES,
                    CONST_1.default.XERO_CONFIG.IMPORT_TRACKING_CATEGORIES,
                    CONST_1.default.XERO_CONFIG.IMPORT_CUSTOMERS,
                    CONST_1.default.XERO_CONFIG.IMPORT_TAX_RATES
                ], (0, Xero_1.getTrackingCategories)(policy).map(function (category) { return "".concat(CONST_1.default.XERO_CONFIG.TRACKING_CATEGORY_PREFIX).concat(category.id); }), true),
                onExportPagePress: function () { return Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_XERO_EXPORT.getRoute(policyID)); },
                subscribedExportSettings: [CONST_1.default.XERO_CONFIG.EXPORTER, CONST_1.default.XERO_CONFIG.BILL_DATE, CONST_1.default.XERO_CONFIG.BILL_STATUS, CONST_1.default.XERO_CONFIG.NON_REIMBURSABLE_ACCOUNT],
                onCardReconciliationPagePress: function () { return Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_ACCOUNTING_CARD_RECONCILIATION.getRoute(policyID, CONST_1.default.POLICY.CONNECTIONS.ROUTE.XERO)); },
                onAdvancedPagePress: function () { return Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_XERO_ADVANCED.getRoute(policyID)); },
                subscribedAdvancedSettings: [
                    CONST_1.default.XERO_CONFIG.ENABLED,
                    CONST_1.default.XERO_CONFIG.SYNC_REIMBURSED_REPORTS,
                    CONST_1.default.XERO_CONFIG.REIMBURSEMENT_ACCOUNT_ID,
                    CONST_1.default.XERO_CONFIG.INVOICE_COLLECTIONS_ACCOUNT_ID,
                ],
                pendingFields: (_x = (_w = (_v = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _v === void 0 ? void 0 : _v.xero) === null || _w === void 0 ? void 0 : _w.config) === null || _x === void 0 ? void 0 : _x.pendingFields,
                errorFields: (_0 = (_z = (_y = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _y === void 0 ? void 0 : _y.xero) === null || _z === void 0 ? void 0 : _z.config) === null || _0 === void 0 ? void 0 : _0.errorFields,
            };
        case CONST_1.default.POLICY.CONNECTIONS.NAME.NETSUITE:
            return {
                title: translate('workspace.accounting.netsuite'),
                icon: Expensicons.NetSuiteSquare,
                setupConnectionFlow: (<ConnectToNetSuiteFlow_1.default policyID={policyID} key={key}/>),
                onImportPagePress: function () { return Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_NETSUITE_IMPORT.getRoute(policyID)); },
                subscribedImportSettings: __spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray([], CONST_1.default.NETSUITE_CONFIG.IMPORT_FIELDS, true), [
                    CONST_1.default.NETSUITE_CONFIG.SYNC_OPTIONS.CUSTOMER_MAPPINGS.CUSTOMERS,
                    CONST_1.default.NETSUITE_CONFIG.SYNC_OPTIONS.CUSTOMER_MAPPINGS.JOBS,
                    CONST_1.default.NETSUITE_CONFIG.SYNC_OPTIONS.CROSS_SUBSIDIARY_CUSTOMERS
                ], false), ((0, PolicyUtils_1.canUseTaxNetSuite)(canUseNetSuiteUSATax, netsuiteSelectedSubsidiary === null || netsuiteSelectedSubsidiary === void 0 ? void 0 : netsuiteSelectedSubsidiary.country) ? [CONST_1.default.NETSUITE_CONFIG.SYNC_OPTIONS.SYNC_TAX] : []), true), (0, utils_1.getImportCustomFieldsSettings)(CONST_1.default.NETSUITE_CONFIG.IMPORT_CUSTOM_FIELDS.CUSTOM_SEGMENTS, netsuiteConfig), true), (0, utils_1.getImportCustomFieldsSettings)(CONST_1.default.NETSUITE_CONFIG.IMPORT_CUSTOM_FIELDS.CUSTOM_LISTS, netsuiteConfig), true),
                onExportPagePress: function () { return Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_NETSUITE_EXPORT.getRoute(policyID)); },
                subscribedExportSettings: __spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray([
                    CONST_1.default.NETSUITE_CONFIG.EXPORTER,
                    CONST_1.default.NETSUITE_CONFIG.EXPORT_DATE,
                    CONST_1.default.NETSUITE_CONFIG.REIMBURSABLE_EXPENSES_EXPORT_DESTINATION
                ], (!(0, utils_1.shouldHideReimbursableDefaultVendor)(true, netsuiteConfig) ? [CONST_1.default.NETSUITE_CONFIG.DEFAULT_VENDOR] : []), true), (!(0, utils_1.shouldHideNonReimbursableJournalPostingAccount)(true, netsuiteConfig) ? [CONST_1.default.NETSUITE_CONFIG.PAYABLE_ACCT] : []), true), (!(0, utils_1.shouldHideReimbursableJournalPostingAccount)(true, netsuiteConfig) ? [CONST_1.default.NETSUITE_CONFIG.REIMBURSABLE_PAYABLE_ACCOUNT] : []), true), (!(0, utils_1.shouldHideJournalPostingPreference)(true, netsuiteConfig) ? [CONST_1.default.NETSUITE_CONFIG.JOURNAL_POSTING_PREFERENCE] : []), true), [
                    CONST_1.default.NETSUITE_CONFIG.NON_REIMBURSABLE_EXPENSES_EXPORT_DESTINATION
                ], false), (!(0, utils_1.shouldHideReimbursableDefaultVendor)(false, netsuiteConfig) ? [CONST_1.default.NETSUITE_CONFIG.DEFAULT_VENDOR] : []), true), (!(0, utils_1.shouldHideNonReimbursableJournalPostingAccount)(false, netsuiteConfig) ? [CONST_1.default.NETSUITE_CONFIG.PAYABLE_ACCT] : []), true), (!(0, utils_1.shouldHideReimbursableJournalPostingAccount)(false, netsuiteConfig) ? [CONST_1.default.NETSUITE_CONFIG.REIMBURSABLE_PAYABLE_ACCOUNT] : []), true), (!(0, utils_1.shouldHideJournalPostingPreference)(false, netsuiteConfig) ? [CONST_1.default.NETSUITE_CONFIG.JOURNAL_POSTING_PREFERENCE] : []), true), [
                    CONST_1.default.NETSUITE_CONFIG.RECEIVABLE_ACCOUNT,
                    CONST_1.default.NETSUITE_CONFIG.INVOICE_ITEM_PREFERENCE
                ], false), ((0, utils_1.shouldShowInvoiceItemMenuItem)(netsuiteConfig) ? [CONST_1.default.NETSUITE_CONFIG.INVOICE_ITEM] : []), true), (!(0, utils_1.shouldHideProvincialTaxPostingAccountSelect)(netsuiteSelectedSubsidiary, netsuiteConfig) ? [CONST_1.default.NETSUITE_CONFIG.PROVINCIAL_TAX_POSTING_ACCOUNT] : []), true), (!(0, utils_1.shouldHideTaxPostingAccountSelect)(canUseNetSuiteUSATax, netsuiteSelectedSubsidiary, netsuiteConfig) ? [CONST_1.default.NETSUITE_CONFIG.TAX_POSTING_ACCOUNT] : []), true), (!(0, utils_1.shouldHideExportForeignCurrencyAmount)(netsuiteConfig) ? [CONST_1.default.NETSUITE_CONFIG.ALLOW_FOREIGN_CURRENCY] : []), true), [
                    CONST_1.default.NETSUITE_CONFIG.EXPORT_TO_NEXT_OPEN_PERIOD,
                ], false),
                onCardReconciliationPagePress: function () { return Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_ACCOUNTING_CARD_RECONCILIATION.getRoute(policyID, CONST_1.default.POLICY.CONNECTIONS.ROUTE.NETSUITE)); },
                onAdvancedPagePress: function () { return Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_NETSUITE_ADVANCED.getRoute(policyID)); },
                subscribedAdvancedSettings: __spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray([
                    CONST_1.default.NETSUITE_CONFIG.AUTO_SYNC,
                    CONST_1.default.NETSUITE_CONFIG.ACCOUNTING_METHOD
                ], (!(0, utils_1.shouldHideReimbursedReportsSection)(netsuiteConfig)
                    ? [CONST_1.default.NETSUITE_CONFIG.SYNC_OPTIONS.SYNC_REIMBURSED_REPORTS, CONST_1.default.NETSUITE_CONFIG.REIMBURSEMENT_ACCOUNT_ID, CONST_1.default.NETSUITE_CONFIG.COLLECTION_ACCOUNT]
                    : []), true), [
                    CONST_1.default.NETSUITE_CONFIG.SYNC_OPTIONS.SYNC_PEOPLE,
                    CONST_1.default.NETSUITE_CONFIG.AUTO_CREATE_ENTITIES,
                    CONST_1.default.NETSUITE_CONFIG.SYNC_OPTIONS.ENABLE_NEW_CATEGORIES
                ], false), (!(0, utils_1.shouldHideReportsExportTo)(netsuiteConfig) ? [CONST_1.default.NETSUITE_CONFIG.SYNC_OPTIONS.EXPORT_REPORTS_TO] : []), true), (!(0, utils_1.shouldHideExportVendorBillsTo)(netsuiteConfig) ? [CONST_1.default.NETSUITE_CONFIG.SYNC_OPTIONS.EXPORT_VENDOR_BILLS_TO] : []), true), (!(0, utils_1.shouldHideExportJournalsTo)(netsuiteConfig) ? [CONST_1.default.NETSUITE_CONFIG.SYNC_OPTIONS.EXPORT_JOURNALS_TO] : []), true), [
                    CONST_1.default.NETSUITE_CONFIG.APPROVAL_ACCOUNT,
                    CONST_1.default.NETSUITE_CONFIG.CUSTOM_FORM_ID_ENABLED
                ], false), (!(0, utils_1.shouldHideCustomFormIDOptions)(netsuiteConfig)
                    ? [CONST_1.default.NETSUITE_CONFIG.CUSTOM_FORM_ID_TYPE.REIMBURSABLE, CONST_1.default.NETSUITE_CONFIG.CUSTOM_FORM_ID_TYPE.NON_REIMBURSABLE]
                    : []), true),
                workspaceUpgradeNavigationDetails: {
                    integrationAlias: CONST_1.default.UPGRADE_FEATURE_INTRO_MAPPING.netsuite.alias,
                    backToAfterWorkspaceUpgradeRoute: integrationToDisconnect
                        ? ROUTES_1.default.POLICY_ACCOUNTING.getRoute(policyID, connectionName, integrationToDisconnect, shouldDisconnectIntegrationBeforeConnecting)
                        : ROUTES_1.default.POLICY_ACCOUNTING_NETSUITE_TOKEN_INPUT.getRoute(policyID),
                },
                pendingFields: __assign(__assign(__assign({}, netsuiteConfig === null || netsuiteConfig === void 0 ? void 0 : netsuiteConfig.pendingFields), (_3 = (_2 = (_1 = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _1 === void 0 ? void 0 : _1.netsuite) === null || _2 === void 0 ? void 0 : _2.config) === null || _3 === void 0 ? void 0 : _3.pendingFields), (_7 = (_6 = (_5 = (_4 = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _4 === void 0 ? void 0 : _4.netsuite) === null || _5 === void 0 ? void 0 : _5.options) === null || _6 === void 0 ? void 0 : _6.config) === null || _7 === void 0 ? void 0 : _7.pendingFields),
                errorFields: __assign(__assign(__assign({}, netsuiteConfig === null || netsuiteConfig === void 0 ? void 0 : netsuiteConfig.errorFields), (_10 = (_9 = (_8 = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _8 === void 0 ? void 0 : _8.netsuite) === null || _9 === void 0 ? void 0 : _9.config) === null || _10 === void 0 ? void 0 : _10.errorFields), (_14 = (_13 = (_12 = (_11 = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _11 === void 0 ? void 0 : _11.netsuite) === null || _12 === void 0 ? void 0 : _12.options) === null || _13 === void 0 ? void 0 : _13.config) === null || _14 === void 0 ? void 0 : _14.errorFields),
            };
        case CONST_1.default.POLICY.CONNECTIONS.NAME.SAGE_INTACCT:
            return {
                title: translate('workspace.accounting.intacct'),
                icon: Expensicons.IntacctSquare,
                setupConnectionFlow: (<ConnectToSageIntacctFlow_1.default policyID={policyID} key={key}/>),
                onImportPagePress: function () { return Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_SAGE_INTACCT_IMPORT.getRoute(policyID)); },
                subscribedImportSettings: __spreadArray(__spreadArray(__spreadArray([
                    CONST_1.default.SAGE_INTACCT_CONFIG.SYNC_ITEMS
                ], Object.values(CONST_1.default.SAGE_INTACCT_CONFIG.MAPPINGS), true), [
                    CONST_1.default.SAGE_INTACCT_CONFIG.TAX
                ], false), ((_19 = (_18 = (_17 = (_16 = (_15 = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _15 === void 0 ? void 0 : _15.intacct) === null || _16 === void 0 ? void 0 : _16.config) === null || _17 === void 0 ? void 0 : _17.mappings) === null || _18 === void 0 ? void 0 : _18.dimensions) !== null && _19 !== void 0 ? _19 : []).map(function (dimension) { return "".concat(CONST_1.default.SAGE_INTACCT_CONFIG.DIMENSION_PREFIX).concat(dimension.dimension); }), true),
                onExportPagePress: function () { return Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_SAGE_INTACCT_EXPORT.getRoute(policyID)); },
                subscribedExportSettings: [
                    CONST_1.default.SAGE_INTACCT_CONFIG.EXPORTER,
                    CONST_1.default.SAGE_INTACCT_CONFIG.EXPORT_DATE,
                    CONST_1.default.SAGE_INTACCT_CONFIG.REIMBURSABLE,
                    CONST_1.default.SAGE_INTACCT_CONFIG.REIMBURSABLE_VENDOR,
                    CONST_1.default.SAGE_INTACCT_CONFIG.NON_REIMBURSABLE,
                    CONST_1.default.SAGE_INTACCT_CONFIG.NON_REIMBURSABLE_ACCOUNT,
                    ((_23 = (_22 = (_21 = (_20 = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _20 === void 0 ? void 0 : _20.intacct) === null || _21 === void 0 ? void 0 : _21.config) === null || _22 === void 0 ? void 0 : _22.export) === null || _23 === void 0 ? void 0 : _23.nonReimbursable) === CONST_1.default.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL
                        ? CONST_1.default.SAGE_INTACCT_CONFIG.NON_REIMBURSABLE_VENDOR
                        : CONST_1.default.SAGE_INTACCT_CONFIG.NON_REIMBURSABLE_CREDIT_CARD_VENDOR,
                ],
                onCardReconciliationPagePress: function () { return Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_ACCOUNTING_CARD_RECONCILIATION.getRoute(policyID, CONST_1.default.POLICY.CONNECTIONS.ROUTE.SAGE_INTACCT)); },
                onAdvancedPagePress: function () { return Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_SAGE_INTACCT_ADVANCED.getRoute(policyID)); },
                subscribedAdvancedSettings: [
                    CONST_1.default.SAGE_INTACCT_CONFIG.AUTO_SYNC_ENABLED,
                    CONST_1.default.SAGE_INTACCT_CONFIG.IMPORT_EMPLOYEES,
                    CONST_1.default.SAGE_INTACCT_CONFIG.APPROVAL_MODE,
                    CONST_1.default.SAGE_INTACCT_CONFIG.SYNC_REIMBURSED_REPORTS,
                    CONST_1.default.SAGE_INTACCT_CONFIG.REIMBURSEMENT_ACCOUNT_ID,
                ],
                workspaceUpgradeNavigationDetails: {
                    integrationAlias: CONST_1.default.UPGRADE_FEATURE_INTRO_MAPPING.intacct.alias,
                    backToAfterWorkspaceUpgradeRoute: getBackToAfterWorkspaceUpgradeRouteForIntacct(),
                },
                pendingFields: (_26 = (_25 = (_24 = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _24 === void 0 ? void 0 : _24.intacct) === null || _25 === void 0 ? void 0 : _25.config) === null || _26 === void 0 ? void 0 : _26.pendingFields,
                errorFields: (_29 = (_28 = (_27 = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _27 === void 0 ? void 0 : _27.intacct) === null || _28 === void 0 ? void 0 : _28.config) === null || _29 === void 0 ? void 0 : _29.errorFields,
            };
        case CONST_1.default.POLICY.CONNECTIONS.NAME.QBD:
            return {
                title: translate('workspace.accounting.qbd'),
                icon: Expensicons.QBDSquare,
                setupConnectionFlow: (<ConnectToQuickbooksDesktopFlow_1.default policyID={policyID} key={key}/>),
                onImportPagePress: function () { return Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_IMPORT.getRoute(policyID)); },
                onExportPagePress: function () { return Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_EXPORT.getRoute(policyID)); },
                onCardReconciliationPagePress: function () { },
                onAdvancedPagePress: function () { return Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_ACCOUNTING_QUICKBOOKS_DESKTOP_ADVANCED.getRoute(policyID)); },
                subscribedImportSettings: [
                    CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.ENABLE_NEW_CATEGORIES,
                    CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.MAPPINGS.CLASSES,
                    CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.MAPPINGS.CUSTOMERS,
                    CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.IMPORT_ITEMS,
                ],
                subscribedExportSettings: [
                    CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.EXPORT_DATE,
                    CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.EXPORTER,
                    CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.REIMBURSABLE,
                    CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.REIMBURSABLE_ACCOUNT,
                    CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.MARK_CHECKS_TO_BE_PRINTED,
                    CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.NON_REIMBURSABLE,
                    CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.NON_REIMBURSABLE_ACCOUNT,
                    CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.NON_REIMBURSABLE_BILL_DEFAULT_VENDOR,
                    CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.SHOULD_AUTO_CREATE_VENDOR,
                ],
                subscribedAdvancedSettings: [CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.SHOULD_AUTO_CREATE_VENDOR, CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.AUTO_SYNC],
                workspaceUpgradeNavigationDetails: {
                    integrationAlias: CONST_1.default.UPGRADE_FEATURE_INTRO_MAPPING.quickbooksDesktop.alias,
                    backToAfterWorkspaceUpgradeRoute: getBackToAfterWorkspaceUpgradeRouteForQBD(),
                },
            };
        default:
            return undefined;
    }
}
function getSynchronizationErrorMessage(policy, connectionName, isSyncInProgress, translate, styles) {
    var _a, _b, _c, _d;
    if ((0, connections_1.isAuthenticationError)(policy, connectionName)) {
        return (<Text_1.default style={[styles === null || styles === void 0 ? void 0 : styles.formError]}>
                <Text_1.default style={[styles === null || styles === void 0 ? void 0 : styles.formError]}>{translate('workspace.common.authenticationError', { connectionName: CONST_1.default.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] })} </Text_1.default>
                {connectionName in CONST_1.default.POLICY.CONNECTIONS.AUTH_HELP_LINKS && (<TextLink_1.default style={[styles === null || styles === void 0 ? void 0 : styles.link, styles === null || styles === void 0 ? void 0 : styles.fontSizeLabel]} href={CONST_1.default.POLICY.CONNECTIONS.AUTH_HELP_LINKS[connectionName]}>
                        {translate('workspace.common.learnMore')}
                    </TextLink_1.default>)}
            </Text_1.default>);
    }
    var syncError = (0, Localize_1.translateLocal)('workspace.accounting.syncError', { connectionName: connectionName });
    var connection = (_a = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _a === void 0 ? void 0 : _a[connectionName];
    if (isSyncInProgress || (0, EmptyObject_1.isEmptyObject)(connection === null || connection === void 0 ? void 0 : connection.lastSync) || ((_b = connection === null || connection === void 0 ? void 0 : connection.lastSync) === null || _b === void 0 ? void 0 : _b.isSuccessful) !== false || !((_c = connection === null || connection === void 0 ? void 0 : connection.lastSync) === null || _c === void 0 ? void 0 : _c.errorDate)) {
        return;
    }
    return "".concat(syncError, " (\"").concat((_d = connection === null || connection === void 0 ? void 0 : connection.lastSync) === null || _d === void 0 ? void 0 : _d.errorMessage, "\")");
}
function getQBDReimbursableAccounts(quickbooksDesktop, reimbursable) {
    var _a, _b;
    var _c = (_a = quickbooksDesktop === null || quickbooksDesktop === void 0 ? void 0 : quickbooksDesktop.data) !== null && _a !== void 0 ? _a : {}, bankAccounts = _c.bankAccounts, journalEntryAccounts = _c.journalEntryAccounts, payableAccounts = _c.payableAccounts, creditCardAccounts = _c.creditCardAccounts;
    var accounts;
    switch (reimbursable !== null && reimbursable !== void 0 ? reimbursable : (_b = quickbooksDesktop === null || quickbooksDesktop === void 0 ? void 0 : quickbooksDesktop.config) === null || _b === void 0 ? void 0 : _b.export.reimbursable) {
        case CONST_1.default.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK:
            accounts = bankAccounts !== null && bankAccounts !== void 0 ? bankAccounts : [];
            break;
        case CONST_1.default.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY:
            // Journal entry accounts include payable accounts, other current liabilities, and other current assets
            accounts = __spreadArray(__spreadArray([], (payableAccounts !== null && payableAccounts !== void 0 ? payableAccounts : []), true), (journalEntryAccounts !== null && journalEntryAccounts !== void 0 ? journalEntryAccounts : []), true);
            break;
        case CONST_1.default.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL:
            accounts = payableAccounts !== null && payableAccounts !== void 0 ? payableAccounts : [];
            break;
        case CONST_1.default.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD:
            accounts = creditCardAccounts !== null && creditCardAccounts !== void 0 ? creditCardAccounts : [];
            break;
        default:
            accounts = [];
    }
    return accounts;
}
