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
var react_native_onyx_1 = require("react-native-onyx");
var ReportSecondaryActionUtils_1 = require("@libs/ReportSecondaryActionUtils");
var CONST_1 = require("@src/CONST");
var ReportActionsUtils = require("@src/libs/ReportActionsUtils");
var ReportUtils = require("@src/libs/ReportUtils");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var actions_1 = require("../../__mocks__/reportData/actions");
var reports_1 = require("../../__mocks__/reportData/reports");
var EMPLOYEE_ACCOUNT_ID = 1;
var EMPLOYEE_EMAIL = 'employee@mail.com';
var MANAGER_ACCOUNT_ID = 2;
var MANAGER_EMAIL = 'manager@mail.com';
var APPROVER_ACCOUNT_ID = 3;
var APPROVER_EMAIL = 'approver@mail.com';
var ADMIN_ACCOUNT_ID = 4;
var ADMIN_EMAIL = 'admin@mail.com';
var SESSION = {
    email: EMPLOYEE_EMAIL,
    accountID: EMPLOYEE_ACCOUNT_ID,
};
var PERSONAL_DETAILS = {
    accountID: EMPLOYEE_ACCOUNT_ID,
    login: EMPLOYEE_EMAIL,
};
var REPORT_ID = 1;
var POLICY_ID = 'POLICY_ID';
var OLD_POLICY_ID = 'OLD_POLICY_ID';
describe('getSecondaryAction', function () {
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
                    return [4 /*yield*/, react_native_onyx_1.default.set(ONYXKEYS_1.default.PERSONAL_DETAILS_LIST, (_a = {}, _a[EMPLOYEE_ACCOUNT_ID] = PERSONAL_DETAILS, _a[APPROVER_ACCOUNT_ID] = { accountID: APPROVER_ACCOUNT_ID, login: APPROVER_EMAIL }, _a))];
                case 2:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it('should always return default options', function () {
        var report = {};
        var policy = {};
        var result = [CONST_1.default.REPORT.SECONDARY_ACTIONS.DOWNLOAD_CSV, CONST_1.default.REPORT.SECONDARY_ACTIONS.DOWNLOAD_PDF, CONST_1.default.REPORT.SECONDARY_ACTIONS.VIEW_DETAILS];
        expect((0, ReportSecondaryActionUtils_1.getSecondaryReportActions)({ report: report, chatReport: reports_1.chatReportR14932, reportTransactions: [], violations: {}, policy: policy })).toEqual(result);
    });
    it('includes ADD_EXPENSE option for empty report', function () { return __awaiter(void 0, void 0, void 0, function () {
        var report, policy, TRANSACTION_ID, transaction, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    report = {
                        reportID: REPORT_ID,
                        type: CONST_1.default.REPORT.TYPE.EXPENSE,
                        ownerAccountID: EMPLOYEE_ACCOUNT_ID,
                        stateNum: CONST_1.default.REPORT.STATE_NUM.OPEN,
                        statusNum: CONST_1.default.REPORT.STATUS_NUM.OPEN,
                    };
                    policy = {
                        autoReportingFrequency: CONST_1.default.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT,
                        harvesting: {
                            enabled: true,
                        },
                    };
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(REPORT_ID), report)];
                case 1:
                    _a.sent();
                    TRANSACTION_ID = 'TRANSACTION_ID';
                    transaction = {
                        transactionID: TRANSACTION_ID,
                    };
                    result = (0, ReportSecondaryActionUtils_1.getSecondaryReportActions)({ report: report, chatReport: reports_1.chatReportR14932, reportTransactions: [transaction], violations: {}, policy: policy });
                    expect(result.includes(CONST_1.default.REPORT.SECONDARY_ACTIONS.ADD_EXPENSE)).toBe(true);
                    return [2 /*return*/];
            }
        });
    }); });
    it('includes SUBMIT option', function () { return __awaiter(void 0, void 0, void 0, function () {
        var report, policy, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    report = {
                        reportID: REPORT_ID,
                        type: CONST_1.default.REPORT.TYPE.EXPENSE,
                        ownerAccountID: EMPLOYEE_ACCOUNT_ID,
                        stateNum: CONST_1.default.REPORT.STATE_NUM.OPEN,
                        statusNum: CONST_1.default.REPORT.STATUS_NUM.OPEN,
                        total: 10,
                    };
                    policy = {
                        autoReportingFrequency: CONST_1.default.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT,
                        harvesting: {
                            enabled: true,
                        },
                    };
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(REPORT_ID), report)];
                case 1:
                    _a.sent();
                    result = (0, ReportSecondaryActionUtils_1.getSecondaryReportActions)({ report: report, chatReport: reports_1.chatReportR14932, reportTransactions: [], violations: {}, policy: policy });
                    expect(result.includes(CONST_1.default.REPORT.SECONDARY_ACTIONS.SUBMIT)).toBe(true);
                    return [2 /*return*/];
            }
        });
    }); });
    it('includes SUBMIT option for admin', function () { return __awaiter(void 0, void 0, void 0, function () {
        var report, policy, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    report = {
                        reportID: REPORT_ID,
                        type: CONST_1.default.REPORT.TYPE.EXPENSE,
                        stateNum: CONST_1.default.REPORT.STATE_NUM.OPEN,
                        statusNum: CONST_1.default.REPORT.STATUS_NUM.OPEN,
                        total: 10,
                    };
                    policy = {
                        autoReportingFrequency: CONST_1.default.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT,
                        harvesting: {
                            enabled: true,
                        },
                        role: CONST_1.default.POLICY.ROLE.ADMIN,
                    };
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(REPORT_ID), report)];
                case 1:
                    _a.sent();
                    result = (0, ReportSecondaryActionUtils_1.getSecondaryReportActions)({ report: report, chatReport: reports_1.chatReportR14932, reportTransactions: [], violations: {}, policy: policy });
                    expect(result.includes(CONST_1.default.REPORT.SECONDARY_ACTIONS.SUBMIT)).toBe(true);
                    return [2 /*return*/];
            }
        });
    }); });
    it('should not include SUBMIT option for admin with only pending transactions', function () { return __awaiter(void 0, void 0, void 0, function () {
        var report, policy, transaction, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    report = {
                        reportID: REPORT_ID,
                        type: CONST_1.default.REPORT.TYPE.EXPENSE,
                        stateNum: CONST_1.default.REPORT.STATE_NUM.OPEN,
                        statusNum: CONST_1.default.REPORT.STATUS_NUM.OPEN,
                        total: 10,
                    };
                    policy = {
                        autoReportingFrequency: CONST_1.default.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT,
                        harvesting: {
                            enabled: true,
                        },
                        role: CONST_1.default.POLICY.ROLE.ADMIN,
                    };
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(REPORT_ID), report)];
                case 1:
                    _a.sent();
                    transaction = {
                        transactionID: 'TRANSACTION_ID',
                        status: CONST_1.default.TRANSACTION.STATUS.PENDING,
                        amount: 10,
                        merchant: 'Merchant',
                        date: '2025-01-01',
                    };
                    result = (0, ReportSecondaryActionUtils_1.getSecondaryReportActions)({ report: report, chatReport: reports_1.chatReportR14932, reportTransactions: [transaction], violations: {}, policy: policy });
                    expect(result.includes(CONST_1.default.REPORT.SECONDARY_ACTIONS.SUBMIT)).toBe(false);
                    return [2 /*return*/];
            }
        });
    }); });
    it('includes APPROVE option for approver and report with duplicates', function () { return __awaiter(void 0, void 0, void 0, function () {
        var report, policy, TRANSACTION_ID, transaction, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    report = {
                        reportID: REPORT_ID,
                        type: CONST_1.default.REPORT.TYPE.EXPENSE,
                        ownerAccountID: EMPLOYEE_ACCOUNT_ID,
                        stateNum: CONST_1.default.REPORT.STATE_NUM.SUBMITTED,
                        statusNum: CONST_1.default.REPORT.STATUS_NUM.SUBMITTED,
                        managerID: EMPLOYEE_ACCOUNT_ID,
                    };
                    policy = {
                        approver: EMPLOYEE_EMAIL,
                    };
                    TRANSACTION_ID = 'TRANSACTION_ID';
                    transaction = {
                        transactionID: TRANSACTION_ID,
                    };
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(TRANSACTION_ID), transaction)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(TRANSACTION_ID), [
                            {
                                name: CONST_1.default.VIOLATIONS.DUPLICATED_TRANSACTION,
                            },
                        ])];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(REPORT_ID), report)];
                case 3:
                    _a.sent();
                    result = (0, ReportSecondaryActionUtils_1.getSecondaryReportActions)({ report: report, chatReport: reports_1.chatReportR14932, reportTransactions: [transaction], violations: {}, policy: policy });
                    expect(result.includes(CONST_1.default.REPORT.SECONDARY_ACTIONS.APPROVE)).toBe(true);
                    return [2 /*return*/];
            }
        });
    }); });
    it('includes APPROVE option for report with RTER violations when it is submitted', function () {
        var _a;
        var report = {
            reportID: REPORT_ID,
            type: CONST_1.default.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            managerID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST_1.default.REPORT.STATE_NUM.SUBMITTED,
            statusNum: CONST_1.default.REPORT.STATUS_NUM.SUBMITTED,
        };
        var policy = {
            approver: EMPLOYEE_EMAIL,
        };
        var TRANSACTION_ID = 'TRANSACTION_ID';
        var transaction = {
            transactionID: TRANSACTION_ID,
        };
        var violation = {
            name: CONST_1.default.VIOLATIONS.RTER,
            data: {
                pendingPattern: true,
                rterType: CONST_1.default.RTER_VIOLATION_TYPES.SEVEN_DAY_HOLD,
            },
        };
        var result = (0, ReportSecondaryActionUtils_1.getSecondaryReportActions)({
            report: report,
            chatReport: reports_1.chatReportR14932,
            reportTransactions: [transaction],
            violations: (_a = {}, _a["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(TRANSACTION_ID)] = [violation], _a),
            policy: policy,
        });
        expect(result.includes(CONST_1.default.REPORT.SECONDARY_ACTIONS.APPROVE)).toBe(true);
    });
    it('does not include APPROVE option for report with RTER violations when it is not submitted', function () {
        var _a;
        var report = {
            reportID: REPORT_ID,
            type: CONST_1.default.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            managerID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST_1.default.REPORT.STATE_NUM.OPEN,
            statusNum: CONST_1.default.REPORT.STATUS_NUM.OPEN,
        };
        var policy = {
            approver: EMPLOYEE_EMAIL,
        };
        var TRANSACTION_ID = 'TRANSACTION_ID';
        var transaction = {
            transactionID: TRANSACTION_ID,
        };
        var violation = {
            name: CONST_1.default.VIOLATIONS.RTER,
            data: {
                pendingPattern: true,
                rterType: CONST_1.default.RTER_VIOLATION_TYPES.SEVEN_DAY_HOLD,
            },
        };
        var result = (0, ReportSecondaryActionUtils_1.getSecondaryReportActions)({
            report: report,
            chatReport: reports_1.chatReportR14932,
            reportTransactions: [transaction],
            violations: (_a = {}, _a["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(TRANSACTION_ID)] = [violation], _a),
            policy: policy,
        });
        expect(result.includes(CONST_1.default.REPORT.SECONDARY_ACTIONS.APPROVE)).toBe(false);
    });
    it('includes APPROVE option for admin with report having broken connection when it is submitted', function () {
        var _a;
        var report = {
            reportID: REPORT_ID,
            type: CONST_1.default.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST_1.default.REPORT.STATE_NUM.SUBMITTED,
            statusNum: CONST_1.default.REPORT.STATUS_NUM.SUBMITTED,
            managerID: EMPLOYEE_ACCOUNT_ID,
        };
        var policy = { role: CONST_1.default.POLICY.ROLE.ADMIN, autoReporting: true, autoReportingFrequency: CONST_1.default.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT };
        var TRANSACTION_ID = 'TRANSACTION_ID';
        var transaction = {
            transactionID: TRANSACTION_ID,
        };
        var violation = {
            name: CONST_1.default.VIOLATIONS.RTER,
            data: {
                rterType: CONST_1.default.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION,
            },
        };
        var result = (0, ReportSecondaryActionUtils_1.getSecondaryReportActions)({
            report: report,
            chatReport: reports_1.chatReportR14932,
            reportTransactions: [transaction],
            violations: (_a = {}, _a["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(TRANSACTION_ID)] = [violation], _a),
            policy: policy,
        });
        expect(result.includes(CONST_1.default.REPORT.SECONDARY_ACTIONS.APPROVE)).toBe(true);
    });
    it('does not include APPROVE option for admin with report having broken connection that is not submitted', function () {
        var _a;
        var report = {
            reportID: REPORT_ID,
            type: CONST_1.default.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST_1.default.REPORT.STATE_NUM.OPEN,
            statusNum: CONST_1.default.REPORT.STATUS_NUM.OPEN,
            managerID: EMPLOYEE_ACCOUNT_ID,
        };
        var policy = { role: CONST_1.default.POLICY.ROLE.ADMIN };
        var TRANSACTION_ID = 'TRANSACTION_ID';
        var transaction = {
            transactionID: TRANSACTION_ID,
        };
        var violation = {
            name: CONST_1.default.VIOLATIONS.RTER,
            data: {
                rterType: CONST_1.default.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION,
            },
        };
        var result = (0, ReportSecondaryActionUtils_1.getSecondaryReportActions)({
            report: report,
            chatReport: reports_1.chatReportR14932,
            reportTransactions: [transaction],
            violations: (_a = {}, _a["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(TRANSACTION_ID)] = [violation], _a),
            policy: policy,
        });
        expect(result.includes(CONST_1.default.REPORT.SECONDARY_ACTIONS.APPROVE)).toBe(false);
    });
    it('does not include APPROVE option for report with transactions that are being scanned', function () {
        var report = {
            reportID: REPORT_ID,
            type: CONST_1.default.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST_1.default.REPORT.STATE_NUM.SUBMITTED,
            statusNum: CONST_1.default.REPORT.STATUS_NUM.SUBMITTED,
            managerID: EMPLOYEE_ACCOUNT_ID,
        };
        var policy = {
            approver: EMPLOYEE_EMAIL,
        };
        var TRANSACTION_ID = 'TRANSACTION_ID';
        var transaction = {
            transactionID: TRANSACTION_ID,
            receipt: {
                state: CONST_1.default.IOU.RECEIPT_STATE.SCANNING,
            },
        };
        var result = (0, ReportSecondaryActionUtils_1.getSecondaryReportActions)({ report: report, chatReport: reports_1.chatReportR14932, reportTransactions: [transaction], violations: {}, policy: policy });
        expect(result.includes(CONST_1.default.REPORT.SECONDARY_ACTIONS.APPROVE)).toBe(false);
    });
    it('includes UNAPPROVE option', function () {
        var report = {
            reportID: REPORT_ID,
            type: CONST_1.default.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST_1.default.REPORT.STATE_NUM.APPROVED,
            statusNum: CONST_1.default.REPORT.STATUS_NUM.APPROVED,
        };
        var policy = { approver: EMPLOYEE_EMAIL };
        var result = (0, ReportSecondaryActionUtils_1.getSecondaryReportActions)({ report: report, chatReport: reports_1.chatReportR14932, reportTransactions: [], violations: {}, policy: policy });
        expect(result.includes(CONST_1.default.REPORT.SECONDARY_ACTIONS.UNAPPROVE)).toBe(true);
    });
    it('includes CANCEL_PAYMENT option for report paid elsewhere', function () {
        var report = {
            reportID: REPORT_ID,
            type: CONST_1.default.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST_1.default.REPORT.STATE_NUM.APPROVED,
            statusNum: CONST_1.default.REPORT.STATUS_NUM.REIMBURSED,
        };
        var policy = {
            role: CONST_1.default.POLICY.ROLE.ADMIN,
        };
        var result = (0, ReportSecondaryActionUtils_1.getSecondaryReportActions)({ report: report, chatReport: reports_1.chatReportR14932, reportTransactions: [], violations: {}, policy: policy });
        expect(result.includes(CONST_1.default.REPORT.SECONDARY_ACTIONS.CANCEL_PAYMENT)).toBe(true);
    });
    it('includes CANCEL_PAYMENT option for report before nacha cutoff', function () { return __awaiter(void 0, void 0, void 0, function () {
        var report, policy, TRANSACTION_ID, ACTION_ID, reportAction, result;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    report = {
                        reportID: REPORT_ID,
                        type: CONST_1.default.REPORT.TYPE.EXPENSE,
                        ownerAccountID: EMPLOYEE_ACCOUNT_ID,
                        statusNum: CONST_1.default.REPORT.STATUS_NUM.APPROVED,
                        isWaitingOnBankAccount: true,
                    };
                    policy = { role: CONST_1.default.POLICY.ROLE.ADMIN };
                    TRANSACTION_ID = 'transaction_id';
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(REPORT_ID), report)];
                case 1:
                    _b.sent();
                    ACTION_ID = 'action_id';
                    reportAction = {
                        actionID: ACTION_ID,
                        actionName: CONST_1.default.REPORT.ACTIONS.TYPE.IOU,
                        message: {
                            IOUTransactionID: TRANSACTION_ID,
                            type: CONST_1.default.IOU.REPORT_ACTION_TYPE.PAY,
                        },
                        created: '2025-03-06 18:00:00.000',
                    };
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(REPORT_ID), (_a = {}, _a[ACTION_ID] = reportAction, _a))];
                case 2:
                    _b.sent();
                    result = (0, ReportSecondaryActionUtils_1.getSecondaryReportActions)({
                        report: report,
                        chatReport: reports_1.chatReportR14932,
                        reportTransactions: [
                            {
                                transactionID: TRANSACTION_ID,
                            },
                        ],
                        violations: {},
                        policy: policy,
                    });
                    expect(result.includes(CONST_1.default.REPORT.SECONDARY_ACTIONS.CANCEL_PAYMENT)).toBe(true);
                    return [2 /*return*/];
            }
        });
    }); });
    it('does not include EXPORT option for invoice reports', function () { return __awaiter(void 0, void 0, void 0, function () {
        var report, policy, result;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    report = {
                        reportID: REPORT_ID,
                        type: CONST_1.default.REPORT.TYPE.INVOICE,
                        ownerAccountID: EMPLOYEE_ACCOUNT_ID,
                    };
                    policy = {
                        connections: (_a = {},
                            _a[CONST_1.default.POLICY.CONNECTIONS.NAME.QBO] = {},
                            _a),
                    };
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(REPORT_ID), report)];
                case 1:
                    _b.sent();
                    result = (0, ReportSecondaryActionUtils_1.getSecondaryReportActions)({ report: report, chatReport: reports_1.chatReportR14932, reportTransactions: [], violations: {}, policy: policy });
                    expect(result.includes(CONST_1.default.REPORT.SECONDARY_ACTIONS.EXPORT_TO_ACCOUNTING)).toBe(false);
                    return [2 /*return*/];
            }
        });
    }); });
    it('includes EXPORT option for expense report with payments enabled', function () {
        var _a;
        var report = {
            reportID: REPORT_ID,
            type: CONST_1.default.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST_1.default.REPORT.STATE_NUM.APPROVED,
            statusNum: CONST_1.default.REPORT.STATUS_NUM.APPROVED,
        };
        var policy = {
            role: CONST_1.default.POLICY.ROLE.ADMIN,
            reimbursementChoice: CONST_1.default.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES,
            connections: (_a = {}, _a[CONST_1.default.POLICY.CONNECTIONS.NAME.QBD] = {}, _a),
        };
        var result = (0, ReportSecondaryActionUtils_1.getSecondaryReportActions)({ report: report, chatReport: reports_1.chatReportR14932, reportTransactions: [], violations: {}, policy: policy });
        expect(result.includes(CONST_1.default.REPORT.SECONDARY_ACTIONS.EXPORT_TO_ACCOUNTING)).toBe(true);
    });
    it('includes EXPORT option for expense report with payments disabled', function () {
        var _a;
        var report = {
            reportID: REPORT_ID,
            type: CONST_1.default.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST_1.default.REPORT.STATE_NUM.APPROVED,
            statusNum: CONST_1.default.REPORT.STATUS_NUM.APPROVED,
        };
        var policy = {
            role: CONST_1.default.POLICY.ROLE.ADMIN,
            connections: (_a = {}, _a[CONST_1.default.POLICY.CONNECTIONS.NAME.QBD] = { config: { autosync: { enabled: true } } }, _a),
        };
        var result = (0, ReportSecondaryActionUtils_1.getSecondaryReportActions)({ report: report, chatReport: reports_1.chatReportR14932, reportTransactions: [], violations: {}, policy: policy });
        expect(result.includes(CONST_1.default.REPORT.SECONDARY_ACTIONS.EXPORT_TO_ACCOUNTING)).toBe(true);
    });
    it('includes MARK_AS_EXPORTED option for invoice report sender', function () { return __awaiter(void 0, void 0, void 0, function () {
        var report, policy, result;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    report = {
                        reportID: REPORT_ID,
                        type: CONST_1.default.REPORT.TYPE.INVOICE,
                        ownerAccountID: EMPLOYEE_ACCOUNT_ID,
                    };
                    policy = {
                        connections: (_a = {}, _a[CONST_1.default.POLICY.CONNECTIONS.NAME.QBD] = {}, _a),
                    };
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(REPORT_ID), report)];
                case 1:
                    _b.sent();
                    result = (0, ReportSecondaryActionUtils_1.getSecondaryReportActions)({ report: report, chatReport: reports_1.chatReportR14932, reportTransactions: [], violations: {}, policy: policy });
                    expect(result.includes(CONST_1.default.REPORT.SECONDARY_ACTIONS.MARK_AS_EXPORTED)).toBe(true);
                    return [2 /*return*/];
            }
        });
    }); });
    it('includes MARK_AS_EXPORTED option for expense report with payments enabled', function () {
        var _a;
        var report = {
            reportID: REPORT_ID,
            type: CONST_1.default.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST_1.default.REPORT.STATE_NUM.APPROVED,
            statusNum: CONST_1.default.REPORT.STATUS_NUM.APPROVED,
        };
        var policy = {
            role: CONST_1.default.POLICY.ROLE.ADMIN,
            reimbursementChoice: CONST_1.default.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES,
            connections: (_a = {}, _a[CONST_1.default.POLICY.CONNECTIONS.NAME.QBD] = {}, _a),
        };
        var result = (0, ReportSecondaryActionUtils_1.getSecondaryReportActions)({ report: report, chatReport: reports_1.chatReportR14932, reportTransactions: [], violations: {}, policy: policy });
        expect(result.includes(CONST_1.default.REPORT.SECONDARY_ACTIONS.MARK_AS_EXPORTED)).toBe(true);
    });
    it('includes MARK_AS_EXPORTED option for expense report with payments disabled', function () {
        var _a;
        var report = {
            reportID: REPORT_ID,
            type: CONST_1.default.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST_1.default.REPORT.STATE_NUM.APPROVED,
            statusNum: CONST_1.default.REPORT.STATUS_NUM.APPROVED,
        };
        var policy = {
            role: CONST_1.default.POLICY.ROLE.ADMIN,
            connections: (_a = {}, _a[CONST_1.default.POLICY.CONNECTIONS.NAME.QBD] = { config: { autosync: { enabled: true } } }, _a),
        };
        var result = (0, ReportSecondaryActionUtils_1.getSecondaryReportActions)({ report: report, chatReport: reports_1.chatReportR14932, reportTransactions: [], violations: {}, policy: policy });
        expect(result.includes(CONST_1.default.REPORT.SECONDARY_ACTIONS.MARK_AS_EXPORTED)).toBe(true);
    });
    it('includes MARK_AS_EXPORTED option for expense report preferred exporter', function () {
        var _a;
        var report = {
            reportID: REPORT_ID,
            type: CONST_1.default.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST_1.default.REPORT.STATE_NUM.APPROVED,
            statusNum: CONST_1.default.REPORT.STATUS_NUM.APPROVED,
        };
        var policy = {
            connections: (_a = {}, _a[CONST_1.default.POLICY.CONNECTIONS.NAME.QBD] = { config: { export: { exporter: EMPLOYEE_EMAIL }, autoSync: { enabled: false } } }, _a),
        };
        var result = (0, ReportSecondaryActionUtils_1.getSecondaryReportActions)({ report: report, chatReport: reports_1.chatReportR14932, reportTransactions: [], violations: {}, policy: policy });
        expect(result.includes(CONST_1.default.REPORT.SECONDARY_ACTIONS.MARK_AS_EXPORTED)).toBe(true);
    });
    it('includes MARK_AS_EXPORTED option for expense report admin', function () {
        var _a;
        var report = {
            reportID: REPORT_ID,
            type: CONST_1.default.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST_1.default.REPORT.STATE_NUM.APPROVED,
            statusNum: CONST_1.default.REPORT.STATUS_NUM.APPROVED,
        };
        var policy = {
            connections: (_a = {}, _a[CONST_1.default.POLICY.CONNECTIONS.NAME.QBD] = { config: { export: { exporter: ADMIN_EMAIL }, autoSync: { enabled: true } } }, _a),
            role: CONST_1.default.POLICY.ROLE.ADMIN,
        };
        var result = (0, ReportSecondaryActionUtils_1.getSecondaryReportActions)({ report: report, chatReport: reports_1.chatReportR14932, reportTransactions: [], violations: {}, policy: policy });
        expect(result.includes(CONST_1.default.REPORT.SECONDARY_ACTIONS.MARK_AS_EXPORTED)).toBe(true);
    });
    it('includes HOLD option ', function () {
        var report = {
            reportID: REPORT_ID,
            type: CONST_1.default.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST_1.default.REPORT.STATE_NUM.SUBMITTED,
            statusNum: CONST_1.default.REPORT.STATUS_NUM.SUBMITTED,
        };
        var transaction = {
            comment: {},
        };
        var policy = {};
        jest.spyOn(ReportUtils, 'canHoldUnholdReportAction').mockReturnValueOnce({ canHoldRequest: true, canUnholdRequest: true });
        jest.spyOn(ReportActionsUtils, 'getOneTransactionThreadReportID').mockReturnValueOnce(actions_1.originalMessageR14932.IOUTransactionID);
        var result = (0, ReportSecondaryActionUtils_1.getSecondaryReportActions)({ report: report, chatReport: reports_1.chatReportR14932, reportTransactions: [transaction], violations: {}, policy: policy, reportActions: [actions_1.actionR14932] });
        expect(result.includes(CONST_1.default.REPORT.SECONDARY_ACTIONS.HOLD)).toBe(true);
    });
    it('includes CHANGE_WORKSPACE option for submitted IOU report and manager being the payer of the new policy', function () { return __awaiter(void 0, void 0, void 0, function () {
        var report, personalDetails, policy, policies, result;
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    report = {
                        reportID: REPORT_ID,
                        type: CONST_1.default.REPORT.TYPE.IOU,
                        ownerAccountID: MANAGER_ACCOUNT_ID,
                        managerID: EMPLOYEE_ACCOUNT_ID,
                        stateNum: CONST_1.default.REPORT.STATE_NUM.SUBMITTED,
                        statusNum: CONST_1.default.REPORT.STATUS_NUM.SUBMITTED,
                    };
                    personalDetails = (_a = {},
                        _a[EMPLOYEE_ACCOUNT_ID] = { login: EMPLOYEE_EMAIL },
                        _a[MANAGER_ACCOUNT_ID] = { login: MANAGER_EMAIL },
                        _a);
                    policy = {
                        id: POLICY_ID,
                        type: CONST_1.default.POLICY.TYPE.TEAM,
                        reimbursementChoice: CONST_1.default.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_MANUAL,
                        isPolicyExpenseChatEnabled: true,
                        employeeList: (_b = {},
                            _b[EMPLOYEE_EMAIL] = { email: EMPLOYEE_EMAIL, role: CONST_1.default.POLICY.ROLE.ADMIN },
                            _b[MANAGER_EMAIL] = { email: MANAGER_EMAIL, role: CONST_1.default.POLICY.ROLE.USER },
                            _b),
                    };
                    policies = (_c = {}, _c["".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(POLICY_ID)] = policy, _c);
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(POLICY_ID), policy)];
                case 1:
                    _d.sent();
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(REPORT_ID), report)];
                case 2:
                    _d.sent();
                    return [4 /*yield*/, react_native_onyx_1.default.merge(ONYXKEYS_1.default.SESSION, { email: EMPLOYEE_EMAIL, accountID: EMPLOYEE_ACCOUNT_ID })];
                case 3:
                    _d.sent();
                    return [4 /*yield*/, react_native_onyx_1.default.merge(ONYXKEYS_1.default.PERSONAL_DETAILS_LIST, personalDetails)];
                case 4:
                    _d.sent();
                    result = (0, ReportSecondaryActionUtils_1.getSecondaryReportActions)({ report: report, chatReport: reports_1.chatReportR14932, reportTransactions: [], violations: {}, policy: policy, policies: policies });
                    expect(result.includes(CONST_1.default.REPORT.SECONDARY_ACTIONS.CHANGE_WORKSPACE)).toBe(true);
                    return [2 /*return*/];
            }
        });
    }); });
    it('includes CHANGE_WORKSPACE option for open expense report submitter', function () { return __awaiter(void 0, void 0, void 0, function () {
        var report, personalDetails, policy, policies, result;
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    report = {
                        reportID: REPORT_ID,
                        type: CONST_1.default.REPORT.TYPE.EXPENSE,
                        ownerAccountID: EMPLOYEE_ACCOUNT_ID,
                        statusNum: CONST_1.default.REPORT.STATUS_NUM.OPEN,
                        stateNum: CONST_1.default.REPORT.STATE_NUM.OPEN,
                    };
                    personalDetails = (_a = {},
                        _a[ADMIN_ACCOUNT_ID] = { login: ADMIN_EMAIL },
                        _a[MANAGER_ACCOUNT_ID] = { login: MANAGER_EMAIL },
                        _a);
                    policy = {
                        id: POLICY_ID,
                        type: CONST_1.default.POLICY.TYPE.TEAM,
                        role: CONST_1.default.POLICY.ROLE.ADMIN,
                        isPolicyExpenseChatEnabled: true,
                        employeeList: (_b = {},
                            _b[ADMIN_EMAIL] = { email: ADMIN_EMAIL, role: CONST_1.default.POLICY.ROLE.ADMIN },
                            _b[EMPLOYEE_EMAIL] = { email: EMPLOYEE_EMAIL, role: CONST_1.default.POLICY.ROLE.USER },
                            _b),
                    };
                    policies = (_c = {}, _c["".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(POLICY_ID)] = policy, _c);
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(POLICY_ID), policy)];
                case 1:
                    _d.sent();
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(REPORT_ID), report)];
                case 2:
                    _d.sent();
                    return [4 /*yield*/, react_native_onyx_1.default.merge(ONYXKEYS_1.default.SESSION, { email: EMPLOYEE_EMAIL, accountID: EMPLOYEE_ACCOUNT_ID })];
                case 3:
                    _d.sent();
                    return [4 /*yield*/, react_native_onyx_1.default.merge(ONYXKEYS_1.default.PERSONAL_DETAILS_LIST, personalDetails)];
                case 4:
                    _d.sent();
                    result = (0, ReportSecondaryActionUtils_1.getSecondaryReportActions)({ report: report, chatReport: reports_1.chatReportR14932, reportTransactions: [], violations: {}, policy: policy, policies: policies });
                    expect(result.includes(CONST_1.default.REPORT.SECONDARY_ACTIONS.CHANGE_WORKSPACE)).toBe(true);
                    return [2 /*return*/];
            }
        });
    }); });
    it('includes CHANGE_WORKSPACE option for submitter, submitted report without approvals', function () { return __awaiter(void 0, void 0, void 0, function () {
        var oldPolicy, newPolicy, report, personalDetails, policies, result;
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    oldPolicy = {
                        id: OLD_POLICY_ID,
                        type: CONST_1.default.POLICY.TYPE.TEAM,
                        approver: MANAGER_EMAIL,
                        employeeList: (_a = {},
                            _a[MANAGER_EMAIL] = { email: MANAGER_EMAIL, role: CONST_1.default.POLICY.ROLE.USER },
                            _a[EMPLOYEE_EMAIL] = { email: EMPLOYEE_EMAIL, role: CONST_1.default.POLICY.ROLE.USER },
                            _a),
                    };
                    newPolicy = {
                        id: POLICY_ID,
                        type: CONST_1.default.POLICY.TYPE.TEAM,
                        isPolicyExpenseChatEnabled: true,
                        employeeList: (_b = {},
                            _b[MANAGER_EMAIL] = { email: MANAGER_EMAIL, role: CONST_1.default.POLICY.ROLE.USER },
                            _b[EMPLOYEE_EMAIL] = { email: EMPLOYEE_EMAIL, role: CONST_1.default.POLICY.ROLE.USER },
                            _b),
                    };
                    report = {
                        reportID: REPORT_ID,
                        type: CONST_1.default.REPORT.TYPE.EXPENSE,
                        ownerAccountID: EMPLOYEE_ACCOUNT_ID,
                        managerID: MANAGER_ACCOUNT_ID,
                        statusNum: CONST_1.default.REPORT.STATUS_NUM.SUBMITTED,
                        stateNum: CONST_1.default.REPORT.STATE_NUM.SUBMITTED,
                        policyID: oldPolicy.id,
                    };
                    personalDetails = (_c = {},
                        _c[EMPLOYEE_ACCOUNT_ID] = { login: EMPLOYEE_EMAIL },
                        _c[MANAGER_ACCOUNT_ID] = { login: MANAGER_EMAIL, accountID: MANAGER_ACCOUNT_ID },
                        _c);
                    policies = (_d = {}, _d["".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(OLD_POLICY_ID)] = oldPolicy, _d["".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(POLICY_ID)] = newPolicy, _d);
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(OLD_POLICY_ID), oldPolicy)];
                case 1:
                    _e.sent();
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(POLICY_ID), newPolicy)];
                case 2:
                    _e.sent();
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(REPORT_ID), report)];
                case 3:
                    _e.sent();
                    return [4 /*yield*/, react_native_onyx_1.default.merge(ONYXKEYS_1.default.SESSION, { email: EMPLOYEE_EMAIL, accountID: EMPLOYEE_ACCOUNT_ID })];
                case 4:
                    _e.sent();
                    return [4 /*yield*/, react_native_onyx_1.default.merge(ONYXKEYS_1.default.PERSONAL_DETAILS_LIST, personalDetails)];
                case 5:
                    _e.sent();
                    result = (0, ReportSecondaryActionUtils_1.getSecondaryReportActions)({
                        report: report,
                        chatReport: reports_1.chatReportR14932,
                        reportTransactions: [],
                        violations: {},
                        policy: oldPolicy,
                        policies: policies,
                    });
                    expect(result.includes(CONST_1.default.REPORT.SECONDARY_ACTIONS.CHANGE_WORKSPACE)).toBe(true);
                    return [2 /*return*/];
            }
        });
    }); });
    it('includes CHANGE_WORKSPACE option for approver', function () { return __awaiter(void 0, void 0, void 0, function () {
        var oldPolicy, report, personalDetails, policy, policies, result;
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    oldPolicy = {
                        id: OLD_POLICY_ID,
                        type: CONST_1.default.POLICY.TYPE.TEAM,
                        approver: APPROVER_EMAIL,
                        employeeList: (_a = {},
                            _a[APPROVER_EMAIL] = { email: APPROVER_EMAIL, role: CONST_1.default.POLICY.ROLE.USER },
                            _a[EMPLOYEE_EMAIL] = { email: EMPLOYEE_EMAIL, role: CONST_1.default.POLICY.ROLE.USER },
                            _a),
                    };
                    report = {
                        reportID: REPORT_ID,
                        type: CONST_1.default.REPORT.TYPE.EXPENSE,
                        ownerAccountID: EMPLOYEE_ACCOUNT_ID,
                        managerID: APPROVER_ACCOUNT_ID,
                        statusNum: CONST_1.default.REPORT.STATUS_NUM.SUBMITTED,
                        stateNum: CONST_1.default.REPORT.STATE_NUM.SUBMITTED,
                        policyID: oldPolicy.id,
                    };
                    personalDetails = (_b = {},
                        _b[EMPLOYEE_ACCOUNT_ID] = { login: EMPLOYEE_EMAIL },
                        _b[APPROVER_ACCOUNT_ID] = { login: APPROVER_EMAIL, accountID: APPROVER_ACCOUNT_ID },
                        _b);
                    policy = {
                        id: POLICY_ID,
                        type: CONST_1.default.POLICY.TYPE.TEAM,
                        approver: APPROVER_EMAIL,
                        isPolicyExpenseChatEnabled: true,
                        employeeList: (_c = {},
                            _c[APPROVER_EMAIL] = { email: APPROVER_EMAIL, role: CONST_1.default.POLICY.ROLE.USER },
                            _c[EMPLOYEE_EMAIL] = { email: EMPLOYEE_EMAIL, role: CONST_1.default.POLICY.ROLE.USER },
                            _c),
                    };
                    policies = (_d = {}, _d["".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(POLICY_ID)] = policy, _d["".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(OLD_POLICY_ID)] = oldPolicy, _d);
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(POLICY_ID), policy)];
                case 1:
                    _e.sent();
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(OLD_POLICY_ID), oldPolicy)];
                case 2:
                    _e.sent();
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(REPORT_ID), report)];
                case 3:
                    _e.sent();
                    return [4 /*yield*/, react_native_onyx_1.default.merge(ONYXKEYS_1.default.SESSION, { email: APPROVER_EMAIL, accountID: APPROVER_ACCOUNT_ID })];
                case 4:
                    _e.sent();
                    return [4 /*yield*/, react_native_onyx_1.default.merge(ONYXKEYS_1.default.PERSONAL_DETAILS_LIST, personalDetails)];
                case 5:
                    _e.sent();
                    result = (0, ReportSecondaryActionUtils_1.getSecondaryReportActions)({ report: report, chatReport: reports_1.chatReportR14932, reportTransactions: [], violations: {}, policy: policy, policies: policies });
                    expect(result.includes(CONST_1.default.REPORT.SECONDARY_ACTIONS.CHANGE_WORKSPACE)).toBe(true);
                    return [2 /*return*/];
            }
        });
    }); });
    it('includes CHANGE_WORKSPACE option for admin', function () { return __awaiter(void 0, void 0, void 0, function () {
        var oldPolicy, report, policy, policies, personalDetails, result;
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    oldPolicy = {
                        id: OLD_POLICY_ID,
                        type: CONST_1.default.POLICY.TYPE.TEAM,
                        role: CONST_1.default.POLICY.ROLE.ADMIN,
                        employeeList: (_a = {},
                            _a[ADMIN_EMAIL] = { email: ADMIN_EMAIL, role: CONST_1.default.POLICY.ROLE.ADMIN },
                            _a[EMPLOYEE_EMAIL] = { email: EMPLOYEE_EMAIL, role: CONST_1.default.POLICY.ROLE.USER },
                            _a),
                    };
                    report = {
                        reportID: REPORT_ID,
                        type: CONST_1.default.REPORT.TYPE.EXPENSE,
                        ownerAccountID: EMPLOYEE_ACCOUNT_ID,
                        managerID: MANAGER_ACCOUNT_ID,
                        statusNum: CONST_1.default.REPORT.STATUS_NUM.REIMBURSED,
                        stateNum: CONST_1.default.REPORT.STATE_NUM.APPROVED,
                        policyID: oldPolicy.id,
                    };
                    policy = {
                        id: POLICY_ID,
                        type: CONST_1.default.POLICY.TYPE.TEAM,
                        role: CONST_1.default.POLICY.ROLE.ADMIN,
                        isPolicyExpenseChatEnabled: true,
                        employeeList: (_b = {},
                            _b[ADMIN_EMAIL] = { email: ADMIN_EMAIL, role: CONST_1.default.POLICY.ROLE.ADMIN },
                            _b[EMPLOYEE_EMAIL] = { login: EMPLOYEE_EMAIL, role: CONST_1.default.POLICY.ROLE.USER },
                            _b),
                    };
                    policies = (_c = {}, _c["".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(POLICY_ID)] = policy, _c["".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(OLD_POLICY_ID)] = oldPolicy, _c);
                    personalDetails = (_d = {},
                        _d[EMPLOYEE_ACCOUNT_ID] = { login: EMPLOYEE_EMAIL },
                        _d[ADMIN_ACCOUNT_ID] = { login: ADMIN_EMAIL },
                        _d[MANAGER_ACCOUNT_ID] = { login: MANAGER_EMAIL },
                        _d);
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(OLD_POLICY_ID), oldPolicy)];
                case 1:
                    _e.sent();
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(POLICY_ID), policy)];
                case 2:
                    _e.sent();
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(REPORT_ID), report)];
                case 3:
                    _e.sent();
                    return [4 /*yield*/, react_native_onyx_1.default.merge(ONYXKEYS_1.default.SESSION, { email: ADMIN_EMAIL, accountID: ADMIN_ACCOUNT_ID })];
                case 4:
                    _e.sent();
                    return [4 /*yield*/, react_native_onyx_1.default.merge(ONYXKEYS_1.default.PERSONAL_DETAILS_LIST, personalDetails)];
                case 5:
                    _e.sent();
                    result = (0, ReportSecondaryActionUtils_1.getSecondaryReportActions)({ report: report, chatReport: reports_1.chatReportR14932, reportTransactions: [], violations: {}, policy: policy, policies: policies });
                    expect(result.includes(CONST_1.default.REPORT.SECONDARY_ACTIONS.CHANGE_WORKSPACE)).toBe(true);
                    return [2 /*return*/];
            }
        });
    }); });
    it('includes DELETE option for expense report submitter', function () { return __awaiter(void 0, void 0, void 0, function () {
        var report, policy, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    report = {
                        reportID: REPORT_ID,
                        type: CONST_1.default.REPORT.TYPE.EXPENSE,
                        ownerAccountID: EMPLOYEE_ACCOUNT_ID,
                        statusNum: CONST_1.default.REPORT.STATUS_NUM.OPEN,
                        stateNum: CONST_1.default.REPORT.STATE_NUM.OPEN,
                    };
                    policy = {};
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(REPORT_ID), report)];
                case 1:
                    _a.sent();
                    result = (0, ReportSecondaryActionUtils_1.getSecondaryReportActions)({ report: report, chatReport: reports_1.chatReportR14932, reportTransactions: [{}], violations: {}, policy: policy });
                    expect(result.includes(CONST_1.default.REPORT.SECONDARY_ACTIONS.DELETE)).toBe(true);
                    return [2 /*return*/];
            }
        });
    }); });
    it('includes DELETE option for owner of unreported transaction', function () {
        var report = {
            reportID: REPORT_ID,
            type: CONST_1.default.REPORT.TYPE.CHAT,
            chatType: CONST_1.default.REPORT.CHAT_TYPE.SELF_DM,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
        };
        var TRANSACTION_ID = 'TRANSACTION_ID';
        var transaction = {
            transactionID: TRANSACTION_ID,
            reportID: CONST_1.default.REPORT.UNREPORTED_REPORT_ID,
        };
        var reportActions = [
            {
                reportActionID: '1',
                actorAccountID: EMPLOYEE_ACCOUNT_ID,
                actionName: CONST_1.default.REPORT.ACTIONS.TYPE.IOU,
                originalMessage: {
                    IOUTransactionID: TRANSACTION_ID,
                    IOUReportID: CONST_1.default.REPORT.UNREPORTED_REPORT_ID,
                },
            },
        ];
        var policy = {};
        var result = (0, ReportSecondaryActionUtils_1.getSecondaryReportActions)({ report: report, chatReport: reports_1.chatReportR14932, reportTransactions: [transaction], violations: {}, policy: policy, reportActions: reportActions });
        expect(result.includes(CONST_1.default.REPORT.SECONDARY_ACTIONS.DELETE)).toBe(true);
    });
    it('includes DELETE option for owner of single processing IOU transaction', function () {
        var report = {
            reportID: REPORT_ID,
            type: CONST_1.default.REPORT.TYPE.IOU,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            statusNum: CONST_1.default.REPORT.STATUS_NUM.SUBMITTED,
            stateNum: CONST_1.default.REPORT.STATE_NUM.SUBMITTED,
        };
        var TRANSACTION_ID = 'TRANSACTION_ID';
        var transaction = {
            transactionID: TRANSACTION_ID,
            reportID: REPORT_ID,
        };
        var reportActions = [
            {
                reportActionID: '1',
                actorAccountID: EMPLOYEE_ACCOUNT_ID,
                actionName: CONST_1.default.REPORT.ACTIONS.TYPE.IOU,
                originalMessage: {
                    IOUTransactionID: TRANSACTION_ID,
                    IOUReportID: REPORT_ID,
                },
            },
        ];
        var policy = {};
        var result = (0, ReportSecondaryActionUtils_1.getSecondaryReportActions)({ report: report, chatReport: reports_1.chatReportR14932, reportTransactions: [transaction], violations: {}, policy: policy, reportActions: reportActions });
        expect(result.includes(CONST_1.default.REPORT.SECONDARY_ACTIONS.DELETE)).toBe(true);
    });
    it('does not include DELETE option for IOU report', function () {
        var report = {
            reportID: REPORT_ID,
            type: CONST_1.default.REPORT.TYPE.IOU,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            statusNum: CONST_1.default.REPORT.STATUS_NUM.SUBMITTED,
            stateNum: CONST_1.default.REPORT.STATE_NUM.SUBMITTED,
        };
        var TRANSACTION_ID = 'TRANSACTION_ID';
        var TRANSACTION_ID_2 = 'TRANSACTION_ID_2';
        var transaction1 = {
            transactionID: TRANSACTION_ID,
            reportID: REPORT_ID,
        };
        var transaction2 = {
            transactionID: TRANSACTION_ID_2,
            reportID: REPORT_ID,
        };
        var reportActions = [
            {
                reportActionID: '1',
                actorAccountID: EMPLOYEE_ACCOUNT_ID,
                actionName: CONST_1.default.REPORT.ACTIONS.TYPE.IOU,
                originalMessage: {
                    IOUTransactionID: TRANSACTION_ID,
                    IOUReportID: REPORT_ID,
                },
            },
            {
                reportActionID: '2',
                actorAccountID: EMPLOYEE_ACCOUNT_ID,
                actionName: CONST_1.default.REPORT.ACTIONS.TYPE.IOU,
                originalMessage: {
                    IOUTransactionID: TRANSACTION_ID_2,
                    IOUReportID: REPORT_ID,
                },
            },
        ];
        var policy = {};
        var result = (0, ReportSecondaryActionUtils_1.getSecondaryReportActions)({ report: report, chatReport: reports_1.chatReportR14932, reportTransactions: [transaction1, transaction2], violations: {}, policy: policy, reportActions: reportActions });
        expect(result.includes(CONST_1.default.REPORT.SECONDARY_ACTIONS.DELETE)).toBe(false);
    });
    it('includes DELETE option for owner of single processing expense transaction', function () { return __awaiter(void 0, void 0, void 0, function () {
        var report, TRANSACTION_ID, transaction, policy, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    report = {
                        reportID: REPORT_ID,
                        type: CONST_1.default.REPORT.TYPE.EXPENSE,
                        ownerAccountID: EMPLOYEE_ACCOUNT_ID,
                        statusNum: CONST_1.default.REPORT.STATUS_NUM.SUBMITTED,
                        stateNum: CONST_1.default.REPORT.STATE_NUM.SUBMITTED,
                    };
                    TRANSACTION_ID = 'TRANSACTION_ID';
                    transaction = {
                        transactionID: TRANSACTION_ID,
                        reportID: REPORT_ID,
                    };
                    policy = {};
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(REPORT_ID), report)];
                case 1:
                    _a.sent();
                    result = (0, ReportSecondaryActionUtils_1.getSecondaryReportActions)({ report: report, chatReport: reports_1.chatReportR14932, reportTransactions: [transaction], violations: {}, policy: policy });
                    expect(result.includes(CONST_1.default.REPORT.SECONDARY_ACTIONS.DELETE)).toBe(true);
                    return [2 /*return*/];
            }
        });
    }); });
    it('includes DELETE option for owner of processing expense report', function () { return __awaiter(void 0, void 0, void 0, function () {
        var report, TRANSACTION_ID, TRANSACTION_ID_2, transaction1, transaction2, policy, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    report = {
                        reportID: REPORT_ID,
                        type: CONST_1.default.REPORT.TYPE.EXPENSE,
                        ownerAccountID: EMPLOYEE_ACCOUNT_ID,
                        statusNum: CONST_1.default.REPORT.STATUS_NUM.SUBMITTED,
                        stateNum: CONST_1.default.REPORT.STATE_NUM.SUBMITTED,
                    };
                    TRANSACTION_ID = 'TRANSACTION_ID';
                    TRANSACTION_ID_2 = 'TRANSACTION_ID_2';
                    transaction1 = {
                        transactionID: TRANSACTION_ID,
                        reportID: REPORT_ID,
                    };
                    transaction2 = {
                        transactionID: TRANSACTION_ID_2,
                        reportID: REPORT_ID,
                    };
                    policy = {};
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(REPORT_ID), report)];
                case 1:
                    _a.sent();
                    result = (0, ReportSecondaryActionUtils_1.getSecondaryReportActions)({ report: report, chatReport: reports_1.chatReportR14932, reportTransactions: [transaction1, transaction2], violations: {}, policy: policy });
                    expect(result.includes(CONST_1.default.REPORT.SECONDARY_ACTIONS.DELETE)).toBe(true);
                    return [2 /*return*/];
            }
        });
    }); });
    it('does not include DELETE option for corporate liability card transaction', function () { return __awaiter(void 0, void 0, void 0, function () {
        var report, TRANSACTION_ID, transaction, policy, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    report = {
                        reportID: REPORT_ID,
                        type: CONST_1.default.REPORT.TYPE.EXPENSE,
                        ownerAccountID: EMPLOYEE_ACCOUNT_ID,
                        statusNum: CONST_1.default.REPORT.STATUS_NUM.SUBMITTED,
                        stateNum: CONST_1.default.REPORT.STATE_NUM.SUBMITTED,
                    };
                    TRANSACTION_ID = 'TRANSACTION_ID';
                    transaction = {
                        transactionID: TRANSACTION_ID,
                        reportID: REPORT_ID,
                        managedCard: true,
                        comment: {
                            liabilityType: CONST_1.default.TRANSACTION.LIABILITY_TYPE.RESTRICT,
                        },
                    };
                    policy = {};
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(REPORT_ID), report)];
                case 1:
                    _a.sent();
                    result = (0, ReportSecondaryActionUtils_1.getSecondaryReportActions)({ report: report, chatReport: reports_1.chatReportR14932, reportTransactions: [transaction], violations: {}, policy: policy });
                    expect(result.includes(CONST_1.default.REPORT.SECONDARY_ACTIONS.DELETE)).toBe(false);
                    return [2 /*return*/];
            }
        });
    }); });
    it('does not include DELETE option for report that has been forwarded', function () { return __awaiter(void 0, void 0, void 0, function () {
        var report, TRANSACTION_ID, transaction, policy, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    report = {
                        reportID: REPORT_ID,
                        type: CONST_1.default.REPORT.TYPE.EXPENSE,
                        ownerAccountID: EMPLOYEE_ACCOUNT_ID,
                        managerID: MANAGER_ACCOUNT_ID,
                        policyID: POLICY_ID,
                        statusNum: CONST_1.default.REPORT.STATUS_NUM.SUBMITTED,
                        stateNum: CONST_1.default.REPORT.STATE_NUM.SUBMITTED,
                    };
                    TRANSACTION_ID = 'TRANSACTION_ID';
                    transaction = {
                        transactionID: TRANSACTION_ID,
                        reportID: REPORT_ID,
                    };
                    policy = {
                        id: POLICY_ID,
                        approvalMode: CONST_1.default.POLICY.APPROVAL_MODE.BASIC,
                        approver: APPROVER_EMAIL,
                    };
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(REPORT_ID), report)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(POLICY_ID), policy)];
                case 2:
                    _a.sent();
                    result = (0, ReportSecondaryActionUtils_1.getSecondaryReportActions)({ report: report, chatReport: reports_1.chatReportR14932, reportTransactions: [transaction], violations: {}, policy: policy });
                    expect(result.includes(CONST_1.default.REPORT.SECONDARY_ACTIONS.DELETE)).toBe(false);
                    return [2 /*return*/];
            }
        });
    }); });
});
describe('getSecondaryTransactionThreadActions', function () {
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
                    return [4 /*yield*/, react_native_onyx_1.default.set(ONYXKEYS_1.default.PERSONAL_DETAILS_LIST, (_a = {}, _a[EMPLOYEE_ACCOUNT_ID] = PERSONAL_DETAILS, _a))];
                case 2:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it('should always return VIEW_DETAILS', function () {
        var report = {};
        var policy = {};
        var result = [CONST_1.default.REPORT.TRANSACTION_SECONDARY_ACTIONS.VIEW_DETAILS];
        expect((0, ReportSecondaryActionUtils_1.getSecondaryTransactionThreadActions)(report, {}, [], policy)).toEqual(result);
    });
    it('includes HOLD option', function () {
        var report = {
            reportID: REPORT_ID,
            type: CONST_1.default.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST_1.default.REPORT.STATE_NUM.SUBMITTED,
            statusNum: CONST_1.default.REPORT.STATUS_NUM.SUBMITTED,
        };
        var transaction = {
            comment: {},
        };
        var policy = {};
        jest.spyOn(ReportUtils, 'canHoldUnholdReportAction').mockReturnValueOnce({ canHoldRequest: true, canUnholdRequest: true });
        var result = (0, ReportSecondaryActionUtils_1.getSecondaryTransactionThreadActions)(report, transaction, [actions_1.actionR14932], policy);
        expect(result.includes(CONST_1.default.REPORT.SECONDARY_ACTIONS.HOLD)).toBe(true);
    });
    it('includes DELETE option for expense report submitter', function () { return __awaiter(void 0, void 0, void 0, function () {
        var report, policy, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    report = {
                        reportID: REPORT_ID,
                        type: CONST_1.default.REPORT.TYPE.EXPENSE,
                        ownerAccountID: EMPLOYEE_ACCOUNT_ID,
                        statusNum: CONST_1.default.REPORT.STATUS_NUM.OPEN,
                        stateNum: CONST_1.default.REPORT.STATE_NUM.OPEN,
                    };
                    policy = {};
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(REPORT_ID), report)];
                case 1:
                    _a.sent();
                    result = (0, ReportSecondaryActionUtils_1.getSecondaryTransactionThreadActions)(report, {}, [], policy);
                    expect(result.includes(CONST_1.default.REPORT.SECONDARY_ACTIONS.DELETE)).toBe(true);
                    return [2 /*return*/];
            }
        });
    }); });
});
