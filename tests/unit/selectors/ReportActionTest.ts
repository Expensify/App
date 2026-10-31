import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction, ReportActions} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

import {getLatestFeedbackActionIDByAuthorSelector, getReceiptScanFailedIOUActionDataSelector, relatedReportActionsErrorFieldsSelector} from '@selectors/ReportAction';

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

describe('relatedReportActionsErrorFieldsSelector', () => {
    const THREAD_REPORT_ID = 'thread1';
    const PARENT_REPORT_ID = 'parent1';
    const CHAT_REPORT_ID = 'chat1';
    const UNRELATED_REPORT_ID = 'unrelated1';
    const ERRORED_THREAD_REPORT_ID = 'erroredThread1';
    const CLEAN_THREAD_REPORT_ID = 'cleanThread1';

    const reportActionsKey = (reportID: string) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}` as const;

    it('should return the actions of the listed reports projected to the error fields, and nothing else', () => {
        // Given actions for a thread, its parent and an unrelated report, where the parent action carries fields the error clearing never reads
        const parentAction = createIOUAction('iou1', {childReportID: THREAD_REPORT_ID, errors: {error1: 'Error message'}, person: [{type: 'TEXT', text: 'Jane'}]});
        const reportActions: OnyxCollection<ReportActions> = {
            [reportActionsKey(THREAD_REPORT_ID)]: {comment1: createIOUAction('comment1')},
            [reportActionsKey(PARENT_REPORT_ID)]: {iou1: parentAction},
            [reportActionsKey(UNRELATED_REPORT_ID)]: {iou2: createIOUAction('iou2')},
        };

        // When the selector is applied for the thread and its parent without a child root
        const result = relatedReportActionsErrorFieldsSelector([THREAD_REPORT_ID, PARENT_REPORT_ID], undefined)(reportActions);

        // Then only the listed reports are returned, so unrelated report action writes cannot change the result
        expect(Object.keys(result ?? {})).toEqual([reportActionsKey(THREAD_REPORT_ID), reportActionsKey(PARENT_REPORT_ID)]);

        // Then each action keeps the fields the walk and its helpers read, and drops the rest so unrelated action updates compare equal
        const projectedParentAction = result?.[reportActionsKey(PARENT_REPORT_ID)]?.iou1;
        expect(projectedParentAction).toEqual({
            reportActionID: 'iou1',
            actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
            created: parentAction.created,
            pendingAction: undefined,
            isOptimisticAction: undefined,
            childReportID: THREAD_REPORT_ID,
            errors: parentAction.errors,
            message: parentAction.message,
            // The projection intentionally preserves the deprecated raw field so getOriginalMessage can resolve it downstream
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            originalMessage: parentAction.originalMessage,
        });
        expect(projectedParentAction).not.toHaveProperty('person');
        expect(projectedParentAction).not.toHaveProperty('actorAccountID');
    });

    it('should follow threads below the child root only through actions that have errors', () => {
        // Given a child root that is also one of the listed reports, holding an errored action with a thread and a clean action with a thread
        const reportActions: OnyxCollection<ReportActions> = {
            [reportActionsKey(THREAD_REPORT_ID)]: {
                errored1: createIOUAction('errored1', {childReportID: ERRORED_THREAD_REPORT_ID, errors: {error1: 'Error message'}}),
                clean1: createIOUAction('clean1', {childReportID: CLEAN_THREAD_REPORT_ID}),
            },
            [reportActionsKey(ERRORED_THREAD_REPORT_ID)]: {reply1: createIOUAction('reply1')},
            [reportActionsKey(CLEAN_THREAD_REPORT_ID)]: {reply2: createIOUAction('reply2')},
        };

        // When the selector is applied with the thread both listed and used as the child root
        const result = relatedReportActionsErrorFieldsSelector([THREAD_REPORT_ID], THREAD_REPORT_ID)(reportActions);

        // Then the thread hanging off the errored action is included, since the walk recurses into it, while the clean action's thread is not
        expect(Object.keys(result ?? {}).sort()).toEqual([reportActionsKey(ERRORED_THREAD_REPORT_ID), reportActionsKey(THREAD_REPORT_ID)].sort());
    });

    it('should skip missing and undefined report IDs and terminate when thread links form a cycle', () => {
        // Given two errored actions whose threads point back at each other, a parent report that is not loaded and an undefined original report ID
        const reportActions: OnyxCollection<ReportActions> = {
            [reportActionsKey(THREAD_REPORT_ID)]: {errored1: createIOUAction('errored1', {childReportID: CHAT_REPORT_ID, errors: {error1: 'Error message'}})},
            [reportActionsKey(CHAT_REPORT_ID)]: {errored2: createIOUAction('errored2', {childReportID: THREAD_REPORT_ID, errors: {error1: 'Error message'}})},
        };

        // When the selector is applied with the cycle reachable from the child root
        const result = relatedReportActionsErrorFieldsSelector([THREAD_REPORT_ID, PARENT_REPORT_ID, undefined], THREAD_REPORT_ID)(reportActions);

        // Then both reports in the cycle are returned once, the unloaded report is left out and the selector returns instead of hanging
        expect(Object.keys(result ?? {}).sort()).toEqual([reportActionsKey(CHAT_REPORT_ID), reportActionsKey(THREAD_REPORT_ID)].sort());
    });
});
