import {getExistingTransactionID} from '@libs/IOUUtils';
import {logReceiptSubmitted} from '@libs/telemetry/ReceiptObservability';

import type CONST from '@src/CONST';
import type {Receipt} from '@src/types/onyx/Transaction';
import type Transaction from '@src/types/onyx/Transaction';
import type DeepValueOf from '@src/types/utils/DeepValueOf';

type LogSubmittedReceiptMilestoneParams = {
    item: Transaction;
    receipt: Receipt | undefined;
    optimisticTransactionID: string;
    command: string;
    iouType: DeepValueOf<typeof CONST.IOU.TYPE>;
};

function logSubmittedReceiptMilestone({item, receipt, optimisticTransactionID, command, iouType}: LogSubmittedReceiptMilestoneParams) {
    if (!receipt?.receiptTraceId) {
        return;
    }
    logReceiptSubmitted({
        receiptTraceId: receipt.receiptTraceId,
        draftTransactionID: item.transactionID,
        transactionID: getExistingTransactionID(item.linkedTrackedExpenseReportAction) ?? optimisticTransactionID,
        command,
        iouType,
    });
}

export default logSubmittedReceiptMilestone;
