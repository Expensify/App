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
var react_native_onyx_1 = require("react-native-onyx");
var CurrencyUtils_1 = require("@libs/CurrencyUtils");
var ReportUtils_1 = require("@libs/ReportUtils");
var TransactionPreviewUtils_1 = require("@libs/TransactionPreviewUtils");
var TransactionUtils_1 = require("@libs/TransactionUtils");
var CONST_1 = require("@src/CONST");
var ReportUtils = require("@src/libs/ReportUtils");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var waitForBatchedUpdates_1 = require("../utils/waitForBatchedUpdates");
var basicProps = {
    iouReport: (0, ReportUtils_1.buildOptimisticIOUReport)(123, 234, 1000, '1', 'USD'),
    transaction: (0, TransactionUtils_1.buildOptimisticTransaction)({
        transactionParams: {
            amount: 100,
            currency: 'USD',
            reportID: '1',
            comment: '',
            attendees: [],
            created: '2024-01-01',
        },
    }),
    translate: jest.fn().mockImplementation(function (key) { return key; }),
    action: (0, ReportUtils_1.buildOptimisticIOUReportAction)({
        type: 'create',
        amount: 100,
        currency: 'USD',
        comment: '',
        participants: [],
        transactionID: '1',
        paymentType: undefined,
        iouReportID: '1',
    }),
    violations: [],
    transactionDetails: {},
    isBillSplit: false,
    shouldShowRBR: false,
    isReportAPolicyExpenseChat: false,
    areThereDuplicates: false,
};
describe('TransactionPreviewUtils', function () {
    beforeAll(function () {
        react_native_onyx_1.default.init({
            keys: ONYXKEYS_1.default,
        });
    });
    beforeEach(function () {
        return react_native_onyx_1.default.clear().then(waitForBatchedUpdates_1.default);
    });
    describe('getTransactionPreviewTextAndTranslationPaths', function () {
        it('should return an empty RBR message when shouldShowRBR is false and no transaction is given', function () {
            var result = (0, TransactionPreviewUtils_1.getTransactionPreviewTextAndTranslationPaths)(__assign(__assign({}, basicProps), { shouldShowRBR: false }));
            expect(result.RBRMessage.text).toEqual('');
        });
        it('returns correct hold message when the transaction is on hold', function () {
            var functionArgs = __assign(__assign({}, basicProps), { transaction: __assign(__assign({}, basicProps.transaction), { comment: { hold: 'true' } }), originalTransaction: undefined, shouldShowRBR: true });
            var result = (0, TransactionPreviewUtils_1.getTransactionPreviewTextAndTranslationPaths)(functionArgs);
            expect(result.RBRMessage.translationPath).toContain('iou.expenseWasPutOnHold');
        });
        it('should handle missing iouReport and transaction correctly', function () {
            var functionArgs = __assign(__assign({}, basicProps), { iouReport: undefined, transaction: undefined, originalTransaction: undefined });
            var result = (0, TransactionPreviewUtils_1.getTransactionPreviewTextAndTranslationPaths)(functionArgs);
            expect(result.RBRMessage.text).toEqual('');
            expect(result.previewHeaderText).toContainEqual({ translationPath: 'iou.cash' });
            expect(result.displayAmountText.text).toEqual('$0.00');
        });
        it('returns merchant missing and amount missing message when appropriate', function () {
            var functionArgs = __assign(__assign({}, basicProps), { transaction: __assign(__assign({}, basicProps.transaction), { merchant: '', amount: 0 }), originalTransaction: undefined, shouldShowRBR: true });
            var result = (0, TransactionPreviewUtils_1.getTransactionPreviewTextAndTranslationPaths)(functionArgs);
            expect(result.RBRMessage.translationPath).toEqual('violations.reviewRequired');
        });
        it('should display showCashOrCard in previewHeaderText', function () {
            var functionArgsWithCardTransaction = __assign(__assign({}, basicProps), { transaction: __assign(__assign({}, basicProps.transaction), { managedCard: true }), originalTransaction: undefined });
            var cardTransaction = (0, TransactionPreviewUtils_1.getTransactionPreviewTextAndTranslationPaths)(functionArgsWithCardTransaction);
            var cashTransaction = (0, TransactionPreviewUtils_1.getTransactionPreviewTextAndTranslationPaths)(__assign({}, basicProps));
            expect(cardTransaction.previewHeaderText).toEqual(expect.arrayContaining([{ translationPath: 'iou.card' }]));
            expect(cashTransaction.previewHeaderText).toEqual(expect.arrayContaining([{ translationPath: 'iou.cash' }]));
        });
        it('displays appropriate header text if the transaction is bill split', function () {
            var functionArgs = __assign(__assign({}, basicProps), { isBillSplit: true, originalTransaction: undefined });
            var result = (0, TransactionPreviewUtils_1.getTransactionPreviewTextAndTranslationPaths)(functionArgs);
            expect(result.previewHeaderText).toEqual(expect.arrayContaining([{ translationPath: 'iou.split' }]));
        });
        it('displays description when receipt is being scanned', function () {
            var functionArgs = __assign(__assign({}, basicProps), { transaction: __assign(__assign({}, basicProps.transaction), { receipt: { state: CONST_1.default.IOU.RECEIPT_STATE.SCANNING } }), originalTransaction: undefined });
            var result = (0, TransactionPreviewUtils_1.getTransactionPreviewTextAndTranslationPaths)(functionArgs);
            expect(result.previewHeaderText).toEqual(expect.arrayContaining([{ translationPath: 'common.receipt' }]));
        });
        it('should apply correct text when transaction is pending and not a bill split', function () {
            var functionArgs = __assign(__assign({}, basicProps), { transaction: __assign(__assign({}, basicProps.transaction), { status: CONST_1.default.TRANSACTION.STATUS.PENDING }), originalTransaction: undefined });
            var result = (0, TransactionPreviewUtils_1.getTransactionPreviewTextAndTranslationPaths)(functionArgs);
            expect(result.previewHeaderText).toEqual(expect.arrayContaining([{ translationPath: 'iou.pending' }]));
        });
        it('handles currency and amount display during scanning correctly', function () {
            var functionArgs = __assign(__assign({}, basicProps), { transactionDetails: { amount: 300, currency: 'EUR' }, transaction: __assign(__assign({}, basicProps.transaction), { receipt: { state: CONST_1.default.IOU.RECEIPT_STATE.SCANNING } }), originalTransaction: undefined });
            var result = (0, TransactionPreviewUtils_1.getTransactionPreviewTextAndTranslationPaths)(functionArgs);
            expect(result.displayAmountText.translationPath).toEqual('iou.receiptStatusTitle');
        });
        it('handles currency and amount display correctly for scan split bill manually completed', function () { return __awaiter(void 0, void 0, void 0, function () {
            var modifiedAmount, currency, originalTransactionID, functionArgs, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        modifiedAmount = 300;
                        currency = 'EUR';
                        originalTransactionID = '2';
                        functionArgs = __assign(__assign({}, basicProps), { transactionDetails: { amount: modifiedAmount / 2, currency: currency }, transaction: __assign(__assign({}, basicProps.transaction), { amount: modifiedAmount / 2, currency: currency, comment: { originalTransactionID: originalTransactionID, source: CONST_1.default.IOU.TYPE.SPLIT } }), isBillSplit: true });
                        return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(originalTransactionID), {
                                reportID: CONST_1.default.REPORT.SPLIT_REPORT_ID,
                                transactionID: originalTransactionID,
                                comment: {
                                    splits: [
                                        { accountID: 1, email: 'aa@gmail.com' },
                                        { accountID: 2, email: 'cc@gmail.com' },
                                    ],
                                },
                                modifiedAmount: modifiedAmount,
                                amount: 0,
                                currency: currency,
                            })];
                    case 1:
                        _a.sent();
                        result = (0, TransactionPreviewUtils_1.getTransactionPreviewTextAndTranslationPaths)(functionArgs);
                        expect(result.displayAmountText.text).toEqual((0, CurrencyUtils_1.convertAmountToDisplayString)(modifiedAmount, currency));
                        return [2 /*return*/];
                }
            });
        }); });
        it('shows approved message when the iouReport is canceled', function () {
            var functionArgs = __assign(__assign({}, basicProps), { iouReport: __assign(__assign({}, basicProps.iouReport), { isCancelledIOU: true }), originalTransaction: undefined });
            var result = (0, TransactionPreviewUtils_1.getTransactionPreviewTextAndTranslationPaths)(functionArgs);
            expect(result.previewHeaderText).toContainEqual({ translationPath: 'iou.canceled' });
        });
        it('should include "Approved" in the preview when the report is approved, regardless of whether RBR is shown', function () {
            var functionArgs = __assign(__assign({}, basicProps), { iouReport: __assign(__assign({}, basicProps.iouReport), { stateNum: CONST_1.default.REPORT.STATE_NUM.APPROVED, statusNum: CONST_1.default.REPORT.STATUS_NUM.APPROVED }), shouldShowRBR: true, originalTransaction: undefined });
            jest.spyOn(ReportUtils, 'isPaidGroupPolicyExpenseReport').mockReturnValue(true);
            var result = (0, TransactionPreviewUtils_1.getTransactionPreviewTextAndTranslationPaths)(functionArgs);
            expect(result.previewHeaderText).toContainEqual({ translationPath: 'iou.approved' });
        });
    });
    describe('createTransactionPreviewConditionals', function () {
        beforeAll(function () {
            react_native_onyx_1.default.merge(ONYXKEYS_1.default.SESSION, { accountID: 999 });
        });
        afterAll(function () {
            react_native_onyx_1.default.clear([ONYXKEYS_1.default.SESSION]);
        });
        it('should determine RBR visibility according to violation and hold conditions', function () {
            var functionArgs = __assign(__assign({}, basicProps), { violations: [{ name: CONST_1.default.VIOLATIONS.MISSING_CATEGORY, type: CONST_1.default.VIOLATION_TYPES.VIOLATION, transactionID: 123, showInReview: true }] });
            var result = (0, TransactionPreviewUtils_1.createTransactionPreviewConditionals)(functionArgs);
            expect(result.shouldShowRBR).toBeTruthy();
        });
        it("should not show category if it's not a policy expense chat", function () {
            var functionArgs = __assign(__assign({}, basicProps), { isReportAPolicyExpenseChat: false });
            var result = (0, TransactionPreviewUtils_1.createTransactionPreviewConditionals)(functionArgs);
            expect(result.shouldShowCategory).toBeFalsy();
        });
        it('should show keep button when there are duplicates', function () {
            var functionArgs = __assign(__assign({}, basicProps), { areThereDuplicates: true });
            var result = (0, TransactionPreviewUtils_1.createTransactionPreviewConditionals)(functionArgs);
            expect(result.shouldShowKeepButton).toBeTruthy();
        });
        it('should show split share if amount is positive and bill is split', function () {
            var functionArgs = __assign(__assign({}, basicProps), { isBillSplit: true, transactionDetails: {
                    amount: 1,
                }, action: __assign(__assign({}, basicProps.action), { originalMessage: {
                        participantAccountIDs: [999],
                        amount: 100,
                        currency: 'USD',
                        type: CONST_1.default.REPORT.ACTIONS.TYPE.IOU,
                    } }) });
            var result = (0, TransactionPreviewUtils_1.createTransactionPreviewConditionals)(functionArgs);
            expect(result.shouldShowSplitShare).toBeTruthy();
        });
        it('should show skeleton if transaction data is empty and action is not deleted', function () {
            var functionArgs = __assign(__assign({}, basicProps), { transaction: undefined });
            var result = (0, TransactionPreviewUtils_1.createTransactionPreviewConditionals)(functionArgs);
            expect(result.shouldShowSkeleton).toBeTruthy();
        });
        it('should show merchant if merchant data is valid and significant', function () {
            var functionArgs = __assign(__assign({}, basicProps), { transactionDetails: { merchant: 'Valid Merchant' } });
            var result = (0, TransactionPreviewUtils_1.createTransactionPreviewConditionals)(functionArgs);
            expect(result.shouldShowMerchant).toBeTruthy();
        });
        it('should not show description when merchant is displayed', function () {
            var functionArgs = __assign(__assign({}, basicProps), { transactionDetails: { merchant: 'Valid Merchant', comment: 'Valid Comment' } });
            var result = (0, TransactionPreviewUtils_1.createTransactionPreviewConditionals)(functionArgs);
            expect(result.shouldShowDescription).toBeFalsy();
        });
        it("should show tag if it's a policy expense chat and tag is present", function () {
            var functionArgs = __assign(__assign({}, basicProps), { isReportAPolicyExpenseChat: true, transactionDetails: { tag: 'Transport' } });
            var result = (0, TransactionPreviewUtils_1.createTransactionPreviewConditionals)(functionArgs);
            expect(result.shouldShowTag).toBeTruthy();
        });
        it('should correctly show violation message if there are multiple violations', function () {
            var functionArgs = __assign(__assign({}, basicProps), { violations: [
                    { name: CONST_1.default.VIOLATIONS.MISSING_CATEGORY, type: CONST_1.default.VIOLATION_TYPES.VIOLATION, showInReview: true },
                    { name: CONST_1.default.VIOLATIONS.CUSTOM_RULES, type: CONST_1.default.VIOLATION_TYPES.WARNING, showInReview: true },
                ], transactionDetails: { amount: 200 } });
            var result = (0, TransactionPreviewUtils_1.createTransactionPreviewConditionals)(functionArgs);
            expect(result.shouldShowRBR).toBeTruthy();
        });
        it('should ensure RBR is not shown when no violation and no hold', function () {
            var functionArgs = __assign(__assign({}, basicProps), { isTransactionOnHold: false });
            var result = (0, TransactionPreviewUtils_1.createTransactionPreviewConditionals)(functionArgs);
            expect(result.shouldShowRBR).toBeFalsy();
        });
        it('should show description if no merchant is presented and is not scanning', function () {
            var functionArgs = __assign(__assign({}, basicProps), { transactionDetails: { comment: 'A valid comment', merchant: '' } });
            var result = (0, TransactionPreviewUtils_1.createTransactionPreviewConditionals)(functionArgs);
            expect(result.shouldShowDescription).toBeTruthy();
        });
        it('should show split share only if user is part of the split bill transaction', function () {
            var functionArgs = __assign(__assign({}, basicProps), { isBillSplit: true, transactionDetails: { amount: 100 }, action: __assign(__assign({}, basicProps.action), { originalMessage: {
                        participantAccountIDs: [999],
                        amount: 100,
                        currency: 'USD',
                        type: CONST_1.default.REPORT.ACTIONS.TYPE.IOU,
                    } }) });
            var result = (0, TransactionPreviewUtils_1.createTransactionPreviewConditionals)(functionArgs);
            expect(result.shouldShowSplitShare).toBeTruthy();
        });
        it('should not show split share if user is not a participant', function () {
            var functionArgs = __assign(__assign({}, basicProps), { isBillSplit: true, transactionDetails: { amount: 100 } });
            var result = (0, TransactionPreviewUtils_1.createTransactionPreviewConditionals)(functionArgs);
            expect(result.shouldShowSplitShare).toBeFalsy();
        });
    });
    describe('getViolationTranslatePath', function () {
        var message = 'Message';
        var reviewRequired = { translationPath: 'violations.reviewRequired' };
        var longMessage = 'x'.repeat(CONST_1.default.REPORT_VIOLATIONS.RBR_MESSAGE_MAX_CHARACTERS_FOR_PREVIEW + 1);
        var mockViolations = function (count) {
            return [
                { name: CONST_1.default.VIOLATIONS.MISSING_CATEGORY, type: CONST_1.default.VIOLATION_TYPES.VIOLATION, showInReview: true },
                { name: CONST_1.default.VIOLATIONS.CUSTOM_RULES, type: CONST_1.default.VIOLATION_TYPES.VIOLATION, showInReview: true },
                { name: CONST_1.default.VIOLATIONS.HOLD, type: CONST_1.default.VIOLATION_TYPES.VIOLATION, showInReview: true },
            ].slice(0, count);
        };
        test('returns translationPath when there is at least one violation and transaction is on hold', function () {
            expect((0, TransactionPreviewUtils_1.getViolationTranslatePath)(mockViolations(1), false, message, true)).toEqual(reviewRequired);
        });
        test('returns translationPath if violation message is too long', function () {
            expect((0, TransactionPreviewUtils_1.getViolationTranslatePath)(mockViolations(1), false, longMessage, false)).toEqual(reviewRequired);
        });
        test('returns translationPath when there are multiple violations', function () {
            expect((0, TransactionPreviewUtils_1.getViolationTranslatePath)(mockViolations(2), false, message, false)).toEqual(reviewRequired);
        });
        test('returns translationPath when there is at least one violation and there are field errors', function () {
            expect((0, TransactionPreviewUtils_1.getViolationTranslatePath)(mockViolations(1), true, message, false)).toEqual(reviewRequired);
        });
        test('returns text when there are no violations, no hold, no field errors, and message is short', function () {
            expect((0, TransactionPreviewUtils_1.getViolationTranslatePath)(mockViolations(0), false, message, false)).toEqual({ text: message });
        });
        test('returns translationPath when there are no violations but message is too long', function () {
            expect((0, TransactionPreviewUtils_1.getViolationTranslatePath)(mockViolations(0), false, longMessage, false)).toEqual(reviewRequired);
        });
    });
    describe('getUniqueActionErrors', function () {
        test('returns an empty array if there are no actions', function () {
            expect((0, TransactionPreviewUtils_1.getUniqueActionErrors)({})).toEqual([]);
        });
        test('returns unique error messages from report actions', function () {
            var actions = {
                /* eslint-disable @typescript-eslint/naming-convention */
                1: { errors: { a: 'Error A', b: 'Error B' } },
                2: { errors: { c: 'Error C', a: 'Error A2' } },
                3: { errors: { a: 'Error A', d: 'Error D' } },
                /* eslint-enable @typescript-eslint/naming-convention */
            };
            var expectedErrors = ['Error B', 'Error C', 'Error D'];
            expect((0, TransactionPreviewUtils_1.getUniqueActionErrors)(actions).sort()).toEqual(expectedErrors.sort());
        });
        test('returns the latest error message if multiple errors exist under a single action', function () {
            var actions = {
                /* eslint-disable @typescript-eslint/naming-convention */
                1: { errors: { z: 'Error Z2', a: 'Error A', f: 'Error Z' } },
                /* eslint-enable @typescript-eslint/naming-convention */
            };
            expect((0, TransactionPreviewUtils_1.getUniqueActionErrors)(actions)).toEqual(['Error Z2']);
        });
        test('filters out non-string error messages', function () {
            var actions = {
                /* eslint-disable @typescript-eslint/naming-convention */
                1: { errors: { a: 404, b: 'Error B' } },
                2: { errors: { c: null, d: 'Error D' } },
                /* eslint-enable @typescript-eslint/naming-convention */
            };
            expect((0, TransactionPreviewUtils_1.getUniqueActionErrors)(actions)).toEqual(['Error B', 'Error D']);
        });
    });
});
