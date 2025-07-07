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
var Transaction_1 = require("@libs/actions/Transaction");
var DateUtils_1 = require("@libs/DateUtils");
var NumberUtils_1 = require("@libs/NumberUtils");
var ReportActionsUtils_1 = require("@libs/ReportActionsUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var TransactionUtils = require("../../src/libs/TransactionUtils");
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
var FAKE_NEW_REPORT_ID = '2';
var FAKE_OLD_REPORT_ID = '3';
var FAKE_SELF_DM_REPORT_ID = '4';
var newReport = {
    reportID: FAKE_NEW_REPORT_ID,
    ownerAccountID: CURRENT_USER_ID,
    type: CONST_1.default.REPORT.TYPE.EXPENSE,
    stateNum: CONST_1.default.REPORT.STATE_NUM.OPEN,
    statusNum: CONST_1.default.REPORT.STATUS_NUM.OPEN,
};
var selfDM = {
    reportID: FAKE_SELF_DM_REPORT_ID,
    ownerAccountID: CURRENT_USER_ID,
    chatType: CONST_1.default.REPORT.CHAT_TYPE.SELF_DM,
};
var reportCollectionDataSet = (_a = {},
    _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(FAKE_NEW_REPORT_ID)] = newReport,
    _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(FAKE_SELF_DM_REPORT_ID)] = selfDM,
    _a);
describe('Transaction', function () {
    beforeAll(function () {
        var _a;
        react_native_onyx_1.default.init({
            keys: ONYXKEYS_1.default,
            initialKeyStates: __assign((_a = {}, _a[ONYXKEYS_1.default.SESSION] = { accountID: CURRENT_USER_ID }, _a), reportCollectionDataSet),
        });
    });
    beforeEach(function () {
        return react_native_onyx_1.default.clear().then(waitForBatchedUpdates_1.default);
    });
    describe('changeTransactionsReport', function () {
        it('correctly moves the IOU report action when an unreported transaction is added to an expense report', function () { return __awaiter(void 0, void 0, void 0, function () {
            var transaction, oldIOUAction, reportActions;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        transaction = generateTransaction({
                            reportID: CONST_1.default.REPORT.UNREPORTED_REPORT_ID,
                        });
                        oldIOUAction = {
                            reportActionID: (0, NumberUtils_1.rand64)(),
                            actionName: CONST_1.default.REPORT.ACTIONS.TYPE.IOU,
                            actorAccountID: CURRENT_USER_ID,
                            created: DateUtils_1.default.getDBTime(),
                            originalMessage: {
                                IOUReportID: '0',
                                IOUTransactionID: transaction.transactionID,
                                amount: transaction.amount,
                                currency: transaction.currency,
                                type: CONST_1.default.IOU.REPORT_ACTION_TYPE.TRACK,
                            },
                        };
                        return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transaction.transactionID), transaction)];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(FAKE_SELF_DM_REPORT_ID), (_a = {}, _a[oldIOUAction.reportActionID] = oldIOUAction, _a))];
                    case 2:
                        _b.sent();
                        (0, Transaction_1.changeTransactionsReport)([transaction.transactionID], FAKE_NEW_REPORT_ID);
                        return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                    case 3:
                        _b.sent();
                        return [4 /*yield*/, new Promise(function (resolve) {
                                var connection = react_native_onyx_1.default.connect({
                                    key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(FAKE_NEW_REPORT_ID),
                                    callback: function (value) {
                                        react_native_onyx_1.default.disconnect(connection);
                                        resolve(value);
                                    },
                                });
                            })];
                    case 4:
                        reportActions = _b.sent();
                        expect((0, ReportActionsUtils_1.getIOUActionForTransactionID)(Object.values(reportActions !== null && reportActions !== void 0 ? reportActions : {}), transaction.transactionID)).toBeDefined();
                        return [2 /*return*/];
                }
            });
        }); });
        it('correctly moves the IOU report action when a transaction is moved from one expense report to another', function () { return __awaiter(void 0, void 0, void 0, function () {
            var transaction, oldIOUAction, reportActions;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        transaction = generateTransaction({
                            reportID: FAKE_OLD_REPORT_ID,
                        });
                        oldIOUAction = {
                            reportActionID: (0, NumberUtils_1.rand64)(),
                            actionName: CONST_1.default.REPORT.ACTIONS.TYPE.IOU,
                            actorAccountID: CURRENT_USER_ID,
                            created: DateUtils_1.default.getDBTime(),
                            originalMessage: {
                                IOUReportID: FAKE_OLD_REPORT_ID,
                                IOUTransactionID: transaction.transactionID,
                                amount: transaction.amount,
                                currency: transaction.currency,
                                type: CONST_1.default.IOU.REPORT_ACTION_TYPE.CREATE,
                            },
                        };
                        return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transaction.transactionID), transaction)];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(FAKE_OLD_REPORT_ID), (_a = {}, _a[oldIOUAction.reportActionID] = oldIOUAction, _a))];
                    case 2:
                        _b.sent();
                        (0, Transaction_1.changeTransactionsReport)([transaction.transactionID], FAKE_NEW_REPORT_ID);
                        return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                    case 3:
                        _b.sent();
                        return [4 /*yield*/, new Promise(function (resolve) {
                                var connection = react_native_onyx_1.default.connect({
                                    key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(FAKE_NEW_REPORT_ID),
                                    callback: function (value) {
                                        react_native_onyx_1.default.disconnect(connection);
                                        resolve(value);
                                    },
                                });
                            })];
                    case 4:
                        reportActions = _b.sent();
                        expect((0, ReportActionsUtils_1.getIOUActionForTransactionID)(Object.values(reportActions !== null && reportActions !== void 0 ? reportActions : {}), transaction.transactionID)).toBeDefined();
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
