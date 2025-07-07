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
var ReportPreviewActionUtils_1 = require("@libs/ReportPreviewActionUtils");
// eslint-disable-next-line no-restricted-syntax
var ReportUtils = require("@libs/ReportUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var InvoiceData = require("../data/Invoice");
var policies_1 = require("../utils/collections/policies");
var reports_1 = require("../utils/collections/reports");
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
var TRANSACTION_ID = 1;
var VIOLATIONS = {};
jest.mock('@libs/ReportUtils', function () { return (__assign(__assign({}, jest.requireActual('@libs/ReportUtils')), { hasViolations: jest.fn().mockReturnValue(false), getReportTransactions: jest.fn().mockReturnValue(['mockValue']) })); });
jest.mock('@libs/PolicyUtils', function () { return (__assign(__assign({}, jest.requireActual('@libs/PolicyUtils')), { isPreferredExporter: jest.fn().mockReturnValue(true), hasAccountingConnections: jest.fn().mockReturnValue(true) })); });
describe('getReportPreviewAction', function () {
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
    it('getReportPreviewAction should return ADD_EXPENSE action for report preview with no transactions', function () { return __awaiter(void 0, void 0, void 0, function () {
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
                        isWaitingOnBankAccount: false,
                    };
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(REPORT_ID), report)];
                case 1:
                    _a.sent();
                    expect((0, ReportPreviewActionUtils_1.getReportPreviewAction)(VIOLATIONS, report, undefined, [])).toBe(CONST_1.default.REPORT.REPORT_PREVIEW_ACTIONS.ADD_EXPENSE);
                    return [2 /*return*/];
            }
        });
    }); });
    it('canSubmit should return true for expense preview report with manual submit', function () { return __awaiter(void 0, void 0, void 0, function () {
        var report, policy, transaction, isReportArchived;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    report = __assign(__assign({}, (0, reports_1.createRandomReport)(REPORT_ID)), { type: CONST_1.default.REPORT.TYPE.EXPENSE, ownerAccountID: CURRENT_USER_ACCOUNT_ID, stateNum: CONST_1.default.REPORT.STATE_NUM.OPEN, statusNum: CONST_1.default.REPORT.STATUS_NUM.OPEN, isWaitingOnBankAccount: false });
                    policy = (0, policies_1.default)(0);
                    policy.autoReportingFrequency = CONST_1.default.POLICY.AUTO_REPORTING_FREQUENCIES.IMMEDIATE;
                    policy.type = CONST_1.default.POLICY.TYPE.CORPORATE;
                    if (policy.harvesting) {
                        policy.harvesting.enabled = false;
                    }
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(REPORT_ID), report)];
                case 1:
                    _a.sent();
                    transaction = {
                        reportID: "".concat(REPORT_ID),
                    };
                    isReportArchived = (0, react_native_1.renderHook)(function () { return (0, useReportIsArchived_1.default)(report === null || report === void 0 ? void 0 : report.parentReportID); }).result;
                    expect((0, ReportPreviewActionUtils_1.getReportPreviewAction)(VIOLATIONS, report, policy, [transaction], isReportArchived.current)).toBe(CONST_1.default.REPORT.REPORT_PREVIEW_ACTIONS.SUBMIT);
                    return [2 /*return*/];
            }
        });
    }); });
    it('canSubmit should return false for expense preview report with only pending transactions', function () { return __awaiter(void 0, void 0, void 0, function () {
        var report, policy, transaction, isReportArchived;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    report = __assign(__assign({}, (0, reports_1.createRandomReport)(REPORT_ID)), { type: CONST_1.default.REPORT.TYPE.EXPENSE, ownerAccountID: CURRENT_USER_ACCOUNT_ID, stateNum: CONST_1.default.REPORT.STATE_NUM.OPEN, statusNum: CONST_1.default.REPORT.STATUS_NUM.OPEN, isWaitingOnBankAccount: false });
                    policy = (0, policies_1.default)(0);
                    policy.autoReportingFrequency = CONST_1.default.POLICY.AUTO_REPORTING_FREQUENCIES.IMMEDIATE;
                    policy.type = CONST_1.default.POLICY.TYPE.CORPORATE;
                    if (policy.harvesting) {
                        policy.harvesting.enabled = false;
                    }
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(REPORT_ID), report)];
                case 1:
                    _a.sent();
                    transaction = {
                        reportID: "".concat(REPORT_ID),
                        status: CONST_1.default.TRANSACTION.STATUS.PENDING,
                        amount: 10,
                        merchant: 'Merchant',
                        date: '2025-01-01',
                    };
                    isReportArchived = (0, react_native_1.renderHook)(function () { return (0, useReportIsArchived_1.default)(report === null || report === void 0 ? void 0 : report.parentReportID); }).result;
                    expect((0, ReportPreviewActionUtils_1.getReportPreviewAction)(VIOLATIONS, report, policy, [transaction], isReportArchived.current)).toBe(CONST_1.default.REPORT.REPORT_PREVIEW_ACTIONS.VIEW);
                    return [2 /*return*/];
            }
        });
    }); });
    describe('canApprove', function () {
        it('should return true for report being processed', function () { return __awaiter(void 0, void 0, void 0, function () {
            var report, policy, transaction, isReportArchived;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        report = __assign(__assign({}, (0, reports_1.createRandomReport)(REPORT_ID)), { type: CONST_1.default.REPORT.TYPE.EXPENSE, ownerAccountID: CURRENT_USER_ACCOUNT_ID, stateNum: CONST_1.default.REPORT.STATE_NUM.SUBMITTED, statusNum: CONST_1.default.REPORT.STATUS_NUM.SUBMITTED, managerID: CURRENT_USER_ACCOUNT_ID, isWaitingOnBankAccount: false });
                        policy = (0, policies_1.default)(0);
                        policy.type = CONST_1.default.POLICY.TYPE.CORPORATE;
                        policy.approver = CURRENT_USER_EMAIL;
                        policy.approvalMode = CONST_1.default.POLICY.APPROVAL_MODE.BASIC;
                        policy.preventSelfApproval = false;
                        return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(REPORT_ID), report)];
                    case 1:
                        _a.sent();
                        transaction = {
                            reportID: "".concat(REPORT_ID),
                        };
                        isReportArchived = (0, react_native_1.renderHook)(function () { return (0, useReportIsArchived_1.default)(report === null || report === void 0 ? void 0 : report.parentReportID); }).result;
                        expect((0, ReportPreviewActionUtils_1.getReportPreviewAction)(VIOLATIONS, report, policy, [transaction], isReportArchived.current)).toBe(CONST_1.default.REPORT.REPORT_PREVIEW_ACTIONS.APPROVE);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should return false for report with scanning expenses', function () { return __awaiter(void 0, void 0, void 0, function () {
            var report, policy, transaction;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        report = __assign(__assign({}, (0, reports_1.createRandomReport)(REPORT_ID)), { type: CONST_1.default.REPORT.TYPE.EXPENSE, ownerAccountID: CURRENT_USER_ACCOUNT_ID, stateNum: CONST_1.default.REPORT.STATE_NUM.SUBMITTED, statusNum: CONST_1.default.REPORT.STATUS_NUM.SUBMITTED, managerID: CURRENT_USER_ACCOUNT_ID, isWaitingOnBankAccount: false });
                        policy = (0, policies_1.default)(0);
                        policy.type = CONST_1.default.POLICY.TYPE.CORPORATE;
                        policy.approver = CURRENT_USER_EMAIL;
                        policy.approvalMode = CONST_1.default.POLICY.APPROVAL_MODE.BASIC;
                        policy.preventSelfApproval = false;
                        return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(REPORT_ID), report)];
                    case 1:
                        _a.sent();
                        transaction = {
                            reportID: "".concat(REPORT_ID),
                            receipt: {
                                state: CONST_1.default.IOU.RECEIPT_STATE.SCANNING,
                            },
                        };
                        expect((0, ReportPreviewActionUtils_1.getReportPreviewAction)(VIOLATIONS, report, policy, [transaction], false)).toBe(CONST_1.default.REPORT.REPORT_PREVIEW_ACTIONS.VIEW);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    it("canApprove should return true for the current report manager regardless of whether they're in the current approval workflow", function () { return __awaiter(void 0, void 0, void 0, function () {
        var report, policy, transaction, isReportArchived;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    report = __assign(__assign({}, (0, reports_1.createRandomReport)(REPORT_ID)), { type: CONST_1.default.REPORT.TYPE.EXPENSE, ownerAccountID: CURRENT_USER_ACCOUNT_ID, stateNum: CONST_1.default.REPORT.STATE_NUM.SUBMITTED, statusNum: CONST_1.default.REPORT.STATUS_NUM.SUBMITTED, managerID: CURRENT_USER_ACCOUNT_ID, isWaitingOnBankAccount: false });
                    policy = (0, policies_1.default)(0);
                    policy.type = CONST_1.default.POLICY.TYPE.CORPORATE;
                    policy.approver = "another+".concat(CURRENT_USER_EMAIL);
                    policy.approvalMode = CONST_1.default.POLICY.APPROVAL_MODE.BASIC;
                    policy.preventSelfApproval = false;
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(REPORT_ID), report)];
                case 1:
                    _a.sent();
                    transaction = {
                        reportID: "".concat(REPORT_ID),
                    };
                    isReportArchived = (0, react_native_1.renderHook)(function () { return (0, useReportIsArchived_1.default)(report === null || report === void 0 ? void 0 : report.parentReportID); }).result;
                    expect((0, ReportPreviewActionUtils_1.getReportPreviewAction)(VIOLATIONS, report, policy, [transaction], isReportArchived.current)).toBe(CONST_1.default.REPORT.REPORT_PREVIEW_ACTIONS.APPROVE);
                    return [2 /*return*/];
            }
        });
    }); });
    it('canPay should return true for expense report with payments enabled', function () { return __awaiter(void 0, void 0, void 0, function () {
        var report, policy, transaction, isReportArchived;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    report = __assign(__assign({}, (0, reports_1.createRandomReport)(REPORT_ID)), { type: CONST_1.default.REPORT.TYPE.EXPENSE, ownerAccountID: CURRENT_USER_ACCOUNT_ID, statusNum: CONST_1.default.REPORT.STATUS_NUM.CLOSED, total: -100, isWaitingOnBankAccount: false });
                    policy = (0, policies_1.default)(0);
                    policy.role = CONST_1.default.POLICY.ROLE.ADMIN;
                    policy.type = CONST_1.default.POLICY.TYPE.CORPORATE;
                    policy.reimbursementChoice = CONST_1.default.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES;
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(REPORT_ID), report)];
                case 1:
                    _a.sent();
                    transaction = {
                        reportID: "".concat(REPORT_ID),
                    };
                    isReportArchived = (0, react_native_1.renderHook)(function () { return (0, useReportIsArchived_1.default)(report === null || report === void 0 ? void 0 : report.parentReportID); }).result;
                    expect((0, ReportPreviewActionUtils_1.getReportPreviewAction)(VIOLATIONS, report, policy, [transaction], isReportArchived.current)).toBe(CONST_1.default.REPORT.REPORT_PREVIEW_ACTIONS.PAY);
                    return [2 /*return*/];
            }
        });
    }); });
    it('canPay should return true for submitted invoice', function () { return __awaiter(void 0, void 0, void 0, function () {
        var report, policy, invoiceReceiverPolicy, transaction, isReportArchived;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    report = __assign(__assign({}, (0, reports_1.createRandomReport)(REPORT_ID)), { type: CONST_1.default.REPORT.TYPE.INVOICE, ownerAccountID: CURRENT_USER_ACCOUNT_ID, statusNum: CONST_1.default.REPORT.STATUS_NUM.SUBMITTED, stateNum: CONST_1.default.REPORT.STATE_NUM.SUBMITTED, isWaitingOnBankAccount: false });
                    policy = (0, policies_1.default)(0);
                    policy.role = CONST_1.default.POLICY.ROLE.ADMIN;
                    policy.type = CONST_1.default.POLICY.TYPE.CORPORATE;
                    policy.reimbursementChoice = CONST_1.default.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO;
                    invoiceReceiverPolicy = (0, policies_1.default)(0);
                    invoiceReceiverPolicy.role = CONST_1.default.POLICY.ROLE.ADMIN;
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(REPORT_ID), report)];
                case 1:
                    _a.sent();
                    transaction = {
                        reportID: "".concat(REPORT_ID),
                    };
                    isReportArchived = (0, react_native_1.renderHook)(function () { return (0, useReportIsArchived_1.default)(report === null || report === void 0 ? void 0 : report.parentReportID); }).result;
                    expect((0, ReportPreviewActionUtils_1.getReportPreviewAction)(VIOLATIONS, report, policy, [transaction], isReportArchived.current, undefined, invoiceReceiverPolicy)).toBe(CONST_1.default.REPORT.REPORT_PREVIEW_ACTIONS.PAY);
                    return [2 /*return*/];
            }
        });
    }); });
    it('canPay should return false for archived invoice', function () { return __awaiter(void 0, void 0, void 0, function () {
        var report, policy, invoiceReceiverPolicy, transaction, isReportArchived;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    report = __assign(__assign({}, (0, reports_1.createRandomReport)(REPORT_ID)), { type: CONST_1.default.REPORT.TYPE.INVOICE, ownerAccountID: CURRENT_USER_ACCOUNT_ID, statusNum: CONST_1.default.REPORT.STATUS_NUM.SUBMITTED, stateNum: CONST_1.default.REPORT.STATE_NUM.SUBMITTED, isWaitingOnBankAccount: false });
                    policy = (0, policies_1.default)(0);
                    policy.role = CONST_1.default.POLICY.ROLE.ADMIN;
                    policy.type = CONST_1.default.POLICY.TYPE.CORPORATE;
                    policy.reimbursementChoice = CONST_1.default.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO;
                    invoiceReceiverPolicy = (0, policies_1.default)(0);
                    invoiceReceiverPolicy.role = CONST_1.default.POLICY.ROLE.ADMIN;
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(REPORT_ID), report)];
                case 1:
                    _a.sent();
                    // This is what indicates that a report is archived (see ReportUtils.isArchivedReport())
                    return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_NAME_VALUE_PAIRS).concat(report.reportID), {
                            private_isArchived: new Date().toString(),
                        })];
                case 2:
                    // This is what indicates that a report is archived (see ReportUtils.isArchivedReport())
                    _a.sent();
                    transaction = {
                        reportID: "".concat(REPORT_ID),
                    };
                    isReportArchived = (0, react_native_1.renderHook)(function () { return (0, useReportIsArchived_1.default)(report === null || report === void 0 ? void 0 : report.parentReportID); }).result;
                    expect((0, ReportPreviewActionUtils_1.getReportPreviewAction)(VIOLATIONS, report, policy, [transaction], isReportArchived.current, undefined, invoiceReceiverPolicy)).toBe(CONST_1.default.REPORT.REPORT_PREVIEW_ACTIONS.PAY);
                    return [2 /*return*/];
            }
        });
    }); });
    it('getReportPreviewAction should return VIEW action for invoice when the chat report is archived', function () { return __awaiter(void 0, void 0, void 0, function () {
        var policy, chatReport, report, transaction, isChatReportArchived;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    policy = InvoiceData.policy, chatReport = InvoiceData.convertedInvoiceChat;
                    report = __assign(__assign({}, (0, reports_1.createRandomReport)(REPORT_ID)), { type: CONST_1.default.REPORT.TYPE.INVOICE, ownerAccountID: CURRENT_USER_ACCOUNT_ID, statusNum: CONST_1.default.REPORT.STATUS_NUM.SUBMITTED, stateNum: CONST_1.default.REPORT.STATE_NUM.SUBMITTED, chatReportID: chatReport.chatReportID });
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
                    // Then the getReportPreviewAction should return the View action
                    expect((0, ReportPreviewActionUtils_1.getReportPreviewAction)(VIOLATIONS, report, policy, [transaction], isChatReportArchived.current, undefined)).toBe(CONST_1.default.REPORT.REPORT_PREVIEW_ACTIONS.VIEW);
                    return [2 /*return*/];
            }
        });
    }); });
    it('canExport should return true for finished reports', function () { return __awaiter(void 0, void 0, void 0, function () {
        var report, policy, transaction, isReportArchived;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    report = __assign(__assign({}, (0, reports_1.createRandomReport)(REPORT_ID)), { type: CONST_1.default.REPORT.TYPE.EXPENSE, ownerAccountID: CURRENT_USER_ACCOUNT_ID, statusNum: CONST_1.default.REPORT.STATUS_NUM.CLOSED, isWaitingOnBankAccount: false });
                    policy = (0, policies_1.default)(0);
                    policy.type = CONST_1.default.POLICY.TYPE.CORPORATE;
                    policy.connections = (_a = {}, _a[CONST_1.default.POLICY.CONNECTIONS.NAME.NETSUITE] = {}, _a);
                    policy.reimbursementChoice = CONST_1.default.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO;
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(REPORT_ID), report)];
                case 1:
                    _b.sent();
                    transaction = {
                        reportID: "".concat(REPORT_ID),
                    };
                    isReportArchived = (0, react_native_1.renderHook)(function () { return (0, useReportIsArchived_1.default)(report === null || report === void 0 ? void 0 : report.parentReportID); }).result;
                    expect((0, ReportPreviewActionUtils_1.getReportPreviewAction)(VIOLATIONS, report, policy, [transaction], isReportArchived.current)).toBe(CONST_1.default.REPORT.REPORT_PREVIEW_ACTIONS.EXPORT_TO_ACCOUNTING);
                    return [2 /*return*/];
            }
        });
    }); });
    it('canReview should return true for reports where there are violations, user is submitter or approver and Workflows are enabled', function () { return __awaiter(void 0, void 0, void 0, function () {
        var report, policy, REPORT_VIOLATION, transaction, isReportArchived;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    ReportUtils.hasViolations.mockReturnValue(true);
                    report = __assign(__assign({}, (0, reports_1.createRandomReport)(REPORT_ID)), { statusNum: 0, stateNum: 0, type: CONST_1.default.REPORT.TYPE.EXPENSE, ownerAccountID: CURRENT_USER_ACCOUNT_ID, isWaitingOnBankAccount: false });
                    policy = (0, policies_1.default)(0);
                    policy.areWorkflowsEnabled = true;
                    policy.type = CONST_1.default.POLICY.TYPE.CORPORATE;
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(REPORT_ID), report)];
                case 1:
                    _a.sent();
                    REPORT_VIOLATION = {
                        FIELD_REQUIRED: 'fieldRequired',
                    };
                    return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_VIOLATIONS).concat(REPORT_ID), REPORT_VIOLATION)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(TRANSACTION_ID), [
                            {
                                name: CONST_1.default.VIOLATIONS.OVER_LIMIT,
                            },
                        ])];
                case 3:
                    _a.sent();
                    transaction = {
                        reportID: "".concat(REPORT_ID),
                    };
                    isReportArchived = (0, react_native_1.renderHook)(function () { return (0, useReportIsArchived_1.default)(report === null || report === void 0 ? void 0 : report.parentReportID); }).result;
                    expect((0, ReportPreviewActionUtils_1.getReportPreviewAction)(VIOLATIONS, report, policy, [transaction], isReportArchived.current)).toBe(CONST_1.default.REPORT.REPORT_PREVIEW_ACTIONS.REVIEW);
                    return [2 /*return*/];
            }
        });
    }); });
    it('canReview should return true for reports with RTER violations regardless of workspace workflow configuration', function () { return __awaiter(void 0, void 0, void 0, function () {
        var report, policy, REPORT_VIOLATION, transaction;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    ReportUtils.hasViolations.mockReturnValue(true);
                    report = __assign(__assign({}, (0, reports_1.createRandomReport)(REPORT_ID)), { statusNum: 0, stateNum: 0, type: CONST_1.default.REPORT.TYPE.EXPENSE, ownerAccountID: CURRENT_USER_ACCOUNT_ID, isWaitingOnBankAccount: false });
                    policy = (0, policies_1.default)(0);
                    policy.areWorkflowsEnabled = true;
                    policy.type = CONST_1.default.POLICY.TYPE.CORPORATE;
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(REPORT_ID), report)];
                case 1:
                    _a.sent();
                    REPORT_VIOLATION = {
                        FIELD_REQUIRED: 'fieldRequired',
                    };
                    return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_VIOLATIONS).concat(REPORT_ID), REPORT_VIOLATION)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(TRANSACTION_ID), [
                            {
                                name: CONST_1.default.VIOLATIONS.RTER,
                                data: {
                                    pendingPattern: true,
                                    rterType: CONST_1.default.RTER_VIOLATION_TYPES.SEVEN_DAY_HOLD,
                                },
                            },
                        ])];
                case 3:
                    _a.sent();
                    transaction = {
                        reportID: "".concat(REPORT_ID),
                    };
                    expect((0, ReportPreviewActionUtils_1.getReportPreviewAction)(VIOLATIONS, report, policy, [transaction])).toBe(CONST_1.default.REPORT.REPORT_PREVIEW_ACTIONS.REVIEW);
                    return [2 /*return*/];
            }
        });
    }); });
    it('canView should return true for reports in which we are waiting for user to add a bank account', function () { return __awaiter(void 0, void 0, void 0, function () {
        var report, policy, transaction, isReportArchived;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    report = __assign(__assign({}, (0, reports_1.createRandomReport)(REPORT_ID)), { type: CONST_1.default.REPORT.TYPE.EXPENSE, ownerAccountID: CURRENT_USER_ACCOUNT_ID, statusNum: CONST_1.default.REPORT.STATUS_NUM.CLOSED, isWaitingOnBankAccount: true });
                    policy = (0, policies_1.default)(0);
                    policy.type = CONST_1.default.POLICY.TYPE.CORPORATE;
                    policy.connections = (_a = {}, _a[CONST_1.default.POLICY.CONNECTIONS.NAME.NETSUITE] = {}, _a);
                    policy.reimbursementChoice = CONST_1.default.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO;
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(REPORT_ID), report)];
                case 1:
                    _b.sent();
                    transaction = {
                        reportID: "".concat(REPORT_ID),
                    };
                    isReportArchived = (0, react_native_1.renderHook)(function () { return (0, useReportIsArchived_1.default)(report === null || report === void 0 ? void 0 : report.parentReportID); }).result;
                    expect((0, ReportPreviewActionUtils_1.getReportPreviewAction)(VIOLATIONS, report, policy, [transaction], isReportArchived.current)).toBe(CONST_1.default.REPORT.REPORT_PREVIEW_ACTIONS.VIEW);
                    return [2 /*return*/];
            }
        });
    }); });
});
