"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var SearchContext_1 = require("@components/Search/SearchContext");
var useOnyx_1 = require("@hooks/useOnyx");
var Transaction_1 = require("@libs/actions/Transaction");
var Navigation_1 = require("@libs/Navigation/Navigation");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var IOURequestEditReportCommon_1 = require("./IOURequestEditReportCommon");
var withWritableReportOrNotFound_1 = require("./withWritableReportOrNotFound");
function IOURequestEditReport(_a) {
    var route = _a.route;
    var _b = route.params, backTo = _b.backTo, reportID = _b.reportID;
    var _c = (0, SearchContext_1.useSearchContext)(), selectedTransactionIDs = _c.selectedTransactionIDs, clearSelectedTransactions = _c.clearSelectedTransactions;
    var transactionReport = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID), { canBeMissing: false })[0];
    var selectReport = function (item) {
        if (selectedTransactionIDs.length === 0 || item.value === reportID) {
            Navigation_1.default.dismissModal();
            return;
        }
        (0, Transaction_1.changeTransactionsReport)(selectedTransactionIDs, item.value);
        clearSelectedTransactions(true);
        Navigation_1.default.dismissModalWithReport({ reportID: item.value });
    };
    return (<IOURequestEditReportCommon_1.default backTo={backTo} transactionsReports={transactionReport ? [transactionReport] : []} selectReport={selectReport}/>);
}
IOURequestEditReport.displayName = 'IOURequestEditReport';
exports.default = (0, withWritableReportOrNotFound_1.default)(IOURequestEditReport);
