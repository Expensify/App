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
var react_1 = require("react");
var SearchContext_1 = require("@components/Search/SearchContext");
var useOnyx_1 = require("@hooks/useOnyx");
var Transaction_1 = require("@libs/actions/Transaction");
var Navigation_1 = require("@libs/Navigation/Navigation");
var IOURequestEditReportCommon_1 = require("@pages/iou/request/step/IOURequestEditReportCommon");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
function SearchTransactionsChangeReport() {
    var _a = (0, SearchContext_1.useSearchContext)(), selectedTransactions = _a.selectedTransactions, clearSelectedTransactions = _a.clearSelectedTransactions;
    var selectedTransactionsKeys = (0, react_1.useMemo)(function () { return Object.keys(selectedTransactions); }, [selectedTransactions]);
    var allReports = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.REPORT, { canBeMissing: false })[0];
    var transactionsReports = (0, react_1.useMemo)(function () {
        var reports = Object.values(selectedTransactions).reduce(function (acc, transaction) {
            var report = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(transaction.reportID)];
            if (report) {
                acc.add(report);
            }
            return acc;
        }, new Set());
        return __spreadArray([], reports, true);
    }, [allReports, selectedTransactions]);
    var selectReport = function (item) {
        if (selectedTransactionsKeys.length === 0) {
            return;
        }
        (0, Transaction_1.changeTransactionsReport)(selectedTransactionsKeys, item.value);
        clearSelectedTransactions();
        Navigation_1.default.goBack();
    };
    return (<IOURequestEditReportCommon_1.default backTo={undefined} transactionsReports={transactionsReports} selectReport={selectReport}/>);
}
SearchTransactionsChangeReport.displayName = 'SearchTransactionsChangeReport';
exports.default = SearchTransactionsChangeReport;
