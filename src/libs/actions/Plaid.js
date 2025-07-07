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
Object.defineProperty(exports, "__esModule", { value: true });
exports.openPlaidBankAccountSelector = openPlaidBankAccountSelector;
exports.openPlaidBankLogin = openPlaidBankLogin;
exports.openPlaidCompanyCardLogin = openPlaidCompanyCardLogin;
exports.importPlaidAccounts = importPlaidAccounts;
var react_native_onyx_1 = require("react-native-onyx");
var API = require("@libs/API");
var types_1 = require("@libs/API/types");
var getPlaidLinkTokenParameters_1 = require("@libs/getPlaidLinkTokenParameters");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
/**
 * Gets the Plaid Link token used to initialize the Plaid SDK
 */
function openPlaidBankLogin(allowDebit, bankAccountID) {
    // redirect_uri needs to be in kebab case convention because that's how it's passed to the backend
    var _a = (0, getPlaidLinkTokenParameters_1.default)(), redirectURI = _a.redirectURI, androidPackage = _a.androidPackage;
    var params = {
        redirectURI: redirectURI,
        androidPackage: androidPackage,
        allowDebit: allowDebit,
        bankAccountID: bankAccountID,
    };
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: ONYXKEYS_1.default.PLAID_DATA,
            value: __assign(__assign({}, CONST_1.default.PLAID.DEFAULT_DATA), { isLoading: true }),
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: ONYXKEYS_1.default.PLAID_LINK_TOKEN,
            value: '',
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT,
            value: {
                plaidAccountID: '',
            },
        },
    ];
    API.read(types_1.READ_COMMANDS.OPEN_PLAID_BANK_LOGIN, params, { optimisticData: optimisticData });
}
/**
 * Gets the Plaid Link token used to initialize the Plaid SDK for Company card
 */
function openPlaidCompanyCardLogin(country) {
    var _a = (0, getPlaidLinkTokenParameters_1.default)(), redirectURI = _a.redirectURI, androidPackage = _a.androidPackage;
    var params = {
        redirectURI: redirectURI,
        androidPackage: androidPackage,
        country: country,
    };
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: ONYXKEYS_1.default.PLAID_DATA,
            value: __assign(__assign({}, CONST_1.default.PLAID.DEFAULT_DATA), { isLoading: true }),
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: ONYXKEYS_1.default.PLAID_LINK_TOKEN,
            value: '',
        },
    ];
    API.read(types_1.READ_COMMANDS.OPEN_PLAID_CARDS_BANK_LOGIN, params, { optimisticData: optimisticData });
}
function openPlaidBankAccountSelector(publicToken, bankName, allowDebit, bankAccountID) {
    var parameters = {
        publicToken: publicToken,
        allowDebit: allowDebit,
        bank: bankName,
        bankAccountID: bankAccountID,
    };
    API.read(types_1.READ_COMMANDS.OPEN_PLAID_BANK_ACCOUNT_SELECTOR, parameters, {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: ONYXKEYS_1.default.PLAID_DATA,
                value: {
                    isLoading: true,
                    errors: null,
                    bankName: bankName,
                },
            },
        ],
        successData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: ONYXKEYS_1.default.PLAID_DATA,
                value: {
                    isLoading: false,
                    errors: null,
                },
            },
        ],
        failureData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: ONYXKEYS_1.default.PLAID_DATA,
                value: {
                    isLoading: false,
                },
            },
        ],
    });
}
function importPlaidAccounts(publicToken, feed, feedName, country, domainName, plaidAccounts) {
    var parameters = {
        publicToken: publicToken,
        feed: feed,
        feedName: feedName,
        country: country,
        domainName: domainName,
        plaidAccounts: plaidAccounts,
    };
    API.write(types_1.WRITE_COMMANDS.IMPORT_PLAID_ACCOUNTS, parameters);
}
