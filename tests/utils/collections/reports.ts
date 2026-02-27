import {randBoolean, randCurrencyCode, randNumber, randWord} from '@ngneat/falso';
import type {ValueOf} from 'type-fest';
import {buildParticipantsFromAccountIDs} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import type {Report} from '@src/types/onyx';

/**
 * Creates a report with random settings
 */
function createRandomReport(index: number, chatType: ValueOf<typeof CONST.REPORT.CHAT_TYPE> | undefined): Report {
    return {
        reportID: index.toString(),
        chatType,
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
        ...createRandomReport(index, CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT),
        isOwnPolicyExpenseChat,
        type: CONST.REPORT.TYPE.CHAT,

        // Ensure it's not a thread
        parentReportID: undefined,
        parentReportActionID: undefined,
    };
}

/**
 * Creates a workspace thread report (chat with parent)
 */
function createWorkspaceThread(index: number): Report {
    return {
        ...createRandomReport(index, CONST.REPORT.CHAT_TYPE.POLICY_ROOM),
        type: CONST.REPORT.TYPE.CHAT,
        parentReportID: `${randNumber()}`,
        parentReportActionID: `${randNumber()}`,
    };
}

/**
 * Creates an expense request report (IOU report)
 */
function createExpenseRequestReport(index: number, parentReportID = `${randNumber()}`, parentReportActionID = `${randNumber()}`): Report {
    return {
        ...createRandomReport(index, undefined),
        type: CONST.REPORT.TYPE.IOU,
        parentReportID,
        parentReportActionID,
        isOwnPolicyExpenseChat: false,
    };
}

/**
 * Creates an expense report
 */
function createExpenseReport(index: number): Report {
    return {
        ...createRandomReport(index, undefined),
        type: CONST.REPORT.TYPE.EXPENSE,
        parentReportID: `${randNumber()}`,
        parentReportActionID: `${randNumber()}`,
        isOwnPolicyExpenseChat: false,
    };
}

/**
 * Creates a workspace task report
 */
function createWorkspaceTaskReport(index: number, accountIDs: number[], parentReportID = `${randNumber()}`): Report {
    return {
        ...createRandomReport(index, undefined),
        type: CONST.REPORT.TYPE.TASK,
        policyID: `policy${index}`,
        participants: buildParticipantsFromAccountIDs(accountIDs),
        parentReportID,

        // Clear random chat type
        chatType: undefined,
        isOwnPolicyExpenseChat: false,
    };
}

/**
 * Creates an invoice room
 */
function createInvoiceRoom(index: number): Report {
    return {
        ...createRandomReport(index, CONST.REPORT.CHAT_TYPE.INVOICE),
        type: CONST.REPORT.TYPE.CHAT,
    };
}

/**
 * Creates an invoice report
 */
function createInvoiceReport(index: number): Report {
    return {
        ...createRandomReport(index, undefined),
        type: CONST.REPORT.TYPE.INVOICE,
    };
}

/**
 * Creates a group chat
 */
function createGroupChat(index: number, accountIDs: number[]): Report {
    return {
        ...createRandomReport(index, CONST.REPORT.CHAT_TYPE.GROUP),
        type: CONST.REPORT.TYPE.CHAT,
        participants: buildParticipantsFromAccountIDs(accountIDs),
    };
}

/**
 * Creates a self DM
 */
function createSelfDM(index: number, currentUserAccountID: number): Report {
    return {
        ...createRandomReport(index, CONST.REPORT.CHAT_TYPE.SELF_DM),
        type: CONST.REPORT.TYPE.CHAT,
        participants: buildParticipantsFromAccountIDs([currentUserAccountID]),
    };
}

/**
 * Creates an admin room
 */
function createAdminRoom(index: number): Report {
    return {
        ...createRandomReport(index, CONST.REPORT.CHAT_TYPE.POLICY_ADMINS),
        type: CONST.REPORT.TYPE.CHAT,
        reportName: '#admins',
    };
}

/**
 * Creates an announce room
 */
function createAnnounceRoom(index: number): Report {
    return {
        ...createRandomReport(index, CONST.REPORT.CHAT_TYPE.POLICY_ANNOUNCE),
        type: CONST.REPORT.TYPE.CHAT,
        reportName: '#announce',
    };
}

/**
 * Creates a domain room
 */
function createDomainRoom(index: number): Report {
    return {
        ...createRandomReport(index, CONST.REPORT.CHAT_TYPE.DOMAIN_ALL),
        type: CONST.REPORT.TYPE.CHAT,
        reportName: '#domain',
    };
}

/**
 * Creates a regular task report (non-workspace)
 */
function createRegularTaskReport(index: number, currentUserAccountID: number): Report {
    return {
        ...createRandomReport(index, undefined),
        type: CONST.REPORT.TYPE.TASK,

        // No policy makes it a regular task
        policyID: undefined,
        participants: buildParticipantsFromAccountIDs([currentUserAccountID, 1]),
    };
}

/**
 * Creates a regular 1:1 chat
 */
function createRegularChat(index: number, accountIDs: number[]): Report {
    return {
        ...createRandomReport(index, undefined),
        type: CONST.REPORT.TYPE.CHAT,

        // No specific chat type makes it regular
        chatType: undefined,
        isOwnPolicyExpenseChat: false,
        participants: buildParticipantsFromAccountIDs(accountIDs),

        // Ensure it's not a thread
        parentReportID: undefined,
        parentReportActionID: undefined,

        // No policy makes it regular
        policyID: undefined,
    };
}

/**
 * Creates a policy expense chat that is also a thread (edge case)
 */
function createPolicyExpenseChatThread(index: number): Report {
    return {
        ...createRandomReport(index, CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT),
        isOwnPolicyExpenseChat: true,
        parentReportID: `${randNumber()}`,
        parentReportActionID: `${randNumber()}`,
    };
}

/**
 * Creates a policy expense chat that is also a task report (edge case)
 */
function createPolicyExpenseChatTask(index: number): Report {
    return {
        ...createRandomReport(index, CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT),
        type: CONST.REPORT.TYPE.TASK,
        isOwnPolicyExpenseChat: true,
    };
}

export {
    createRandomReport,
    createPolicyExpenseChat,
    createWorkspaceThread,
    createExpenseRequestReport,
    createExpenseReport,
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
