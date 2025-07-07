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
var MoneyRequestReportUtils_1 = require("@libs/MoneyRequestReportUtils");
var CONST_1 = require("@src/CONST");
var transactionItemBaseMock = {
    reportID: 'report123',
    transactionThreadReportID: 'thread123',
};
describe('MoneyRequestReportUtils', function () {
    describe('getReportIDForTransaction', function () {
        it('returns transaction thread ID if its not from one transaction report', function () {
            var transactionItem = __assign({}, transactionItemBaseMock);
            var resultID = (0, MoneyRequestReportUtils_1.getReportIDForTransaction)(transactionItem);
            expect(resultID).toBe('thread123');
        });
        it('returns transaction thread ID if its from self DM', function () {
            var transactionItem = __assign(__assign({}, transactionItemBaseMock), { reportID: CONST_1.default.REPORT.UNREPORTED_REPORT_ID });
            var resultID = (0, MoneyRequestReportUtils_1.getReportIDForTransaction)(transactionItem);
            expect(resultID).toBe('thread123');
        });
        it('returns expense reportID if its from one transaction report', function () {
            var transactionItem = __assign(__assign({}, transactionItemBaseMock), { isFromOneTransactionReport: true });
            var resultID = (0, MoneyRequestReportUtils_1.getReportIDForTransaction)(transactionItem);
            expect(resultID).toBe('report123');
        });
        it('returns reportID if transaction thread ID is 0 - unreported', function () {
            var transactionItem = __assign(__assign({}, transactionItemBaseMock), { transactionThreadReportID: CONST_1.default.REPORT.UNREPORTED_REPORT_ID });
            var resultID = (0, MoneyRequestReportUtils_1.getReportIDForTransaction)(transactionItem);
            expect(resultID).toBe('report123');
        });
    });
});
