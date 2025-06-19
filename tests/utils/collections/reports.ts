import {rand, randBoolean, randCurrencyCode, randWord} from '@ngneat/falso';
import {buildParticipantsFromAccountIDs} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import type {Report} from '@src/types/onyx';

/**
 * Creates a report with random settings
 */
function createRandomReport(index: number): Report {
    return {
        reportID: index.toString(),
        chatType: rand(Object.values(CONST.REPORT.CHAT_TYPE)),
        currency: randCurrencyCode(),
        ownerAccountID: index,
        isPinned: randBoolean(),
        isOwnPolicyExpenseChat: randBoolean(),
        isWaitingOnBankAccount: randBoolean(),
        policyID: index.toString(),
        reportName: randWord(),
    };
}

/**
 * Creates a policy expense chat report
 */
function createPolicyExpenseChat(index: number, isOwnPolicyExpenseChat = true): Report {
    return {
        ...createRandomReport(index),
        chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
        isOwnPolicyExpenseChat,
        type: CONST.REPORT.TYPE.CHAT,
        parentReportID: undefined, // Ensure it's not a thread
        parentReportActionID: undefined,
    };
}

/**
 * Creates a workspace thread report (chat with parent)
 */
function createWorkspaceThread(index: number, parentReportID = '12345', parentReportActionID = '67890'): Report {
    return {
        ...createRandomReport(index),
        type: CONST.REPORT.TYPE.CHAT,
        chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM,
        parentReportID,
        parentReportActionID,
    };
}

/**
 * Creates an expense request report (IOU report)
 */
function createExpenseRequestReport(index: number, parentReportID = '12345', parentReportActionID = '67890'): Report {
    return {
        ...createRandomReport(index),
        type: CONST.REPORT.TYPE.IOU,
        parentReportID,
        parentReportActionID,
        chatType: undefined, // Clear random chat type
        isOwnPolicyExpenseChat: false, // Clear random value
    };
}

/**
 * Creates an expense report with single transaction
 */
function createExpenseReportWithSingleTransaction(index: number, parentReportID = '12345', parentReportActionID = '67890'): Report {
    return {
        ...createRandomReport(index),
        type: CONST.REPORT.TYPE.EXPENSE,
        parentReportID,
        parentReportActionID,
        chatType: undefined, // Clear random chat type
        isOwnPolicyExpenseChat: false, // Clear random value
    };
}

/**
 * Creates a workspace task report
 */
function createWorkspaceTaskReport(index: number, policyID = 'policy123'): Report {
    return {
        ...createRandomReport(index),
        type: CONST.REPORT.TYPE.TASK,
        policyID,
        participants: buildParticipantsFromAccountIDs([5, 1]), // currentUserAccountID = 5 in tests
        chatType: undefined, // Clear random chat type
        isOwnPolicyExpenseChat: false, // Clear random value
    };
}

/**
 * Creates an invoice room
 */
function createInvoiceRoom(index: number): Report {
    return {
        ...createRandomReport(index),
        type: CONST.REPORT.TYPE.CHAT,
        chatType: CONST.REPORT.CHAT_TYPE.INVOICE,
    };
}

/**
 * Creates an invoice report
 */
function createInvoiceReport(index: number): Report {
    return {
        ...createRandomReport(index),
        type: CONST.REPORT.TYPE.INVOICE,
    };
}

/**
 * Creates a group chat
 */
function createGroupChat(index: number, participantAccountIDs = [5, 1, 2, 3]): Report {
    return {
        ...createRandomReport(index),
        type: CONST.REPORT.TYPE.CHAT,
        chatType: CONST.REPORT.CHAT_TYPE.GROUP,
        participants: buildParticipantsFromAccountIDs(participantAccountIDs),
    };
}

/**
 * Creates a self DM
 */
function createSelfDM(index: number, currentUserAccountID = 5): Report {
    return {
        ...createRandomReport(index),
        type: CONST.REPORT.TYPE.CHAT,
        chatType: CONST.REPORT.CHAT_TYPE.SELF_DM,
        participants: buildParticipantsFromAccountIDs([currentUserAccountID]),
    };
}

/**
 * Creates an admin room
 */
function createAdminRoom(index: number): Report {
    return {
        ...createRandomReport(index),
        type: CONST.REPORT.TYPE.CHAT,
        chatType: CONST.REPORT.CHAT_TYPE.POLICY_ADMINS,
        reportName: '#admins',
    };
}

/**
 * Creates an announce room
 */
function createAnnounceRoom(index: number): Report {
    return {
        ...createRandomReport(index),
        type: CONST.REPORT.TYPE.CHAT,
        chatType: CONST.REPORT.CHAT_TYPE.POLICY_ANNOUNCE,
        reportName: '#announce',
    };
}

/**
 * Creates a domain room
 */
function createDomainRoom(index: number): Report {
    return {
        ...createRandomReport(index),
        type: CONST.REPORT.TYPE.CHAT,
        chatType: CONST.REPORT.CHAT_TYPE.DOMAIN_ALL,
        reportName: '#domain',
    };
}

/**
 * Creates a regular task report (non-workspace)
 */
function createRegularTaskReport(index: number, currentUserAccountID = 5): Report {
    return {
        ...createRandomReport(index),
        type: CONST.REPORT.TYPE.TASK,
        policyID: undefined, // No policy makes it a regular task
        participants: buildParticipantsFromAccountIDs([currentUserAccountID, 1]),
    };
}

/**
 * Creates a regular 1:1 chat
 */
function createRegularChat(index: number, currentUserAccountID = 5, participantAccountIDs = [1]): Report {
    return {
        ...createRandomReport(index),
        type: CONST.REPORT.TYPE.CHAT,
        chatType: undefined, // No specific chat type makes it regular
        isOwnPolicyExpenseChat: false,
        participants: buildParticipantsFromAccountIDs([currentUserAccountID, ...participantAccountIDs]),
        parentReportID: undefined, // Ensure it's not a thread
        parentReportActionID: undefined,
        policyID: undefined, // No policy makes it regular
    };
}

/**
 * Creates a policy expense chat that is also a thread (edge case)
 */
function createPolicyExpenseChatThread(index: number, parentReportID = '12345', parentReportActionID = '67890'): Report {
    return {
        ...createRandomReport(index),
        chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
        isOwnPolicyExpenseChat: true,
        parentReportID,
        parentReportActionID,
    };
}

/**
 * Creates a policy expense chat that is also a task report (edge case)
 */
function createPolicyExpenseChatTask(index: number): Report {
    return {
        ...createRandomReport(index),
        type: CONST.REPORT.TYPE.TASK,
        chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
        isOwnPolicyExpenseChat: true,
    };
}

export {
    createRandomReport,
    createPolicyExpenseChat,
    createWorkspaceThread,
    createExpenseRequestReport,
    createExpenseReportWithSingleTransaction,
    createWorkspaceTaskReport,
    createInvoiceRoom,
    createInvoiceReport,
    createGroupChat,
    createSelfDM,
    createAdminRoom,
    createAnnounceRoom,
    createDomainRoom,
    createRegularTaskReport,
    createRegularChat,
    createPolicyExpenseChatThread,
    createPolicyExpenseChatTask,
};
