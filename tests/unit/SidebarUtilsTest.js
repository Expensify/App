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
/* eslint-disable @typescript-eslint/naming-convention */
var react_native_1 = require("@testing-library/react-native");
var react_native_onyx_1 = require("react-native-onyx");
var useReportIsArchived_1 = require("@hooks/useReportIsArchived");
var DateUtils_1 = require("@libs/DateUtils");
var ReportActionsUtils_1 = require("@libs/ReportActionsUtils");
var ReportUtils_1 = require("@libs/ReportUtils");
var SidebarUtils_1 = require("@libs/SidebarUtils");
var OnyxDerived_1 = require("@userActions/OnyxDerived");
var CONST_1 = require("@src/CONST");
var IntlStore_1 = require("@src/languages/IntlStore");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var actions_1 = require("../../__mocks__/reportData/actions");
var reports_1 = require("../../__mocks__/reportData/reports");
var policies_1 = require("../utils/collections/policies");
var reportActions_1 = require("../utils/collections/reportActions");
var reports_2 = require("../utils/collections/reports");
var LHNTestUtils = require("../utils/LHNTestUtils");
var waitForBatchedUpdates_1 = require("../utils/waitForBatchedUpdates");
describe('SidebarUtils', function () {
    beforeAll(function () {
        react_native_onyx_1.default.init({
            keys: ONYXKEYS_1.default,
            evictableKeys: [ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS],
        });
        IntlStore_1.default.load(CONST_1.default.LOCALES.EN);
        (0, OnyxDerived_1.default)();
        return (0, waitForBatchedUpdates_1.default)();
    });
    afterAll(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    react_native_onyx_1.default.clear();
                    return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    describe('getReasonAndReportActionThatHasRedBrickRoad', function () {
        it('returns correct reason when report has transaction thread violations', function () { return __awaiter(void 0, void 0, void 0, function () {
            var MOCK_REPORT, MOCK_REPORTS, MOCK_REPORT_ACTIONS, MOCK_TRANSACTION, MOCK_TRANSACTIONS, MOCK_TRANSACTION_VIOLATIONS, isReportArchived, reason;
            var _a, _b, _c, _d, _e;
            var _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        MOCK_REPORT = {
                            reportID: '1',
                            ownerAccountID: 12345,
                            chatType: CONST_1.default.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                            stateNum: CONST_1.default.REPORT.STATE_NUM.OPEN,
                            statusNum: CONST_1.default.REPORT.STATUS_NUM.OPEN,
                            policyID: '6',
                        };
                        MOCK_REPORTS = (_a = {},
                            _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(MOCK_REPORT.reportID)] = MOCK_REPORT,
                            _a);
                        MOCK_REPORT_ACTIONS = {
                            // eslint-disable-next-line @typescript-eslint/naming-convention
                            '1': {
                                reportActionID: '1',
                                actionName: CONST_1.default.REPORT.ACTIONS.TYPE.IOU,
                                actorAccountID: 12345,
                                created: '2024-08-08 18:20:44.171',
                            },
                        };
                        MOCK_TRANSACTION = {
                            transactionID: '1',
                            amount: 10,
                            modifiedAmount: 10,
                            reportID: MOCK_REPORT.reportID,
                        };
                        MOCK_TRANSACTIONS = (_b = {},
                            _b["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(MOCK_TRANSACTION.transactionID)] = MOCK_TRANSACTION,
                            _b);
                        MOCK_TRANSACTION_VIOLATIONS = (_c = {},
                            _c["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(MOCK_TRANSACTION.transactionID)] = [
                                {
                                    type: CONST_1.default.VIOLATION_TYPES.VIOLATION,
                                    name: CONST_1.default.VIOLATIONS.MISSING_CATEGORY,
                                    showInReview: true,
                                },
                            ],
                            _c);
                        return [4 /*yield*/, react_native_onyx_1.default.multiSet(__assign(__assign(__assign((_d = {}, _d[ONYXKEYS_1.default.SESSION] = {
                                accountID: 12345,
                            }, _d), MOCK_REPORTS), MOCK_TRANSACTION_VIOLATIONS), (_e = {}, _e["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(MOCK_REPORT.reportID)] = MOCK_REPORT_ACTIONS, _e["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(MOCK_TRANSACTION.transactionID)] = MOCK_TRANSACTION, _e)))];
                    case 1:
                        _g.sent();
                        isReportArchived = (0, react_native_1.renderHook)(function () { return (0, useReportIsArchived_1.default)(MOCK_REPORT === null || MOCK_REPORT === void 0 ? void 0 : MOCK_REPORT.reportID); }).result;
                        reason = ((_f = SidebarUtils_1.default.getReasonAndReportActionThatHasRedBrickRoad(MOCK_REPORT, reports_1.chatReportR14932, MOCK_REPORT_ACTIONS, false, {}, MOCK_TRANSACTIONS, MOCK_TRANSACTION_VIOLATIONS, isReportArchived.current)) !== null && _f !== void 0 ? _f : {}).reason;
                        expect(reason).toBe(CONST_1.default.RBR_REASONS.HAS_TRANSACTION_THREAD_VIOLATIONS);
                        return [2 /*return*/];
                }
            });
        }); });
        it('returns correct reason when report has errors', function () {
            var _a;
            var MOCK_REPORT = {
                reportID: '1',
                errorFields: {
                    someField: {
                        error: 'Some error occurred',
                    },
                },
            };
            var MOCK_REPORT_ACTIONS = {};
            var MOCK_TRANSACTIONS = {};
            var MOCK_TRANSACTION_VIOLATIONS = {};
            var isReportArchived = (0, react_native_1.renderHook)(function () { return (0, useReportIsArchived_1.default)(MOCK_REPORT === null || MOCK_REPORT === void 0 ? void 0 : MOCK_REPORT.reportID); }).result;
            var reportErrors = (0, ReportUtils_1.getAllReportErrors)(MOCK_REPORT, MOCK_REPORT_ACTIONS);
            var reason = ((_a = SidebarUtils_1.default.getReasonAndReportActionThatHasRedBrickRoad(MOCK_REPORT, reports_1.chatReportR14932, MOCK_REPORT_ACTIONS, false, reportErrors, MOCK_TRANSACTIONS, MOCK_TRANSACTION_VIOLATIONS, isReportArchived.current)) !== null && _a !== void 0 ? _a : {}).reason;
            expect(reason).toBe(CONST_1.default.RBR_REASONS.HAS_ERRORS);
        });
        it('returns correct reason when report has violations', function () {
            var _a;
            var MOCK_REPORT = {
                reportID: '1',
            };
            var MOCK_REPORT_ACTIONS = {};
            var MOCK_TRANSACTIONS = {};
            var MOCK_TRANSACTION_VIOLATIONS = {};
            // Simulate how components determined if a report is archived by using this hook
            var isReportArchived = (0, react_native_1.renderHook)(function () { return (0, useReportIsArchived_1.default)(MOCK_REPORT === null || MOCK_REPORT === void 0 ? void 0 : MOCK_REPORT.reportID); }).result;
            var reason = ((_a = SidebarUtils_1.default.getReasonAndReportActionThatHasRedBrickRoad(MOCK_REPORT, reports_1.chatReportR14932, MOCK_REPORT_ACTIONS, true, {}, MOCK_TRANSACTIONS, MOCK_TRANSACTION_VIOLATIONS, isReportArchived.current)) !== null && _a !== void 0 ? _a : {}).reason;
            expect(reason).toBe(CONST_1.default.RBR_REASONS.HAS_VIOLATIONS);
        });
        it('returns correct reason when report has report action errors', function () {
            var _a;
            var MOCK_REPORT = {
                reportID: '1',
            };
            var MOCK_REPORT_ACTIONS = {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                '1': {
                    reportActionID: '1',
                    actionName: CONST_1.default.REPORT.ACTIONS.TYPE.CREATED,
                    actorAccountID: 12345,
                    created: '2024-08-08 18:20:44.171',
                    message: [
                        {
                            type: '',
                            text: '',
                        },
                    ],
                    errors: {
                        someError: 'Some error occurred',
                    },
                },
            };
            var MOCK_TRANSACTIONS = {};
            var MOCK_TRANSACTION_VIOLATIONS = {};
            // Simulate how components determined if a report is archived by using this hook
            var isReportArchived = (0, react_native_1.renderHook)(function () { return (0, useReportIsArchived_1.default)(MOCK_REPORT === null || MOCK_REPORT === void 0 ? void 0 : MOCK_REPORT.reportID); }).result;
            var reportErrors = (0, ReportUtils_1.getAllReportErrors)(MOCK_REPORT, MOCK_REPORT_ACTIONS);
            var reason = ((_a = SidebarUtils_1.default.getReasonAndReportActionThatHasRedBrickRoad(MOCK_REPORT, reports_1.chatReportR14932, MOCK_REPORT_ACTIONS, false, reportErrors, MOCK_TRANSACTIONS, MOCK_TRANSACTION_VIOLATIONS, isReportArchived.current)) !== null && _a !== void 0 ? _a : {}).reason;
            expect(reason).toBe(CONST_1.default.RBR_REASONS.HAS_ERRORS);
        });
        it('returns correct reason when report has export errors', function () {
            var _a;
            var MOCK_REPORT = {
                reportID: '1',
                errorFields: {
                    export: {
                        error: 'Some error occurred',
                    },
                },
            };
            var MOCK_REPORT_ACTIONS = {};
            var MOCK_TRANSACTIONS = {};
            var MOCK_TRANSACTION_VIOLATIONS = {};
            var reportErrors = (0, ReportUtils_1.getAllReportErrors)(MOCK_REPORT, MOCK_REPORT_ACTIONS);
            // Simulate how components determined if a report is archived by using this hook
            var isReportArchived = (0, react_native_1.renderHook)(function () { return (0, useReportIsArchived_1.default)(MOCK_REPORT === null || MOCK_REPORT === void 0 ? void 0 : MOCK_REPORT.reportID); }).result;
            var reason = ((_a = SidebarUtils_1.default.getReasonAndReportActionThatHasRedBrickRoad(MOCK_REPORT, reports_1.chatReportR14932, MOCK_REPORT_ACTIONS, false, reportErrors, MOCK_TRANSACTIONS, MOCK_TRANSACTION_VIOLATIONS, isReportArchived.current)) !== null && _a !== void 0 ? _a : {}).reason;
            expect(reason).toBe(CONST_1.default.RBR_REASONS.HAS_ERRORS);
        });
        it('returns correct report action when report has report action errors', function () {
            var _a;
            var MOCK_REPORT = {
                reportID: '1',
            };
            var MOCK_REPORT_ACTION = {
                reportActionID: '1',
                actionName: CONST_1.default.REPORT.ACTIONS.TYPE.CREATED,
                actorAccountID: 12345,
                created: '2024-08-08 18:20:44.171',
                message: [
                    {
                        type: '',
                        text: '',
                    },
                ],
                errors: {
                    someError: 'Some error occurred',
                },
            };
            var MOCK_REPORT_ACTIONS = {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                '1': MOCK_REPORT_ACTION,
            };
            var MOCK_TRANSACTIONS = {};
            var MOCK_TRANSACTION_VIOLATIONS = {};
            var reportErrors = (0, ReportUtils_1.getAllReportErrors)(MOCK_REPORT, MOCK_REPORT_ACTIONS);
            // Simulate how components determined if a report is archived by using this hook
            var isReportArchived = (0, react_native_1.renderHook)(function () { return (0, useReportIsArchived_1.default)(MOCK_REPORT === null || MOCK_REPORT === void 0 ? void 0 : MOCK_REPORT.reportID); }).result;
            var reportAction = ((_a = SidebarUtils_1.default.getReasonAndReportActionThatHasRedBrickRoad(MOCK_REPORT, reports_1.chatReportR14932, MOCK_REPORT_ACTIONS, false, reportErrors, MOCK_TRANSACTIONS, MOCK_TRANSACTION_VIOLATIONS, isReportArchived.current)) !== null && _a !== void 0 ? _a : {}).reportAction;
            expect(reportAction).toMatchObject(MOCK_REPORT_ACTION);
        });
        it('returns null when report has no errors', function () {
            var MOCK_REPORT = {
                reportID: '1',
            };
            var MOCK_REPORT_ACTIONS = {};
            var MOCK_TRANSACTIONS = {};
            var MOCK_TRANSACTION_VIOLATIONS = {};
            // Simulate how components determined if a report is archived by using this hook
            var isReportArchived = (0, react_native_1.renderHook)(function () { return (0, useReportIsArchived_1.default)(MOCK_REPORT === null || MOCK_REPORT === void 0 ? void 0 : MOCK_REPORT.reportID); }).result;
            var result = SidebarUtils_1.default.getReasonAndReportActionThatHasRedBrickRoad(MOCK_REPORT, reports_1.chatReportR14932, MOCK_REPORT_ACTIONS, false, {}, MOCK_TRANSACTIONS, MOCK_TRANSACTION_VIOLATIONS, isReportArchived.current);
            expect(result).toBeNull();
        });
        it('returns isPinned true only when report.isPinned is true', function () {
            var MOCK_REPORT_PINNED = {
                reportID: '1',
                isPinned: true,
            };
            var MOCK_REPORT_UNPINNED = {
                reportID: '2',
                isPinned: false,
            };
            var optionDataPinned = SidebarUtils_1.default.getOptionData({
                report: MOCK_REPORT_PINNED,
                reportAttributes: undefined,
                reportNameValuePairs: {},
                personalDetails: {},
                policy: undefined,
                parentReportAction: undefined,
                oneTransactionThreadReport: undefined,
            });
            var optionDataUnpinned = SidebarUtils_1.default.getOptionData({
                report: MOCK_REPORT_UNPINNED,
                reportAttributes: undefined,
                reportNameValuePairs: {},
                personalDetails: {},
                policy: undefined,
                parentReportAction: undefined,
                oneTransactionThreadReport: undefined,
            });
            expect(optionDataPinned === null || optionDataPinned === void 0 ? void 0 : optionDataPinned.isPinned).toBe(true);
            expect(optionDataUnpinned === null || optionDataUnpinned === void 0 ? void 0 : optionDataUnpinned.isPinned).toBe(false);
        });
        it('returns null when report is archived', function () { return __awaiter(void 0, void 0, void 0, function () {
            var MOCK_REPORT, reportNameValuePairs, MOCK_REPORT_ACTION, MOCK_REPORT_ACTIONS, MOCK_TRANSACTIONS, MOCK_TRANSACTION_VIOLATIONS, isReportArchived, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        MOCK_REPORT = {
                            reportID: '5',
                        };
                        reportNameValuePairs = {
                            private_isArchived: DateUtils_1.default.getDBTime(),
                        };
                        return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_NAME_VALUE_PAIRS).concat(MOCK_REPORT.reportID), reportNameValuePairs)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                    case 2:
                        _a.sent();
                        MOCK_REPORT_ACTION = {
                            reportActionID: '1',
                            actionName: CONST_1.default.REPORT.ACTIONS.TYPE.CREATED,
                            actorAccountID: 12345,
                            created: '2024-08-08 18:20:44.171',
                            message: [
                                {
                                    type: '',
                                    text: '',
                                },
                            ],
                            errors: {
                                someError: 'Some error occurred',
                            },
                        };
                        MOCK_REPORT_ACTIONS = {
                            // eslint-disable-next-line @typescript-eslint/naming-convention
                            '1': MOCK_REPORT_ACTION,
                        };
                        MOCK_TRANSACTIONS = {};
                        MOCK_TRANSACTION_VIOLATIONS = {};
                        isReportArchived = (0, react_native_1.renderHook)(function () { return (0, useReportIsArchived_1.default)(MOCK_REPORT === null || MOCK_REPORT === void 0 ? void 0 : MOCK_REPORT.reportID); }).result;
                        result = SidebarUtils_1.default.getReasonAndReportActionThatHasRedBrickRoad(MOCK_REPORT, reports_1.chatReportR14932, MOCK_REPORT_ACTIONS, false, {}, MOCK_TRANSACTIONS, MOCK_TRANSACTION_VIOLATIONS, isReportArchived.current);
                        expect(result).toBeNull();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('shouldShowRedBrickRoad', function () {
        it('returns true when report has transaction thread violations', function () { return __awaiter(void 0, void 0, void 0, function () {
            var MOCK_REPORT, MOCK_REPORTS, MOCK_REPORT_ACTIONS, MOCK_TRANSACTION, MOCK_TRANSACTIONS, MOCK_TRANSACTION_VIOLATIONS, isReportArchived, result;
            var _a, _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        MOCK_REPORT = {
                            reportID: '1',
                            ownerAccountID: 12345,
                            chatType: CONST_1.default.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                            stateNum: CONST_1.default.REPORT.STATE_NUM.OPEN,
                            statusNum: CONST_1.default.REPORT.STATUS_NUM.OPEN,
                            policyID: '6',
                        };
                        MOCK_REPORTS = (_a = {},
                            _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(MOCK_REPORT.reportID)] = MOCK_REPORT,
                            _a);
                        MOCK_REPORT_ACTIONS = {
                            // eslint-disable-next-line @typescript-eslint/naming-convention
                            '1': {
                                reportActionID: '1',
                                actionName: CONST_1.default.REPORT.ACTIONS.TYPE.IOU,
                                actorAccountID: 12345,
                                created: '2024-08-08 18:20:44.171',
                            },
                        };
                        MOCK_TRANSACTION = {
                            transactionID: '1',
                            amount: 10,
                            modifiedAmount: 10,
                            reportID: MOCK_REPORT.reportID,
                        };
                        MOCK_TRANSACTIONS = (_b = {},
                            _b["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(MOCK_TRANSACTION.transactionID)] = MOCK_TRANSACTION,
                            _b);
                        MOCK_TRANSACTION_VIOLATIONS = (_c = {},
                            _c["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(MOCK_TRANSACTION.transactionID)] = [
                                {
                                    type: CONST_1.default.VIOLATION_TYPES.VIOLATION,
                                    name: CONST_1.default.VIOLATIONS.MISSING_CATEGORY,
                                    showInReview: true,
                                },
                            ],
                            _c);
                        return [4 /*yield*/, react_native_onyx_1.default.multiSet(__assign(__assign(__assign({}, MOCK_REPORTS), MOCK_TRANSACTION_VIOLATIONS), (_d = {}, _d["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(MOCK_REPORT.reportID)] = MOCK_REPORT_ACTIONS, _d[ONYXKEYS_1.default.SESSION] = {
                                accountID: 12345,
                            }, _d["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(MOCK_TRANSACTION.transactionID)] = MOCK_TRANSACTION, _d)))];
                    case 1:
                        _e.sent();
                        isReportArchived = (0, react_native_1.renderHook)(function () { return (0, useReportIsArchived_1.default)(MOCK_REPORT === null || MOCK_REPORT === void 0 ? void 0 : MOCK_REPORT.reportID); }).result;
                        result = SidebarUtils_1.default.shouldShowRedBrickRoad(MOCK_REPORT, reports_1.chatReportR14932, MOCK_REPORT_ACTIONS, false, {}, MOCK_TRANSACTIONS, MOCK_TRANSACTION_VIOLATIONS, isReportArchived.current);
                        expect(result).toBe(true);
                        return [2 /*return*/];
                }
            });
        }); });
        it('returns true when report has transaction thread notice type violation', function () { return __awaiter(void 0, void 0, void 0, function () {
            var MOCK_REPORT, MOCK_REPORTS, MOCK_REPORT_ACTIONS, MOCK_TRANSACTION, MOCK_TRANSACTIONS, MOCK_TRANSACTION_VIOLATIONS, isReportArchived, result;
            var _a, _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        MOCK_REPORT = {
                            reportID: '1',
                            ownerAccountID: 12345,
                            chatType: CONST_1.default.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                            stateNum: CONST_1.default.REPORT.STATE_NUM.OPEN,
                            statusNum: CONST_1.default.REPORT.STATUS_NUM.OPEN,
                            policyID: '6',
                        };
                        MOCK_REPORTS = (_a = {},
                            _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(MOCK_REPORT.reportID)] = MOCK_REPORT,
                            _a);
                        MOCK_REPORT_ACTIONS = {
                            // eslint-disable-next-line @typescript-eslint/naming-convention
                            '1': {
                                reportActionID: '1',
                                actionName: CONST_1.default.REPORT.ACTIONS.TYPE.IOU,
                                actorAccountID: 12345,
                                created: '2024-08-08 18:20:44.171',
                            },
                        };
                        MOCK_TRANSACTION = {
                            transactionID: '1',
                            amount: 10,
                            modifiedAmount: 10,
                            reportID: MOCK_REPORT.reportID,
                        };
                        MOCK_TRANSACTIONS = (_b = {},
                            _b["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(MOCK_TRANSACTION.transactionID)] = MOCK_TRANSACTION,
                            _b);
                        MOCK_TRANSACTION_VIOLATIONS = (_c = {},
                            _c["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(MOCK_TRANSACTION.transactionID)] = [
                                {
                                    type: CONST_1.default.VIOLATION_TYPES.NOTICE,
                                    name: CONST_1.default.VIOLATIONS.MODIFIED_AMOUNT,
                                    showInReview: true,
                                },
                            ],
                            _c);
                        return [4 /*yield*/, react_native_onyx_1.default.multiSet(__assign(__assign(__assign({}, MOCK_REPORTS), MOCK_TRANSACTION_VIOLATIONS), (_d = {}, _d["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(MOCK_REPORT.reportID)] = MOCK_REPORT_ACTIONS, _d[ONYXKEYS_1.default.SESSION] = {
                                accountID: 12345,
                            }, _d["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(MOCK_TRANSACTION.transactionID)] = MOCK_TRANSACTION, _d)))];
                    case 1:
                        _e.sent();
                        isReportArchived = (0, react_native_1.renderHook)(function () { return (0, useReportIsArchived_1.default)(MOCK_REPORT === null || MOCK_REPORT === void 0 ? void 0 : MOCK_REPORT.reportID); }).result;
                        result = SidebarUtils_1.default.shouldShowRedBrickRoad(MOCK_REPORT, reports_1.chatReportR14932, MOCK_REPORT_ACTIONS, false, {}, MOCK_TRANSACTIONS, MOCK_TRANSACTION_VIOLATIONS, isReportArchived.current);
                        expect(result).toBe(true);
                        return [2 /*return*/];
                }
            });
        }); });
        it('returns true when report has errors', function () {
            var MOCK_REPORT = {
                reportID: '1',
                errorFields: {
                    someField: {
                        error: 'Some error occurred',
                    },
                },
            };
            var MOCK_REPORT_ACTIONS = {};
            var MOCK_TRANSACTIONS = {};
            var MOCK_TRANSACTION_VIOLATIONS = {};
            var reportErrors = (0, ReportUtils_1.getAllReportErrors)(MOCK_REPORT, MOCK_REPORT_ACTIONS);
            var isReportArchived = (0, react_native_1.renderHook)(function () { return (0, useReportIsArchived_1.default)(MOCK_REPORT === null || MOCK_REPORT === void 0 ? void 0 : MOCK_REPORT.reportID); }).result;
            var result = SidebarUtils_1.default.shouldShowRedBrickRoad(MOCK_REPORT, reports_1.chatReportR14932, MOCK_REPORT_ACTIONS, false, reportErrors, MOCK_TRANSACTIONS, MOCK_TRANSACTION_VIOLATIONS, isReportArchived.current);
            expect(result).toBe(true);
        });
        it('returns true when report has violations', function () {
            var MOCK_REPORT = {
                reportID: '1',
            };
            var MOCK_REPORT_ACTIONS = {};
            var MOCK_TRANSACTIONS = {};
            var MOCK_TRANSACTION_VIOLATIONS = {};
            var isReportArchived = (0, react_native_1.renderHook)(function () { return (0, useReportIsArchived_1.default)(MOCK_REPORT === null || MOCK_REPORT === void 0 ? void 0 : MOCK_REPORT.reportID); }).result;
            var result = SidebarUtils_1.default.shouldShowRedBrickRoad(MOCK_REPORT, reports_1.chatReportR14932, MOCK_REPORT_ACTIONS, true, {}, MOCK_TRANSACTIONS, MOCK_TRANSACTION_VIOLATIONS, isReportArchived.current);
            expect(result).toBe(true);
        });
        it('returns true when report has report action errors', function () {
            var MOCK_REPORT = {
                reportID: '1',
            };
            var MOCK_REPORT_ACTIONS = {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                '1': {
                    reportActionID: '1',
                    actionName: CONST_1.default.REPORT.ACTIONS.TYPE.CREATED,
                    actorAccountID: 12345,
                    created: '2024-08-08 18:20:44.171',
                    message: [
                        {
                            type: '',
                            text: '',
                        },
                    ],
                    errors: {
                        someError: 'Some error occurred',
                    },
                },
            };
            var MOCK_TRANSACTIONS = {};
            var MOCK_TRANSACTION_VIOLATIONS = {};
            var reportErrors = (0, ReportUtils_1.getAllReportErrors)(MOCK_REPORT, MOCK_REPORT_ACTIONS);
            var isReportArchived = (0, react_native_1.renderHook)(function () { return (0, useReportIsArchived_1.default)(MOCK_REPORT === null || MOCK_REPORT === void 0 ? void 0 : MOCK_REPORT.reportID); }).result;
            var result = SidebarUtils_1.default.shouldShowRedBrickRoad(MOCK_REPORT, reports_1.chatReportR14932, MOCK_REPORT_ACTIONS, false, reportErrors, MOCK_TRANSACTIONS, MOCK_TRANSACTION_VIOLATIONS, isReportArchived.current);
            expect(result).toBe(true);
        });
        it('returns true when report has export errors', function () {
            var MOCK_REPORT = {
                reportID: '1',
                errorFields: {
                    export: {
                        error: 'Some error occurred',
                    },
                },
            };
            var MOCK_REPORT_ACTIONS = {};
            var MOCK_TRANSACTIONS = {};
            var MOCK_TRANSACTION_VIOLATIONS = {};
            var reportErrors = (0, ReportUtils_1.getAllReportErrors)(MOCK_REPORT, MOCK_REPORT_ACTIONS);
            var isReportArchived = (0, react_native_1.renderHook)(function () { return (0, useReportIsArchived_1.default)(MOCK_REPORT === null || MOCK_REPORT === void 0 ? void 0 : MOCK_REPORT.reportID); }).result;
            var result = SidebarUtils_1.default.shouldShowRedBrickRoad(MOCK_REPORT, reports_1.chatReportR14932, MOCK_REPORT_ACTIONS, false, reportErrors, MOCK_TRANSACTIONS, MOCK_TRANSACTION_VIOLATIONS, isReportArchived.current);
            expect(result).toBe(true);
        });
        it('returns false when report has no errors', function () {
            var MOCK_REPORT = {
                reportID: '1',
            };
            var MOCK_REPORT_ACTIONS = {};
            var MOCK_TRANSACTIONS = {};
            var MOCK_TRANSACTION_VIOLATIONS = {};
            var isReportArchived = (0, react_native_1.renderHook)(function () { return (0, useReportIsArchived_1.default)(MOCK_REPORT === null || MOCK_REPORT === void 0 ? void 0 : MOCK_REPORT.reportID); }).result;
            var result = SidebarUtils_1.default.shouldShowRedBrickRoad(MOCK_REPORT, reports_1.chatReportR14932, MOCK_REPORT_ACTIONS, false, {}, MOCK_TRANSACTIONS, MOCK_TRANSACTION_VIOLATIONS, isReportArchived.current);
            expect(result).toBe(false);
        });
        it('returns false when report is archived', function () {
            var MOCK_REPORT = {
                reportID: '5',
                errorFields: {
                    export: {
                        error: 'Some error occurred',
                    },
                },
            };
            // This report with reportID 5 is already archived from previous tests
            // where we set reportNameValuePairs with private_isArchived
            var MOCK_REPORT_ACTIONS = {};
            var MOCK_TRANSACTIONS = {};
            var MOCK_TRANSACTION_VIOLATIONS = {};
            // Simulate how components determined if a report is archived by using this hook
            var isReportArchived = (0, react_native_1.renderHook)(function () { return (0, useReportIsArchived_1.default)(MOCK_REPORT === null || MOCK_REPORT === void 0 ? void 0 : MOCK_REPORT.reportID); }).result;
            var result = SidebarUtils_1.default.shouldShowRedBrickRoad(MOCK_REPORT, reports_1.chatReportR14932, MOCK_REPORT_ACTIONS, false, {}, MOCK_TRANSACTIONS, MOCK_TRANSACTION_VIOLATIONS, isReportArchived.current);
            expect(result).toBe(false);
        });
    });
    describe('getWelcomeMessage', function () {
        it('do not return pronouns in the welcome message text when it is group chat', function () { return __awaiter(void 0, void 0, void 0, function () {
            var MOCK_REPORT;
            return __generator(this, function (_a) {
                MOCK_REPORT = __assign(__assign({}, LHNTestUtils.getFakeReport()), { chatType: 'group', type: 'chat' });
                return [2 /*return*/, ((0, waitForBatchedUpdates_1.default)()
                        // When Onyx is updated to contain that report
                        .then(function () {
                        var _a;
                        return react_native_onyx_1.default.multiSet((_a = {},
                            _a[ONYXKEYS_1.default.PERSONAL_DETAILS_LIST] = LHNTestUtils.fakePersonalDetails,
                            _a));
                    })
                        .then(function () {
                        var result = SidebarUtils_1.default.getWelcomeMessage(MOCK_REPORT, undefined);
                        expect(result.messageText).toBe('This chat is with One and Two.');
                    }))];
            });
        }); });
        it('returns a welcome message for an archived chat room', function () {
            var MOCK_REPORT = __assign(__assign({}, LHNTestUtils.getFakeReport()), { chatType: CONST_1.default.REPORT.CHAT_TYPE.POLICY_ANNOUNCE });
            return ((0, waitForBatchedUpdates_1.default)()
                // Given a "chat room" report (ie. a policy announce room) is stored in Onyx
                .then(function () { return react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(MOCK_REPORT.reportID), MOCK_REPORT); })
                // And that report is archived
                .then(function () { return react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_NAME_VALUE_PAIRS).concat(MOCK_REPORT.reportID), { private_isArchived: new Date().toString() }); })
                // When the welcome message is retrieved
                .then(function () {
                // Simulate how components call getWelcomeMessage() by using the hook useReportIsArchived() to see if the report is archived
                var isReportArchived = (0, react_native_1.renderHook)(function () { return (0, useReportIsArchived_1.default)(MOCK_REPORT === null || MOCK_REPORT === void 0 ? void 0 : MOCK_REPORT.reportID); }).result;
                return SidebarUtils_1.default.getWelcomeMessage(MOCK_REPORT, undefined, isReportArchived.current);
            })
                // Then the welcome message should indicate the report is archived
                .then(function (result) { return expect(result.messageText).toBe("You missed the party in Report (archived) , there's nothing to see here."); }));
        });
        it('returns a welcome message for a non-archived chat room', function () {
            var MOCK_REPORT = __assign(__assign({}, LHNTestUtils.getFakeReport()), { chatType: CONST_1.default.REPORT.CHAT_TYPE.POLICY_ANNOUNCE });
            return ((0, waitForBatchedUpdates_1.default)()
                // Given a "chat room" report (ie. a policy announce room) is stored in Onyx
                .then(function () { return react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(MOCK_REPORT.reportID), MOCK_REPORT); })
                // When the welcome message is retrieved
                .then(function () {
                // Simulate how components call getWelcomeMessage() by using the hook useReportIsArchived() to see if the report is archived
                var isReportArchived = (0, react_native_1.renderHook)(function () { return (0, useReportIsArchived_1.default)(MOCK_REPORT === null || MOCK_REPORT === void 0 ? void 0 : MOCK_REPORT.reportID); }).result;
                return SidebarUtils_1.default.getWelcomeMessage(MOCK_REPORT, undefined, isReportArchived.current);
            })
                // Then the welcome message should explain the purpose of the room
                .then(function (result) { return expect(result.messageText).toBe('This chat is with everyone in Unavailable workspace. Use it for the most important announcements.'); }));
        });
    });
    describe('getOptionData', function () {
        it('returns the last action message as an alternate text if the action is POLICY_CHANGE_LOG.LEAVE_ROOM type', function () { return __awaiter(void 0, void 0, void 0, function () {
            var report, lastAction, reportActions, result;
            var _a;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        report = __assign(__assign({}, (0, reports_2.createRandomReport)(4)), { chatType: 'policyAdmins', lastMessageHtml: 'removed 0 user', lastMessageText: 'removed 0 user', lastVisibleActionCreated: '2025-01-20 12:30:03.784', participants: {
                                '18921695': {
                                    notificationPreference: 'always',
                                },
                            } });
                        lastAction = __assign(__assign({}, (0, reportActions_1.default)(2)), { message: [
                                {
                                    type: 'COMMENT',
                                    html: '<muted-text>removed <mention-user accountID=19010378></mention-user> from <a href="https://dev.new.expensify.com:8082/r/5345362886584843" target="_blank">#r1</a></muted-text>',
                                    text: 'removed  from #r1',
                                    isDeletedParentAction: false,
                                    deleted: '',
                                },
                            ], actionName: CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.LEAVE_ROOM, actorAccountID: 18921695, person: [
                                {
                                    type: 'TEXT',
                                    style: 'strong',
                                    text: 'f50',
                                },
                            ], originalMessage: undefined });
                        reportActions = (_a = {}, _a[lastAction.reportActionID] = lastAction, _a);
                        return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report.reportID), report)];
                    case 1:
                        _c.sent();
                        return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(report.reportID), reportActions)];
                    case 2:
                        _c.sent();
                        result = SidebarUtils_1.default.getOptionData({
                            report: report,
                            reportAttributes: undefined,
                            reportNameValuePairs: {},
                            personalDetails: {},
                            policy: undefined,
                            parentReportAction: undefined,
                            oneTransactionThreadReport: undefined,
                        });
                        // Then the alternate text should be equal to the message of the last action prepended with the last actor display name.
                        expect(result === null || result === void 0 ? void 0 : result.alternateText).toBe("".concat((_b = lastAction.person) === null || _b === void 0 ? void 0 : _b[0].text, ": ").concat((0, ReportActionsUtils_1.getReportActionMessageText)(lastAction)));
                        return [2 /*return*/];
                }
            });
        }); });
        it('returns @Hidden as an alternate text if the last action mentioned account has no name', function () { return __awaiter(void 0, void 0, void 0, function () {
            var report, mentionedAccountID, lastAction, reportActions, result;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        report = __assign(__assign({}, (0, reports_2.createRandomReport)(4)), { chatType: CONST_1.default.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT, lastMessageText: '@unexisting@gmail.com', lastVisibleActionCreated: '2025-01-20 12:30:03.784' });
                        mentionedAccountID = 19797552;
                        lastAction = __assign(__assign({}, (0, reportActions_1.default)(2)), { message: [
                                {
                                    html: "<mention-user accountID=\"".concat(mentionedAccountID, "\"/>"),
                                    text: '@unexisting@gmal.com',
                                    type: 'COMMENT',
                                    whisperedTo: [],
                                },
                            ], originalMessage: {
                                html: "<mention-user accountID=\"".concat(mentionedAccountID, "\"/>"),
                                whisperedTo: [],
                                lastModified: '2025-05-01 13:23:25.209',
                                mentionedAccountIDs: [mentionedAccountID],
                            }, pendingAction: undefined, previousMessage: undefined, actionName: CONST_1.default.REPORT.ACTIONS.TYPE.ADD_COMMENT, actorAccountID: 119086, person: [
                                {
                                    type: 'TEXT',
                                    style: 'strong',
                                    text: 'f50',
                                },
                            ] });
                        reportActions = (_a = {}, _a[lastAction.reportActionID] = lastAction, _a);
                        return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report.reportID), report)];
                    case 1:
                        _c.sent();
                        return [4 /*yield*/, react_native_onyx_1.default.set(ONYXKEYS_1.default.PERSONAL_DETAILS_LIST, (_b = {}, _b[mentionedAccountID] = { accountID: mentionedAccountID, firstName: '', lastName: '' }, _b))];
                    case 2:
                        _c.sent();
                        return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(report.reportID), reportActions)];
                    case 3:
                        _c.sent();
                        result = SidebarUtils_1.default.getOptionData({
                            report: report,
                            reportAttributes: undefined,
                            reportNameValuePairs: {},
                            personalDetails: {},
                            policy: undefined,
                            parentReportAction: undefined,
                            oneTransactionThreadReport: undefined,
                        });
                        // Then the alternate text should show @Hidden.
                        expect(result === null || result === void 0 ? void 0 : result.alternateText).toBe("f50: @Hidden");
                        return [2 /*return*/];
                }
            });
        }); });
        describe('Alternative text', function () {
            afterEach(function () { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            react_native_onyx_1.default.clear();
                            return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
            it('The text should not contain the policy name at prefix if the report is not related to a workspace', function () { return __awaiter(void 0, void 0, void 0, function () {
                var policy, report, reportNameValuePairs, optionData;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            policy = __assign(__assign({}, (0, policies_1.default)(1)), { role: CONST_1.default.POLICY.ROLE.ADMIN, pendingAction: null });
                            report = __assign(__assign({}, (0, reports_2.createRandomReport)(1)), { chatType: undefined, policyID: CONST_1.default.POLICY.ID_FAKE });
                            reportNameValuePairs = {};
                            return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.POLICY, "1"), policy)];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.POLICY, "2"), __assign(__assign({}, (0, policies_1.default)(2, CONST_1.default.POLICY.TYPE.TEAM)), { role: CONST_1.default.POLICY.ROLE.ADMIN, pendingAction: null }))];
                        case 2:
                            _a.sent();
                            optionData = SidebarUtils_1.default.getOptionData({
                                report: report,
                                reportAttributes: undefined,
                                reportNameValuePairs: reportNameValuePairs,
                                personalDetails: {},
                                policy: policy,
                                parentReportAction: undefined,
                                lastMessageTextFromReport: 'test message',
                                oneTransactionThreadReport: undefined,
                            });
                            expect(optionData === null || optionData === void 0 ? void 0 : optionData.alternateText).toBe("test message");
                            return [2 /*return*/];
                    }
                });
            }); });
            it("The text should not contain the last actor's name at prefix if the report is archived.", function () { return __awaiter(void 0, void 0, void 0, function () {
                var policy, report, reportNameValuePairs, optionData;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            policy = __assign(__assign({}, (0, policies_1.default)(1)), { role: CONST_1.default.POLICY.ROLE.ADMIN, pendingAction: null });
                            report = __assign(__assign({}, (0, reports_2.createRandomReport)(2)), { chatType: CONST_1.default.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT, policyID: policy.id, policyName: policy.name, type: CONST_1.default.REPORT.TYPE.CHAT, lastActorAccountID: 1 });
                            reportNameValuePairs = {
                                private_isArchived: DateUtils_1.default.getDBTime(),
                            };
                            return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.POLICY, "1"), policy)];
                        case 1:
                            _a.sent();
                            optionData = SidebarUtils_1.default.getOptionData({
                                report: report,
                                reportAttributes: undefined,
                                reportNameValuePairs: reportNameValuePairs,
                                personalDetails: LHNTestUtils.fakePersonalDetails,
                                policy: policy,
                                parentReportAction: undefined,
                                lastMessageTextFromReport: 'test message',
                                oneTransactionThreadReport: undefined,
                            });
                            expect(optionData === null || optionData === void 0 ? void 0 : optionData.alternateText).toBe("test message");
                            return [2 /*return*/];
                    }
                });
            }); });
            it('The text should not contain the policy name at prefix if we only have a workspace', function () { return __awaiter(void 0, void 0, void 0, function () {
                var policy, report, reportNameValuePairs, optionData;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            policy = __assign(__assign({}, (0, policies_1.default)(1)), { role: CONST_1.default.POLICY.ROLE.ADMIN, pendingAction: null });
                            report = __assign(__assign({}, (0, reports_2.createRandomReport)(2)), { chatType: CONST_1.default.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT, policyID: policy.id, policyName: policy.name, type: CONST_1.default.REPORT.TYPE.CHAT });
                            reportNameValuePairs = {};
                            return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.POLICY, "1"), policy)];
                        case 1:
                            _a.sent();
                            optionData = SidebarUtils_1.default.getOptionData({
                                report: report,
                                reportAttributes: undefined,
                                reportNameValuePairs: reportNameValuePairs,
                                personalDetails: {},
                                policy: policy,
                                parentReportAction: undefined,
                                lastMessageTextFromReport: 'test message',
                                oneTransactionThreadReport: undefined,
                            });
                            expect(optionData === null || optionData === void 0 ? void 0 : optionData.alternateText).toBe("test message");
                            return [2 /*return*/];
                    }
                });
            }); });
            it('The text should contain the policy name at prefix if we have multiple workspace and the report is related to a workspace', function () { return __awaiter(void 0, void 0, void 0, function () {
                var policy, report, reportNameValuePairs, optionData;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            policy = __assign(__assign({}, (0, policies_1.default)(1, CONST_1.default.POLICY.TYPE.TEAM)), { role: CONST_1.default.POLICY.ROLE.ADMIN, pendingAction: null });
                            report = __assign(__assign({}, (0, reports_2.createRandomReport)(3)), { chatType: CONST_1.default.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT, policyID: '1', policyName: policy.name });
                            reportNameValuePairs = {};
                            return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.POLICY, "1"), policy)];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.POLICY, "2"), __assign(__assign({}, (0, policies_1.default)(2, CONST_1.default.POLICY.TYPE.TEAM)), { role: CONST_1.default.POLICY.ROLE.ADMIN, pendingAction: null }))];
                        case 2:
                            _a.sent();
                            optionData = SidebarUtils_1.default.getOptionData({
                                report: report,
                                reportAttributes: undefined,
                                reportNameValuePairs: reportNameValuePairs,
                                personalDetails: {},
                                policy: policy,
                                parentReportAction: undefined,
                                lastMessageTextFromReport: 'test message',
                                oneTransactionThreadReport: undefined,
                            });
                            expect(optionData === null || optionData === void 0 ? void 0 : optionData.alternateText).toBe("".concat(policy.name, " ").concat(CONST_1.default.DOT_SEPARATOR, " test message"));
                            return [2 /*return*/];
                    }
                });
            }); });
            it('returns the last action message as an alternate text if the action is INVITE_TO_ROOM type', function () { return __awaiter(void 0, void 0, void 0, function () {
                var policy, session, report, lastAction, reportActions, result;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            policy = __assign(__assign({}, (0, policies_1.default)(1)), { role: CONST_1.default.POLICY.ROLE.ADMIN, pendingAction: null });
                            session = {
                                authToken: 'sensitive-auth-token',
                                encryptedAuthToken: 'sensitive-encrypted-token',
                                email: 'user@example.com',
                                accountID: 12345,
                            };
                            report = __assign(__assign({}, (0, reports_2.createRandomReport)(4)), { chatType: 'policyRoom', lastMessageHtml: 'invited 1 user', lastMessageText: 'invited 1 user', lastVisibleActionCreated: '2025-01-20 12:30:03.784', participants: {
                                    '12345': {
                                        notificationPreference: 'daily',
                                        role: 'admin',
                                    },
                                }, policyID: '1' });
                            lastAction = __assign(__assign({}, (0, reportActions_1.default)(2)), { message: [
                                    {
                                        type: 'COMMENT',
                                        html: '<muted-text>invited <mention-user accountID=19268914></mention-user></muted-text>',
                                        text: 'invited',
                                        isEdited: false,
                                        whisperedTo: [],
                                        isDeletedParentAction: false,
                                        deleted: '',
                                    },
                                ], originalMessage: {
                                    lastModified: '2025-03-04 10:32:10.416',
                                    targetAccountIDs: [19268914],
                                }, actorAccountID: 12345, actionName: CONST_1.default.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.INVITE_TO_ROOM });
                            reportActions = (_a = {}, _a[lastAction.reportActionID] = lastAction, _a);
                            return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report.reportID), report)];
                        case 1:
                            _b.sent();
                            return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(report.reportID), reportActions)];
                        case 2:
                            _b.sent();
                            return [4 /*yield*/, react_native_onyx_1.default.set(ONYXKEYS_1.default.SESSION, session)];
                        case 3:
                            _b.sent();
                            return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.POLICY, "1"), policy)];
                        case 4:
                            _b.sent();
                            result = SidebarUtils_1.default.getOptionData({
                                report: report,
                                reportAttributes: undefined,
                                reportNameValuePairs: {},
                                personalDetails: {},
                                policy: undefined,
                                parentReportAction: undefined,
                                oneTransactionThreadReport: undefined,
                            });
                            // Then the alternate text should be equal to the message of the last action prepended with the last actor display name.
                            expect(result === null || result === void 0 ? void 0 : result.alternateText).toBe("You invited 1 member");
                            return [2 /*return*/];
                    }
                });
            }); });
            it('returns the last action message as an alternate text if the action is MOVED type', function () { return __awaiter(void 0, void 0, void 0, function () {
                var report, lastAction, reportActions, result;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            report = __assign(__assign({}, (0, reports_2.createRandomReport)(4)), { chatType: 'policyExpenseChat', pendingAction: null, isOwnPolicyExpenseChat: true });
                            lastAction = __assign(__assign({}, (0, reportActions_1.default)(2)), { message: [
                                    {
                                        type: 'COMMENT',
                                        html: "moved this report to the <a href='https://new.expensify.com/r/1325702002189143' target='_blank' rel='noreferrer noopener'>Three&#039;s Workspace</a> workspace",
                                        text: "moved this report to the Three's Workspace workspace",
                                    },
                                ], originalMessage: {
                                    whisperedTo: [],
                                }, actionName: CONST_1.default.REPORT.ACTIONS.TYPE.MOVED, created: DateUtils_1.default.getDBTime(), lastModified: DateUtils_1.default.getDBTime(), shouldShow: true, pendingAction: null });
                            reportActions = (_a = {}, _a[lastAction.reportActionID] = lastAction, _a);
                            return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report.reportID), report)];
                        case 1:
                            _b.sent();
                            return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(report.reportID), reportActions)];
                        case 2:
                            _b.sent();
                            result = SidebarUtils_1.default.getOptionData({
                                report: report,
                                reportAttributes: undefined,
                                reportNameValuePairs: {},
                                personalDetails: {},
                                policy: undefined,
                                parentReportAction: undefined,
                                oneTransactionThreadReport: undefined,
                            });
                            expect(result === null || result === void 0 ? void 0 : result.alternateText).toBe("You: ".concat((0, ReportActionsUtils_1.getReportActionMessageText)(lastAction)));
                            return [2 /*return*/];
                    }
                });
            }); });
            it('returns the last action message as an alternate text if the expense report is the one expense report', function () { return __awaiter(void 0, void 0, void 0, function () {
                var IOUTransactionID, report, linkedCreateAction, lastAction, result;
                var _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            IOUTransactionID = "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION, "TRANSACTION_IOU");
                            reports_1.iouReportR14932.reportID = '5';
                            reports_1.chatReportR14932.reportID = '6';
                            reports_1.iouReportR14932.lastActorAccountID = undefined;
                            report = __assign(__assign({}, (0, reports_2.createRandomReport)(1)), { chatType: 'policyExpenseChat', pendingAction: null, isOwnPolicyExpenseChat: true, parentReportID: reports_1.iouReportR14932.reportID, parentReportActionID: actions_1.actionR14932.reportActionID, lastActorAccountID: undefined });
                            linkedCreateAction = __assign(__assign({}, actions_1.actionR14932), { originalMessage: __assign(__assign({}, (0, ReportActionsUtils_1.getOriginalMessage)(actions_1.actionR14932)), { IOUTransactionID: IOUTransactionID }), childReportID: report.reportID, reportActionID: '3' });
                            lastAction = __assign(__assign({}, (0, reportActions_1.default)(1)), { message: [
                                    {
                                        type: 'COMMENT',
                                        html: 'test action',
                                        text: 'test action',
                                    },
                                ], originalMessage: {
                                    whisperedTo: [],
                                }, created: DateUtils_1.default.getDBTime(), lastModified: DateUtils_1.default.getDBTime(), shouldShow: true, pendingAction: null, actionName: CONST_1.default.REPORT.ACTIONS.TYPE.ADD_COMMENT, actorAccountID: undefined });
                            return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reports_1.iouReportR14932.reportID), reports_1.iouReportR14932)];
                        case 1:
                            _c.sent();
                            return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reports_1.chatReportR14932.reportID), reports_1.chatReportR14932)];
                        case 2:
                            _c.sent();
                            return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report.reportID), report)];
                        case 3:
                            _c.sent();
                            return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(report.reportID), (_a = {}, _a[lastAction.reportActionID] = lastAction, _a))];
                        case 4:
                            _c.sent();
                            return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(reports_1.iouReportR14932.reportID), (_b = {}, _b[linkedCreateAction.reportActionID] = linkedCreateAction, _b))];
                        case 5:
                            _c.sent();
                            result = SidebarUtils_1.default.getOptionData({
                                report: reports_1.iouReportR14932,
                                reportAttributes: undefined,
                                reportNameValuePairs: {},
                                personalDetails: {},
                                policy: undefined,
                                parentReportAction: undefined,
                                oneTransactionThreadReport: undefined,
                            });
                            expect(result === null || result === void 0 ? void 0 : result.alternateText).toBe("You: ".concat((0, ReportActionsUtils_1.getReportActionMessageText)(lastAction)));
                            return [2 /*return*/];
                    }
                });
            }); });
        });
    });
});
