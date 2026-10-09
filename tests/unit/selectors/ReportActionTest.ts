import CONST from '@src/CONST';
import type {ReportAction, ReportActions} from '@src/types/onyx';

import {getLatestFeedbackActionIDByAuthorSelector, getReceiptScanFailedIOUActionDataSelector} from '@selectors/ReportAction';

const CURRENT_USER_ACCOUNT_ID = 123456789;
const OTHER_USER_ACCOUNT_ID = 987654321;
const TRANSACTION_ID = 'txn123';
const OTHER_TRANSACTION_ID = 'txn456';

const createIOUAction = (reportActionID: string, overrides: Partial<ReportAction> = {}): ReportAction => ({
    reportActionID,
    actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
    actorAccountID: CURRENT_USER_ACCOUNT_ID,
    created: '2025-01-01 00:00:00.000',
    message: [{type: 'COMMENT', html: '', text: ''}],
    originalMessage: {
        type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
        amount: 100,
        currency: 'USD',
        IOUTransactionID: TRANSACTION_ID,
    },
    ...overrides,
});

describe('getReceiptScanFailedIOUActionDataSelector', () => {
    it('returns undefined transactionID and actorAccountID when reportActions is undefined', () => {
        expect(getReceiptScanFailedIOUActionDataSelector(undefined, false, 'iou1', 'thread1')).toEqual({
            transactionID: undefined,
            actorAccountID: undefined,
        });
    });

    it('returns transactionID and actorAccountID for the IOU action matching parentReportActionID on a transaction thread report', () => {
        const reportActions: ReportActions = {
            iou1: createIOUAction('iou1'),
            other: createIOUAction('other', {
                childReportID: 'thread1',
                originalMessage: {
                    type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                    amount: 100,
                    currency: 'USD',
                    IOUTransactionID: OTHER_TRANSACTION_ID,
                },
            }),
        };

        expect(getReceiptScanFailedIOUActionDataSelector(reportActions, false, 'iou1', 'thread1')).toEqual({
            transactionID: TRANSACTION_ID,
            actorAccountID: CURRENT_USER_ACCOUNT_ID,
        });
    });

    it('skips parentReportActionID lookup when the report is an IOU report', () => {
        const reportActions: ReportActions = {
            parentIOU: createIOUAction('parentIOU'),
            childMatch: createIOUAction('childMatch', {
                childReportID: 'thread1',
                originalMessage: {
                    type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                    amount: 100,
                    currency: 'USD',
                    IOUTransactionID: OTHER_TRANSACTION_ID,
                },
            }),
        };

        expect(getReceiptScanFailedIOUActionDataSelector(reportActions, true, 'parentIOU', 'thread1')).toEqual({
            transactionID: OTHER_TRANSACTION_ID,
            actorAccountID: CURRENT_USER_ACCOUNT_ID,
        });
    });

    it('falls back to childReportID match when parentReportActionID does not point to an IOU action', () => {
        const reportActions: ReportActions = {
            comment1: createIOUAction('comment1', {actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT}),
            iou1: createIOUAction('iou1', {childReportID: 'thread1'}),
        };

        expect(getReceiptScanFailedIOUActionDataSelector(reportActions, false, 'comment1', 'thread1')).toEqual({
            transactionID: TRANSACTION_ID,
            actorAccountID: CURRENT_USER_ACCOUNT_ID,
        });
    });

    it('returns transactionID and actorAccountID for the IOU action whose childReportID matches actionReportID', () => {
        const reportActions: ReportActions = {
            iou1: createIOUAction('iou1', {childReportID: 'thread1'}),
            iou2: createIOUAction('iou2', {
                childReportID: 'thread2',
                originalMessage: {
                    type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                    amount: 100,
                    currency: 'USD',
                    IOUTransactionID: OTHER_TRANSACTION_ID,
                },
            }),
        };

        expect(getReceiptScanFailedIOUActionDataSelector(reportActions, true, undefined, 'thread1')).toEqual({
            transactionID: TRANSACTION_ID,
            actorAccountID: CURRENT_USER_ACCOUNT_ID,
        });
    });

    it('returns transactionID and actorAccountID for the only IOU action on one-transaction reports', () => {
        const reportActions: ReportActions = {iou1: createIOUAction('iou1')};

        expect(getReceiptScanFailedIOUActionDataSelector(reportActions, true, undefined, undefined)).toEqual({
            transactionID: TRANSACTION_ID,
            actorAccountID: CURRENT_USER_ACCOUNT_ID,
        });
    });

    it('returns undefined transactionID and actorAccountID when multiple IOU actions exist and none match actionReportID', () => {
        const reportActions: ReportActions = {
            iou1: createIOUAction('iou1', {childReportID: 'thread1'}),
            iou2: createIOUAction('iou2', {childReportID: 'thread2'}),
        };

        expect(getReceiptScanFailedIOUActionDataSelector(reportActions, true, undefined, 'thread3')).toEqual({
            transactionID: undefined,
            actorAccountID: undefined,
        });
    });

    it('returns undefined transactionID and actorAccountID when no IOU actions exist', () => {
        const reportActions: ReportActions = {
            comment1: createIOUAction('comment1', {actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT}),
        };

        expect(getReceiptScanFailedIOUActionDataSelector(reportActions, false, 'comment1', 'thread1')).toEqual({
            transactionID: undefined,
            actorAccountID: undefined,
        });
    });

    it('returns actorAccountID for the matched IOU action when it belongs to another user', () => {
        const reportActions: ReportActions = {
            iou1: createIOUAction('iou1', {actorAccountID: OTHER_USER_ACCOUNT_ID}),
        };

        expect(getReceiptScanFailedIOUActionDataSelector(reportActions, false, 'iou1', 'thread1')).toEqual({
            transactionID: TRANSACTION_ID,
            actorAccountID: OTHER_USER_ACCOUNT_ID,
        });
    });
});

describe('getLatestFeedbackActionIDByAuthorSelector', () => {
    const AGENT_ACCOUNT_ID = 1001;

    const createComment = (reportActionID: string, actorAccountID: number, created: string): ReportAction => ({
        reportActionID,
        actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
        actorAccountID,
        created,
        message: [{type: 'COMMENT', html: 'hi', text: 'hi'}],
        originalMessage: {html: 'hi', whisperedTo: []},
    });

    const reportActions: ReportActions = {
        concierge: createComment('concierge', CONST.ACCOUNT_ID.CONCIERGE, '2026-09-01 00:00:00.000'),
        olderAgent: createComment('olderAgent', AGENT_ACCOUNT_ID, '2026-09-02 00:00:00.000'),
        newerAgent: createComment('newerAgent', AGENT_ACCOUNT_ID, '2026-09-03 00:00:00.000'),
    };

    it('returns the newest comment of the given author', () => {
        // Given a parent report where a custom agent wrote twice after Concierge
        // When the selector runs for the agent
        // Then it picks the agent's newest comment, and Concierge's comment does not count for the agent
        expect(getLatestFeedbackActionIDByAuthorSelector(AGENT_ACCOUNT_ID)(reportActions)).toBe('newerAgent');
    });

    it('returns undefined when the author is not known', () => {
        // Given a parent action whose author is not loaded yet
        // When the selector runs without an author
        // Then it returns nothing, so the selector does not fall back to Concierge's newest comment
        expect(getLatestFeedbackActionIDByAuthorSelector(undefined)(reportActions)).toBeUndefined();
    });
});
