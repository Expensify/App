import {isMovingTransactionFromTrackExpense as isMovingTransactionFromTrackExpenseIOUUtils} from '@libs/IOUUtils';
import {isMoneyRequestReport as isMoneyRequestReportReportUtils} from '@libs/ReportUtils';
import type * as IOU from '@userActions/IOU';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PolicyTagLists} from '@src/types/onyx';
import type {ReceiptError} from '@src/types/onyx/Transaction';
import useMoneyRequestPolicyTags from './useMoneyRequestPolicyTags';
import useOnyx from './useOnyx';

function useReceiptErrorPolicyTagList(receiptError: ReceiptError | undefined): PolicyTagLists {
    const retryParams: IOU.RequestMoneyInformation | undefined = receiptError
        ? typeof receiptError.retryParams === 'string'
            ? (JSON.parse(receiptError.retryParams) as IOU.RequestMoneyInformation)
            : (receiptError.retryParams as IOU.RequestMoneyInformation)
        : undefined;

    const isMoneyRequestReport = isMoneyRequestReportReportUtils(retryParams?.report);
    const isMovingTransactionFromTrackExpense = isMovingTransactionFromTrackExpenseIOUUtils(retryParams?.action);
    const moneyRequestReportID = isMoneyRequestReport ? retryParams?.report?.reportID : undefined;
    const chatReportID = isMoneyRequestReport && !isMovingTransactionFromTrackExpense ? retryParams?.report?.chatReportID : undefined;

    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`);
    const [chatReportDraft] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_DRAFT}${chatReportID}`);
    const effectiveChatReport = chatReport ?? chatReportDraft;

    const parentChatReportPolicyID = isMovingTransactionFromTrackExpense ? undefined : isMoneyRequestReport ? effectiveChatReport?.policyID : retryParams?.report?.policyID;

    return useMoneyRequestPolicyTags({
        existingIOUReportPolicyID: retryParams?.existingIOUReport?.policyID,
        moneyRequestReportID,
        parentChatReportPolicyID,
        participantReportID: retryParams?.participantParams?.participant?.reportID,
    });
}

export default useReceiptErrorPolicyTagList;
