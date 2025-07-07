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
exports.getExportMenuItem = getExportMenuItem;
var PolicyUtils_1 = require("@libs/PolicyUtils");
var Navigation_1 = require("@navigation/Navigation");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
function getExportMenuItem(connectionName, policyID, translate, policy, companyCard, backTo) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16, _17, _18, _19, _20, _21, _22, _23, _24, _25, _26, _27, _28, _29, _30, _31, _32, _33, _34, _35, _36, _37, _38, _39, _40, _41, _42, _43, _44, _45, _46, _47, _48, _49, _50, _51, _52, _53, _54, _55;
    var currentConnectionName = (0, PolicyUtils_1.getCurrentConnectionName)(policy);
    var defaultCard = translate('workspace.moreFeatures.companyCards.defaultCard');
    var defaultMenuItem = {
        name: defaultCard,
        value: defaultCard,
        id: defaultCard,
        currency: '',
    };
    var _56 = (_c = (_b = (_a = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _a === void 0 ? void 0 : _a.quickbooksOnline) === null || _b === void 0 ? void 0 : _b.config) !== null && _c !== void 0 ? _c : {}, nonReimbursableExpensesExportDestination = _56.nonReimbursableExpensesExportDestination, nonReimbursableExpensesAccount = _56.nonReimbursableExpensesAccount, reimbursableExpensesExportDestination = _56.reimbursableExpensesExportDestination, reimbursableExpensesAccount = _56.reimbursableExpensesAccount;
    var exportConfig = ((_f = (_e = (_d = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _d === void 0 ? void 0 : _d.intacct) === null || _e === void 0 ? void 0 : _e.config) !== null && _f !== void 0 ? _f : {}).export;
    var exportConfiguration = ((_j = (_h = (_g = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _g === void 0 ? void 0 : _g.xero) === null || _h === void 0 ? void 0 : _h.config) !== null && _j !== void 0 ? _j : {}).export;
    var config = (_l = (_k = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _k === void 0 ? void 0 : _k.netsuite) === null || _l === void 0 ? void 0 : _l.options.config;
    var bankAccounts = ((_p = (_o = (_m = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _m === void 0 ? void 0 : _m.xero) === null || _o === void 0 ? void 0 : _o.data) !== null && _p !== void 0 ? _p : {}).bankAccounts;
    var _57 = (_s = (_r = (_q = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _q === void 0 ? void 0 : _q.quickbooksOnline) === null || _r === void 0 ? void 0 : _r.data) !== null && _s !== void 0 ? _s : {}, creditCards = _57.creditCards, quickbooksOnlineBankAccounts = _57.bankAccounts;
    var creditCardAccounts = ((_v = (_u = (_t = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _t === void 0 ? void 0 : _t.quickbooksDesktop) === null || _u === void 0 ? void 0 : _u.data) !== null && _v !== void 0 ? _v : {}).creditCardAccounts;
    var exportQBD = ((_y = (_x = (_w = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _w === void 0 ? void 0 : _w.quickbooksDesktop) === null || _x === void 0 ? void 0 : _x.config) !== null && _y !== void 0 ? _y : {}).export;
    switch (connectionName) {
        case CONST_1.default.POLICY.CONNECTIONS.NAME.QBO: {
            var typeNonReimbursable = nonReimbursableExpensesExportDestination ? translate("workspace.qbo.accounts.".concat(nonReimbursableExpensesExportDestination)) : undefined;
            var typeReimbursable = reimbursableExpensesExportDestination ? translate("workspace.qbo.accounts.".concat(reimbursableExpensesExportDestination)) : undefined;
            var type = typeNonReimbursable !== null && typeNonReimbursable !== void 0 ? typeNonReimbursable : typeReimbursable;
            var description = currentConnectionName && type ? translate('workspace.moreFeatures.companyCards.integrationExport', { integration: currentConnectionName, type: type }) : undefined;
            var data = void 0;
            var shouldShowMenuItem = nonReimbursableExpensesExportDestination !== CONST_1.default.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.VENDOR_BILL;
            var title = '';
            var selectedAccount_1 = '';
            var defaultAccount = (_z = nonReimbursableExpensesAccount === null || nonReimbursableExpensesAccount === void 0 ? void 0 : nonReimbursableExpensesAccount.name) !== null && _z !== void 0 ? _z : reimbursableExpensesAccount === null || reimbursableExpensesAccount === void 0 ? void 0 : reimbursableExpensesAccount.name;
            var isDefaultTitle_1 = false;
            var exportType = void 0;
            var qboConfig = nonReimbursableExpensesExportDestination !== null && nonReimbursableExpensesExportDestination !== void 0 ? nonReimbursableExpensesExportDestination : reimbursableExpensesExportDestination;
            switch (qboConfig) {
                case CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY:
                case CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK:
                case CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL:
                case CONST_1.default.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD: {
                    data = creditCards !== null && creditCards !== void 0 ? creditCards : [];
                    isDefaultTitle_1 = !!(defaultAccount &&
                        (!((_0 = companyCard === null || companyCard === void 0 ? void 0 : companyCard.nameValuePairs) === null || _0 === void 0 ? void 0 : _0.quickbooks_online_export_account) ||
                            ((_1 = companyCard === null || companyCard === void 0 ? void 0 : companyCard.nameValuePairs) === null || _1 === void 0 ? void 0 : _1.quickbooks_online_export_account) === CONST_1.default.COMPANY_CARDS.DEFAULT_EXPORT_TYPE));
                    title = isDefaultTitle_1 ? defaultCard : (_2 = companyCard === null || companyCard === void 0 ? void 0 : companyCard.nameValuePairs) === null || _2 === void 0 ? void 0 : _2.quickbooks_online_export_account;
                    selectedAccount_1 = (_4 = (_3 = companyCard === null || companyCard === void 0 ? void 0 : companyCard.nameValuePairs) === null || _3 === void 0 ? void 0 : _3.quickbooks_online_export_account) !== null && _4 !== void 0 ? _4 : defaultAccount;
                    exportType = CONST_1.default.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_QUICKBOOKS_ONLINE_EXPORT_ACCOUNT;
                    break;
                }
                case CONST_1.default.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD: {
                    data = quickbooksOnlineBankAccounts !== null && quickbooksOnlineBankAccounts !== void 0 ? quickbooksOnlineBankAccounts : [];
                    isDefaultTitle_1 = !!(defaultAccount &&
                        (!((_5 = companyCard === null || companyCard === void 0 ? void 0 : companyCard.nameValuePairs) === null || _5 === void 0 ? void 0 : _5.quickbooks_online_export_account_debit) ||
                            ((_6 = companyCard === null || companyCard === void 0 ? void 0 : companyCard.nameValuePairs) === null || _6 === void 0 ? void 0 : _6.quickbooks_online_export_account_debit) === CONST_1.default.COMPANY_CARDS.DEFAULT_EXPORT_TYPE));
                    title = isDefaultTitle_1 ? defaultCard : (_7 = companyCard === null || companyCard === void 0 ? void 0 : companyCard.nameValuePairs) === null || _7 === void 0 ? void 0 : _7.quickbooks_online_export_account_debit;
                    selectedAccount_1 = (_9 = (_8 = companyCard === null || companyCard === void 0 ? void 0 : companyCard.nameValuePairs) === null || _8 === void 0 ? void 0 : _8.quickbooks_online_export_account_debit) !== null && _9 !== void 0 ? _9 : defaultAccount;
                    exportType = CONST_1.default.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_QUICKBOOKS_ONLINE_EXPORT_ACCOUNT_DEBIT;
                    break;
                }
                default:
                    shouldShowMenuItem = false;
                    data = [];
            }
            var resultData = data.length > 0 ? __spreadArray([defaultMenuItem], data, true) : data;
            return {
                description: description,
                title: title,
                exportType: exportType,
                shouldShowMenuItem: shouldShowMenuItem,
                onExportPagePress: function () { return Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_EXPORT.getRoute(policyID, backTo)); },
                data: resultData.map(function (card) { return ({
                    value: card.name,
                    text: card.name,
                    keyForList: card.name,
                    isSelected: isDefaultTitle_1 ? card.name === defaultCard : card.name === selectedAccount_1,
                }); }),
            };
        }
        case CONST_1.default.POLICY.CONNECTIONS.NAME.XERO: {
            var type = translate('workspace.xero.xeroBankAccount');
            var description = currentConnectionName && type ? translate('workspace.moreFeatures.companyCards.integrationExport', { integration: type }) : undefined;
            var exportType = CONST_1.default.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_XERO_EXPORT_BANK_ACCOUNT;
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            var defaultAccount_1 = (exportConfiguration === null || exportConfiguration === void 0 ? void 0 : exportConfiguration.nonReimbursableAccount) || ((_10 = bankAccounts === null || bankAccounts === void 0 ? void 0 : bankAccounts[0]) === null || _10 === void 0 ? void 0 : _10.id);
            var isDefaultTitle_2 = !!(defaultAccount_1 &&
                (!((_11 = companyCard === null || companyCard === void 0 ? void 0 : companyCard.nameValuePairs) === null || _11 === void 0 ? void 0 : _11.xero_export_bank_account) || ((_12 = companyCard === null || companyCard === void 0 ? void 0 : companyCard.nameValuePairs) === null || _12 === void 0 ? void 0 : _12.xero_export_bank_account) === CONST_1.default.COMPANY_CARDS.DEFAULT_EXPORT_TYPE));
            var selectedAccount_2 = (bankAccounts !== null && bankAccounts !== void 0 ? bankAccounts : []).find(function (bank) { var _a, _b; return bank.id === ((_b = (_a = companyCard === null || companyCard === void 0 ? void 0 : companyCard.nameValuePairs) === null || _a === void 0 ? void 0 : _a.xero_export_bank_account) !== null && _b !== void 0 ? _b : defaultAccount_1); });
            var resultData = ((_13 = (bankAccounts !== null && bankAccounts !== void 0 ? bankAccounts : [])) === null || _13 === void 0 ? void 0 : _13.length) > 0 ? __spreadArray([defaultMenuItem], (bankAccounts !== null && bankAccounts !== void 0 ? bankAccounts : []), true) : bankAccounts;
            return {
                description: description,
                exportType: exportType,
                shouldShowMenuItem: !!(exportConfiguration === null || exportConfiguration === void 0 ? void 0 : exportConfiguration.nonReimbursableAccount),
                title: isDefaultTitle_2 ? defaultCard : selectedAccount_2 === null || selectedAccount_2 === void 0 ? void 0 : selectedAccount_2.name,
                onExportPagePress: function () { return Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_XERO_EXPORT.getRoute(policyID, backTo)); },
                data: (resultData !== null && resultData !== void 0 ? resultData : []).map(function (card) {
                    return {
                        value: card.id,
                        text: card.name,
                        keyForList: card.id,
                        isSelected: isDefaultTitle_2 ? card.name === defaultCard : (selectedAccount_2 === null || selectedAccount_2 === void 0 ? void 0 : selectedAccount_2.id) === card.id,
                    };
                }),
            };
        }
        case CONST_1.default.POLICY.CONNECTIONS.NAME.NETSUITE: {
            var typeNonreimbursable = (config === null || config === void 0 ? void 0 : config.nonreimbursableExpensesExportDestination)
                ? translate("workspace.netsuite.exportDestination.values.".concat(config.nonreimbursableExpensesExportDestination, ".label"))
                : undefined;
            var typeReimbursable = (config === null || config === void 0 ? void 0 : config.reimbursableExpensesExportDestination)
                ? translate("workspace.netsuite.exportDestination.values.".concat(config.reimbursableExpensesExportDestination, ".label"))
                : undefined;
            var type = typeNonreimbursable !== null && typeNonreimbursable !== void 0 ? typeNonreimbursable : typeReimbursable;
            var title = '';
            var exportType = void 0;
            var shouldShowMenuItem = true;
            var description = currentConnectionName && type ? translate('workspace.moreFeatures.companyCards.integrationExport', { integration: currentConnectionName, type: type }) : undefined;
            var data = void 0;
            var defaultAccount = '';
            var isDefaultTitle_3 = false;
            var netSuiteConfig = (_14 = config === null || config === void 0 ? void 0 : config.nonreimbursableExpensesExportDestination) !== null && _14 !== void 0 ? _14 : config === null || config === void 0 ? void 0 : config.reimbursableExpensesExportDestination;
            switch (netSuiteConfig) {
                case CONST_1.default.NETSUITE_EXPORT_DESTINATION.VENDOR_BILL: {
                    var vendors = (_16 = (_15 = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _15 === void 0 ? void 0 : _15.netsuite) === null || _16 === void 0 ? void 0 : _16.options.data.vendors;
                    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                    defaultAccount = (config === null || config === void 0 ? void 0 : config.defaultVendor) || ((_17 = vendors === null || vendors === void 0 ? void 0 : vendors[0]) === null || _17 === void 0 ? void 0 : _17.id);
                    isDefaultTitle_3 = !!(defaultAccount &&
                        (!((_18 = companyCard === null || companyCard === void 0 ? void 0 : companyCard.nameValuePairs) === null || _18 === void 0 ? void 0 : _18.netsuite_export_vendor) || ((_19 = companyCard === null || companyCard === void 0 ? void 0 : companyCard.nameValuePairs) === null || _19 === void 0 ? void 0 : _19.netsuite_export_vendor) === CONST_1.default.COMPANY_CARDS.DEFAULT_EXPORT_TYPE));
                    var selectedVendor_1 = (0, PolicyUtils_1.findSelectedVendorWithDefaultSelect)(vendors, (_21 = (_20 = companyCard === null || companyCard === void 0 ? void 0 : companyCard.nameValuePairs) === null || _20 === void 0 ? void 0 : _20.netsuite_export_vendor) !== null && _21 !== void 0 ? _21 : defaultAccount);
                    title = isDefaultTitle_3 ? defaultCard : selectedVendor_1 === null || selectedVendor_1 === void 0 ? void 0 : selectedVendor_1.name;
                    var resultData = (vendors !== null && vendors !== void 0 ? vendors : []).length > 0 ? __spreadArray([defaultMenuItem], (vendors !== null && vendors !== void 0 ? vendors : []), true) : vendors;
                    data = (resultData !== null && resultData !== void 0 ? resultData : []).map(function (_a) {
                        var id = _a.id, name = _a.name;
                        return {
                            value: id,
                            text: name,
                            keyForList: id,
                            isSelected: isDefaultTitle_3 ? name === defaultCard : (selectedVendor_1 === null || selectedVendor_1 === void 0 ? void 0 : selectedVendor_1.id) === id,
                        };
                    });
                    exportType = CONST_1.default.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_NETSUITE_EXPORT_VENDOR;
                    break;
                }
                case CONST_1.default.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY: {
                    var payableAccounts = (_23 = (_22 = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _22 === void 0 ? void 0 : _22.netsuite) === null || _23 === void 0 ? void 0 : _23.options.data.payableList;
                    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                    defaultAccount = (config === null || config === void 0 ? void 0 : config.payableAcct) || ((_24 = payableAccounts === null || payableAccounts === void 0 ? void 0 : payableAccounts[0]) === null || _24 === void 0 ? void 0 : _24.id);
                    isDefaultTitle_3 = !!(defaultAccount &&
                        (!((_25 = companyCard === null || companyCard === void 0 ? void 0 : companyCard.nameValuePairs) === null || _25 === void 0 ? void 0 : _25.netsuite_export_payable_account) ||
                            ((_26 = companyCard === null || companyCard === void 0 ? void 0 : companyCard.nameValuePairs) === null || _26 === void 0 ? void 0 : _26.netsuite_export_payable_account) === CONST_1.default.COMPANY_CARDS.DEFAULT_EXPORT_TYPE));
                    var selectedPayableAccount_1 = (0, PolicyUtils_1.findSelectedBankAccountWithDefaultSelect)(payableAccounts, (_28 = (_27 = companyCard === null || companyCard === void 0 ? void 0 : companyCard.nameValuePairs) === null || _27 === void 0 ? void 0 : _27.netsuite_export_payable_account) !== null && _28 !== void 0 ? _28 : defaultAccount);
                    title = isDefaultTitle_3 ? defaultCard : selectedPayableAccount_1 === null || selectedPayableAccount_1 === void 0 ? void 0 : selectedPayableAccount_1.name;
                    var resultData = (payableAccounts !== null && payableAccounts !== void 0 ? payableAccounts : []).length > 0 ? __spreadArray([defaultMenuItem], (payableAccounts !== null && payableAccounts !== void 0 ? payableAccounts : []), true) : payableAccounts;
                    data = (resultData !== null && resultData !== void 0 ? resultData : []).map(function (_a) {
                        var id = _a.id, name = _a.name;
                        return {
                            value: id,
                            text: name,
                            keyForList: id,
                            isSelected: isDefaultTitle_3 ? name === defaultCard : (selectedPayableAccount_1 === null || selectedPayableAccount_1 === void 0 ? void 0 : selectedPayableAccount_1.id) === id,
                        };
                    });
                    exportType = CONST_1.default.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_NETSUITE_EXPORT_ACCOUNT;
                    break;
                }
                default:
                    shouldShowMenuItem = false;
                    data = [];
            }
            return {
                description: description,
                title: title,
                shouldShowMenuItem: shouldShowMenuItem,
                exportType: exportType,
                data: data,
                onExportPagePress: function () { return Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_NETSUITE_EXPORT.getRoute(policyID, backTo)); },
            };
        }
        case CONST_1.default.POLICY.CONNECTIONS.NAME.SAGE_INTACCT: {
            var isNonReimbursable = !!(exportConfig === null || exportConfig === void 0 ? void 0 : exportConfig.nonReimbursable);
            var isReimbursable = !!(exportConfig === null || exportConfig === void 0 ? void 0 : exportConfig.reimbursable);
            var typeNonReimbursable = isNonReimbursable ? translate("workspace.sageIntacct.nonReimbursableExpenses.values.".concat(exportConfig.nonReimbursable)) : undefined;
            var typeReimbursable = isReimbursable ? translate("workspace.sageIntacct.reimbursableExpenses.values.".concat(exportConfig.reimbursable)) : undefined;
            var type = typeNonReimbursable !== null && typeNonReimbursable !== void 0 ? typeNonReimbursable : typeReimbursable;
            var description = currentConnectionName && type ? translate('workspace.moreFeatures.companyCards.integrationExport', { integration: currentConnectionName, type: type }) : undefined;
            var exportType = void 0;
            var title = '';
            var isDefaultTitle_4 = false;
            var shouldShowMenuItem = true;
            var data = void 0;
            var sageConfig = (_29 = exportConfig === null || exportConfig === void 0 ? void 0 : exportConfig.nonReimbursable) !== null && _29 !== void 0 ? _29 : exportConfig === null || exportConfig === void 0 ? void 0 : exportConfig.reimbursable;
            switch (sageConfig) {
                case CONST_1.default.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL:
                case CONST_1.default.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL: {
                    var defaultAccount = isNonReimbursable ? (0, PolicyUtils_1.getSageIntacctNonReimbursableActiveDefaultVendor)(policy) : exportConfig === null || exportConfig === void 0 ? void 0 : exportConfig.reimbursableExpenseReportDefaultVendor;
                    isDefaultTitle_4 = !!(((_30 = companyCard === null || companyCard === void 0 ? void 0 : companyCard.nameValuePairs) === null || _30 === void 0 ? void 0 : _30.intacct_export_vendor) === CONST_1.default.COMPANY_CARDS.DEFAULT_EXPORT_TYPE ||
                        (defaultAccount && !((_31 = companyCard === null || companyCard === void 0 ? void 0 : companyCard.nameValuePairs) === null || _31 === void 0 ? void 0 : _31.intacct_export_vendor)));
                    var vendors = (_35 = (_34 = (_33 = (_32 = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _32 === void 0 ? void 0 : _32.intacct) === null || _33 === void 0 ? void 0 : _33.data) === null || _34 === void 0 ? void 0 : _34.vendors) !== null && _35 !== void 0 ? _35 : [];
                    var selectedVendorID_1 = (_37 = (_36 = companyCard === null || companyCard === void 0 ? void 0 : companyCard.nameValuePairs) === null || _36 === void 0 ? void 0 : _36.intacct_export_vendor) !== null && _37 !== void 0 ? _37 : defaultAccount;
                    var selectedVendor_2 = (vendors !== null && vendors !== void 0 ? vendors : []).find(function (_a) {
                        var id = _a.id;
                        return id === selectedVendorID_1;
                    });
                    title = isDefaultTitle_4 ? defaultCard : selectedVendor_2 === null || selectedVendor_2 === void 0 ? void 0 : selectedVendor_2.value;
                    var resultData = (vendors !== null && vendors !== void 0 ? vendors : []).length > 0 ? __spreadArray([defaultMenuItem], (vendors !== null && vendors !== void 0 ? vendors : []), true) : vendors;
                    data = (resultData !== null && resultData !== void 0 ? resultData : []).map(function (_a) {
                        var id = _a.id, value = _a.value;
                        return {
                            value: id,
                            text: value,
                            keyForList: id,
                            isSelected: isDefaultTitle_4 ? value === defaultCard : (selectedVendor_2 === null || selectedVendor_2 === void 0 ? void 0 : selectedVendor_2.id) === id,
                        };
                    });
                    exportType = CONST_1.default.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_INTACCT_EXPORT_VENDOR;
                    break;
                }
                case CONST_1.default.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.CREDIT_CARD_CHARGE: {
                    var intacctCreditCards = (_41 = (_40 = (_39 = (_38 = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _38 === void 0 ? void 0 : _38.intacct) === null || _39 === void 0 ? void 0 : _39.data) === null || _40 === void 0 ? void 0 : _40.creditCards) !== null && _41 !== void 0 ? _41 : [];
                    var activeDefaultVendor_1 = (0, PolicyUtils_1.getSageIntacctNonReimbursableActiveDefaultVendor)(policy);
                    var defaultVendorAccount = ((_45 = (_44 = (_43 = (_42 = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _42 === void 0 ? void 0 : _42.intacct) === null || _43 === void 0 ? void 0 : _43.data) === null || _44 === void 0 ? void 0 : _44.vendors) !== null && _45 !== void 0 ? _45 : []).find(function (vendor) { return vendor.id === activeDefaultVendor_1; });
                    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                    var defaultAccount = (exportConfig === null || exportConfig === void 0 ? void 0 : exportConfig.nonReimbursableAccount) || defaultVendorAccount;
                    isDefaultTitle_4 = !!(((_46 = companyCard === null || companyCard === void 0 ? void 0 : companyCard.nameValuePairs) === null || _46 === void 0 ? void 0 : _46.intacct_export_charge_card) === CONST_1.default.COMPANY_CARDS.DEFAULT_EXPORT_TYPE ||
                        (defaultAccount && !((_47 = companyCard === null || companyCard === void 0 ? void 0 : companyCard.nameValuePairs) === null || _47 === void 0 ? void 0 : _47.intacct_export_charge_card)));
                    var selectedVendorID_2 = (_49 = (_48 = companyCard === null || companyCard === void 0 ? void 0 : companyCard.nameValuePairs) === null || _48 === void 0 ? void 0 : _48.intacct_export_charge_card) !== null && _49 !== void 0 ? _49 : defaultAccount;
                    var selectedCard_1 = (intacctCreditCards !== null && intacctCreditCards !== void 0 ? intacctCreditCards : []).find(function (_a) {
                        var id = _a.id;
                        return id === selectedVendorID_2;
                    });
                    title = isDefaultTitle_4 ? defaultCard : selectedCard_1 === null || selectedCard_1 === void 0 ? void 0 : selectedCard_1.name;
                    var resultData = (intacctCreditCards !== null && intacctCreditCards !== void 0 ? intacctCreditCards : []).length > 0 ? __spreadArray([defaultMenuItem], (intacctCreditCards !== null && intacctCreditCards !== void 0 ? intacctCreditCards : []), true) : intacctCreditCards;
                    data = (resultData !== null && resultData !== void 0 ? resultData : []).map(function (_a) {
                        var id = _a.id, name = _a.name;
                        return {
                            value: id,
                            text: name,
                            keyForList: id,
                            isSelected: isDefaultTitle_4 ? name === defaultCard : (selectedCard_1 === null || selectedCard_1 === void 0 ? void 0 : selectedCard_1.id) === id,
                        };
                    });
                    exportType = CONST_1.default.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_INTACCT_EXPORT_CHARGE_CARD;
                    break;
                }
                default:
                    shouldShowMenuItem = false;
                    data = [];
            }
            return {
                description: description,
                shouldShowMenuItem: shouldShowMenuItem,
                exportType: exportType,
                title: title,
                onExportPagePress: function () { return Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_SAGE_INTACCT_EXPORT.getRoute(policyID, backTo)); },
                data: data,
            };
        }
        case CONST_1.default.POLICY.CONNECTIONS.NAME.QBD: {
            var nonReimbursableExpenses = exportQBD === null || exportQBD === void 0 ? void 0 : exportQBD.nonReimbursable;
            var reimbursableExpenses = exportQBD === null || exportQBD === void 0 ? void 0 : exportQBD.reimbursable;
            var typeNonReimbursable = nonReimbursableExpenses ? translate("workspace.qbd.accounts.".concat(nonReimbursableExpenses)) : undefined;
            var typeReimbursable = reimbursableExpenses ? translate("workspace.qbd.accounts.".concat(reimbursableExpenses)) : undefined;
            var type = typeNonReimbursable !== null && typeNonReimbursable !== void 0 ? typeNonReimbursable : typeReimbursable;
            var description = currentConnectionName && type ? translate('workspace.moreFeatures.companyCards.integrationExport', { integration: currentConnectionName, type: type }) : undefined;
            var data = void 0;
            var shouldShowMenuItem = nonReimbursableExpenses !== CONST_1.default.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CHECK &&
                nonReimbursableExpenses !== CONST_1.default.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.VENDOR_BILL;
            var title = '';
            var selectedAccount_3 = '';
            var defaultAccount = (_50 = exportQBD === null || exportQBD === void 0 ? void 0 : exportQBD.nonReimbursableAccount) !== null && _50 !== void 0 ? _50 : exportQBD === null || exportQBD === void 0 ? void 0 : exportQBD.reimbursableAccount;
            var isDefaultTitle_5 = false;
            var exportType = void 0;
            var qbdConfig = nonReimbursableExpenses !== null && nonReimbursableExpenses !== void 0 ? nonReimbursableExpenses : reimbursableExpenses;
            switch (qbdConfig) {
                case CONST_1.default.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY:
                case CONST_1.default.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK:
                case CONST_1.default.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL:
                case CONST_1.default.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD: {
                    data = creditCardAccounts !== null && creditCardAccounts !== void 0 ? creditCardAccounts : [];
                    isDefaultTitle_5 = !!(((_51 = companyCard === null || companyCard === void 0 ? void 0 : companyCard.nameValuePairs) === null || _51 === void 0 ? void 0 : _51.quickbooks_desktop_export_account_credit) === CONST_1.default.COMPANY_CARDS.DEFAULT_EXPORT_TYPE ||
                        (defaultAccount && !((_52 = companyCard === null || companyCard === void 0 ? void 0 : companyCard.nameValuePairs) === null || _52 === void 0 ? void 0 : _52.quickbooks_desktop_export_account_credit)));
                    title = isDefaultTitle_5 ? defaultCard : (_53 = companyCard === null || companyCard === void 0 ? void 0 : companyCard.nameValuePairs) === null || _53 === void 0 ? void 0 : _53.quickbooks_desktop_export_account_credit;
                    selectedAccount_3 = (_55 = (_54 = companyCard === null || companyCard === void 0 ? void 0 : companyCard.nameValuePairs) === null || _54 === void 0 ? void 0 : _54.quickbooks_desktop_export_account_credit) !== null && _55 !== void 0 ? _55 : defaultAccount;
                    exportType = CONST_1.default.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_QUICKBOOKS_DESKTOP_EXPORT_ACCOUNT_CREDIT;
                    break;
                }
                default:
                    shouldShowMenuItem = false;
                    data = [];
            }
            var resultData = data.length > 0 ? __spreadArray([defaultMenuItem], data, true) : data;
            return {
                description: description,
                title: title,
                exportType: exportType,
                shouldShowMenuItem: shouldShowMenuItem,
                onExportPagePress: function () { return Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_EXPORT.getRoute(policyID, backTo)); },
                data: resultData.map(function (card) { return ({
                    value: card.name,
                    text: card.name,
                    keyForList: card.name,
                    isSelected: isDefaultTitle_5 ? card.name === defaultCard : card.name === selectedAccount_3,
                }); }),
            };
        }
        default:
            return undefined;
    }
}
