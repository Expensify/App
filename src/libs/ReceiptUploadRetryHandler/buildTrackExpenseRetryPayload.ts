/** Decides whether a failed `TrackExpense` can be retried and rebuilds the call from Onyx. */
import {getTransactionDetails, isSelfDM} from '@libs/ReportUtils';
import {getIsFromGlobalCreate} from '@libs/TransactionUtils';

import {getAllReports, getCurrentUserPersonalDetails} from '@userActions/IOU';
import type {CreateTrackExpenseParams} from '@userActions/IOU/types/CreateTrackExpenseParams';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Receipt} from '@src/types/onyx/Transaction';
import type {FileObject} from '@src/types/utils/Attachment';

import type {ReceiptRetryContext} from './types';

import {getCurrentUserAccountID, getMerchantForRetry, isRetryableFlow, resolveParticipant} from './buildRetryPayload';

function canBuildTrackExpenseRetryPayload(context: ReceiptRetryContext): boolean {
    const {transaction, iouReport, receiptError} = context;
    if (receiptError.action !== CONST.IOU.ACTION_PARAMS.TRACK_EXPENSE || !isSelfDM(iouReport)) {
        return false;
    }
    return isRetryableFlow(context) && !!iouReport?.reportID && !!transaction?.transactionID && !!resolveParticipant(iouReport);
}

/** Rebuilds the `TrackExpense` call behind a failed receipt upload from the records the failure left in Onyx. */
function buildTrackExpenseRetryPayload(context: ReceiptRetryContext, receiptFile: FileObject): CreateTrackExpenseParams | undefined {
    const {
        transaction,
        iouReport,
        iouActionID,
        transactionThreadReportID,
        policyParams,
        rules,
        conciergeReportID,
        isSelfTourViewed,
        isASAPSubmitBetaEnabled,
        introSelected,
        delegateAccountID,
        getCurrencyDecimals,
    } = context;
    const participant = resolveParticipant(iouReport);
    if (!canBuildTrackExpenseRetryPayload(context) || !transaction || !iouReport || !participant) {
        return undefined;
    }

    const currentUser = getCurrentUserPersonalDetails();
    // Unreported amounts are stored negated; this returns them positive, as `trackExpense` expects.
    const details = getTransactionDetails(transaction);
    if (!details) {
        return undefined;
    }
    const receipt: Receipt = {...receiptFile, source: context.receiptError.source, state: CONST.IOU.RECEIPT_STATE.SCAN_READY};

    return {
        report: iouReport,
        isDraftPolicy: false,
        isDraftChatReport: false,
        participantParams: {
            payeeEmail: currentUser?.login,
            payeeAccountID: getCurrentUserAccountID(),
            participant,
        },
        policyParams,
        transactionParams: {
            amount: details.amount,
            currency: details.currency,
            created: details.created,
            merchant: getMerchantForRetry(details.merchant),
            comment: details.comment,
            category: details.category,
            tag: details.tag,
            taxCode: details.taxCode,
            taxAmount: details.taxAmount,
            billable: details.billable,
            reimbursable: details.reimbursable,
            // Read from the transaction because `details` widens this to `string | Attendee[]`.
            attendees: transaction.comment?.attendees,
            isFromGlobalCreate: getIsFromGlobalCreate(transaction),
            receipt,
        },
        // Same ID, so if the first attempt reached Auth the retry gets `Transaction already created.` instead of a second expense.
        optimisticTransactionID: transaction.transactionID,
        // Without these two, the retry creates a second IOU action and thread for the same transaction.
        currentReportActionID: iouActionID,
        existingTransactionThreadReportID: transactionThreadReportID,
        existingTransaction: transaction,
        isASAPSubmitBetaEnabled,
        currentUser: {
            accountID: getCurrentUserAccountID(),
            email: currentUser?.login ?? '',
        },
        introSelected,
        conciergeChat: conciergeReportID ? getAllReports()?.[`${ONYXKEYS.COLLECTION.REPORT}${conciergeReportID}`] : undefined,
        quickAction: undefined,
        recentWaypoints: [],
        isSelfTourViewed,
        // Only read when a draft chat report builds a new workspace, which the create path behind this error never does.
        currentUserLocalCurrency: undefined,
        delegateAccountID,
        reportActionsList: undefined,
        getCurrencyDecimals,
        rules,
    };
}

export default buildTrackExpenseRetryPayload;
export {canBuildTrackExpenseRetryPayload};
