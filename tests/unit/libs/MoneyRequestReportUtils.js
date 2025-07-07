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
var actions_1 = require("../../../__mocks__/reportData/actions");
var transactions_1 = require("../../../__mocks__/reportData/transactions");
describe('getThreadReportIDsForTransactions', function () {
    test('returns empty list for no transactions', function () {
        var result = (0, MoneyRequestReportUtils_1.getThreadReportIDsForTransactions)([actions_1.actionR14932], []);
        expect(result).toEqual([]);
    });
    test('returns empty list for transactions but no reportActions', function () {
        var result = (0, MoneyRequestReportUtils_1.getThreadReportIDsForTransactions)([], [transactions_1.transactionR14932]);
        expect(result).toEqual([]);
    });
    test('returns list of reportIDs for transactions which have matching reportActions', function () {
        var reportActions = [actions_1.actionR14932, actions_1.actionR98765];
        var transactions = [__assign({}, transactions_1.transactionR14932), __assign({}, transactions_1.transactionR98765)];
        var result = (0, MoneyRequestReportUtils_1.getThreadReportIDsForTransactions)(reportActions, transactions);
        expect(result).toEqual(['CHILD_REPORT_ID_R14932', 'CHILD_REPORT_ID_R98765']);
    });
    test('returns empty list for transactions which have no matching reportActions', function () {
        // fakeAction456 has originalMessage with undefined id, so cannot be mapped
        var reportActions = [__assign(__assign({}, actions_1.actionR98765), { originalMessage: {} })];
        var transactions = [__assign({}, transactions_1.transactionR14932), __assign({}, transactions_1.transactionR98765)];
        var result = (0, MoneyRequestReportUtils_1.getThreadReportIDsForTransactions)(reportActions, transactions);
        expect(result).toEqual([]);
    });
});
