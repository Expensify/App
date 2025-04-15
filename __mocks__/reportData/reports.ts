import CONST from '@src/CONST';
import type {Report} from '@src/types/onyx';

const usersIDs = [15593135, 51760358, 26502375];
const amount = 10402;
const currency = CONST.CURRENCY.USD;

const REPORT_ID_R14932 = 'REPORT_ID_R14932';
const CHAT_REPORT_ID_R14932 = 'CHAT_REPORT_ID_R14932';
const IOU_REPORT_ID_R14932 = 'IOU_REPORT_ID_R14932';
const PARENT_REPORT_ACTION_ID_R14932 = 'PARENT_ACTION_ID_R14932';
const PARENT_REPORT_ID_R14932 = 'PARENT_REPORT_ID_R14932';
const LAST_MESSAGE_R14932 = 'LAST_MESSAGE_R14932';

const participants = usersIDs.reduce((prev, userID) => {
    return {
        [userID]: {
            notificationPreference: 'always',
        },
    };
}, {});

const iouReportR14932: Report = {
    currency,
    participants,
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
    permissions: [CONST.REPORT.PERMISSIONS.READ, CONST.REPORT.PERMISSIONS.WRITE],
    policyID: CONST.POLICY.ID_FAKE,
    reportName: CONST.REPORT.ACTIONS.TYPE.IOU,
    stateNum: CONST.REPORT.STATE_NUM.APPROVED,
    statusNum: CONST.REPORT.STATUS_NUM.OPEN,
    type: CONST.REPORT.TYPE.EXPENSE,
    writeCapability: CONST.REPORT.WRITE_CAPABILITIES.ALL,
    lastActionType: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
    chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
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

const chatReportR14932: Report = {
    currency,
    participants,
    lastMessageText: LAST_MESSAGE_R14932,
    reportID: REPORT_ID_R14932,
    iouReportID: IOU_REPORT_ID_R14932,
    lastActorAccountID: usersIDs.at(0),
    ownerAccountID: usersIDs.at(0),
    managerID: usersIDs.at(1),
    total: amount,
    unheldTotal: amount,
    chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
    policyID: CONST.POLICY.ID_FAKE,
    reportName: CONST.REPORT.DEFAULT_REPORT_NAME,
    lastActionType: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
    writeCapability: CONST.REPORT.WRITE_CAPABILITIES.ALL,
    permissions: [CONST.REPORT.PERMISSIONS.READ, CONST.REPORT.PERMISSIONS.WRITE],
    type: CONST.REPORT.TYPE.CHAT,
    lastMessageHtml: `<mention-user accountID="${usersIDs.at(0)}"/> <mention-user accountID="${usersIDs.at(0)}"/>`,
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

export {chatReportR14932, iouReportR14932};
