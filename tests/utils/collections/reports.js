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
exports.createRandomReport = createRandomReport;
exports.createPolicyExpenseChat = createPolicyExpenseChat;
exports.createWorkspaceThread = createWorkspaceThread;
exports.createExpenseRequestReport = createExpenseRequestReport;
exports.createExpenseReport = createExpenseReport;
exports.createWorkspaceTaskReport = createWorkspaceTaskReport;
exports.createInvoiceRoom = createInvoiceRoom;
exports.createInvoiceReport = createInvoiceReport;
exports.createGroupChat = createGroupChat;
exports.createSelfDM = createSelfDM;
exports.createAdminRoom = createAdminRoom;
exports.createAnnounceRoom = createAnnounceRoom;
exports.createDomainRoom = createDomainRoom;
exports.createRegularTaskReport = createRegularTaskReport;
exports.createRegularChat = createRegularChat;
exports.createPolicyExpenseChatThread = createPolicyExpenseChatThread;
exports.createPolicyExpenseChatTask = createPolicyExpenseChatTask;
var falso_1 = require("@ngneat/falso");
var ReportUtils_1 = require("@libs/ReportUtils");
var CONST_1 = require("@src/CONST");
/**
 * Creates a report with random settings
 */
function createRandomReport(index) {
    return {
        reportID: index.toString(),
        chatType: (0, falso_1.rand)(Object.values(CONST_1.default.REPORT.CHAT_TYPE)),
        currency: (0, falso_1.randCurrencyCode)(),
        ownerAccountID: index,
        isPinned: (0, falso_1.randBoolean)(),
        isOwnPolicyExpenseChat: (0, falso_1.randBoolean)(),
        isWaitingOnBankAccount: (0, falso_1.randBoolean)(),
        policyID: index.toString(),
        reportName: (0, falso_1.randWord)(),
    };
}
/**
 * Creates a policy expense chat report
 */
function createPolicyExpenseChat(index, isOwnPolicyExpenseChat) {
    if (isOwnPolicyExpenseChat === void 0) { isOwnPolicyExpenseChat = true; }
    return __assign(__assign({}, createRandomReport(index)), { chatType: CONST_1.default.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT, isOwnPolicyExpenseChat: isOwnPolicyExpenseChat, type: CONST_1.default.REPORT.TYPE.CHAT, 
        // Ensure it's not a thread
        parentReportID: undefined, parentReportActionID: undefined });
}
/**
 * Creates a workspace thread report (chat with parent)
 */
function createWorkspaceThread(index) {
    return __assign(__assign({}, createRandomReport(index)), { type: CONST_1.default.REPORT.TYPE.CHAT, chatType: CONST_1.default.REPORT.CHAT_TYPE.POLICY_ROOM, parentReportID: "".concat((0, falso_1.randNumber)()), parentReportActionID: "".concat((0, falso_1.randNumber)()) });
}
/**
 * Creates an expense request report (IOU report)
 */
function createExpenseRequestReport(index, parentReportID, parentReportActionID) {
    if (parentReportID === void 0) { parentReportID = "".concat((0, falso_1.randNumber)()); }
    if (parentReportActionID === void 0) { parentReportActionID = "".concat((0, falso_1.randNumber)()); }
    return __assign(__assign({}, createRandomReport(index)), { type: CONST_1.default.REPORT.TYPE.IOU, parentReportID: parentReportID, parentReportActionID: parentReportActionID, 
        // Clear random chat type
        chatType: undefined, isOwnPolicyExpenseChat: false });
}
/**
 * Creates an expense report
 */
function createExpenseReport(index) {
    return __assign(__assign({}, createRandomReport(index)), { type: CONST_1.default.REPORT.TYPE.EXPENSE, parentReportID: "".concat((0, falso_1.randNumber)()), parentReportActionID: "".concat((0, falso_1.randNumber)()), 
        // Clear random chat type
        chatType: undefined, isOwnPolicyExpenseChat: false });
}
/**
 * Creates a workspace task report
 */
function createWorkspaceTaskReport(index, accountIDs, parentReportID) {
    if (parentReportID === void 0) { parentReportID = "".concat((0, falso_1.randNumber)()); }
    return __assign(__assign({}, createRandomReport(index)), { type: CONST_1.default.REPORT.TYPE.TASK, policyID: "policy".concat(index), participants: (0, ReportUtils_1.buildParticipantsFromAccountIDs)(accountIDs), parentReportID: parentReportID, 
        // Clear random chat type
        chatType: undefined, isOwnPolicyExpenseChat: false });
}
/**
 * Creates an invoice room
 */
function createInvoiceRoom(index) {
    return __assign(__assign({}, createRandomReport(index)), { type: CONST_1.default.REPORT.TYPE.CHAT, chatType: CONST_1.default.REPORT.CHAT_TYPE.INVOICE });
}
/**
 * Creates an invoice report
 */
function createInvoiceReport(index) {
    return __assign(__assign({}, createRandomReport(index)), { type: CONST_1.default.REPORT.TYPE.INVOICE });
}
/**
 * Creates a group chat
 */
function createGroupChat(index, accountIDs) {
    return __assign(__assign({}, createRandomReport(index)), { type: CONST_1.default.REPORT.TYPE.CHAT, chatType: CONST_1.default.REPORT.CHAT_TYPE.GROUP, participants: (0, ReportUtils_1.buildParticipantsFromAccountIDs)(accountIDs) });
}
/**
 * Creates a self DM
 */
function createSelfDM(index, currentUserAccountID) {
    return __assign(__assign({}, createRandomReport(index)), { type: CONST_1.default.REPORT.TYPE.CHAT, chatType: CONST_1.default.REPORT.CHAT_TYPE.SELF_DM, participants: (0, ReportUtils_1.buildParticipantsFromAccountIDs)([currentUserAccountID]) });
}
/**
 * Creates an admin room
 */
function createAdminRoom(index) {
    return __assign(__assign({}, createRandomReport(index)), { type: CONST_1.default.REPORT.TYPE.CHAT, chatType: CONST_1.default.REPORT.CHAT_TYPE.POLICY_ADMINS, reportName: '#admins' });
}
/**
 * Creates an announce room
 */
function createAnnounceRoom(index) {
    return __assign(__assign({}, createRandomReport(index)), { type: CONST_1.default.REPORT.TYPE.CHAT, chatType: CONST_1.default.REPORT.CHAT_TYPE.POLICY_ANNOUNCE, reportName: '#announce' });
}
/**
 * Creates a domain room
 */
function createDomainRoom(index) {
    return __assign(__assign({}, createRandomReport(index)), { type: CONST_1.default.REPORT.TYPE.CHAT, chatType: CONST_1.default.REPORT.CHAT_TYPE.DOMAIN_ALL, reportName: '#domain' });
}
/**
 * Creates a regular task report (non-workspace)
 */
function createRegularTaskReport(index, currentUserAccountID) {
    return __assign(__assign({}, createRandomReport(index)), { type: CONST_1.default.REPORT.TYPE.TASK, 
        // No policy makes it a regular task
        policyID: undefined, participants: (0, ReportUtils_1.buildParticipantsFromAccountIDs)([currentUserAccountID, 1]) });
}
/**
 * Creates a regular 1:1 chat
 */
function createRegularChat(index, accountIDs) {
    return __assign(__assign({}, createRandomReport(index)), { type: CONST_1.default.REPORT.TYPE.CHAT, 
        // No specific chat type makes it regular
        chatType: undefined, isOwnPolicyExpenseChat: false, participants: (0, ReportUtils_1.buildParticipantsFromAccountIDs)(accountIDs), 
        // Ensure it's not a thread
        parentReportID: undefined, parentReportActionID: undefined, 
        // No policy makes it regular
        policyID: undefined });
}
/**
 * Creates a policy expense chat that is also a thread (edge case)
 */
function createPolicyExpenseChatThread(index) {
    return __assign(__assign({}, createRandomReport(index)), { chatType: CONST_1.default.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT, isOwnPolicyExpenseChat: true, parentReportID: "".concat((0, falso_1.randNumber)()), parentReportActionID: "".concat((0, falso_1.randNumber)()) });
}
/**
 * Creates a policy expense chat that is also a task report (edge case)
 */
function createPolicyExpenseChatTask(index) {
    return __assign(__assign({}, createRandomReport(index)), { type: CONST_1.default.REPORT.TYPE.TASK, chatType: CONST_1.default.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT, isOwnPolicyExpenseChat: true });
}
