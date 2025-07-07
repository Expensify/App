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
var TransactionUtils_1 = require("@libs/TransactionUtils");
var CONST_1 = require("@src/CONST");
function generateTransaction(values) {
    if (values === void 0) { values = {}; }
    var baseTransaction = __assign({ transactionID: "transaction_".concat(Math.random()), reportID: CONST_1.default.REPORT.UNREPORTED_REPORT_ID, amount: 1000, currency: 'USD', merchant: 'Test Merchant', category: '', comment: { comment: '' }, created: '2025-06-12', tag: '', billable: false, receipt: {}, filename: '', taxCode: '', taxAmount: 0, pendingAction: undefined }, values);
    return baseTransaction;
}
describe('AddUnreportedExpense', function () {
    describe('createUnreportedExpenseSections', function () {
        it('should mark transactions with DELETE pendingAction as disabled', function () {
            var _a, _b, _c, _d;
            var normalTransaction = generateTransaction({
                transactionID: '123',
                pendingAction: undefined,
                amount: 1000,
                merchant: 'Normal Merchant',
            });
            var deletedTransaction = generateTransaction({
                transactionID: '456',
                pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                amount: 2000,
                merchant: 'Deleted Merchant',
            });
            var transactions = [normalTransaction, deletedTransaction];
            var sections = (0, TransactionUtils_1.createUnreportedExpenseSections)(transactions);
            // Should create one section
            expect(sections).toHaveLength(1);
            expect((_a = sections.at(0)) === null || _a === void 0 ? void 0 : _a.shouldShow).toBe(true);
            expect((_b = sections.at(0)) === null || _b === void 0 ? void 0 : _b.data).toHaveLength(2);
            var processedNormalTransaction = (_c = sections.at(0)) === null || _c === void 0 ? void 0 : _c.data.find(function (t) { return t.transactionID === '123'; });
            expect(processedNormalTransaction === null || processedNormalTransaction === void 0 ? void 0 : processedNormalTransaction.isDisabled).toBe(false);
            var processedDeletedTransaction = (_d = sections.at(0)) === null || _d === void 0 ? void 0 : _d.data.find(function (t) { return t.transactionID === '456'; });
            expect(processedDeletedTransaction === null || processedDeletedTransaction === void 0 ? void 0 : processedDeletedTransaction.isDisabled).toBe(true);
        });
        it('should not mark transactions without DELETE pendingAction as disabled', function () {
            var _a, _b;
            var normalTransaction = generateTransaction({
                transactionID: '123',
                pendingAction: undefined,
                amount: 1000,
                merchant: 'Normal Merchant',
            });
            var updateTransaction = generateTransaction({
                transactionID: '456',
                pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                amount: 2000,
                merchant: 'Update Merchant',
            });
            var addTransaction = generateTransaction({
                transactionID: '789',
                pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                amount: 3000,
                merchant: 'Add Merchant',
            });
            var transactions = [normalTransaction, updateTransaction, addTransaction];
            var sections = (0, TransactionUtils_1.createUnreportedExpenseSections)(transactions);
            expect((_a = sections.at(0)) === null || _a === void 0 ? void 0 : _a.data).toHaveLength(3);
            (_b = sections.at(0)) === null || _b === void 0 ? void 0 : _b.data.forEach(function (transaction) {
                expect(transaction.isDisabled).toBe(false);
            });
        });
        it('should handle transaction list with only deleted transactions', function () {
            var _a, _b;
            var deletedTransaction1 = generateTransaction({
                transactionID: '123',
                pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                amount: 1000,
                merchant: 'Deleted Merchant 1',
            });
            var deletedTransaction2 = generateTransaction({
                transactionID: '456',
                pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                amount: 2000,
                merchant: 'Deleted Merchant 2',
            });
            var transactions = [deletedTransaction1, deletedTransaction2];
            var sections = (0, TransactionUtils_1.createUnreportedExpenseSections)(transactions);
            expect((_a = sections.at(0)) === null || _a === void 0 ? void 0 : _a.data).toHaveLength(2);
            (_b = sections.at(0)) === null || _b === void 0 ? void 0 : _b.data.forEach(function (transaction) {
                expect(transaction.isDisabled).toBe(true);
                expect(transaction.pendingAction).toBe(CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
            });
        });
    });
});
