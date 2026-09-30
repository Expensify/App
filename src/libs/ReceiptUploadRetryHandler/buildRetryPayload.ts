/** Decides whether a failed receipt upload can be retried and rebuilds its `RequestMoney` call from Onyx. */
import {isLocalFile} from '@libs/fileDownload/FileUtils';
import {getTransactionDetails} from '@libs/ReportUtils';
import {getIsFromGlobalCreate, isDistanceRequest, isPerDiemRequest, isTimeRequest} from '@libs/TransactionUtils';

import {getAllPersonalDetails, getAllReports, getAllTransactionViolations, getCurrentUserAccountIDFromSession, getCurrentUserPersonalDetails} from '@userActions/IOU';
import {getMoneyRequestParticipantsFromReport} from '@userActions/IOU/MoneyRequest';
import type {RequestMoneyInformation} from '@userActions/IOU/MoneyRequestBuilder';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';
import type {Receipt} from '@src/types/onyx/Transaction';
import type {FileObject} from '@src/types/utils/Attachment';

import type {OnyxEntry} from 'react-native-onyx';

import type {ReceiptRetryContext} from './types';

import isRetrySupported from './isRetrySupported';

function isRetryableFlow(context: ReceiptRetryContext): boolean {
    const {transaction} = context;
    if (!isRetrySupported || !transaction) {
        return false;
    }

    if (!isLocalFile(context.receiptError.source)) {
        return false;
    }

    // These carry GPS points, rates, or units that the transaction doesn't store, so a retry would drop them.
    if (isDistanceRequest(transaction) || isPerDiemRequest(transaction) || isTimeRequest(transaction)) {
        return false;
    }
    if (!!transaction.comment?.waypoints || !!transaction.comment?.customUnit || !!transaction.comment?.type) {
        return false;
    }

    return !transaction.receipt?.isTestReceipt && !transaction.receipt?.isTestDriveReceipt;
}

function getCurrentUserAccountID(): number {
    return getCurrentUserPersonalDetails()?.accountID ?? getCurrentUserAccountIDFromSession();
}

function resolveParticipant(iouReport: OnyxEntry<Report>): Participant | undefined {
    const participants = getMoneyRequestParticipantsFromReport(iouReport, getCurrentUserAccountID());
    if (participants.length !== 1) {
        return undefined;
    }

    const participant = participants.at(0);
    if (!participant?.accountID || participant.isPolicyExpenseChat) {
        return participant;
    }

    const login = getAllPersonalDetails()[participant.accountID]?.login;
    return login ? {...participant, login} : undefined;
}

function getMerchantForRetry(merchant: string | undefined): string {
    if (!merchant || merchant === CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT) {
        return '';
    }
    return merchant;
}

/** Checks the action here too, not only in `retryReceiptUpload`, so the button is hidden instead of doing nothing. */
function canBuildRetryPayload(context: ReceiptRetryContext): boolean {
    const {transaction, iouReport, receiptError} = context;
    if (receiptError.action !== CONST.IOU.ACTION_PARAMS.MONEY_REQUEST) {
        return false;
    }
    return isRetryableFlow(context) && !!iouReport?.reportID && !!transaction?.transactionID && !!resolveParticipant(iouReport);
}

/** Rebuilds the `RequestMoney` call behind a failed receipt upload from the records the failure left in Onyx. */
function buildRetryPayload(context: ReceiptRetryContext, receiptFile: FileObject): RequestMoneyInformation | undefined {
    const {
        transaction,
        iouReport,
        iouActionID,
        transactionThreadReportID,
        policyParams,
        isVendorMatchingBetaEnabled,
        rules,
        conciergeReportID,
        isSelfTourViewed,
        isASAPSubmitBetaEnabled,
        isTrackIntentUser,
        delegateAccountID,
        formatPhoneNumber,
        getCurrencyDecimals,
    } = context;
    const participant = resolveParticipant(iouReport);
    if (!canBuildRetryPayload(context) || !transaction || !iouReport || !participant) {
        return undefined;
    }

    const currentUser = getCurrentUserPersonalDetails();
    const details = getTransactionDetails(transaction);
    if (!details) {
        return undefined;
    }
    const receipt: Receipt = {...receiptFile, source: context.receiptError.source, state: CONST.IOU.RECEIPT_STATE.SCAN_READY};

    return {
        report: iouReport,
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
        optimisticIOUReportID: iouReport.reportID,
        optimisticChatReportID: iouReport.chatReportID,
        // Without these two, the retry creates a second IOU action and thread for the same transaction.
        currentReportActionID: iouActionID,
        existingTransactionThreadReportID: transactionThreadReportID,
        isTransactionAlreadyOnReport: true,
        existingTransaction: transaction,
        existingTransactionDraft: undefined,
        shouldGenerateTransactionThreadReport: true,
        // eslint-disable-next-line @typescript-eslint/no-deprecated -- `requestMoney` needs the whole collection for its `hasViolations` check, as UpdateMoneyRequest and TrackExpense do. Subscribing from the receipt view would put a collection-wide listener on every expense row.
        transactionViolations: getAllTransactionViolations(),
        personalDetails: getAllPersonalDetails(),
        isVendorMatchingBetaEnabled,
        rules,
        conciergeChat: conciergeReportID ? getAllReports()?.[`${ONYXKEYS.COLLECTION.REPORT}${conciergeReportID}`] : undefined,
        isSelfTourViewed,
        isASAPSubmitBetaEnabled,
        isTrackIntentUser,
        delegateAccountID,
        currentUserAccountIDParam: getCurrentUserAccountID(),
        currentUserEmailParam: currentUser?.login ?? '',
        quickAction: undefined,
        policyRecentlyUsedCurrencies: [],
        formatPhoneNumber,
        getCurrencyDecimals,
    };
}

export default buildRetryPayload;
export {canBuildRetryPayload};
