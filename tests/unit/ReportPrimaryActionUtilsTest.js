"use strict";
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
var ReportPrimaryActionUtils_1 = require("@libs/ReportPrimaryActionUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var reports_1 = require("../../__mocks__/reportData/reports");
var InvoiceData = require("../data/Invoice");
var CURRENT_USER_ACCOUNT_ID = 1;
var CURRENT_USER_EMAIL = 'tester@mail.com';
var SESSION = {
    email: CURRENT_USER_EMAIL,
    accountID: CURRENT_USER_ACCOUNT_ID,
};
var PERSONAL_DETAILS = {
    accountID: CURRENT_USER_ACCOUNT_ID,
    login: CURRENT_USER_EMAIL,
};
var REPORT_ID = 1;
var CHAT_REPORT_ID = 2;
var POLICY_ID = 3;
var INVOICE_SENDER_ACCOUNT_ID = 4;
// This keeps the error "@rnmapbox/maps native code not available." from causing the tests to fail
jest.mock('@components/ConfirmedRoute.tsx');
describe('getPrimaryAction', function () {
    beforeAll(function () {
        react_native_onyx_1.default.init({
            keys: ONYXKEYS_1.default,
        });
    });
    beforeEach(function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    jest.clearAllMocks();
                    react_native_onyx_1.default.clear();
                    return [4 /*yield*/, react_native_onyx_1.default.merge(ONYXKEYS_1.default.SESSION, SESSION)];
                case 1:
                    _b.sent();
                    return [4 /*yield*/, react_native_onyx_1.default.set(ONYXKEYS_1.default.PERSONAL_DETAILS_LIST, (_a = {}, _a[CURRENT_USER_ACCOUNT_ID] = PERSONAL_DETAILS, _a))];
                case 2:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it('should return ADD_EXPENSE for expense report with no transactions', function () { return __awaiter(void 0, void 0, void 0, function () {
        var report;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    report = {
                        reportID: REPORT_ID,
                        type: CONST_1.default.REPORT.TYPE.EXPENSE,
                        ownerAccountID: CURRENT_USER_ACCOUNT_ID,
                        stateNum: CONST_1.default.REPORT.STATE_NUM.OPEN,
                        statusNum: CONST_1.default.REPORT.STATUS_NUM.OPEN,
                    };
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(REPORT_ID), report)];
                case 1:
                    _a.sent();
                    expect((0, ReportPrimaryActionUtils_1.getReportPrimaryAction)({ report: report, chatReport: reports_1.chatReportR14932, reportTransactions: [], violations: {}, policy: {} })).toBe(CONST_1.default.REPORT.PRIMARY_ACTIONS.ADD_EXPENSE);
                    return [2 /*return*/];
            }
        });
    }); });
    it('should return SUBMIT for expense report with manual submit', function () { return __awaiter(void 0, void 0, void 0, function () {
        var report, policy, transaction;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    report = {
                        reportID: REPORT_ID,
                        type: CONST_1.default.REPORT.TYPE.EXPENSE,
                        ownerAccountID: CURRENT_USER_ACCOUNT_ID,
                        stateNum: CONST_1.default.REPORT.STATE_NUM.OPEN,
                        statusNum: CONST_1.default.REPORT.STATUS_NUM.OPEN,
                    };
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(REPORT_ID), report)];
                case 1:
                    _a.sent();
                    policy = {
                        autoReportingFrequency: CONST_1.default.POLICY.AUTO_REPORTING_FREQUENCIES.IMMEDIATE,
                    };
                    transaction = {
                        reportID: "".concat(REPORT_ID),
                    };
                    expect((0, ReportPrimaryActionUtils_1.getReportPrimaryAction)({ report: report, chatReport: reports_1.chatReportR14932, reportTransactions: [transaction], violations: {}, policy: policy })).toBe(CONST_1.default.REPORT.PRIMARY_ACTIONS.SUBMIT);
                    return [2 /*return*/];
            }
        });
    }); });
    it('should not return SUBMIT option for admin with only pending transactions', function () { return __awaiter(void 0, void 0, void 0, function () {
        var report, policy, transaction;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    report = {
                        reportID: REPORT_ID,
                        type: CONST_1.default.REPORT.TYPE.EXPENSE,
                        ownerAccountID: CURRENT_USER_ACCOUNT_ID,
                        stateNum: CONST_1.default.REPORT.STATE_NUM.OPEN,
                        statusNum: CONST_1.default.REPORT.STATUS_NUM.OPEN,
                    };
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(REPORT_ID), report)];
                case 1:
                    _a.sent();
                    policy = {
                        autoReportingFrequency: CONST_1.default.POLICY.AUTO_REPORTING_FREQUENCIES.IMMEDIATE,
                    };
                    transaction = {
                        reportID: "".concat(REPORT_ID),
                        status: CONST_1.default.TRANSACTION.STATUS.PENDING,
                        amount: 10,
                        merchant: 'Merchant',
                        date: '2025-01-01',
                    };
                    expect((0, ReportPrimaryActionUtils_1.getReportPrimaryAction)({ report: report, chatReport: reports_1.chatReportR14932, reportTransactions: [transaction], violations: {}, policy: policy })).toBe('');
                    return [2 /*return*/];
            }
        });
    }); });
    it('should return Approve for report being processed', function () { return __awaiter(void 0, void 0, void 0, function () {
        var report, policy, transaction;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    report = {
                        reportID: REPORT_ID,
                        type: CONST_1.default.REPORT.TYPE.EXPENSE,
                        ownerAccountID: CURRENT_USER_ACCOUNT_ID,
                        stateNum: CONST_1.default.REPORT.STATE_NUM.SUBMITTED,
                        statusNum: CONST_1.default.REPORT.STATUS_NUM.SUBMITTED,
                        managerID: CURRENT_USER_ACCOUNT_ID,
                    };
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(REPORT_ID), report)];
                case 1:
                    _a.sent();
                    policy = {
                        approver: CURRENT_USER_EMAIL,
                        approvalMode: CONST_1.default.POLICY.APPROVAL_MODE.BASIC,
                    };
                    transaction = {
                        reportID: "".concat(REPORT_ID),
                        comment: {
                            hold: 'Hold',
                        },
                    };
                    expect((0, ReportPrimaryActionUtils_1.getReportPrimaryAction)({ report: report, chatReport: reports_1.chatReportR14932, reportTransactions: [transaction], violations: {}, policy: policy })).toBe(CONST_1.default.REPORT.PRIMARY_ACTIONS.APPROVE);
                    return [2 /*return*/];
            }
        });
    }); });
    it('should return empty for report being processed but transactions are scanning', function () { return __awaiter(void 0, void 0, void 0, function () {
        var report, policy, transaction;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    report = {
                        reportID: REPORT_ID,
                        type: CONST_1.default.REPORT.TYPE.EXPENSE,
                        ownerAccountID: CURRENT_USER_ACCOUNT_ID,
                        stateNum: CONST_1.default.REPORT.STATE_NUM.SUBMITTED,
                        statusNum: CONST_1.default.REPORT.STATUS_NUM.SUBMITTED,
                        managerID: CURRENT_USER_ACCOUNT_ID,
                    };
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(REPORT_ID), report)];
                case 1:
                    _a.sent();
                    policy = {
                        approver: CURRENT_USER_EMAIL,
                        approvalMode: CONST_1.default.POLICY.APPROVAL_MODE.BASIC,
                    };
                    transaction = {
                        reportID: "".concat(REPORT_ID),
                        comment: {
                            hold: 'Hold',
                        },
                        receipt: {
                            state: CONST_1.default.IOU.RECEIPT_STATE.SCANNING,
                        },
                    };
                    expect((0, ReportPrimaryActionUtils_1.getReportPrimaryAction)({ report: report, chatReport: reports_1.chatReportR14932, reportTransactions: [transaction], violations: {}, policy: policy })).toBe('');
                    return [2 /*return*/];
            }
        });
    }); });
    it('should return PAY for submitted invoice report if paid as personal', function () { return __awaiter(void 0, void 0, void 0, function () {
        var report, parentReport, policy, invoiceReceiverPolicy, transaction;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    report = {
                        reportID: REPORT_ID,
                        type: CONST_1.default.REPORT.TYPE.INVOICE,
                        ownerAccountID: INVOICE_SENDER_ACCOUNT_ID,
                        parentReportID: CHAT_REPORT_ID,
                        statusNum: CONST_1.default.REPORT.STATUS_NUM.SUBMITTED,
                        stateNum: CONST_1.default.REPORT.STATE_NUM.SUBMITTED,
                    };
                    parentReport = {
                        reportID: CHAT_REPORT_ID,
                        invoiceReceiver: {
                            type: CONST_1.default.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL,
                            accountID: CURRENT_USER_ACCOUNT_ID,
                        },
                    };
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(REPORT_ID), report)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(CHAT_REPORT_ID), parentReport)];
                case 2:
                    _a.sent();
                    policy = {};
                    invoiceReceiverPolicy = {
                        role: CONST_1.default.POLICY.ROLE.ADMIN,
                    };
                    transaction = {
                        reportID: "".concat(REPORT_ID),
                    };
                    expect((0, ReportPrimaryActionUtils_1.getReportPrimaryAction)({ report: report, chatReport: reports_1.chatReportR14932, reportTransactions: [transaction], violations: {}, policy: policy, invoiceReceiverPolicy: invoiceReceiverPolicy })).toBe(CONST_1.default.REPORT.PRIMARY_ACTIONS.PAY);
                    return [2 /*return*/];
            }
        });
    }); });
    it('should return PAY for expense report with payments enabled', function () { return __awaiter(void 0, void 0, void 0, function () {
        var report, policy, transaction;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    report = {
                        reportID: REPORT_ID,
                        type: CONST_1.default.REPORT.TYPE.EXPENSE,
                        ownerAccountID: CURRENT_USER_ACCOUNT_ID,
                        statusNum: CONST_1.default.REPORT.STATUS_NUM.CLOSED,
                        total: -300,
                    };
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(REPORT_ID), report)];
                case 1:
                    _a.sent();
                    policy = {
                        role: CONST_1.default.POLICY.ROLE.ADMIN,
                    };
                    transaction = {
                        reportID: "".concat(REPORT_ID),
                    };
                    expect((0, ReportPrimaryActionUtils_1.getReportPrimaryAction)({ report: report, chatReport: reports_1.chatReportR14932, reportTransactions: [transaction], violations: {}, policy: policy })).toBe(CONST_1.default.REPORT.PRIMARY_ACTIONS.PAY);
                    return [2 /*return*/];
            }
        });
    }); });
    it('should return EXPORT TO ACCOUNTING for finished reports', function () { return __awaiter(void 0, void 0, void 0, function () {
        var report, policy, transaction;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    report = {
                        reportID: REPORT_ID,
                        type: CONST_1.default.REPORT.TYPE.EXPENSE,
                        ownerAccountID: CURRENT_USER_ACCOUNT_ID,
                        statusNum: CONST_1.default.REPORT.STATUS_NUM.CLOSED,
                    };
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(REPORT_ID), report)];
                case 1:
                    _a.sent();
                    policy = {
                        connections: {
                            intacct: {
                                config: {
                                    export: {
                                        exporter: CURRENT_USER_EMAIL,
                                    },
                                },
                            },
                        },
                    };
                    transaction = {
                        reportID: "".concat(REPORT_ID),
                    };
                    expect((0, ReportPrimaryActionUtils_1.getReportPrimaryAction)({ report: report, chatReport: reports_1.chatReportR14932, reportTransactions: [transaction], violations: {}, policy: policy })).toBe(CONST_1.default.REPORT.PRIMARY_ACTIONS.EXPORT_TO_ACCOUNTING);
                    return [2 /*return*/];
            }
        });
    }); });
    it('should not return EXPORT TO ACCOUNTING for invoice reports', function () { return __awaiter(void 0, void 0, void 0, function () {
        var report, policy, transaction;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    report = {
                        reportID: REPORT_ID,
                        type: CONST_1.default.REPORT.TYPE.INVOICE,
                        ownerAccountID: CURRENT_USER_ACCOUNT_ID,
                        statusNum: CONST_1.default.REPORT.STATUS_NUM.CLOSED,
                    };
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(REPORT_ID), report)];
                case 1:
                    _a.sent();
                    policy = {
                        connections: {
                            intacct: {
                                config: {
                                    export: {
                                        exporter: CURRENT_USER_EMAIL,
                                    },
                                },
                            },
                        },
                    };
                    transaction = {
                        reportID: "".concat(REPORT_ID),
                    };
                    expect((0, ReportPrimaryActionUtils_1.getReportPrimaryAction)({ report: report, chatReport: reports_1.chatReportR14932, reportTransactions: [transaction], violations: {}, policy: policy })).not.toBe(CONST_1.default.REPORT.PRIMARY_ACTIONS.EXPORT_TO_ACCOUNTING);
                    return [2 /*return*/];
            }
        });
    }); });
    it('should not return EXPORT TO ACCOUNTING for reports marked manually as exported', function () { return __awaiter(void 0, void 0, void 0, function () {
        var report, policy, reportActions;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    report = {
                        reportID: REPORT_ID,
                        type: CONST_1.default.REPORT.TYPE.EXPENSE,
                        ownerAccountID: CURRENT_USER_ACCOUNT_ID,
                        statusNum: CONST_1.default.REPORT.STATUS_NUM.CLOSED,
                    };
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(REPORT_ID), report)];
                case 1:
                    _a.sent();
                    policy = {
                        connections: {
                            intacct: {
                                config: {
                                    export: {
                                        exporter: CURRENT_USER_EMAIL,
                                    },
                                },
                            },
                        },
                    };
                    reportActions = [
                        { actionName: CONST_1.default.REPORT.ACTIONS.TYPE.EXPORTED_TO_INTEGRATION, reportActionID: '1', created: '2025-01-01', originalMessage: { markedManually: true } },
                    ];
                    expect((0, ReportPrimaryActionUtils_1.getReportPrimaryAction)({ report: report, chatReport: reports_1.chatReportR14932, reportTransactions: [], violations: {}, policy: policy, reportNameValuePairs: {}, reportActions: reportActions })).toBe('');
                    return [2 /*return*/];
            }
        });
    }); });
    it('should return REMOVE HOLD for reports with transactions on hold', function () { return __awaiter(void 0, void 0, void 0, function () {
        var report, policy, HOLD_ACTION_ID, REPORT_ACTION_ID, TRANSACTION_ID, CHILD_REPORT_ID, transaction, reportAction, holdAction;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    report = {
                        reportID: REPORT_ID,
                        type: CONST_1.default.REPORT.TYPE.EXPENSE,
                    };
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(REPORT_ID), report)];
                case 1:
                    _c.sent();
                    policy = {};
                    HOLD_ACTION_ID = 'HOLD_ACTION_ID';
                    REPORT_ACTION_ID = 'REPORT_ACTION_ID';
                    TRANSACTION_ID = 'TRANSACTION_ID';
                    CHILD_REPORT_ID = 'CHILD_REPORT_ID';
                    transaction = {
                        transactionID: TRANSACTION_ID,
                        comment: {
                            hold: HOLD_ACTION_ID,
                        },
                    };
                    reportAction = {
                        actionName: CONST_1.default.REPORT.ACTIONS.TYPE.IOU,
                        type: CONST_1.default.REPORT.ACTIONS.TYPE.IOU,
                        reportActionID: REPORT_ACTION_ID,
                        actorAccountID: CURRENT_USER_ACCOUNT_ID,
                        childReportID: CHILD_REPORT_ID,
                        message: [
                            {
                                html: 'html',
                            },
                        ],
                        originalMessage: {
                            type: CONST_1.default.IOU.REPORT_ACTION_TYPE.CREATE,
                            IOUTransactionID: TRANSACTION_ID,
                        },
                    };
                    holdAction = {
                        reportActionID: HOLD_ACTION_ID,
                        reportID: CHILD_REPORT_ID,
                        actorAccountID: CURRENT_USER_ACCOUNT_ID,
                    };
                    return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(REPORT_ID), (_a = {}, _a[REPORT_ACTION_ID] = reportAction, _a))];
                case 2:
                    _c.sent();
                    return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(CHILD_REPORT_ID), (_b = {}, _b[HOLD_ACTION_ID] = holdAction, _b))];
                case 3:
                    _c.sent();
                    expect((0, ReportPrimaryActionUtils_1.getReportPrimaryAction)({ report: report, chatReport: reports_1.chatReportR14932, reportTransactions: [transaction], violations: {}, policy: policy })).toBe(CONST_1.default.REPORT.PRIMARY_ACTIONS.REMOVE_HOLD);
                    return [2 /*return*/];
            }
        });
    }); });
    it('should return MARK AS CASH if has all RTER violations', function () { return __awaiter(void 0, void 0, void 0, function () {
        var report, policy, TRANSACTION_ID, transaction, violation;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    report = {
                        reportID: REPORT_ID,
                        type: CONST_1.default.REPORT.TYPE.EXPENSE,
                        ownerAccountID: CURRENT_USER_ACCOUNT_ID,
                        statusNum: CONST_1.default.REPORT.STATUS_NUM.CLOSED,
                        total: -300,
                    };
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(REPORT_ID), report)];
                case 1:
                    _b.sent();
                    policy = {
                        role: CONST_1.default.POLICY.ROLE.ADMIN,
                    };
                    TRANSACTION_ID = 'TRANSACTION_ID';
                    transaction = {
                        transactionID: TRANSACTION_ID,
                    };
                    violation = {
                        name: CONST_1.default.VIOLATIONS.RTER,
                        data: {
                            pendingPattern: true,
                            rterType: CONST_1.default.RTER_VIOLATION_TYPES.SEVEN_DAY_HOLD,
                        },
                    };
                    expect((0, ReportPrimaryActionUtils_1.getReportPrimaryAction)({
                        report: report,
                        chatReport: reports_1.chatReportR14932,
                        reportTransactions: [transaction],
                        violations: (_a = {}, _a["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(TRANSACTION_ID)] = [violation], _a),
                        policy: policy,
                    })).toBe(CONST_1.default.REPORT.PRIMARY_ACTIONS.MARK_AS_CASH);
                    return [2 /*return*/];
            }
        });
    }); });
    it('should return MARK AS CASH for broken connection', function () { return __awaiter(void 0, void 0, void 0, function () {
        var report, policy, TRANSACTION_ID, transaction, violation;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    report = {
                        reportID: REPORT_ID,
                        ownerAccountID: CURRENT_USER_ACCOUNT_ID,
                        stateNum: CONST_1.default.REPORT.STATE_NUM.OPEN,
                        statusNum: CONST_1.default.REPORT.STATUS_NUM.OPEN,
                        type: CONST_1.default.REPORT.TYPE.EXPENSE,
                    };
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(REPORT_ID), report)];
                case 1:
                    _b.sent();
                    policy = {};
                    TRANSACTION_ID = 'TRANSACTION_ID';
                    transaction = {
                        transactionID: TRANSACTION_ID,
                    };
                    violation = {
                        name: CONST_1.default.VIOLATIONS.RTER,
                        data: {
                            rterType: CONST_1.default.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION,
                        },
                    };
                    expect((0, ReportPrimaryActionUtils_1.getReportPrimaryAction)({
                        report: report,
                        chatReport: reports_1.chatReportR14932,
                        reportTransactions: [transaction],
                        violations: (_a = {}, _a["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(TRANSACTION_ID)] = [violation], _a),
                        policy: policy,
                    })).toBe(CONST_1.default.REPORT.PRIMARY_ACTIONS.MARK_AS_CASH);
                    return [2 /*return*/];
            }
        });
    }); });
    it('should return an empty string for invoice report when the chat report is archived', function () { return __awaiter(void 0, void 0, void 0, function () {
        var policy, invoiceChatReport, report, transaction, isChatReportArchived;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    policy = InvoiceData.policy, invoiceChatReport = InvoiceData.convertedInvoiceChat;
                    report = {
                        type: CONST_1.default.REPORT.TYPE.INVOICE,
                        ownerAccountID: CURRENT_USER_ACCOUNT_ID,
                        statusNum: CONST_1.default.REPORT.STATUS_NUM.SUBMITTED,
                        stateNum: CONST_1.default.REPORT.STATE_NUM.SUBMITTED,
                        chatReportID: invoiceChatReport.chatReportID,
                    };
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(REPORT_ID), report)];
                case 1:
                    _a.sent();
                    // This is what indicates that a report is archived (see ReportUtils.isArchivedReport())
                    return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_NAME_VALUE_PAIRS).concat(report.chatReportID), {
                            private_isArchived: new Date().toString(),
                        })];
                case 2:
                    // This is what indicates that a report is archived (see ReportUtils.isArchivedReport())
                    _a.sent();
                    transaction = {
                        reportID: "".concat(REPORT_ID),
                    };
                    isChatReportArchived = (0, react_native_1.renderHook)(function () { return (0, useReportIsArchived_1.default)(report === null || report === void 0 ? void 0 : report.chatReportID); }).result;
                    // Then the getReportPrimaryAction should return the empty string
                    expect((0, ReportPrimaryActionUtils_1.getReportPrimaryAction)({
                        report: report,
                        chatReport: invoiceChatReport,
                        reportTransactions: [transaction],
                        violations: {},
                        // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
                        policy: policy,
                        isChatReportArchived: isChatReportArchived.current,
                    })).toBe('');
                    return [2 /*return*/];
            }
        });
    }); });
});
describe('getTransactionThreadPrimaryAction', function () {
    beforeAll(function () {
        react_native_onyx_1.default.init({
            keys: ONYXKEYS_1.default,
        });
    });
    beforeEach(function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    jest.clearAllMocks();
                    react_native_onyx_1.default.clear();
                    return [4 /*yield*/, react_native_onyx_1.default.merge(ONYXKEYS_1.default.SESSION, SESSION)];
                case 1:
                    _b.sent();
                    return [4 /*yield*/, react_native_onyx_1.default.set(ONYXKEYS_1.default.PERSONAL_DETAILS_LIST, (_a = {}, _a[CURRENT_USER_ACCOUNT_ID] = PERSONAL_DETAILS, _a))];
                case 2:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it('should return REMOVE HOLD for transaction thread being on hold', function () { return __awaiter(void 0, void 0, void 0, function () {
        var policy, HOLD_ACTION_ID, TRANSACTION_ID, CHILD_REPORT_ID, report, transaction, holdAction;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    policy = {};
                    HOLD_ACTION_ID = 'HOLD_ACTION_ID';
                    TRANSACTION_ID = 'TRANSACTION_ID';
                    CHILD_REPORT_ID = 'CHILD_REPORT_ID';
                    report = {
                        reportID: CHILD_REPORT_ID,
                        type: CONST_1.default.REPORT.TYPE.EXPENSE,
                    };
                    transaction = {
                        transactionID: TRANSACTION_ID,
                        comment: {
                            hold: HOLD_ACTION_ID,
                        },
                    };
                    holdAction = {
                        reportActionID: HOLD_ACTION_ID,
                        reportID: CHILD_REPORT_ID,
                        actorAccountID: CURRENT_USER_ACCOUNT_ID,
                    };
                    return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(CHILD_REPORT_ID), (_a = {}, _a[HOLD_ACTION_ID] = holdAction, _a))];
                case 1:
                    _b.sent();
                    expect((0, ReportPrimaryActionUtils_1.getTransactionThreadPrimaryAction)(report, {}, transaction, [], policy)).toBe(CONST_1.default.REPORT.TRANSACTION_PRIMARY_ACTIONS.REMOVE_HOLD);
                    return [2 /*return*/];
            }
        });
    }); });
    it('should return REVIEW DUPLICATES when there are duplicated transactions', function () { return __awaiter(void 0, void 0, void 0, function () {
        var report, policy, REPORT_ACTION_ID, TRANSACTION_ID, transaction;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    report = {
                        reportID: REPORT_ID,
                        ownerAccountID: CURRENT_USER_ACCOUNT_ID,
                        stateNum: CONST_1.default.REPORT.STATE_NUM.OPEN,
                        statusNum: CONST_1.default.REPORT.STATUS_NUM.OPEN,
                    };
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(REPORT_ID), report)];
                case 1:
                    _a.sent();
                    policy = {};
                    REPORT_ACTION_ID = 'REPORT_ACTION_ID';
                    TRANSACTION_ID = 'TRANSACTION_ID';
                    transaction = {
                        transactionID: TRANSACTION_ID,
                        comment: {
                            hold: REPORT_ACTION_ID,
                        },
                    };
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(TRANSACTION_ID), transaction)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(TRANSACTION_ID), [
                            {
                                name: CONST_1.default.VIOLATIONS.DUPLICATED_TRANSACTION,
                            },
                        ])];
                case 3:
                    _a.sent();
                    expect((0, ReportPrimaryActionUtils_1.getTransactionThreadPrimaryAction)({}, report, transaction, [], policy)).toBe(CONST_1.default.REPORT.TRANSACTION_PRIMARY_ACTIONS.REVIEW_DUPLICATES);
                    return [2 /*return*/];
            }
        });
    }); });
    it('should return MARK AS CASH if has all RTER violations', function () { return __awaiter(void 0, void 0, void 0, function () {
        var report, policy, TRANSACTION_ID, transaction, violation;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    report = {
                        reportID: REPORT_ID,
                        type: CONST_1.default.REPORT.TYPE.EXPENSE,
                        ownerAccountID: CURRENT_USER_ACCOUNT_ID,
                        stateNum: CONST_1.default.REPORT.STATE_NUM.OPEN,
                        statusNum: CONST_1.default.REPORT.STATUS_NUM.OPEN,
                    };
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(REPORT_ID), report)];
                case 1:
                    _a.sent();
                    policy = {};
                    TRANSACTION_ID = 'TRANSACTION_ID';
                    transaction = {
                        transactionID: TRANSACTION_ID,
                    };
                    violation = {
                        name: CONST_1.default.VIOLATIONS.RTER,
                        data: {
                            pendingPattern: true,
                            rterType: CONST_1.default.RTER_VIOLATION_TYPES.SEVEN_DAY_HOLD,
                        },
                    };
                    expect((0, ReportPrimaryActionUtils_1.getTransactionThreadPrimaryAction)({}, report, transaction, [violation], policy)).toBe(CONST_1.default.REPORT.TRANSACTION_PRIMARY_ACTIONS.MARK_AS_CASH);
                    return [2 /*return*/];
            }
        });
    }); });
    it('should return MARK AS CASH for broken connection', function () { return __awaiter(void 0, void 0, void 0, function () {
        var report, policy, TRANSACTION_ID, transaction, violation;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    report = {
                        reportID: REPORT_ID,
                        ownerAccountID: CURRENT_USER_ACCOUNT_ID,
                        stateNum: CONST_1.default.REPORT.STATE_NUM.OPEN,
                        statusNum: CONST_1.default.REPORT.STATUS_NUM.OPEN,
                        type: CONST_1.default.REPORT.TYPE.EXPENSE,
                    };
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(REPORT_ID), report)];
                case 1:
                    _a.sent();
                    policy = {};
                    TRANSACTION_ID = 'TRANSACTION_ID';
                    transaction = {
                        transactionID: TRANSACTION_ID,
                    };
                    violation = {
                        name: CONST_1.default.VIOLATIONS.RTER,
                        data: {
                            rterType: CONST_1.default.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION,
                        },
                    };
                    expect((0, ReportPrimaryActionUtils_1.getTransactionThreadPrimaryAction)({}, report, transaction, [violation], policy)).toBe(CONST_1.default.REPORT.TRANSACTION_PRIMARY_ACTIONS.MARK_AS_CASH);
                    return [2 /*return*/];
            }
        });
    }); });
    it('Should return empty string when we are waiting for user to add a bank account', function () { return __awaiter(void 0, void 0, void 0, function () {
        var report, policy, transaction;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    report = {
                        reportID: REPORT_ID,
                        type: CONST_1.default.REPORT.TYPE.EXPENSE,
                        ownerAccountID: CURRENT_USER_ACCOUNT_ID,
                        statusNum: CONST_1.default.REPORT.STATUS_NUM.CLOSED,
                        isWaitingOnBankAccount: true,
                    };
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(REPORT_ID), report)];
                case 1:
                    _a.sent();
                    policy = {
                        connections: {
                            intacct: {
                                config: {
                                    export: {
                                        exporter: CURRENT_USER_EMAIL,
                                    },
                                },
                            },
                        },
                    };
                    transaction = {
                        reportID: "".concat(REPORT_ID),
                    };
                    expect((0, ReportPrimaryActionUtils_1.getReportPrimaryAction)({
                        report: report,
                        chatReport: reports_1.chatReportR14932,
                        reportTransactions: [transaction],
                        violations: {},
                        policy: policy,
                    })).toBe('');
                    return [2 /*return*/];
            }
        });
    }); });
    it('should return PAY for submitted invoice report if paid as business and the payer is the policy admin', function () { return __awaiter(void 0, void 0, void 0, function () {
        var report, parentReport, invoiceReceiverPolicy, transaction;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    report = {
                        reportID: REPORT_ID,
                        type: CONST_1.default.REPORT.TYPE.INVOICE,
                        ownerAccountID: INVOICE_SENDER_ACCOUNT_ID,
                        parentReportID: CHAT_REPORT_ID,
                        statusNum: CONST_1.default.REPORT.STATUS_NUM.SUBMITTED,
                        stateNum: CONST_1.default.REPORT.STATE_NUM.SUBMITTED,
                    };
                    parentReport = {
                        reportID: CHAT_REPORT_ID,
                        invoiceReceiver: {
                            type: CONST_1.default.REPORT.INVOICE_RECEIVER_TYPE.BUSINESS,
                            policyID: POLICY_ID,
                        },
                    };
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(REPORT_ID), report)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(CHAT_REPORT_ID), parentReport)];
                case 2:
                    _a.sent();
                    invoiceReceiverPolicy = {
                        role: CONST_1.default.POLICY.ROLE.ADMIN,
                    };
                    transaction = {
                        reportID: "".concat(REPORT_ID),
                    };
                    expect((0, ReportPrimaryActionUtils_1.getReportPrimaryAction)({
                        report: report,
                        chatReport: reports_1.chatReportR14932,
                        reportTransactions: [transaction],
                        violations: {},
                        policy: {},
                        invoiceReceiverPolicy: invoiceReceiverPolicy,
                    })).toBe(CONST_1.default.REPORT.PRIMARY_ACTIONS.PAY);
                    return [2 /*return*/];
            }
        });
    }); });
});
