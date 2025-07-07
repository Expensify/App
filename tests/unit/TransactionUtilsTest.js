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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_onyx_1 = require("react-native-onyx");
var TransactionUtils_1 = require("@libs/TransactionUtils");
var CONST_1 = require("@src/CONST");
var IntlStore_1 = require("@src/languages/IntlStore");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var TransactionUtils = require("../../src/libs/TransactionUtils");
var policies_1 = require("../utils/collections/policies");
var waitForBatchedUpdates_1 = require("../utils/waitForBatchedUpdates");
function generateTransaction(values) {
    if (values === void 0) { values = {}; }
    var reportID = '1';
    var amount = 100;
    var currency = 'USD';
    var comment = '';
    var attendees = [];
    var created = '2023-10-01';
    var baseValues = TransactionUtils.buildOptimisticTransaction({
        transactionParams: {
            amount: amount,
            currency: currency,
            reportID: reportID,
            comment: comment,
            attendees: attendees,
            created: created,
        },
    });
    return __assign(__assign({}, baseValues), values);
}
var CURRENT_USER_ID = 1;
var SECOND_USER_ID = 2;
var FAKE_OPEN_REPORT_ID = 'FAKE_OPEN_REPORT_ID';
var FAKE_OPEN_REPORT_SECOND_USER_ID = 'FAKE_OPEN_REPORT_SECOND_USER_ID';
var FAKE_PROCESSING_REPORT_ID = 'FAKE_PROCESSING_REPORT_ID';
var FAKE_APPROVED_REPORT_ID = 'FAKE_APPROVED_REPORT_ID';
var openReport = {
    reportID: FAKE_OPEN_REPORT_ID,
    ownerAccountID: CURRENT_USER_ID,
    type: CONST_1.default.REPORT.TYPE.EXPENSE,
    stateNum: CONST_1.default.REPORT.STATE_NUM.OPEN,
    statusNum: CONST_1.default.REPORT.STATUS_NUM.OPEN,
};
var processingReport = {
    reportID: FAKE_PROCESSING_REPORT_ID,
    ownerAccountID: CURRENT_USER_ID,
    type: CONST_1.default.REPORT.TYPE.EXPENSE,
    stateNum: CONST_1.default.REPORT.STATE_NUM.SUBMITTED,
};
var approvedReport = {
    reportID: FAKE_APPROVED_REPORT_ID,
    ownerAccountID: SECOND_USER_ID,
    type: CONST_1.default.REPORT.TYPE.EXPENSE,
    stateNum: CONST_1.default.REPORT.STATE_NUM.APPROVED,
};
var secondUserOpenReport = {
    reportID: FAKE_OPEN_REPORT_SECOND_USER_ID,
    ownerAccountID: SECOND_USER_ID,
    type: CONST_1.default.REPORT.TYPE.EXPENSE,
    stateNum: CONST_1.default.REPORT.STATE_NUM.OPEN,
    statusNum: CONST_1.default.REPORT.STATUS_NUM.OPEN,
};
var reportCollectionDataSet = (_a = {},
    _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(FAKE_OPEN_REPORT_ID)] = openReport,
    _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(FAKE_PROCESSING_REPORT_ID)] = processingReport,
    _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(FAKE_APPROVED_REPORT_ID)] = approvedReport,
    _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(FAKE_OPEN_REPORT_SECOND_USER_ID)] = secondUserOpenReport,
    _a);
describe('TransactionUtils', function () {
    beforeAll(function () {
        var _a;
        react_native_onyx_1.default.init({
            keys: ONYXKEYS_1.default,
            initialKeyStates: __assign((_a = {}, _a[ONYXKEYS_1.default.SESSION] = { accountID: CURRENT_USER_ID }, _a), reportCollectionDataSet),
        });
        IntlStore_1.default.load(CONST_1.default.LOCALES.EN);
        return (0, waitForBatchedUpdates_1.default)();
    });
    describe('getCreated', function () {
        describe('when the transaction property "modifiedCreated" has value', function () {
            var transaction = generateTransaction({
                created: '2023-10-01',
                modifiedCreated: '2023-10-25',
            });
            it('returns the "modifiedCreated" date with the correct format', function () {
                var expectedResult = '2023-10-25';
                var result = TransactionUtils.getFormattedCreated(transaction);
                expect(result).toEqual(expectedResult);
            });
        });
        describe('when the transaction property "modifiedCreated" does not have value', function () {
            describe('and the transaction property "created" has value', function () {
                var transaction = generateTransaction({
                    created: '2023-10-01',
                    modifiedCreated: undefined,
                });
                it('returns the "created" date with the correct format', function () {
                    var expectedResult = '2023-10-01';
                    var result = TransactionUtils.getFormattedCreated(transaction);
                    expect(result).toEqual(expectedResult);
                });
            });
            describe('and the transaction property "created" does not have value', function () {
                var transaction = generateTransaction({
                    created: undefined,
                    modifiedCreated: undefined,
                });
                it('returns an empty string', function () {
                    var expectedResult = '';
                    var result = TransactionUtils.getFormattedCreated(transaction);
                    expect(result).toEqual(expectedResult);
                });
            });
        });
    });
    describe('getPostedDate', function () {
        describe('when posted date is undefined', function () {
            var transaction = generateTransaction({
                posted: undefined,
            });
            it('returns an empty string', function () {
                var expectedResult = '';
                var result = TransactionUtils.getFormattedPostedDate(transaction);
                expect(result).toEqual(expectedResult);
            });
        });
        describe('when posted date has value with format YYYYMMdd', function () {
            var transaction = generateTransaction({
                posted: '20241125',
            });
            it('returns the posted date with the correct format YYYY-MM-dd', function () {
                var expectedResult = '2024-11-25';
                var result = TransactionUtils.getFormattedPostedDate(transaction);
                expect(result).toEqual(expectedResult);
            });
        });
    });
    describe('getCategoryTaxCodeAndAmount', function () {
        it('should return the associated tax when the category matches the tax expense rules', function () {
            // Given a policy with tax expense rules associated with a category
            var category = 'Advertising';
            var fakePolicy = __assign(__assign({}, (0, policies_1.default)(0)), { taxRates: CONST_1.default.DEFAULT_TAX, rules: { expenseRules: (0, policies_1.createCategoryTaxExpenseRules)(category, 'id_TAX_RATE_1') } });
            var transaction = generateTransaction();
            // When retrieving the tax from the associated category
            var _a = TransactionUtils.getCategoryTaxCodeAndAmount(category, transaction, fakePolicy), categoryTaxCode = _a.categoryTaxCode, categoryTaxAmount = _a.categoryTaxAmount;
            // Then it should return the associated tax code and amount
            expect(categoryTaxCode).toBe('id_TAX_RATE_1');
            expect(categoryTaxAmount).toBe(5);
        });
        it("should return the default tax when the category doesn't match the tax expense rules", function () {
            // Given a policy with tax expense rules associated with a category
            var ruleCategory = 'Advertising';
            var selectedCategory = 'Benefits';
            var fakePolicy = __assign(__assign({}, (0, policies_1.default)(0)), { taxRates: CONST_1.default.DEFAULT_TAX, rules: { expenseRules: (0, policies_1.createCategoryTaxExpenseRules)(ruleCategory, 'id_TAX_RATE_1') } });
            var transaction = generateTransaction();
            // When retrieving the tax from a category that is not associated with the tax expense rules
            var _a = TransactionUtils.getCategoryTaxCodeAndAmount(selectedCategory, transaction, fakePolicy), categoryTaxCode = _a.categoryTaxCode, categoryTaxAmount = _a.categoryTaxAmount;
            // Then it should return the default tax code and amount
            expect(categoryTaxCode).toBe('id_TAX_EXEMPT');
            expect(categoryTaxAmount).toBe(0);
        });
        it("should return the foreign default tax when the category doesn't match the tax expense rules and using a foreign currency", function () {
            // Given a policy with tax expense rules associated with a category and a transaction with a foreign currency
            var ruleCategory = 'Advertising';
            var selectedCategory = 'Benefits';
            var fakePolicy = __assign(__assign({}, (0, policies_1.default)(0)), { taxRates: __assign(__assign({}, CONST_1.default.DEFAULT_TAX), { foreignTaxDefault: 'id_TAX_RATE_2', taxes: __assign(__assign({}, CONST_1.default.DEFAULT_TAX.taxes), { 
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        id_TAX_RATE_2: {
                            name: 'Tax rate 2',
                            value: '10%',
                        } }) }), outputCurrency: 'IDR', rules: { expenseRules: (0, policies_1.createCategoryTaxExpenseRules)(ruleCategory, 'id_TAX_RATE_1') } });
            var transaction = generateTransaction();
            // When retrieving the tax from a category that is not associated with the tax expense rules
            var _a = TransactionUtils.getCategoryTaxCodeAndAmount(selectedCategory, transaction, fakePolicy), categoryTaxCode = _a.categoryTaxCode, categoryTaxAmount = _a.categoryTaxAmount;
            // Then it should return the default tax code and amount
            expect(categoryTaxCode).toBe('id_TAX_RATE_2');
            expect(categoryTaxAmount).toBe(9);
        });
        describe('should return undefined tax', function () {
            it('if the transaction type is distance', function () {
                // Given a policy with tax expense rules associated with a category
                var category = 'Advertising';
                var fakePolicy = __assign(__assign({}, (0, policies_1.default)(0)), { taxRates: CONST_1.default.DEFAULT_TAX, rules: { expenseRules: (0, policies_1.createCategoryTaxExpenseRules)(category, 'id_TAX_RATE_1') } });
                var transaction = __assign(__assign({}, generateTransaction()), { iouRequestType: CONST_1.default.IOU.REQUEST_TYPE.DISTANCE });
                // When retrieving the tax from the associated category
                var _a = TransactionUtils.getCategoryTaxCodeAndAmount(category, transaction, fakePolicy), categoryTaxCode = _a.categoryTaxCode, categoryTaxAmount = _a.categoryTaxAmount;
                // Then it should return undefined for both the tax code and the tax amount
                expect(categoryTaxCode).toBe(undefined);
                expect(categoryTaxAmount).toBe(undefined);
            });
            it('if there are no policy tax expense rules', function () {
                // Given a policy without tax expense rules
                var category = 'Advertising';
                var fakePolicy = __assign(__assign({}, (0, policies_1.default)(0)), { taxRates: CONST_1.default.DEFAULT_TAX, rules: {} });
                var transaction = generateTransaction();
                // When retrieving the tax from a category
                var _a = TransactionUtils.getCategoryTaxCodeAndAmount(category, transaction, fakePolicy), categoryTaxCode = _a.categoryTaxCode, categoryTaxAmount = _a.categoryTaxAmount;
                // Then it should return undefined for both the tax code and the tax amount
                expect(categoryTaxCode).toBe(undefined);
                expect(categoryTaxAmount).toBe(undefined);
            });
        });
    });
    describe('getUpdatedTransaction', function () {
        it('should return updated category and tax when updating category with a category tax rules', function () {
            // Given a policy with tax expense rules associated with a category
            var category = 'Advertising';
            var taxCode = 'id_TAX_RATE_1';
            var fakePolicy = __assign(__assign({}, (0, policies_1.default)(0)), { taxRates: CONST_1.default.DEFAULT_TAX, rules: { expenseRules: (0, policies_1.createCategoryTaxExpenseRules)(category, taxCode) } });
            var transaction = generateTransaction();
            // When updating the transaction category to the category associated with the rule
            var updatedTransaction = TransactionUtils.getUpdatedTransaction({
                transaction: transaction,
                isFromExpenseReport: true,
                policy: fakePolicy,
                transactionChanges: { category: category },
            });
            // Then the updated transaction should contain the tax from the matched rule
            expect(updatedTransaction.category).toBe(category);
            expect(updatedTransaction.taxCode).toBe(taxCode);
            expect(updatedTransaction.taxAmount).toBe(5);
        });
    });
    describe('shouldShowRTERViolationMessage', function () {
        it('should return true if transaction is receipt being scanned', function () {
            var transaction = generateTransaction({
                receipt: {
                    state: CONST_1.default.IOU.RECEIPT_STATE.SCAN_READY,
                },
            });
            expect(TransactionUtils.shouldShowRTERViolationMessage([transaction])).toBe(true);
        });
    });
    describe('calculateTaxAmount', function () {
        it('returns 0 for undefined percentage', function () {
            var result = TransactionUtils.calculateTaxAmount(undefined, 10000, 'USD');
            expect(result).toBe(0);
        });
        it('returns 0 for empty percentage', function () {
            var result = TransactionUtils.calculateTaxAmount('', 10000, 'USD');
            expect(result).toBe(0);
        });
        it('returns 0 for zero percentage', function () {
            var result = TransactionUtils.calculateTaxAmount('0%', 10000, 'USD');
            expect(result).toBe(0);
        });
        it('returns 0 for zero amount', function () {
            var result = TransactionUtils.calculateTaxAmount('10%', 0, 'USD');
            expect(result).toBe(0);
        });
        it('returns correct tax amount for valid percentage and amount', function () {
            var result = TransactionUtils.calculateTaxAmount('10%', 10000, 'USD');
            expect(result).toBe(9.09);
        });
    });
    describe('shouldShowBrokenConnectionViolation', function () {
        it('should return false when no broken connection violations are found for the provided transaction', function () {
            var transactionViolations = [{ type: CONST_1.default.VIOLATION_TYPES.VIOLATION, name: CONST_1.default.VIOLATIONS.DUPLICATED_TRANSACTION }];
            var showBrokenConnectionViolation = (0, TransactionUtils_1.shouldShowBrokenConnectionViolation)(undefined, undefined, transactionViolations);
            expect(showBrokenConnectionViolation).toBe(false);
        });
        it('should return true when a broken connection violation exists for one transaction and the user is the policy member', function () {
            var policy = { role: CONST_1.default.POLICY.ROLE.USER };
            var transactionViolations = [{ type: CONST_1.default.VIOLATION_TYPES.VIOLATION, name: CONST_1.default.VIOLATIONS.RTER, data: { rterType: CONST_1.default.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION } }];
            var showBrokenConnectionViolation = (0, TransactionUtils_1.shouldShowBrokenConnectionViolation)(undefined, policy, transactionViolations);
            expect(showBrokenConnectionViolation).toBe(true);
        });
        it('should return true when a broken connection violation exists for any of the provided transactions and the user is the policy member', function () {
            var _a;
            var policy = { role: CONST_1.default.POLICY.ROLE.USER };
            var transaction1 = generateTransaction();
            var transaction2 = generateTransaction();
            var transactionIDs = [transaction1.transactionID, transaction2.transactionID];
            var transactionViolations = (_a = {},
                _a["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(transaction1.transactionID)] = [
                    {
                        type: CONST_1.default.VIOLATION_TYPES.VIOLATION,
                        name: CONST_1.default.VIOLATIONS.RTER,
                        data: { rterType: CONST_1.default.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION },
                    },
                ],
                _a);
            var showBrokenConnectionViolation = (0, TransactionUtils_1.shouldShowBrokenConnectionViolationForMultipleTransactions)(transactionIDs, undefined, policy, transactionViolations);
            expect(showBrokenConnectionViolation).toBe(true);
        });
        it('should return true when a broken connection violation exists and the user is the policy admin and the expense submitter', function () {
            var policy = { role: CONST_1.default.POLICY.ROLE.ADMIN };
            var report = processingReport;
            var transactionViolations = [{ type: CONST_1.default.VIOLATION_TYPES.VIOLATION, name: CONST_1.default.VIOLATIONS.RTER, data: { rterType: CONST_1.default.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION } }];
            var showBrokenConnectionViolation = (0, TransactionUtils_1.shouldShowBrokenConnectionViolation)(report, policy, transactionViolations);
            expect(showBrokenConnectionViolation).toBe(true);
        });
        it('should return true when a broken connection violation exists, the user is the policy admin and the expense report is in the open state', function () {
            var policy = { role: CONST_1.default.POLICY.ROLE.ADMIN };
            var report = secondUserOpenReport;
            var transactionViolations = [{ type: CONST_1.default.VIOLATION_TYPES.VIOLATION, name: CONST_1.default.VIOLATIONS.RTER, data: { rterType: CONST_1.default.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION } }];
            var showBrokenConnectionViolation = (0, TransactionUtils_1.shouldShowBrokenConnectionViolation)(report, policy, transactionViolations);
            expect(showBrokenConnectionViolation).toBe(true);
        });
        it('should return true when a broken connection violation exists, the user is the policy admin, the expense report is in the processing state and instant submit is enabled', function () {
            var policy = { role: CONST_1.default.POLICY.ROLE.ADMIN, autoReporting: true, autoReportingFrequency: CONST_1.default.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT };
            var report = processingReport;
            var transactionViolations = [{ type: CONST_1.default.VIOLATION_TYPES.VIOLATION, name: CONST_1.default.VIOLATIONS.RTER, data: { rterType: CONST_1.default.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION } }];
            var showBrokenConnectionViolation = (0, TransactionUtils_1.shouldShowBrokenConnectionViolation)(report, policy, transactionViolations);
            expect(showBrokenConnectionViolation).toBe(true);
        });
        it('should return false when a broken connection violation exists, the user is the policy admin but the expense report is in the approved state', function () {
            var policy = { role: CONST_1.default.POLICY.ROLE.ADMIN };
            var report = approvedReport;
            var transactionViolations = [{ type: CONST_1.default.VIOLATION_TYPES.VIOLATION, name: CONST_1.default.VIOLATIONS.RTER, data: { rterType: CONST_1.default.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION } }];
            var showBrokenConnectionViolation = (0, TransactionUtils_1.shouldShowBrokenConnectionViolation)(report, policy, transactionViolations);
            expect(showBrokenConnectionViolation).toBe(false);
        });
    });
    describe('getMerchant', function () {
        it('should return merchant if transaction has merchant', function () {
            var transaction = generateTransaction({
                merchant: 'Merchant',
            });
            var merchant = TransactionUtils.getMerchant(transaction);
            expect(merchant).toBe('Merchant');
        });
        it('should return (none) if transaction has no merchant', function () {
            var transaction = generateTransaction();
            var merchant = TransactionUtils.getMerchant(transaction);
            expect(merchant).toBe('(none)');
        });
        it('should return modified merchant if transaction has modified merchant', function () {
            var transaction = generateTransaction({
                modifiedMerchant: 'Modified Merchant',
                merchant: 'Original Merchant',
            });
            var merchant = TransactionUtils.getMerchant(transaction);
            expect(merchant).toBe('Modified Merchant');
        });
        it('should return distance merchant if transaction is distance expense and pending create', function () {
            var transaction = generateTransaction({
                iouRequestType: CONST_1.default.IOU.REQUEST_TYPE.DISTANCE,
            });
            var merchant = TransactionUtils.getMerchant(transaction);
            expect(merchant).toBe('Pending...');
        });
        it('should return distance merchant if transaction is created distance expense', function () {
            return (0, waitForBatchedUpdates_1.default)()
                .then(function () { return __awaiter(void 0, void 0, void 0, function () {
                var fakePolicy;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            fakePolicy = __assign(__assign({}, (0, policies_1.default)(0)), { customUnits: {
                                    Unit1: {
                                        customUnitID: 'Unit1',
                                        name: CONST_1.default.CUSTOM_UNITS.NAME_DISTANCE,
                                        rates: {
                                            Rate1: {
                                                customUnitRateID: 'Rate1',
                                                currency: CONST_1.default.CURRENCY.USD,
                                                rate: 100,
                                            },
                                        },
                                        enabled: true,
                                        attributes: {
                                            unit: 'mi',
                                        },
                                    },
                                }, outputCurrency: CONST_1.default.CURRENCY.USD });
                            return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(fakePolicy.id), fakePolicy)];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(FAKE_OPEN_REPORT_ID), { policyID: fakePolicy.id })];
                        case 2:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); })
                .then(function () {
                var transaction = generateTransaction({
                    comment: {
                        type: CONST_1.default.TRANSACTION.TYPE.CUSTOM_UNIT,
                        customUnit: {
                            name: CONST_1.default.CUSTOM_UNITS.NAME_DISTANCE,
                            customUnitID: 'Unit1',
                            customUnitRateID: 'Rate1',
                            quantity: 100,
                            distanceUnit: CONST_1.default.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
                        },
                    },
                    reportID: FAKE_OPEN_REPORT_ID,
                });
                var merchant = TransactionUtils.getMerchant(transaction);
                expect(merchant).toBe('100.00 mi @ USD 1.00 / mi');
            });
        });
    });
    describe('getTransactionPendingAction', function () {
        it.each([
            ['when pendingAction is null', null, null],
            ['when pendingAction is delete', CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE, CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE],
            ['when pendingAction is add', CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD, CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD],
        ])('%s', function (_description, pendingAction, expected) {
            var transaction = generateTransaction({ pendingAction: pendingAction });
            var result = TransactionUtils.getTransactionPendingAction(transaction);
            expect(result).toEqual(expected);
        });
        it('when pendingAction is update', function () {
            var pendingAction = CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE;
            var transaction = generateTransaction({
                pendingFields: { amount: pendingAction },
                pendingAction: null,
            });
            var result = TransactionUtils.getTransactionPendingAction(transaction);
            expect(result).toEqual(pendingAction);
        });
    });
    describe('isTransactionPendingDelete', function () {
        it.each([
            ['when pendingAction is null', null, false],
            ['when pendingAction is delete', CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE, true],
            ['when pendingAction is add', CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD, false],
            ['when pendingAction is update', CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE, false],
        ])('%s', function (_description, pendingAction, expected) {
            var transaction = generateTransaction({ pendingAction: pendingAction });
            var result = TransactionUtils.isTransactionPendingDelete(transaction);
            expect(result).toEqual(expected);
        });
    });
});
