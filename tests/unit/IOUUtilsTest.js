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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_1 = require("@testing-library/react-native");
var react_native_onyx_1 = require("react-native-onyx");
var useReportIsArchived_1 = require("@hooks/useReportIsArchived");
var DateUtils_1 = require("@libs/DateUtils");
var IOU_1 = require("@userActions/IOU");
var CONST_1 = require("@src/CONST");
var IOUUtils = require("@src/libs/IOUUtils");
var ReportUtils = require("@src/libs/ReportUtils");
var TransactionUtils = require("@src/libs/TransactionUtils");
var TransactionUtils_1 = require("@src/libs/TransactionUtils");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var policies_1 = require("../utils/collections/policies");
var reports_1 = require("../utils/collections/reports");
var transaction_1 = require("../utils/collections/transaction");
var waitForBatchedUpdates_1 = require("../utils/waitForBatchedUpdates");
var currencyList_json_1 = require("./currencyList.json");
var testDate = DateUtils_1.default.getDBTime();
var currentUserAccountID = 5;
function initCurrencyList() {
    var _a;
    react_native_onyx_1.default.init({
        keys: ONYXKEYS_1.default,
        initialKeyStates: (_a = {},
            _a[ONYXKEYS_1.default.CURRENCY_LIST] = currencyList_json_1.default,
            _a),
    });
    return (0, waitForBatchedUpdates_1.default)();
}
describe('IOUUtils', function () {
    describe('isIOUReportPendingCurrencyConversion', function () {
        beforeAll(function () {
            react_native_onyx_1.default.init({
                keys: ONYXKEYS_1.default,
            });
        });
        test('Submitting an expense offline in a different currency will show the pending conversion message', function () {
            var iouReport = ReportUtils.buildOptimisticIOUReport(1, 2, 100, '1', 'USD');
            var usdPendingTransaction = TransactionUtils.buildOptimisticTransaction({
                transactionParams: {
                    amount: 100,
                    currency: 'USD',
                    reportID: iouReport.reportID,
                },
            });
            var aedPendingTransaction = TransactionUtils.buildOptimisticTransaction({
                transactionParams: {
                    amount: 100,
                    currency: 'AED',
                    reportID: iouReport.reportID,
                },
            });
            var MergeQueries = {};
            MergeQueries["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(usdPendingTransaction.transactionID)] = usdPendingTransaction;
            MergeQueries["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(aedPendingTransaction.transactionID)] = aedPendingTransaction;
            return react_native_onyx_1.default.mergeCollection(ONYXKEYS_1.default.COLLECTION.TRANSACTION, MergeQueries).then(function () {
                // We submitted an expense offline in a different currency, we don't know the total of the iouReport until we're back online
                expect(IOUUtils.isIOUReportPendingCurrencyConversion(iouReport)).toBe(true);
            });
        });
        test('Submitting an expense online in a different currency will not show the pending conversion message', function () {
            var iouReport = ReportUtils.buildOptimisticIOUReport(2, 3, 100, '1', 'USD');
            var usdPendingTransaction = TransactionUtils.buildOptimisticTransaction({
                transactionParams: {
                    amount: 100,
                    currency: 'USD',
                    reportID: iouReport.reportID,
                },
            });
            var aedPendingTransaction = TransactionUtils.buildOptimisticTransaction({
                transactionParams: {
                    amount: 100,
                    currency: 'AED',
                    reportID: iouReport.reportID,
                },
            });
            var MergeQueries = {};
            MergeQueries["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(usdPendingTransaction.transactionID)] = __assign(__assign({}, usdPendingTransaction), { pendingAction: null });
            MergeQueries["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(aedPendingTransaction.transactionID)] = __assign(__assign({}, aedPendingTransaction), { pendingAction: null });
            return react_native_onyx_1.default.mergeCollection(ONYXKEYS_1.default.COLLECTION.TRANSACTION, MergeQueries).then(function () {
                // We submitted an expense online in a different currency, we know the iouReport total and there's no need to show the pending conversion message
                expect(IOUUtils.isIOUReportPendingCurrencyConversion(iouReport)).toBe(false);
            });
        });
    });
    describe('calculateAmount', function () {
        beforeAll(function () { return initCurrencyList(); });
        test('103 JPY split among 3 participants including the default user should be [35, 34, 34]', function () {
            var participantsAccountIDs = [100, 101];
            expect(IOUUtils.calculateAmount(participantsAccountIDs.length, 10300, 'JPY', true)).toBe(3500);
            expect(IOUUtils.calculateAmount(participantsAccountIDs.length, 10300, 'JPY')).toBe(3400);
        });
        test('103 USD split among 3 participants including the default user should be [34.34, 34.33, 34.33]', function () {
            var participantsAccountIDs = [100, 101];
            expect(IOUUtils.calculateAmount(participantsAccountIDs.length, 10300, 'USD', true)).toBe(3434);
            expect(IOUUtils.calculateAmount(participantsAccountIDs.length, 10300, 'USD')).toBe(3433);
        });
        test('10 AFN split among 4 participants including the default user should be [1, 3, 3, 3]', function () {
            var participantsAccountIDs = [100, 101, 102];
            expect(IOUUtils.calculateAmount(participantsAccountIDs.length, 1000, 'AFN', true)).toBe(100);
            expect(IOUUtils.calculateAmount(participantsAccountIDs.length, 1000, 'AFN')).toBe(300);
        });
        test('10.12 USD split among 4 participants including the default user should be [2.53, 2.53, 2.53, 2.53]', function () {
            var participantsAccountIDs = [100, 101, 102];
            expect(IOUUtils.calculateAmount(participantsAccountIDs.length, 1012, 'USD', true)).toBe(253);
            expect(IOUUtils.calculateAmount(participantsAccountIDs.length, 1012, 'USD')).toBe(253);
        });
        test('10.12 USD split among 3 participants including the default user should be [3.38, 3.37, 3.37]', function () {
            var participantsAccountIDs = [100, 102];
            expect(IOUUtils.calculateAmount(participantsAccountIDs.length, 1012, 'USD', true)).toBe(338);
            expect(IOUUtils.calculateAmount(participantsAccountIDs.length, 1012, 'USD')).toBe(337);
        });
        test('0.02 USD split among 4 participants including the default user should be [-0.01, 0.01, 0.01, 0.01]', function () {
            var participantsAccountIDs = [100, 101, 102];
            expect(IOUUtils.calculateAmount(participantsAccountIDs.length, 2, 'USD', true)).toBe(-1);
            expect(IOUUtils.calculateAmount(participantsAccountIDs.length, 2, 'USD')).toBe(1);
        });
        test('1 RSD split among 3 participants including the default user should be [0.34, 0.33, 0.33]', function () {
            // RSD is a special case that we forced to have 2 decimals
            var participantsAccountIDs = [100, 101];
            expect(IOUUtils.calculateAmount(participantsAccountIDs.length, 100, 'RSD', true)).toBe(34);
            expect(IOUUtils.calculateAmount(participantsAccountIDs.length, 100, 'RSD')).toBe(33);
        });
        test('1 BHD split among 3 participants including the default user should be [0.34, 0.33, 0.33]', function () {
            // BHD has 3 decimal places, but it still produces parts with only 2 decimal places because of a backend limitation
            var participantsAccountIDs = [100, 101];
            expect(IOUUtils.calculateAmount(participantsAccountIDs.length, 100, 'BHD', true)).toBe(34);
            expect(IOUUtils.calculateAmount(participantsAccountIDs.length, 100, 'BHD')).toBe(33);
        });
    });
    describe('insertTagIntoTransactionTagsString', function () {
        test('Inserting a tag into tag string should update the tag', function () {
            expect(IOUUtils.insertTagIntoTransactionTagsString(':NY:Texas', 'California', 2)).toBe(':NY:California');
        });
        test('Inserting a tag into an index with no tags should update the tag', function () {
            expect(IOUUtils.insertTagIntoTransactionTagsString('::California', 'NY', 1)).toBe(':NY:California');
        });
        test('Inserting a tag with colon in name into tag string should keep the colon in tag', function () {
            expect(IOUUtils.insertTagIntoTransactionTagsString('East:NY:California', 'City \\: \\:', 1)).toBe('East:City \\: \\::California');
        });
        test('Remove a tag from tagString', function () {
            expect(IOUUtils.insertTagIntoTransactionTagsString('East:City \\: \\::California', '', 1)).toBe('East::California');
        });
    });
});
describe('isValidMoneyRequestType', function () {
    test('Return true for valid iou type', function () {
        Object.values(CONST_1.default.IOU.TYPE).forEach(function (iouType) {
            expect(IOUUtils.isValidMoneyRequestType(iouType)).toBe(true);
        });
    });
    test('Return false for invalid iou type', function () {
        expect(IOUUtils.isValidMoneyRequestType('money')).toBe(false);
    });
});
describe('hasRTERWithoutViolation', function () {
    test('Return true if there is at least one rter without violation in transactionViolations with given transactionIDs.', function () { return __awaiter(void 0, void 0, void 0, function () {
        var transactionIDWithViolation, transactionIDWithoutViolation, currentReportId, transactionWithViolation, transactionWithoutViolation, transactionViolations, violations;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    transactionIDWithViolation = 1;
                    transactionIDWithoutViolation = 2;
                    currentReportId = '';
                    transactionWithViolation = __assign(__assign({}, (0, transaction_1.default)(transactionIDWithViolation)), { category: '', tag: '', created: testDate, reportID: currentReportId });
                    transactionWithoutViolation = __assign(__assign({}, (0, transaction_1.default)(transactionIDWithoutViolation)), { category: '', tag: '', created: testDate, reportID: currentReportId });
                    transactionViolations = "transactionViolations_".concat(transactionIDWithViolation);
                    violations = (_a = {},
                        _a[transactionViolations] = [
                            {
                                type: 'warning',
                                name: 'rter',
                                data: {
                                    tooltip: "Personal Cards: Fix your card from Account Settings. Corporate Cards: ask your Expensify admin to fix your company's card connection.",
                                    rterType: 'brokenCardConnection',
                                },
                                showInReview: true,
                            },
                        ],
                        _a);
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionIDWithViolation), transactionWithViolation)];
                case 1:
                    _b.sent();
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionIDWithoutViolation), transactionWithoutViolation)];
                case 2:
                    _b.sent();
                    expect((0, TransactionUtils_1.hasAnyTransactionWithoutRTERViolation)([transactionWithoutViolation, transactionWithViolation], violations)).toBe(true);
                    return [2 /*return*/];
            }
        });
    }); });
    test('Return false if there is no rter without violation in all transactionViolations with given transactionIDs.', function () { return __awaiter(void 0, void 0, void 0, function () {
        var transactionIDWithViolation, currentReportId, transactionWithViolation, transactionViolations, violations;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    transactionIDWithViolation = 1;
                    currentReportId = '';
                    transactionWithViolation = __assign(__assign({}, (0, transaction_1.default)(transactionIDWithViolation)), { category: '', tag: '', created: testDate, reportID: currentReportId });
                    transactionViolations = "transactionViolations_".concat(transactionIDWithViolation);
                    violations = (_a = {},
                        _a[transactionViolations] = [
                            {
                                type: 'warning',
                                name: 'rter',
                                data: {
                                    tooltip: "Personal Cards: Fix your card from Account Settings. Corporate Cards: ask your Expensify admin to fix your company's card connection.",
                                    rterType: 'brokenCardConnection',
                                },
                                showInReview: true,
                            },
                        ],
                        _a);
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionIDWithViolation), transactionWithViolation)];
                case 1:
                    _b.sent();
                    expect((0, TransactionUtils_1.hasAnyTransactionWithoutRTERViolation)([transactionWithViolation], violations)).toBe(false);
                    return [2 /*return*/];
            }
        });
    }); });
});
describe('canSubmitReport', function () {
    test('Return true if report can be submitted', function () { return __awaiter(void 0, void 0, void 0, function () {
        var fakePolicy, expenseReport, transactionIDWithViolation, transactionIDWithoutViolation, transactionWithViolation, transactionWithoutViolation, transactionViolations, violations;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, react_native_onyx_1.default.merge(ONYXKEYS_1.default.SESSION, { accountID: currentUserAccountID })];
                case 1:
                    _b.sent();
                    fakePolicy = __assign(__assign({}, (0, policies_1.default)(6)), { ownerAccountID: currentUserAccountID, areRulesEnabled: true, preventSelfApproval: false, autoReportingFrequency: 'immediate', harvesting: {
                            enabled: false,
                        } });
                    expenseReport = __assign(__assign({}, (0, reports_1.createRandomReport)(6)), { type: CONST_1.default.REPORT.TYPE.EXPENSE, managerID: currentUserAccountID, ownerAccountID: currentUserAccountID, policyID: fakePolicy.id, stateNum: CONST_1.default.REPORT.STATE_NUM.OPEN, statusNum: CONST_1.default.REPORT.STATUS_NUM.OPEN });
                    transactionIDWithViolation = 1;
                    transactionIDWithoutViolation = 2;
                    transactionWithViolation = __assign(__assign({}, (0, transaction_1.default)(transactionIDWithViolation)), { category: '', tag: '', created: testDate, reportID: expenseReport === null || expenseReport === void 0 ? void 0 : expenseReport.reportID });
                    transactionWithoutViolation = __assign(__assign({}, (0, transaction_1.default)(transactionIDWithoutViolation)), { category: '', tag: '', created: testDate, reportID: expenseReport === null || expenseReport === void 0 ? void 0 : expenseReport.reportID });
                    transactionViolations = "transactionViolations_".concat(transactionIDWithViolation);
                    violations = (_a = {},
                        _a[transactionViolations] = [
                            {
                                type: 'warning',
                                name: 'rter',
                                data: {
                                    tooltip: "Personal Cards: Fix your card from Account Settings. Corporate Cards: ask your Expensify admin to fix your company's card connection.",
                                    rterType: 'brokenCardConnection',
                                },
                                showInReview: true,
                            },
                        ],
                        _a);
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionIDWithViolation), transactionWithViolation)];
                case 2:
                    _b.sent();
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionIDWithoutViolation), transactionWithoutViolation)];
                case 3:
                    _b.sent();
                    expect((0, IOU_1.canSubmitReport)(expenseReport, fakePolicy, [transactionWithViolation, transactionWithoutViolation], violations)).toBe(true);
                    return [2 /*return*/];
            }
        });
    }); });
    test('Return false if report can not be submitted', function () { return __awaiter(void 0, void 0, void 0, function () {
        var fakePolicy, expenseReport;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, react_native_onyx_1.default.merge(ONYXKEYS_1.default.SESSION, { accountID: currentUserAccountID })];
                case 1:
                    _a.sent();
                    fakePolicy = __assign(__assign({}, (0, policies_1.default)(6)), { ownerAccountID: currentUserAccountID, areRulesEnabled: true, preventSelfApproval: false });
                    expenseReport = __assign(__assign({}, (0, reports_1.createRandomReport)(6)), { type: CONST_1.default.REPORT.TYPE.EXPENSE, managerID: currentUserAccountID, ownerAccountID: currentUserAccountID, policyID: fakePolicy.id });
                    expect((0, IOU_1.canSubmitReport)(expenseReport, fakePolicy, [], undefined)).toBe(false);
                    return [2 /*return*/];
            }
        });
    }); });
    it('returns false if the report is archived', function () { return __awaiter(void 0, void 0, void 0, function () {
        var policy, report, isReportArchived;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    policy = __assign(__assign({}, (0, policies_1.default)(7)), { ownerAccountID: currentUserAccountID, areRulesEnabled: true, preventSelfApproval: false });
                    report = __assign(__assign({}, (0, reports_1.createRandomReport)(7)), { type: CONST_1.default.REPORT.TYPE.EXPENSE, managerID: currentUserAccountID, ownerAccountID: currentUserAccountID, policyID: policy.id });
                    // This is what indicates that a report is archived (see ReportUtils.isArchivedReport())
                    return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_NAME_VALUE_PAIRS).concat(report.reportID), {
                            private_isArchived: new Date().toString(),
                        })];
                case 1:
                    // This is what indicates that a report is archived (see ReportUtils.isArchivedReport())
                    _a.sent();
                    isReportArchived = (0, react_native_1.renderHook)(function () { return (0, useReportIsArchived_1.default)(report === null || report === void 0 ? void 0 : report.reportID); }).result;
                    expect((0, IOU_1.canSubmitReport)(report, policy, [], undefined, isReportArchived.current)).toBe(false);
                    return [2 /*return*/];
            }
        });
    }); });
});
describe('Check valid amount for IOU/Expense request', function () {
    test('IOU amount should be positive', function () {
        var iouReport = ReportUtils.buildOptimisticIOUReport(1, 2, 100, '1', 'USD');
        var iouTransaction = TransactionUtils.buildOptimisticTransaction({
            transactionParams: {
                amount: 100,
                currency: 'USD',
                reportID: iouReport.reportID,
            },
        });
        var iouAmount = TransactionUtils.getAmount(iouTransaction, false, false);
        expect(iouAmount).toBeGreaterThan(0);
    });
    test('Expense amount should be negative', function () {
        var expenseReport = ReportUtils.buildOptimisticExpenseReport('212', '123', 100, 122, 'USD');
        var expenseTransaction = TransactionUtils.buildOptimisticTransaction({
            transactionParams: {
                amount: 100,
                currency: 'USD',
                reportID: expenseReport.reportID,
            },
        });
        var expenseAmount = TransactionUtils.getAmount(expenseTransaction, true, false);
        expect(expenseAmount).toBeLessThan(0);
    });
});
