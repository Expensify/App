import {getReceiptScanFailedIouActionDataSelector} from '@selectors/ReportAction';
import Onyx from 'react-native-onyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction, ReportActions} from '@src/types/onyx';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const CURRENT_USER_ACCOUNT_ID = 123456789;
const OTHER_USER_ACCOUNT_ID = 987654321;
const TRANSACTION_ID = 'txn123';
const OTHER_TRANSACTION_ID = 'txn456';

const createIouAction = (reportActionID: string, overrides: Partial<ReportAction> = {}): ReportAction => ({
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

describe('getReceiptScanFailedIouActionDataSelector', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        return Onyx.merge(ONYXKEYS.SESSION, {accountID: CURRENT_USER_ACCOUNT_ID}).then(() => waitForBatchedUpdates());
    });

    it('returns undefined transactionID and canEdit false when reportActions is undefined', () => {
        expect(getReceiptScanFailedIouActionDataSelector(undefined, false, 'iou1', 'thread1')).toEqual({
            transactionID: undefined,
            canEdit: false,
        });
    });

    it('returns transactionID and canEdit for the IOU action matching parentReportActionID on a transaction thread report', () => {
        const reportActions: ReportActions = {
            iou1: createIouAction('iou1'),
            other: createIouAction('other', {
                childReportID: 'thread1',
                originalMessage: {
                    type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                    amount: 100,
                    currency: 'USD',
                    IOUTransactionID: OTHER_TRANSACTION_ID,
                },
            }),
        };

        expect(getReceiptScanFailedIouActionDataSelector(reportActions, false, 'iou1', 'thread1')).toEqual({
            transactionID: TRANSACTION_ID,
            canEdit: true,
        });
    });

    it('skips parentReportActionID lookup when the report is an IOU report', () => {
        const reportActions: ReportActions = {
            parentIou: createIouAction('parentIou'),
            childMatch: createIouAction('childMatch', {
                childReportID: 'thread1',
                originalMessage: {
                    type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                    amount: 100,
                    currency: 'USD',
                    IOUTransactionID: OTHER_TRANSACTION_ID,
                },
            }),
        };

        expect(getReceiptScanFailedIouActionDataSelector(reportActions, true, 'parentIou', 'thread1')).toEqual({
            transactionID: OTHER_TRANSACTION_ID,
            canEdit: true,
        });
    });

    it('falls back to childReportID match when parentReportActionID does not point to an IOU action', () => {
        const reportActions: ReportActions = {
            comment1: createIouAction('comment1', {actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT}),
            iou1: createIouAction('iou1', {childReportID: 'thread1'}),
        };

        expect(getReceiptScanFailedIouActionDataSelector(reportActions, false, 'comment1', 'thread1')).toEqual({
            transactionID: TRANSACTION_ID,
            canEdit: true,
        });
    });

    it('returns transactionID and canEdit for the IOU action whose childReportID matches actionReportID', () => {
        const reportActions: ReportActions = {
            iou1: createIouAction('iou1', {childReportID: 'thread1'}),
            iou2: createIouAction('iou2', {
                childReportID: 'thread2',
                originalMessage: {
                    type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                    amount: 100,
                    currency: 'USD',
                    IOUTransactionID: OTHER_TRANSACTION_ID,
                },
            }),
        };

        expect(getReceiptScanFailedIouActionDataSelector(reportActions, true, undefined, 'thread1')).toEqual({
            transactionID: TRANSACTION_ID,
            canEdit: true,
        });
    });

    it('returns transactionID and canEdit for the only IOU action on one-transaction reports', () => {
        const reportActions: ReportActions = {iou1: createIouAction('iou1')};

        expect(getReceiptScanFailedIouActionDataSelector(reportActions, true, undefined, undefined)).toEqual({
            transactionID: TRANSACTION_ID,
            canEdit: true,
        });
    });

    it('returns undefined transactionID and canEdit false when multiple IOU actions exist and none match actionReportID', () => {
        const reportActions: ReportActions = {
            iou1: createIouAction('iou1', {childReportID: 'thread1'}),
            iou2: createIouAction('iou2', {childReportID: 'thread2'}),
        };

        expect(getReceiptScanFailedIouActionDataSelector(reportActions, true, undefined, 'thread3')).toEqual({
            transactionID: undefined,
            canEdit: false,
        });
    });

    it('returns undefined transactionID and canEdit false when no IOU actions exist', () => {
        const reportActions: ReportActions = {
            comment1: createIouAction('comment1', {actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT}),
        };

        expect(getReceiptScanFailedIouActionDataSelector(reportActions, false, 'comment1', 'thread1')).toEqual({
            transactionID: undefined,
            canEdit: false,
        });
    });

    it('returns canEdit false when the matched IOU action belongs to another user', () => {
        const reportActions: ReportActions = {
            iou1: createIouAction('iou1', {actorAccountID: OTHER_USER_ACCOUNT_ID}),
        };

        expect(getReceiptScanFailedIouActionDataSelector(reportActions, false, 'iou1', 'thread1')).toEqual({
            transactionID: TRANSACTION_ID,
            canEdit: false,
        });
    });
});
