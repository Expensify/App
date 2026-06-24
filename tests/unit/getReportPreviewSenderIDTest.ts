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

    it('returns childOwnerAccountID when all transactions map to IOU actions from the same actor', () => {
        const transaction1 = makeTransaction(100, 'user1@test.com', {transactionID: '123'});
        const transaction2 = makeTransaction(200, 'user1@test.com', {transactionID: '321'});

        const result = getReportPreviewSenderID({
            ...baseParams,
            iouReport: makeIOUReport(),
            action: makeAction({childMoneyRequestCount: 2}),
            iouActions: [
                makeIOUAction(CONST.IOU.REPORT_ACTION_TYPE.CREATE, {
                    actorAccountID: 10,
                    originalMessage: {
                        type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                        IOUTransactionID: '123',
                        amount: 100,
                        currency: 'USD',
                    },
                }),
                makeIOUAction(CONST.IOU.REPORT_ACTION_TYPE.CREATE, {
                    actorAccountID: 10,
                    originalMessage: {
                        type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                        IOUTransactionID: '321',
                        amount: 200,
                        currency: 'USD',
                    },
                }),
            ],
            transactions: [transaction1, transaction2],
        });

        expect(result).toBe(OWNER_ACCOUNT_ID);
    });

    it('returns undefined when transactions map to IOU actions from different actors', () => {
        const transaction1 = makeTransaction(100, 'user1@test.com', {transactionID: '123'});
        const transaction2 = makeTransaction(200, 'user1@test.com', {transactionID: '321'});

        const result = getReportPreviewSenderID({
            ...baseParams,
            iouReport: makeIOUReport(),
            action: makeAction({childMoneyRequestCount: 2}),
            iouActions: [
                makeIOUAction(CONST.IOU.REPORT_ACTION_TYPE.CREATE, {
                    actorAccountID: 10,
                    originalMessage: {
                        type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                        IOUTransactionID: '123',
                        amount: 100,
                        currency: 'USD',
                    },
                }),
                makeIOUAction(CONST.IOU.REPORT_ACTION_TYPE.CREATE, {
                    actorAccountID: 20,
                    originalMessage: {
                        type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                        IOUTransactionID: '321',
                        amount: 200,
                        currency: 'USD',
                    },
                }),
            ],
            transactions: [transaction1, transaction2],
        });

        expect(result).toBeUndefined();
    });

    it('returns childManagerAccountID for send money flow (all iouActions are sentMoney)', () => {
        const sentMoneyAction = makeIOUAction(CONST.IOU.REPORT_ACTION_TYPE.PAY, {
            originalMessage: {
                type: CONST.IOU.REPORT_ACTION_TYPE.PAY,
                IOUDetails: {amount: 100, comment: '', currency: 'USD'},
                IOUTransactionID: '111',
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

    it('returns childOwnerAccountID for a zero-amount scan request when modifiedAmount reveals the direction', () => {
        const result = getReportPreviewSenderID({
            ...baseParams,
            iouReport: makeIOUReport(),
            action: makeAction(),
            iouActions: [],
            transactions: [
                makeTransaction(0, 'user@test.com', {
                    modifiedAmount: 100,
                    receipt: {source: 'receipt.jpg'},
                }),
            ],
        });

        expect(result).toBe(OWNER_ACCOUNT_ID);
    });

    it('returns childOwnerAccountID after cache clear when a receipt-backed transaction is rehydrated as manual but modifiedAmount reveals the direction', () => {
        const result = getReportPreviewSenderID({
            ...baseParams,
            iouReport: makeIOUReport({transactionCount: 2}),
            action: makeAction({childMoneyRequestCount: 2}),
            iouActions: [],
            transactions: [
                makeTransaction(1200, 'user@test.com', {transactionID: '567'}),
                makeTransaction(0, 'user@test.com', {
                    transactionID: '890',
                    iouRequestType: CONST.IOU.REQUEST_TYPE.MANUAL,
                    modifiedAmount: 50000,
                    modifiedCreated: '2021-03-18 00:00:00',
                    modifiedCurrency: 'INR',
                    modifiedMerchant: 'merchant',
                    receipt: {source: 'receipt.jpg'},
                }),
            ],
        });

        expect(result).toBe(OWNER_ACCOUNT_ID);
    });

    it('returns childOwnerAccountID when a pending scan belongs to the same sender as the hydrated transactions', () => {
        const result = getReportPreviewSenderID({
            ...baseParams,
            iouReport: makeIOUReport({transactionCount: 3}),
            action: makeAction({childMoneyRequestCount: 3, childLastActorAccountID: 10}),
            iouActions: [
                makeIOUAction(CONST.IOU.REPORT_ACTION_TYPE.CREATE, {
                    actorAccountID: 10,
                    originalMessage: {
                        type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                        IOUTransactionID: '111',
                        amount: 100,
                        currency: 'USD',
                    },
                }),
                makeIOUAction(CONST.IOU.REPORT_ACTION_TYPE.CREATE, {
                    actorAccountID: 10,
                    originalMessage: {
                        type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                        IOUTransactionID: '222',
                        amount: 100,
                        currency: 'USD',
                    },
                }),
            ],
            transactions: [
                makeTransaction(1200, 'user@test.com', {transactionID: '111'}),
                makeTransaction(0, 'user@test.com', {transactionID: '222', modifiedAmount: 50000, receipt: {source: 'receipt.jpg'}}),
                makeTransaction(0, 'user@test.com', {
                    transactionID: '333',
                    receipt: {source: 'receipt.jpg', state: CONST.IOU.RECEIPT_STATE.SCANNING},
                }),
            ],
        });

        expect(result).toBe(OWNER_ACCOUNT_ID);
    });

    it('returns undefined when a pending scan belongs to a different sender than the hydrated transactions', () => {
        const result = getReportPreviewSenderID({
            ...baseParams,
            iouReport: makeIOUReport({transactionCount: 3}),
            action: makeAction({childMoneyRequestCount: 3, childLastActorAccountID: 20}),
            iouActions: [
                makeIOUAction(CONST.IOU.REPORT_ACTION_TYPE.CREATE, {
                    actorAccountID: 10,
                    originalMessage: {
                        type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                        IOUTransactionID: '111',
                        amount: 100,
                        currency: 'USD',
                    },
                }),
                makeIOUAction(CONST.IOU.REPORT_ACTION_TYPE.CREATE, {
                    actorAccountID: 10,
                    originalMessage: {
                        type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                        IOUTransactionID: '222',
                        amount: 100,
                        currency: 'USD',
                    },
                }),
            ],
            transactions: [
                makeTransaction(1200, 'user@test.com', {transactionID: '111'}),
                makeTransaction(0, 'user@test.com', {transactionID: '222', modifiedAmount: 50000, receipt: {source: 'receipt.jpg'}}),
                makeTransaction(0, 'user@test.com', {
                    transactionID: '333',
                    receipt: {source: 'receipt.jpg', state: CONST.IOU.RECEIPT_STATE.SCANNING},
                }),
            ],
        });

        expect(result).toBeUndefined();
    });

    it('returns undefined when chatReport last actor shows the pending scan belongs to the other participant', () => {
        const dmChat: Report = {
            reportID: 'dm-1',
            type: CONST.REPORT.TYPE.CHAT,
            lastActorAccountID: MANAGER_ACCOUNT_ID,
            participants: {
                [OWNER_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                [MANAGER_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
            },
        } as Report;

        const result = getReportPreviewSenderID({
            ...baseParams,
            chatReport: dmChat,
            iouReport: makeIOUReport({transactionCount: 2, ownerAccountID: OWNER_ACCOUNT_ID, managerID: MANAGER_ACCOUNT_ID}),
            action: makeAction({childMoneyRequestCount: 2, childLastActorAccountID: OWNER_ACCOUNT_ID}),
            iouActions: [
                makeIOUAction(CONST.IOU.REPORT_ACTION_TYPE.CREATE, {
                    actorAccountID: OWNER_ACCOUNT_ID,
                    originalMessage: {
                        type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                        IOUTransactionID: '111',
                        amount: 100,
                        currency: 'USD',
                    },
                }),
            ],
            transactions: [
                makeTransaction(1200, 'user@test.com', {transactionID: '111'}),
                makeTransaction(0, 'user@test.com', {
                    transactionID: '222',
                    receipt: {source: 'receipt.jpg', state: CONST.IOU.RECEIPT_STATE.SCANNING},
                }),
            ],
        });

        expect(result).toBeUndefined();
    });

    it('returns undefined when a pending scan actor conflicts with the manual transaction direction actor', () => {
        const result = getReportPreviewSenderID({
            ...baseParams,
            iouReport: makeIOUReport({transactionCount: 2, ownerAccountID: OWNER_ACCOUNT_ID, managerID: MANAGER_ACCOUNT_ID}),
            action: makeAction({
                childMoneyRequestCount: 2,
                childOwnerAccountID: OWNER_ACCOUNT_ID,
                childManagerAccountID: MANAGER_ACCOUNT_ID,
            }),
            iouActions: [
                makeIOUAction(CONST.IOU.REPORT_ACTION_TYPE.CREATE, {
                    actorAccountID: MANAGER_ACCOUNT_ID,
                    originalMessage: {
                        type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                        IOUTransactionID: '222',
                        amount: 0,
                        currency: 'USD',
                    },
                }),
            ],
            transactions: [
                makeTransaction(1200, 'user@test.com', {
                    transactionID: '111',
                }),
                makeTransaction(0, 'user@test.com', {
                    transactionID: '222',
                    receipt: {source: 'receipt.jpg', state: CONST.IOU.RECEIPT_STATE.SCAN_READY},
                }),
            ],
        });

        expect(result).toBeUndefined();
    });

    it('returns undefined when the report preview has not loaded all child transactions yet', () => {
        const result = getReportPreviewSenderID({
            ...baseParams,
            iouReport: makeIOUReport(),
            action: makeAction({childMoneyRequestCount: 2}),
            iouActions: [],
            transactions: [makeTransaction(100)],
        });

        expect(result).toBeUndefined();
    });

    it('returns childOwnerAccountID when a deleted expense keeps childMoneyRequestCount stale', () => {
        const result = getReportPreviewSenderID({
            ...baseParams,
            iouReport: makeIOUReport({transactionCount: 1}),
            action: makeAction({childMoneyRequestCount: 2}),
            iouActions: [
                makeIOUAction(CONST.IOU.REPORT_ACTION_TYPE.CREATE, {
                    actorAccountID: 10,
                    originalMessage: {
                        type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                        IOUTransactionID: '987654321012345678',
                        amount: 100,
                        currency: 'USD',
                    },
                }),
                makeIOUAction(CONST.IOU.REPORT_ACTION_TYPE.CREATE, {
                    actorAccountID: 20,
                    originalMessage: {
                        type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                        IOUTransactionID: '987654321012345679',
                        amount: 100,
                        currency: 'USD',
                        deleted: '2026-04-11 07:12:23.697',
                    },
                    message: [{type: 'COMMENT', text: 'Deleted expense', deleted: '2026-04-11 07:12:23.697'}],
                }),
            ],
            transactions: [makeTransaction(100, 'user@test.com', {transactionID: '987654321012345678'})],
        });

        expect(result).toBe(OWNER_ACCOUNT_ID);
    });

    it('returns childOwnerAccountID when iouReport.transactionCount is lower than stale childMoneyRequestCount after deletion', () => {
        const result = getReportPreviewSenderID({
            ...baseParams,
            iouReport: makeIOUReport({transactionCount: 1}),
            action: makeAction({childMoneyRequestCount: 5}),
            iouActions: [
                makeIOUAction(CONST.IOU.REPORT_ACTION_TYPE.CREATE, {
                    actorAccountID: 10,
                    originalMessage: {
                        type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                        IOUTransactionID: '444',
                        amount: 100,
                        currency: 'USD',
                    },
                }),
                makeIOUAction(CONST.IOU.REPORT_ACTION_TYPE.CREATE, {
                    actorAccountID: 20,
                    originalMessage: {
                        type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                        deleted: '2026-04-12 04:48:48.212',
                        amount: 100,
                        currency: 'USD',
                    },
                    message: [{type: 'COMMENT', text: '', deleted: '2026-04-12 04:48:48.212'}],
                }),
            ],
            transactions: [makeTransaction(100, 'user@test.com', {transactionID: '444'})],
        });

        expect(result).toBe(OWNER_ACCOUNT_ID);
    });

    it('returns undefined for multi-sender: multiple attendees', () => {
        // Two transactions with different attendees (different emails resolve to different accountIDs)
        // Since getPersonalDetailByEmail returns undefined in test (no Onyx), attendeesIDs will be filtered out
        // and the set size will be 0, which is <= 1, so we need to use splits to create multiple attendees
        const splitTr1: Transaction = {
            transactionID: '111',
            amount: 100,
            comment: {
                source: CONST.IOU.TYPE.SPLIT,
                originalTransactionID: 'orig-1',
                attendees: [{email: 'user1@test.com'}],
            },
        } as Transaction;

        const splitTr2: Transaction = {
            transactionID: '222',
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
            transactionID: '111',
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

    it('returns undefined when transactions have not loaded yet for a money request preview', () => {
        const result = getReportPreviewSenderID({
            ...baseParams,
            iouReport: makeIOUReport(),
            action: makeAction(),
            iouActions: [makeIOUAction(CONST.IOU.REPORT_ACTION_TYPE.CREATE)],
            transactions: [],
        });

        expect(result).toBeUndefined();
    });

    it('ignores attendees with undefined email without crashing', () => {
        const result = getReportPreviewSenderID({
            ...baseParams,
            iouReport: makeIOUReport(),
            action: makeAction(),
            iouActions: [makeIOUAction(CONST.IOU.REPORT_ACTION_TYPE.CREATE)],
            transactions: [
                makeTransaction(100, 'user@test.com', {
                    comment: {
                        attendees: [{avatarUrl: '', displayName: 'Login Only User'}],
                    },
                }),
            ],
        });

        expect(result).toBe(OWNER_ACCOUNT_ID);
    });
});
