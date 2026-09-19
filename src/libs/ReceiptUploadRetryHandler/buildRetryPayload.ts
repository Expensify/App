/**
 * Rebuilds the `RequestMoney` call behind a failed receipt upload from the records the failure left in Onyx, so
 * a Retry action can re-dispatch the original request under the original transaction ID rather than creating a
 * second expense.
 */
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

function isRetryableFlow(context: ReceiptRetryContext): boolean {
    const {transaction} = context;
    if (!transaction) {
        return false;
    }

    if (!isLocalFile(context.receiptError.source)) {
        return false;
    }

    // A distance, per diem, or time request carries state the transaction alone does not store, such as GPS
    // points, rates, and units, so it is excluded rather than retried with those fields silently dropped.
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

/**
 * Whether the Retry button should be shown.
 *
 * The action is checked here and not only in `retryReceiptUpload`, so the button is absent rather than present
 * and inert. A `ReceiptError` can come from a track expense failure, or from the fallback error the receipt view
 * synthesizes for a report-creation failure, which carries no action and whose source is still the local file.
 */
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
            // Not from `details`, which widens this to `string | Attendee[]` for the search fields.
            attendees: transaction.comment?.attendees,
            isFromGlobalCreate: getIsFromGlobalCreate(transaction),
            receipt,
        },
        // Reusing the original ID is what makes a re-send safe: if the first attempt did reach Auth, the retry
        // comes back `Transaction already created.` and `SequentialQueue` applies `successData` instead of
        // creating a second expense
        optimisticTransactionID: transaction.transactionID,
        optimisticIOUReportID: iouReport.reportID,
        optimisticChatReportID: iouReport.chatReportID,
        // Without these two the server dedupes the transaction but the retry still mints a fresh IOU action and
        // transaction thread, leaving two report actions on one transaction, which reads as two expenses.
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
