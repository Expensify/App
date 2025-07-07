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
var ModifiedExpenseMessage_1 = require("@libs/ModifiedExpenseMessage");
var CONST_1 = require("@src/CONST");
var IntlStore_1 = require("@src/languages/IntlStore");
var Localize_1 = require("@src/libs/Localize");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var reportActions_1 = require("../utils/collections/reportActions");
var reports_1 = require("../utils/collections/reports");
var waitForBatchedUpdates_1 = require("../utils/waitForBatchedUpdates");
describe('ModifiedExpenseMessage', function () {
    beforeAll(function () {
        IntlStore_1.default.load(CONST_1.default.LOCALES.EN);
        return (0, waitForBatchedUpdates_1.default)();
    });
    describe('getForAction', function () {
        var report = (0, reports_1.createRandomReport)(1);
        describe('when the amount is changed', function () {
            var reportAction = __assign(__assign({}, (0, reportActions_1.default)(1)), { actionName: CONST_1.default.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE, originalMessage: {
                    amount: 1800,
                    currency: CONST_1.default.CURRENCY.USD,
                    oldAmount: 1255,
                    oldCurrency: CONST_1.default.CURRENCY.USD,
                } });
            it('returns the correct text message', function () {
                var expectedResult = "changed the amount to $18.00 (previously $12.55)";
                var result = ModifiedExpenseMessage_1.default.getForReportAction({ reportOrID: report.reportID, reportAction: reportAction });
                expect(result).toEqual(expectedResult);
            });
        });
        describe('when the amount is changed while the original value was partial', function () {
            var reportAction = __assign(__assign({}, (0, reportActions_1.default)(1)), { actionName: CONST_1.default.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE, originalMessage: {
                    amount: 1800,
                    currency: CONST_1.default.CURRENCY.USD,
                    oldAmount: 0,
                    oldCurrency: CONST_1.default.CURRENCY.USD,
                } });
            it('returns the correct text message', function () {
                var expectedResult = "set the amount to $18.00";
                var result = ModifiedExpenseMessage_1.default.getForReportAction({ reportOrID: report.reportID, reportAction: reportAction });
                expect(result).toEqual(expectedResult);
            });
        });
        describe('when the amount is changed and the description is removed', function () {
            var reportAction = __assign(__assign({}, (0, reportActions_1.default)(1)), { actionName: CONST_1.default.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE, originalMessage: {
                    amount: 1800,
                    currency: CONST_1.default.CURRENCY.USD,
                    oldAmount: 1255,
                    oldCurrency: CONST_1.default.CURRENCY.USD,
                    newComment: '',
                    oldComment: 'this is for the shuttle',
                } });
            it('returns the correct text message', function () {
                var expectedResult = 'changed the amount to $18.00 (previously $12.55)\nremoved the description (previously "this is for the shuttle")';
                var result = ModifiedExpenseMessage_1.default.getForReportAction({ reportOrID: report.reportID, reportAction: reportAction });
                expect(result).toEqual(expectedResult);
            });
        });
        describe('when the amount is changed, the description is removed, and category is set', function () {
            var reportAction = __assign(__assign({}, (0, reportActions_1.default)(1)), { actionName: CONST_1.default.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE, originalMessage: {
                    amount: 1800,
                    currency: CONST_1.default.CURRENCY.USD,
                    oldAmount: 1255,
                    oldCurrency: CONST_1.default.CURRENCY.USD,
                    newComment: '',
                    oldComment: 'this is for the shuttle',
                    category: 'Benefits',
                    oldCategory: '',
                } });
            it('returns the correct text message', function () {
                var expectedResult = 'changed the amount to $18.00 (previously $12.55)\nset the category to "Benefits"\nremoved the description (previously "this is for the shuttle")';
                var result = ModifiedExpenseMessage_1.default.getForReportAction({ reportOrID: report.reportID, reportAction: reportAction });
                expect(result).toEqual(expectedResult);
            });
        });
        describe('when the amount and merchant are changed', function () {
            var reportAction = __assign(__assign({}, (0, reportActions_1.default)(1)), { actionName: CONST_1.default.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE, originalMessage: {
                    merchant: 'Taco Bell',
                    oldMerchant: 'Big Belly',
                    amount: 1800,
                    currency: CONST_1.default.CURRENCY.USD,
                    oldAmount: 1255,
                    oldCurrency: CONST_1.default.CURRENCY.USD,
                } });
            it('returns the correct text message', function () {
                var expectedResult = 'changed the amount to $18.00 (previously $12.55) and the merchant to "Taco Bell" (previously "Big Belly")';
                var result = ModifiedExpenseMessage_1.default.getForReportAction({ reportOrID: report.reportID, reportAction: reportAction });
                expect(result).toEqual(expectedResult);
            });
        });
        describe('when the amount and merchant are changed, the description is removed, and category is set', function () {
            var reportAction = __assign(__assign({}, (0, reportActions_1.default)(1)), { actionName: CONST_1.default.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE, originalMessage: {
                    merchant: 'Taco Bell',
                    oldMerchant: 'Big Belly',
                    amount: 1800,
                    currency: CONST_1.default.CURRENCY.USD,
                    oldAmount: 1255,
                    oldCurrency: CONST_1.default.CURRENCY.USD,
                    newComment: '',
                    oldComment: 'this is for the shuttle',
                    category: 'Benefits',
                    oldCategory: '',
                } });
            it('returns the correct text message', function () {
                var expectedResult = 'changed the amount to $18.00 (previously $12.55) and the merchant to "Taco Bell" (previously "Big Belly")\nset the category to "Benefits"\nremoved the description (previously "this is for the shuttle")';
                var result = ModifiedExpenseMessage_1.default.getForReportAction({ reportOrID: report.reportID, reportAction: reportAction });
                expect(result).toEqual(expectedResult);
            });
        });
        describe('when the amount, comment and merchant are changed', function () {
            var reportAction = __assign(__assign({}, (0, reportActions_1.default)(1)), { actionName: CONST_1.default.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE, originalMessage: {
                    merchant: 'Taco Bell',
                    oldMerchant: 'Big Belly',
                    amount: 1800,
                    currency: CONST_1.default.CURRENCY.USD,
                    oldAmount: 1255,
                    oldCurrency: CONST_1.default.CURRENCY.USD,
                    newComment: 'I bought it on the way',
                    oldComment: 'from the business trip',
                } });
            it('returns the correct text message', function () {
                var expectedResult = 'changed the amount to $18.00 (previously $12.55), the description to "I bought it on the way" (previously "from the business trip"), and the merchant to "Taco Bell" (previously "Big Belly")';
                var result = ModifiedExpenseMessage_1.default.getForReportAction({ reportOrID: report.reportID, reportAction: reportAction });
                expect(result).toEqual(expectedResult);
            });
        });
        describe('when the merchant is removed', function () {
            var reportAction = __assign(__assign({}, (0, reportActions_1.default)(1)), { actionName: CONST_1.default.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE, originalMessage: {
                    merchant: '',
                    oldMerchant: 'Big Belly',
                } });
            it('returns the correct text message', function () {
                var expectedResult = "removed the merchant (previously \"Big Belly\")";
                var result = ModifiedExpenseMessage_1.default.getForReportAction({ reportOrID: report.reportID, reportAction: reportAction });
                expect(result).toEqual(expectedResult);
            });
        });
        describe('when the merchant is changed while the previous merchant was partial', function () {
            var reportAction = __assign(__assign({}, (0, reportActions_1.default)(1)), { actionName: CONST_1.default.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE, originalMessage: {
                    merchant: 'KFC',
                    oldMerchant: CONST_1.default.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT,
                } });
            it('returns the correct text message', function () {
                var expectedResult = "set the merchant to \"KFC\"";
                var result = ModifiedExpenseMessage_1.default.getForReportAction({ reportOrID: report.reportID, reportAction: reportAction });
                expect(result).toEqual(expectedResult);
            });
        });
        describe('when the merchant and the description are removed', function () {
            var reportAction = __assign(__assign({}, (0, reportActions_1.default)(1)), { actionName: CONST_1.default.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE, originalMessage: {
                    merchant: '',
                    oldMerchant: 'Big Belly',
                    newComment: '',
                    oldComment: 'mini shore',
                } });
            it('returns the correct text message', function () {
                var expectedResult = "removed the description (previously \"mini shore\") and the merchant (previously \"Big Belly\")";
                var result = ModifiedExpenseMessage_1.default.getForReportAction({ reportOrID: report.reportID, reportAction: reportAction });
                expect(result).toEqual(expectedResult);
            });
        });
        describe('when the merchant, the category and the description are removed', function () {
            var reportAction = __assign(__assign({}, (0, reportActions_1.default)(1)), { actionName: CONST_1.default.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE, originalMessage: {
                    merchant: '',
                    oldMerchant: 'Big Belly',
                    newComment: '',
                    oldComment: 'mini shore',
                    category: '',
                    oldCategory: 'Benefits',
                } });
            it('returns the correct text message', function () {
                var expectedResult = "removed the description (previously \"mini shore\"), the merchant (previously \"Big Belly\"), and the category (previously \"Benefits\")";
                var result = ModifiedExpenseMessage_1.default.getForReportAction({ reportOrID: report.reportID, reportAction: reportAction });
                expect(result).toEqual(expectedResult);
            });
        });
        describe('when the merchant is set', function () {
            var reportAction = __assign(__assign({}, (0, reportActions_1.default)(1)), { actionName: CONST_1.default.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE, originalMessage: {
                    oldMerchant: '',
                    merchant: 'Big Belly',
                } });
            it('returns the correct text message', function () {
                var expectedResult = "set the merchant to \"Big Belly\"";
                var result = ModifiedExpenseMessage_1.default.getForReportAction({ reportOrID: report.reportID, reportAction: reportAction });
                expect(result).toEqual(expectedResult);
            });
        });
        describe('when the merchant and the description are set', function () {
            var reportAction = __assign(__assign({}, (0, reportActions_1.default)(1)), { actionName: CONST_1.default.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE, originalMessage: {
                    oldMerchant: '',
                    merchant: 'Big Belly',
                    oldComment: '',
                    newComment: 'mini shore',
                } });
            it('returns the correct text message', function () {
                var expectedResult = "set the description to \"mini shore\" and the merchant to \"Big Belly\"";
                var result = ModifiedExpenseMessage_1.default.getForReportAction({ reportOrID: report.reportID, reportAction: reportAction });
                expect(result).toEqual(expectedResult);
            });
        });
        describe('when the merchant, the category and the description are set', function () {
            var reportAction = __assign(__assign({}, (0, reportActions_1.default)(1)), { actionName: CONST_1.default.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE, originalMessage: {
                    oldMerchant: '',
                    merchant: 'Big Belly',
                    oldComment: '',
                    newComment: 'mini shore',
                    oldCategory: '',
                    category: 'Benefits',
                } });
            it('returns the correct text message', function () {
                var expectedResult = "set the description to \"mini shore\", the merchant to \"Big Belly\", and the category to \"Benefits\"";
                var result = ModifiedExpenseMessage_1.default.getForReportAction({ reportOrID: report.reportID, reportAction: reportAction });
                expect(result).toEqual(expectedResult);
            });
        });
        describe('when the created date is changed', function () {
            var reportAction = __assign(__assign({}, (0, reportActions_1.default)(1)), { actionName: CONST_1.default.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE, originalMessage: {
                    created: '2023-12-27',
                    oldCreated: '2023-12-26',
                } });
            it('returns the correct text message', function () {
                var expectedResult = 'changed the date to 2023-12-27 (previously 2023-12-26)';
                var result = ModifiedExpenseMessage_1.default.getForReportAction({ reportOrID: report.reportID, reportAction: reportAction });
                expect(result).toEqual(expectedResult);
            });
        });
        describe('when the created date was not changed', function () {
            var reportAction = __assign(__assign({}, (0, reportActions_1.default)(1)), { actionName: CONST_1.default.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE, originalMessage: {
                    created: '2023-12-27',
                } });
            it('returns the correct text message', function () {
                var expectedResult = 'changed the expense';
                var result = ModifiedExpenseMessage_1.default.getForReportAction({ reportOrID: report.reportID, reportAction: reportAction });
                expect(result).toEqual(expectedResult);
            });
        });
        describe('when the distance is changed', function () {
            var reportAction = __assign(__assign({}, (0, reportActions_1.default)(1)), { actionName: CONST_1.default.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE, originalMessage: {
                    oldMerchant: '1.00 mi @ $0.70 / mi',
                    merchant: '10.00 mi @ $0.70 / mi',
                    oldAmount: 70,
                    amount: 700,
                    oldCurrency: CONST_1.default.CURRENCY.USD,
                    currency: CONST_1.default.CURRENCY.USD,
                } });
            it('then the message says the distance is changed and shows the new and old merchant and amount', function () {
                var expectedResult = "changed the distance to ".concat(reportAction.originalMessage.merchant, " (previously ").concat(reportAction.originalMessage.oldMerchant, "), which updated the amount to $7.00 (previously $0.70)");
                var result = ModifiedExpenseMessage_1.default.getForReportAction({ reportOrID: report.reportID, reportAction: reportAction });
                expect(result).toEqual(expectedResult);
            });
        });
        describe('when the distance rate is changed', function () {
            var reportAction = __assign(__assign({}, (0, reportActions_1.default)(1)), { actionName: CONST_1.default.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE, originalMessage: {
                    oldMerchant: '56.36 mi @ $0.70 / mi',
                    merchant: '56.36 mi @ $0.99 / mi',
                    oldAmount: 3945,
                    amount: 5580,
                    oldCurrency: CONST_1.default.CURRENCY.USD,
                    currency: CONST_1.default.CURRENCY.USD,
                } });
            it('then the message says the rate is changed and shows the new and old merchant and amount', function () {
                var expectedResult = "changed the rate to ".concat(reportAction.originalMessage.merchant, " (previously ").concat(reportAction.originalMessage.oldMerchant, "), which updated the amount to $55.80 (previously $39.45)");
                var result = ModifiedExpenseMessage_1.default.getForReportAction({ reportOrID: report.reportID, reportAction: reportAction });
                expect(result).toEqual(expectedResult);
            });
        });
        describe('when moving an expense', function () {
            beforeEach(function () { return react_native_onyx_1.default.clear(); });
            it('return the message "moved expense to personal space" when moving an expense from an expense chat or 1:1 DM to selfDM', function () { return __awaiter(void 0, void 0, void 0, function () {
                var selfDMReport, reportAction, expectedResult, result;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            selfDMReport = __assign(__assign({}, report), { chatType: CONST_1.default.REPORT.CHAT_TYPE.SELF_DM });
                            reportAction = __assign(__assign({}, (0, reportActions_1.default)(1)), { actionName: CONST_1.default.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE, originalMessage: {
                                    movedToReportID: selfDMReport.reportID,
                                } });
                            return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT), (_a = {}, _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(selfDMReport.reportID)] = selfDMReport, _a))];
                        case 1:
                            _b.sent();
                            return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                        case 2:
                            _b.sent();
                            expectedResult = (0, Localize_1.translate)(CONST_1.default.LOCALES.EN, 'iou.movedToPersonalSpace');
                            result = ModifiedExpenseMessage_1.default.getForReportAction({ reportOrID: selfDMReport.reportID, reportAction: reportAction });
                            // Then it should return the correct text message
                            expect(result).toEqual(expectedResult);
                            return [2 /*return*/];
                    }
                });
            }); });
            it('return the message "changed the expense" when reportName and workspace name are empty', function () { return __awaiter(void 0, void 0, void 0, function () {
                var policyExpenseChat, reportAction, expectedResult, result;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            policyExpenseChat = __assign(__assign({}, report), { chatType: CONST_1.default.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT, reportName: '', isOwnPolicyExpenseChat: false });
                            reportAction = __assign(__assign({}, (0, reportActions_1.default)(1)), { actionName: CONST_1.default.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE, originalMessage: {
                                    movedToReportID: policyExpenseChat.reportID,
                                } });
                            return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT), (_a = {}, _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(policyExpenseChat.reportID)] = policyExpenseChat, _a))];
                        case 1:
                            _b.sent();
                            return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                        case 2:
                            _b.sent();
                            expectedResult = (0, Localize_1.translate)(CONST_1.default.LOCALES.EN, 'iou.changedTheExpense');
                            result = ModifiedExpenseMessage_1.default.getForReportAction({ reportOrID: policyExpenseChat.reportID, reportAction: reportAction });
                            // Then it should return the correct text message
                            expect(result).toEqual(expectedResult);
                            return [2 /*return*/];
                    }
                });
            }); });
            it('return the message "moved expense from personal space to policyName" when both reportName and policyName are present', function () { return __awaiter(void 0, void 0, void 0, function () {
                var policyExpenseChat, reportAction, expectedResult, result;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            policyExpenseChat = __assign(__assign({}, report), { chatType: CONST_1.default.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT, isOwnPolicyExpenseChat: false, policyName: 'fake policyName' });
                            reportAction = __assign(__assign({}, (0, reportActions_1.default)(1)), { actionName: CONST_1.default.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE, originalMessage: {
                                    movedToReportID: policyExpenseChat.reportID,
                                } });
                            return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT), (_a = {}, _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(policyExpenseChat.reportID)] = policyExpenseChat, _a))];
                        case 1:
                            _b.sent();
                            return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                        case 2:
                            _b.sent();
                            expectedResult = (0, Localize_1.translate)(CONST_1.default.LOCALES.EN, 'iou.movedFromPersonalSpace', {
                                reportName: policyExpenseChat.reportName,
                                workspaceName: policyExpenseChat.policyName,
                            });
                            result = ModifiedExpenseMessage_1.default.getForReportAction({ reportOrID: policyExpenseChat.reportID, reportAction: reportAction });
                            // Then it should return the correct text message
                            expect(result).toEqual(expectedResult);
                            return [2 /*return*/];
                    }
                });
            }); });
            it('return the message "moved expense from personal space to chat with reportName" when only reportName is present', function () { return __awaiter(void 0, void 0, void 0, function () {
                var policyExpenseChat, reportAction, expectedResult, result;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            policyExpenseChat = __assign(__assign({}, report), { chatType: CONST_1.default.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT, isOwnPolicyExpenseChat: false });
                            reportAction = __assign(__assign({}, (0, reportActions_1.default)(1)), { actionName: CONST_1.default.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE, originalMessage: {
                                    movedToReportID: policyExpenseChat.reportID,
                                } });
                            return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT), (_a = {}, _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(policyExpenseChat.reportID)] = policyExpenseChat, _a))];
                        case 1:
                            _b.sent();
                            return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                        case 2:
                            _b.sent();
                            expectedResult = (0, Localize_1.translate)(CONST_1.default.LOCALES.EN, 'iou.movedFromPersonalSpace', { reportName: policyExpenseChat.reportName });
                            result = ModifiedExpenseMessage_1.default.getForReportAction({ reportOrID: policyExpenseChat.reportID, reportAction: reportAction });
                            // Then it should return the correct text message
                            expect(result).toEqual(expectedResult);
                            return [2 /*return*/];
                    }
                });
            }); });
        });
    });
});
