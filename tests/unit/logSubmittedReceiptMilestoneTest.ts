import {WRITE_COMMANDS} from '@libs/API/types';

import logSubmittedReceiptMilestone from '@pages/iou/request/step/confirmation/submission/utils/logSubmittedReceiptMilestone';

import CONST from '@src/CONST';
import type {ReportAction} from '@src/types/onyx';
import type {Receipt} from '@src/types/onyx/Transaction';
import type Transaction from '@src/types/onyx/Transaction';

import createRandomTransaction from '../utils/collections/transaction';
import createMock from '../utils/createMock';

const mockLogReceiptSubmitted = jest.fn();

jest.mock('@libs/telemetry/ReceiptObservability', () => ({
    ...jest.requireActual<Record<string, unknown>>('@libs/telemetry/ReceiptObservability'),
    logReceiptSubmitted: (...args: unknown[]) => mockLogReceiptSubmitted(...args) as unknown,
}));

const DRAFT_TRANSACTION_ID = '1';
const OPTIMISTIC_TRANSACTION_ID = 'optimistic1';
const TRACKED_TRANSACTION_ID = 'tracked1';
const RECEIPT_TRACE_ID = 'trace1';

const RECEIPT_WITH_TRACE: Receipt = {source: 'file://receipt.jpg', receiptTraceId: RECEIPT_TRACE_ID};

function buildTransaction(overrides: Partial<Transaction> = {}): Transaction {
    return {...createRandomTransaction(Number(DRAFT_TRANSACTION_ID)), linkedTrackedExpenseReportAction: undefined, ...overrides};
}

describe('logSubmittedReceiptMilestone', () => {
    beforeEach(() => {
        mockLogReceiptSubmitted.mockClear();
    });

    it('does not log when the expense has no receipt', () => {
        // Given an expense submitted without a receipt
        const item = buildTransaction();

        // When the submitted milestone is logged
        logSubmittedReceiptMilestone({item, receipt: undefined, optimisticTransactionID: OPTIMISTIC_TRANSACTION_ID, command: WRITE_COMMANDS.REQUEST_MONEY, iouType: CONST.IOU.TYPE.SUBMIT});

        // Then nothing is logged, since there is no receipt to trace
        expect(mockLogReceiptSubmitted).not.toHaveBeenCalled();
    });

    it('does not log when the receipt has no trace ID', () => {
        // Given an expense whose receipt was never assigned a trace ID
        const item = buildTransaction();

        // When the submitted milestone is logged
        logSubmittedReceiptMilestone({
            item,
            receipt: {source: 'file://receipt.jpg'},
            optimisticTransactionID: OPTIMISTIC_TRANSACTION_ID,
            command: WRITE_COMMANDS.REQUEST_MONEY,
            iouType: CONST.IOU.TYPE.SUBMIT,
        });

        // Then nothing is logged, because the milestone could not be tied to the receipt's earlier events
        expect(mockLogReceiptSubmitted).not.toHaveBeenCalled();
    });

    it('logs the optimistic transaction ID for a new expense', () => {
        // Given a new expense with a traced receipt
        const item = buildTransaction();

        // When the submitted milestone is logged
        logSubmittedReceiptMilestone({
            item,
            receipt: RECEIPT_WITH_TRACE,
            optimisticTransactionID: OPTIMISTIC_TRANSACTION_ID,
            command: WRITE_COMMANDS.REQUEST_MONEY,
            iouType: CONST.IOU.TYPE.SUBMIT,
        });

        // Then the milestone links the draft to the optimistic transaction created on submit
        expect(mockLogReceiptSubmitted).toHaveBeenCalledWith({
            receiptTraceId: RECEIPT_TRACE_ID,
            draftTransactionID: DRAFT_TRANSACTION_ID,
            transactionID: OPTIMISTIC_TRANSACTION_ID,
            command: WRITE_COMMANDS.REQUEST_MONEY,
            iouType: CONST.IOU.TYPE.SUBMIT,
        });
    });

    it('logs the tracked transaction ID when a tracked expense is moved', () => {
        // Given a tracked expense with a traced receipt being submitted to a workspace
        const item = buildTransaction({
            linkedTrackedExpenseReportAction: createMock<ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU>>({
                reportActionID: 'trackedAction1',
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                created: '',
                originalMessage: {
                    IOUTransactionID: TRACKED_TRANSACTION_ID,
                    type: CONST.IOU.REPORT_ACTION_TYPE.TRACK,
                },
            }),
        });

        // When the submitted milestone is logged
        logSubmittedReceiptMilestone({
            item,
            receipt: RECEIPT_WITH_TRACE,
            optimisticTransactionID: OPTIMISTIC_TRANSACTION_ID,
            command: WRITE_COMMANDS.CONVERT_TRACKED_EXPENSE_TO_REQUEST,
            iouType: CONST.IOU.TYPE.SUBMIT,
        });

        // Then the milestone uses the tracked transaction's ID, since moving a tracked expense reuses it instead of the optimistic one
        expect(mockLogReceiptSubmitted).toHaveBeenCalledWith(expect.objectContaining({transactionID: TRACKED_TRANSACTION_ID}));
    });
});
