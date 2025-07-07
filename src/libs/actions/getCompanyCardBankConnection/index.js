"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCompanyCardPlaidConnection = getCompanyCardPlaidConnection;
exports.getCompanyCardBankConnection = getCompanyCardBankConnection;
var ApiUtils_1 = require("@libs/ApiUtils");
var NetworkStore = require("@libs/Network/NetworkStore");
var PolicyUtils = require("@libs/PolicyUtils");
var CONST_1 = require("@src/CONST");
function getCompanyCardBankConnection(policyID, bankName) {
    var bankConnection = Object.keys(CONST_1.default.COMPANY_CARDS.BANKS).find(function (key) { return CONST_1.default.COMPANY_CARDS.BANKS[key] === bankName; });
    if (!bankName || !bankConnection || !policyID) {
        return null;
    }
    var authToken = NetworkStore.getAuthToken();
    var params = {
        authToken: authToken !== null && authToken !== void 0 ? authToken : '',
        isNewDot: 'true',
        domainName: PolicyUtils.getDomainNameForPolicy(policyID),
        isCorporate: 'true',
        scrapeMinDate: '',
    };
    var bank = CONST_1.default.COMPANY_CARDS.BANK_CONNECTIONS[bankConnection];
    // The Amex connection whitelists only our production servers, so we need to always use the production API for American Express
    var forceProductionAPI = bank === CONST_1.default.COMPANY_CARDS.BANK_CONNECTIONS.AMEX;
    var commandURL = (0, ApiUtils_1.getApiRoot)({
        shouldSkipWebProxy: true,
        command: '',
    }, forceProductionAPI);
    return "".concat(commandURL, "partners/banks/").concat(bank, "/oauth_callback.php?").concat(new URLSearchParams(params).toString());
}
function getCompanyCardPlaidConnection(policyID, publicToken, feed, feedName, country, plaidAccounts) {
    if (!policyID || !publicToken || !feed || !feedName || !country || !(plaidAccounts === null || plaidAccounts === void 0 ? void 0 : plaidAccounts.length)) {
        return null;
    }
    var authToken = NetworkStore.getAuthToken();
    var params = {
        authToken: authToken !== null && authToken !== void 0 ? authToken : '',
        feed: feed,
        feedName: feedName,
        publicToken: publicToken,
        country: country,
        domainName: PolicyUtils.getDomainNameForPolicy(policyID),
        plaidAccounts: JSON.stringify(plaidAccounts),
    };
    var commandURL = (0, ApiUtils_1.getApiRoot)({
        shouldSkipWebProxy: true,
        command: '',
    });
    return "".concat(commandURL, "partners/banks/plaid/oauth_callback.php?").concat(new URLSearchParams(params).toString());
}
