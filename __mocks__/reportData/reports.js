"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.iouReportR14932 = exports.chatReportR14932 = void 0;
var CONST_1 = require("@src/CONST");
var usersIDs = [15593135, 51760358, 26502375];
var amount = 10402;
var currency = CONST_1.default.CURRENCY.USD;
var REPORT_ID_R14932 = 'REPORT_ID_R14932';
var CHAT_REPORT_ID_R14932 = 'CHAT_REPORT_ID_R14932';
var IOU_REPORT_ID_R14932 = 'IOU_REPORT_ID_R14932';
var PARENT_REPORT_ACTION_ID_R14932 = 'PARENT_ACTION_ID_R14932';
var PARENT_REPORT_ID_R14932 = 'PARENT_REPORT_ID_R14932';
var LAST_MESSAGE_R14932 = 'LAST_MESSAGE_R14932';
var participants = usersIDs.reduce(function (prev, userID) {
    var _a;
    return _a = {},
        _a[userID] = {
            notificationPreference: 'always',
        },
        _a;
}, {});
var iouReportR14932 = {
    currency: currency,
    participants: participants,
    total: amount,
    unheldTotal: amount,
    chatReportID: CHAT_REPORT_ID_R14932,
    lastMessageHtml: LAST_MESSAGE_R14932,
    lastMessageText: LAST_MESSAGE_R14932,
    parentReportActionID: PARENT_REPORT_ACTION_ID_R14932,
    parentReportID: PARENT_REPORT_ID_R14932,
    reportID: REPORT_ID_R14932,
    lastActorAccountID: usersIDs.at(0),
    ownerAccountID: usersIDs.at(0),
    managerID: usersIDs.at(1),
    permissions: [CONST_1.default.REPORT.PERMISSIONS.READ, CONST_1.default.REPORT.PERMISSIONS.WRITE],
    policyID: CONST_1.default.POLICY.ID_FAKE,
    reportName: CONST_1.default.REPORT.ACTIONS.TYPE.IOU,
    stateNum: CONST_1.default.REPORT.STATE_NUM.APPROVED,
    statusNum: CONST_1.default.REPORT.STATUS_NUM.OPEN,
    type: CONST_1.default.REPORT.TYPE.EXPENSE,
    writeCapability: CONST_1.default.REPORT.WRITE_CAPABILITIES.ALL,
    lastActionType: CONST_1.default.REPORT.ACTIONS.TYPE.ADD_COMMENT,
    chatType: CONST_1.default.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
    hasOutstandingChildRequest: false,
    hasOutstandingChildTask: false,
    hasParentAccess: true,
    isCancelledIOU: false,
    isOwnPolicyExpenseChat: false,
    isPinned: false,
    isWaitingOnBankAccount: false,
    lastReadTime: '2025-03-07 07:23:39.335',
    lastVisibleActionCreated: '2025-03-07 07:23:39.335',
    lastVisibleActionLastModified: '2025-03-07 07:23:39.335',
    lastReadSequenceNumber: 0,
    unheldNonReimbursableTotal: 0,
    nonReimbursableTotal: 0,
    errorFields: {},
    welcomeMessage: '',
    description: '',
    oldPolicyName: '',
};
exports.iouReportR14932 = iouReportR14932;
var chatReportR14932 = {
    currency: currency,
    participants: participants,
    lastMessageText: LAST_MESSAGE_R14932,
    reportID: REPORT_ID_R14932,
    iouReportID: IOU_REPORT_ID_R14932,
    lastActorAccountID: usersIDs.at(0),
    ownerAccountID: usersIDs.at(0),
    managerID: usersIDs.at(1),
    total: amount,
    unheldTotal: amount,
    chatType: CONST_1.default.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
    policyID: CONST_1.default.POLICY.ID_FAKE,
    reportName: CONST_1.default.REPORT.DEFAULT_REPORT_NAME,
    lastActionType: CONST_1.default.REPORT.ACTIONS.TYPE.ADD_COMMENT,
    writeCapability: CONST_1.default.REPORT.WRITE_CAPABILITIES.ALL,
    permissions: [CONST_1.default.REPORT.PERMISSIONS.READ, CONST_1.default.REPORT.PERMISSIONS.WRITE],
    type: CONST_1.default.REPORT.TYPE.CHAT,
    lastMessageHtml: "<mention-user accountID=\"".concat(usersIDs.at(0), "\"/> <mention-user accountID=\"").concat(usersIDs.at(0), "\"/>"),
    lastReadTime: '2025-03-11 08:51:38.736',
    lastVisibleActionCreated: '2025-03-11 08:47:56.654',
    lastVisibleActionLastModified: '2025-03-11 08:47:56.654',
    hasOutstandingChildRequest: false,
    hasOutstandingChildTask: false,
    isCancelledIOU: false,
    isOwnPolicyExpenseChat: false,
    isPinned: false,
    isWaitingOnBankAccount: false,
    lastReadSequenceNumber: 0,
    unheldNonReimbursableTotal: 0,
    stateNum: 0,
    statusNum: 0,
    nonReimbursableTotal: 0,
    errorFields: {},
    description: '',
    oldPolicyName: '',
    welcomeMessage: '',
};
exports.chatReportR14932 = chatReportR14932;
