import {isLocalFile} from '@libs/fileDownload/FileUtils';
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

    // Not `isScanRequest`: `iouRequestType` stays `manual` on a receipt expense whose amount was confirmed, so it
    // says nothing about whether a file is left to re-send.
    if (!isLocalFile(transaction.receipt?.source)) {
        return false;
    }

    // These carry state the transaction does not store - GPS points, rates, units - so they are excluded rather
    // than retried with those fields silently dropped.
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

/** Derived from the report, not the transaction: the create path calls `buildOptimisticTransaction` without `participants`. */
function resolveParticipant(iouReport: OnyxEntry<Report>): Participant | undefined {
    const participants = getMoneyRequestParticipantsFromReport(iouReport, getCurrentUserAccountID());
    // Anything ambiguous - an invoice room yields two - gets no retry rather than a guess.
    if (participants.length !== 1) {
        return undefined;
    }

    const participant = participants.at(0);
    if (!participant?.accountID || participant.isPolicyExpenseChat) {
        return participant;
    }

    // A DM participant carries only an account ID, but `login` travels to the API as `debtorEmail`.
    const login = getAllPersonalDetails()[participant.accountID]?.login;
    return login ? {...participant, login} : undefined;
}

function getMerchantForRetry(merchant: string | undefined): string {
    if (!merchant || merchant === CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT) {
        return '';
    }
    return merchant;
}

/** Checked before the Retry button renders, so the button is absent rather than present and inert. */
function canBuildRetryPayload(context: ReceiptRetryContext): boolean {
    const {transaction, iouReport} = context;
    return isRetryableFlow(context) && !!iouReport?.reportID && !!transaction?.transactionID && !!resolveParticipant(iouReport);
}

/** Rebuilds the `RequestMoney` call behind a failed receipt upload from the records the failure left in Onyx. */
function buildRetryPayload(context: ReceiptRetryContext, receiptFile: FileObject): RequestMoneyInformation | undefined {
    const {
        transaction,
        iouReport,
        policyParams,
        betas,
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
    const receipt: Receipt = {...receiptFile, source: context.receiptError.source, state: CONST.IOU.RECEIPT_STATE.SCAN_READY};

    return {
        // `requestMoney` turns this into `moneyRequestReportID`, which routes the retry onto the existing report.
        // Deliberately not `existingIOUReport`: that path reads `errorFields.createChat` off this render-time
        // snapshot, which the failure set, and would build a second report.
        report: iouReport,
        participantParams: {
            payeeEmail: currentUser?.login,
            payeeAccountID: getCurrentUserAccountID(),
            participant,
        },
        policyParams,
        transactionParams: {
            amount: transaction.amount ?? 0,
            currency: transaction.currency ?? CONST.CURRENCY.USD,
            created: transaction.created ?? '',
            merchant: getMerchantForRetry(transaction.merchant),
            comment: transaction.comment?.comment,
            category: transaction.category,
            tag: transaction.tag,
            taxCode: transaction.taxCode,
            taxAmount: transaction.taxAmount,
            billable: transaction.billable,
            reimbursable: transaction.reimbursable,
            attendees: transaction.comment?.attendees,
            isFromGlobalCreate: getIsFromGlobalCreate(transaction),
            receipt,
        },
        // Reusing the original ID is what makes a re-send safe: if the first attempt did reach Auth, the retry
        // comes back `Transaction already created.` and `SequentialQueue` applies `successData` instead of
        // creating a second expense.
        optimisticTransactionID: transaction.transactionID,
        optimisticIOUReportID: iouReport.reportID,
        optimisticChatReportID: iouReport.chatReportID,
        existingTransaction: transaction,
        existingTransactionDraft: undefined,
        shouldGenerateTransactionThreadReport: true,
        // eslint-disable-next-line @typescript-eslint/no-deprecated -- `requestMoney` needs the whole collection for its `hasViolations` check, as UpdateMoneyRequest and TrackExpense do. Subscribing from the receipt view would put a collection-wide listener on every expense row.
        transactionViolations: getAllTransactionViolations(),
        personalDetails: getAllPersonalDetails(),
        betas,
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
