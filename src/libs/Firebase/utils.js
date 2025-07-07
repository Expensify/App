"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_onyx_1 = require("react-native-onyx");
var Transaction_1 = require("@libs/actions/Transaction");
var PersonalDetailsUtils = require("@libs/PersonalDetailsUtils");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var ReportActionsUtils_1 = require("@libs/ReportActionsUtils");
var SessionUtils = require("@libs/SessionUtils");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var allReports;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.COLLECTION.REPORT,
    waitForCollectionCallback: true,
    callback: function (value) {
        allReports = value;
    },
});
function getAttributes(attributes) {
    var _a, _b, _c, _d;
    var session = SessionUtils.getSession();
    var policy = (0, PolicyUtils_1.getActivePolicy)();
    var allAttributes = {
        accountId: (_b = (_a = session === null || session === void 0 ? void 0 : session.accountID) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : 'N/A',
        reportsLength: Object.keys(allReports !== null && allReports !== void 0 ? allReports : {}).length.toString(),
        reportActionsLength: (0, ReportActionsUtils_1.getReportActionsLength)().toString(),
        personalDetailsLength: PersonalDetailsUtils.getPersonalDetailsLength().toString(),
        transactionViolationsLength: (0, Transaction_1.getAllTransactionViolationsLength)().toString(),
        policiesLength: (0, PolicyUtils_1.getAllPoliciesLength)().toString(),
        transactionsLength: (0, Transaction_1.getAllTransactions)().toString(),
        policyType: (_c = policy === null || policy === void 0 ? void 0 : policy.type) !== null && _c !== void 0 ? _c : 'N/A',
        policyRole: (_d = policy === null || policy === void 0 ? void 0 : policy.role) !== null && _d !== void 0 ? _d : 'N/A',
    };
    if (attributes && attributes.length > 0) {
        var selectedAttributes_1 = {};
        attributes.forEach(function (attribute) {
            selectedAttributes_1[attribute] = allAttributes[attribute];
        });
        return selectedAttributes_1;
    }
    return allAttributes;
}
exports.default = {
    getAttributes: getAttributes,
};
