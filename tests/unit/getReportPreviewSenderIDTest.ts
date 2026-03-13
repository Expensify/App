import {getReportPreviewSenderID} from '../../src/components/ReportActionAvatars/useReportPreviewSenderID';
import CONST from '../../src/CONST';
import type {Report, ReportAction, Transaction} from '../../src/types/onyx';

const CURRENT_USER_ACCOUNT_ID = 100;
const OWNER_ACCOUNT_ID = 200;
const MANAGER_ACCOUNT_ID = 300;

function makeAction(overrides: Partial<ReportAction> = {}): ReportAction {
    return {
        reportActionID: '1',
        actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
        childOwnerAccountID: OWNER_ACCOUNT_ID,
        childManagerAccountID: MANAGER_ACCOUNT_ID,
        childMoneyRequestCount: 1,
        created: '2024-01-01',
        ...overrides,
    } as ReportAction;
}

function makeIOUReport(overrides: Partial<Report> = {}): Report {
    return {
        reportID: '1',
        type: CONST.REPORT.TYPE.IOU,
        ...overrides,
    } as Report;
}

function makeTransaction(amount: number, attendeeEmail = 'user@test.com', overrides: Partial<Transaction> = {}): Transaction {
    return {
        transactionID: `tr-${Math.random()}`,
        amount,
        comment: {
            attendees: [{email: attendeeEmail}],
        },
        ...overrides,
    } as Transaction;
}

function makeIOUAction(type: string, overrides: Partial<ReportAction> = {}): ReportAction {
    return {
        reportActionID: `iou-${Math.random()}`,
        actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
        originalMessage: {
            type,
            IOUTransactionID: `tr-${Math.random()}`,
            amount: 100,
            currency: 'USD',
        },
        ...overrides,
    } as ReportAction;
}

const baseParams = {
    chatReport: undefined,
    splits: undefined,
    policy: undefined,
    currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
};

describe('getReportPreviewSenderID', () => {
    it('returns currentUserAccountID for optimistic report preview', () => {
        const result = getReportPreviewSenderID({
            ...baseParams,
            iouReport: makeIOUReport(),
            action: makeAction({isOptimisticAction: true, actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW}),
            iouActions: undefined,
            transactions: undefined,
        });

        expect(result).toBe(CURRENT_USER_ACCOUNT_ID);
    });

    it('returns childOwnerAccountID for single sender normal request', () => {
        const result = getReportPreviewSenderID({
            ...baseParams,
            iouReport: makeIOUReport(),
            action: makeAction(),
            iouActions: [makeIOUAction(CONST.IOU.REPORT_ACTION_TYPE.CREATE)],
            transactions: [makeTransaction(100)],
        });

        expect(result).toBe(OWNER_ACCOUNT_ID);
    });

    it('returns childManagerAccountID for send money flow (all iouActions are sentMoney)', () => {
        const sentMoneyAction = makeIOUAction(CONST.IOU.REPORT_ACTION_TYPE.PAY, {
            originalMessage: {
                type: CONST.IOU.REPORT_ACTION_TYPE.PAY,
                IOUDetails: {amount: 100, comment: '', currency: 'USD'},
                IOUTransactionID: 'tr-1',
                amount: 100,
                currency: 'USD',
            },
        } as Partial<ReportAction>);

        const result = getReportPreviewSenderID({
            ...baseParams,
            iouReport: makeIOUReport(),
            action: makeAction(),
            iouActions: [sentMoneyAction],
            transactions: [makeTransaction(100)],
        });

        expect(result).toBe(MANAGER_ACCOUNT_ID);
    });

    it('returns childManagerAccountID for send money fallback (no iouActions, 1 transaction, DM chat)', () => {
        const dmChat: Report = {
            reportID: 'dm-1',
            type: CONST.REPORT.TYPE.CHAT,
            chatType: undefined,
            participants: {
                [CURRENT_USER_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                [MANAGER_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
            },
        } as Report;

        const result = getReportPreviewSenderID({
            ...baseParams,
            chatReport: dmChat,
            iouReport: makeIOUReport(),
            action: makeAction({childMoneyRequestCount: 0}),
            iouActions: [],
            transactions: [makeTransaction(100)],
        });

        expect(result).toBe(MANAGER_ACCOUNT_ID);
    });

    it('returns undefined for multi-sender: different-sign amounts', () => {
        const result = getReportPreviewSenderID({
            ...baseParams,
            iouReport: makeIOUReport(),
            action: makeAction(),
            iouActions: [makeIOUAction(CONST.IOU.REPORT_ACTION_TYPE.CREATE)],
            transactions: [makeTransaction(100), makeTransaction(-50)],
        });

        expect(result).toBeUndefined();
    });

    it('returns undefined for multi-sender: multiple attendees', () => {
        // Two transactions with different attendees (different emails resolve to different accountIDs)
        // Since getPersonalDetailByEmail returns undefined in test (no Onyx), attendeesIDs will be filtered out
        // and the set size will be 0, which is <= 1, so we need to use splits to create multiple attendees
        const splitTr1: Transaction = {
            transactionID: 'tr-1',
            amount: 100,
            comment: {
                source: CONST.IOU.TYPE.SPLIT,
                originalTransactionID: 'orig-1',
                attendees: [{email: 'user1@test.com'}],
            },
        } as Transaction;

        const splitTr2: Transaction = {
            transactionID: 'tr-2',
            amount: 100,
            comment: {
                source: CONST.IOU.TYPE.SPLIT,
                originalTransactionID: 'orig-2',
                attendees: [{email: 'user2@test.com'}],
            },
        } as Transaction;

        const splits = [
            {
                reportActionID: 'split-1',
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                actorAccountID: 10,
                originalMessage: {
                    type: CONST.IOU.REPORT_ACTION_TYPE.SPLIT,
                    IOUTransactionID: 'orig-1',
                    amount: 100,
                    currency: 'USD',
                },
            } as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU>,
            {
                reportActionID: 'split-2',
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                actorAccountID: 20,
                originalMessage: {
                    type: CONST.IOU.REPORT_ACTION_TYPE.SPLIT,
                    IOUTransactionID: 'orig-2',
                    amount: 100,
                    currency: 'USD',
                },
            } as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU>,
        ];

        const result = getReportPreviewSenderID({
            ...baseParams,
            iouReport: makeIOUReport(),
            action: makeAction(),
            iouActions: [makeIOUAction(CONST.IOU.REPORT_ACTION_TYPE.CREATE)],
            transactions: [splitTr1, splitTr2],
            splits,
        });

        expect(result).toBeUndefined();
    });

    it('returns childOwnerAccountID for split transaction with single author', () => {
        const splitTr: Transaction = {
            transactionID: 'tr-1',
            amount: 100,
            comment: {
                source: CONST.IOU.TYPE.SPLIT,
                originalTransactionID: 'orig-1',
                attendees: [{email: 'user1@test.com'}],
            },
        } as Transaction;

        const splits = [
            {
                reportActionID: 'split-1',
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                actorAccountID: 10,
                originalMessage: {
                    type: CONST.IOU.REPORT_ACTION_TYPE.SPLIT,
                    IOUTransactionID: 'orig-1',
                    amount: 100,
                    currency: 'USD',
                },
            } as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU>,
        ];

        const result = getReportPreviewSenderID({
            ...baseParams,
            iouReport: makeIOUReport(),
            action: makeAction(),
            iouActions: [makeIOUAction(CONST.IOU.REPORT_ACTION_TYPE.CREATE)],
            transactions: [splitTr],
            splits,
        });

        expect(result).toBe(OWNER_ACCOUNT_ID);
    });

    it('returns sender ID when no transactions (empty set has size 0 < 2)', () => {
        const result = getReportPreviewSenderID({
            ...baseParams,
            iouReport: makeIOUReport(),
            action: makeAction(),
            iouActions: [makeIOUAction(CONST.IOU.REPORT_ACTION_TYPE.CREATE)],
            transactions: [],
        });

        expect(result).toBe(OWNER_ACCOUNT_ID);
    });
});
