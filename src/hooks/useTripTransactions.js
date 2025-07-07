"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var useOnyx_1 = require("./useOnyx");
/**
 * Hook to fetch transactions associated with a specific `tripRoom` report.
 *
 * Since trip rooms and their transactions lack a direct connection, this hook
 * fetches all child reports and transactions from Onyx and filters them to derive
 * relevant transactions for the given trip room.
 *
 * @param reportID - The trip room's reportID.
 * @returns Transactions linked to the specified trip room.
 */
function useTripTransactions(reportID) {
    var _a = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.REPORT, {
        selector: function (reports) {
            return Object.values(reports !== null && reports !== void 0 ? reports : {})
                .filter(function (report) { return report && report.chatReportID === reportID; })
                .map(function (report) { return report === null || report === void 0 ? void 0 : report.reportID; });
        },
    })[0], tripTransactionReportIDs = _a === void 0 ? [] : _a;
    var _b = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.TRANSACTION, {
        selector: function (transactions) {
            if (!tripTransactionReportIDs.length) {
                return [];
            }
            return Object.values(transactions !== null && transactions !== void 0 ? transactions : {}).filter(function (transaction) { return !!transaction && tripTransactionReportIDs.includes(transaction.reportID); });
        },
    }, [tripTransactionReportIDs])[0], tripTransactions = _b === void 0 ? [] : _b;
    return tripTransactions;
}
exports.default = useTripTransactions;
