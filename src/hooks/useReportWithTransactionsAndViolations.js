"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ReportUtils_1 = require("@libs/ReportUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var useNetwork_1 = require("./useNetwork");
var useOnyx_1 = require("./useOnyx");
var DEFAULT_TRANSACTIONS = [];
var DEFAULT_VIOLATIONS = {};
function useReportWithTransactionsAndViolations(reportID) {
    var report = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID), { canBeMissing: false })[0];
    var transactions = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.TRANSACTION, {
        selector: function (_transactions) { return (0, ReportUtils_1.reportTransactionsSelector)(_transactions, reportID); },
        canBeMissing: true,
    })[0];
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var filteredTransactions = transactions === null || transactions === void 0 ? void 0 : transactions.filter(function (transaction) { return isOffline || (transaction === null || transaction === void 0 ? void 0 : transaction.pendingAction) !== CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE; });
    var violations = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS, {
        selector: function (allViolations) {
            return Object.fromEntries(Object.entries(allViolations !== null && allViolations !== void 0 ? allViolations : {}).filter(function (_a) {
                var key = _a[0];
                return filteredTransactions === null || filteredTransactions === void 0 ? void 0 : filteredTransactions.some(function (transaction) { return transaction.transactionID === key.replace(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS, ''); });
            }));
        },
        canBeMissing: true,
    }, [filteredTransactions])[0];
    return [report, filteredTransactions !== null && filteredTransactions !== void 0 ? filteredTransactions : DEFAULT_TRANSACTIONS, violations !== null && violations !== void 0 ? violations : DEFAULT_VIOLATIONS];
}
exports.default = useReportWithTransactionsAndViolations;
