import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useDelegateAccountID from '@hooks/useDelegateAccountID';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useParticipantsPolicyTags from '@hooks/useParticipantsPolicyTags';
import usePermissions from '@hooks/usePermissions';
import useReportTransactions from '@hooks/useReportTransactions';

import Log from '@libs/Log';
import cleanupAfterExpenseCreate from '@libs/Navigation/helpers/cleanupAfterExpenseCreate';
import dismissModalAndOpenReportInInboxTab from '@libs/Navigation/helpers/dismissModalAndOpenReportInInboxTab';
import isSearchTopmostFullScreenRoute from '@libs/Navigation/helpers/isSearchTopmostFullScreenRoute';
import {markPendingSearchWrite} from '@libs/pendingSearchWrite';
import markSubmitExpenseEnd from '@libs/telemetry/markSubmitExpenseEnd';
import {isScanRequest as isScanRequestTransactionUtils} from '@libs/TransactionUtils';

import {resolveOptimisticSplitChatReportID, splitBill, splitBillAndOpenReport, startSplitBill} from '@userActions/IOU/Split';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList, Report} from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';
import type {CurrentUserPersonalDetails} from '@src/types/onyx/PersonalDetails';
import type {Receipt} from '@src/types/onyx/Transaction';
import type Transaction from '@src/types/onyx/Transaction';
import type DeepValueOf from '@src/types/utils/DeepValueOf';

import type {OnyxEntry} from 'react-native-onyx';

import type {CreateTransactionParams, SubmissionHandle} from './types';
import type {TransactionTaxValues} from './utils/getTransactionTaxValues';

import useSubmissionOnboardingIntent from './useSubmissionOnboardingIntent';
import useSubmissionRecentlyUsedData from './useSubmissionRecentlyUsedData';
import useSubmissionViolations from './useSubmissionViolations';
import getSelectedParticipantsForSubmission from './utils/getSelectedParticipantsForSubmission';

type UseSplitSubmissionParams = TransactionTaxValues & {
    transaction: OnyxEntry<Transaction>;
    transactions: Transaction[];
    receiptFiles: Record<string, Receipt>;
    report: OnyxEntry<Report>;
    policyID: string | undefined;
    personalDetails: OnyxEntry<PersonalDetailsList>;
    currentUserPersonalDetails: CurrentUserPersonalDetails;
    selectedParticipants: Participant[];
    iouType: DeepValueOf<typeof CONST.IOU.TYPE>;
    releaseSubmitLock: () => void;
};

/** Hook implementing the split submission path (splitBill / startSplitBill / splitBillAndOpenReport) for the expense confirmation screen. */
function useSplitSubmission({
    transaction,
    transactions,
    receiptFiles,
    report,
    policyID,
    personalDetails,
    currentUserPersonalDetails,
    selectedParticipants,
    iouType,
    releaseSubmitLock,
    transactionTaxCode,
    transactionTaxAmount,
    transactionTaxValue,
}: UseSplitSubmissionParams): SubmissionHandle {
    const {formatPhoneNumber} = useLocalize();
    const {getCurrencyDecimals} = useCurrencyListActions();
    const {isBetaEnabled, isBetaEnabledOrUnknown} = usePermissions();
    const isVendorMatchingBetaEnabled = isBetaEnabledOrUnknown(CONST.BETAS.VENDOR_MATCHING);
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);

    const {isTrackIntentUser} = useSubmissionOnboardingIntent();
    const delegateAccountID = useDelegateAccountID();
    const {transactionViolationsRef} = useSubmissionViolations();
    const reportTransactions = useReportTransactions(report?.reportID);
    const [rules] = useOnyx(ONYXKEYS.COLLECTION.RULE);
    const [quickAction] = useOnyx(ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE);
    const participantsPolicyTags = useParticipantsPolicyTags(selectedParticipants);

    const {policyRecentlyUsedCategories, policyRecentlyUsedTags, policyRecentlyUsedCurrencies} = useSubmissionRecentlyUsedData(policyID);
    const splitParticipants = getSelectedParticipantsForSubmission({transaction, iouType, selectedParticipants});

    function createTransaction({shouldHandleNavigation = true, writeBarrier}: CreateTransactionParams) {
        const trimmedComment = transaction?.comment?.comment?.trim() ?? '';
        // receiptFiles can hold an entry for a transaction no longer being submitted, so the files are matched against what is actually being submitted.
        const scannedItems = transactions.filter((item) => !!receiptFiles[item.transactionID]);

        // The manual split below sends transaction.amount, which stays 0 until SmartScan returns, so a scan with no matching receipt has nothing to write yet rather than a $0 split.
        if (isScanRequestTransactionUtils(transaction) && scannedItems.length === 0) {
            // The tap is a silent no-op from the user's side, so leave a trace for whoever has to explain it later.
            Log.warn('[useSplitSubmission] Scan split submitted with no receipt file for any transaction being submitted', {
                transactionCount: transactions.length,
                receiptFileCount: Object.keys(receiptFiles).length,
            });
            releaseSubmitLock();
            markSubmitExpenseEnd();
            return false;
        }

        // Split flows usually navigate to the destination report internally, but dismiss-first
        // handlers can pass shouldHandleNavigation=false after revealing/dismissing first.
        if (scannedItems.length > 0) {
            const currentUserLogin = currentUserPersonalDetails.login;
            if (currentUserLogin) {
                // Re-resolving inside the loop would mint a different chat per scan, so resolve once up front.
                const {optimisticSplitChatReportID, chatReportID} = resolveOptimisticSplitChatReportID(report?.reportID, selectedParticipants, currentUserPersonalDetails.accountID);

                for (const [index, item] of scannedItems.entries()) {
                    const transactionReceiptFile = receiptFiles[item.transactionID];
                    const itemTrimmedComment = item?.comment?.comment?.trim() ?? '';

                    startSplitBill({
                        getCurrencyDecimals,
                        writeBarrier,
                        participants: selectedParticipants,
                        currentUserLogin,
                        currentUserAccountID: currentUserPersonalDetails.accountID,
                        comment: itemTrimmedComment,
                        receipt: transactionReceiptFile,
                        existingSplitChatReportID: report?.reportID,
                        billable: item.billable,
                        reimbursable: item.reimbursable,
                        category: item.category,
                        tag: item.tag,
                        currency: item.currency,
                        taxCode: transactionTaxCode,
                        taxAmount: transactionTaxAmount,
                        taxValue: transactionTaxValue,
                        shouldPlaySound: index === scannedItems.length - 1,
                        optimisticSplitChatReportID,
                        isFirstSplitInBatch: !(index > 0 && optimisticSplitChatReportID),
                        policyRecentlyUsedCategories,
                        policyRecentlyUsedTags,
                        quickAction,
                        policyRecentlyUsedCurrencies,
                        participantsPolicyTags,
                        delegateAccountID,
                        formatPhoneNumber,
                    });
                }
                if (shouldHandleNavigation) {
                    dismissModalAndOpenReportInInboxTab(chatReportID, undefined, false);
                }
            } else {
                releaseSubmitLock();
            }
            markSubmitExpenseEnd();
            return false;
        }

        // Raise Search's own pending-write signal when a split write will actually run and land back on
        // Search: resolveWriteBarrier's automatic hasPendingSearchWrite() check then defers this write
        // for it. Only for submissions from the Search screen itself, not global-create (that path is
        // covered separately by markPendingWriteForSearchPage).
        const isDeferredSearchSubmit = !shouldHandleNavigation && isSearchTopmostFullScreenRoute();
        if (isDeferredSearchSubmit && currentUserPersonalDetails.login && !!transaction) {
            markPendingSearchWrite();
        }

        // IOUs created from a group report will have a reportID param in the route.
        // Since the user is already viewing the report, we don't need to navigate them to the report
        if (!transaction?.isFromGlobalCreate) {
            if (currentUserPersonalDetails.login && !!transaction) {
                splitBill({
                    isVendorMatchingBetaEnabled,
                    getCurrencyDecimals,
                    writeBarrier,
                    participants: splitParticipants,
                    currentUserLogin: currentUserPersonalDetails.login,
                    currentUserAccountID: currentUserPersonalDetails.accountID,
                    amount: transaction.amount,
                    comment: trimmedComment,
                    currency: transaction.currency,
                    merchant: transaction.merchant,
                    created: transaction.created,
                    category: transaction.category,
                    tag: transaction.tag,
                    existingSplitChatReportID: report?.reportID,
                    billable: transaction.billable,
                    reimbursable: transaction.reimbursable,
                    iouRequestType: transaction.iouRequestType,
                    splitShares: transaction.splitShares,
                    taxCode: transactionTaxCode,
                    taxAmount: transactionTaxAmount,
                    taxValue: transactionTaxValue,
                    policyRecentlyUsedCategories,
                    policyRecentlyUsedTags,
                    isASAPSubmitBetaEnabled,
                    transactionViolations: transactionViolationsRef.current,
                    quickAction,
                    policyRecentlyUsedCurrencies,
                    personalDetails,
                    delegateAccountID,
                    isTrackIntentUser,
                    formatPhoneNumber,
                    participantsPolicyTags,
                    rules,
                });
                if (shouldHandleNavigation) {
                    cleanupAfterExpenseCreate({draftTransactionIDs: [CONST.IOU.OPTIMISTIC_TRANSACTION_ID], shouldWaitForUpcomingTransition: true});
                    dismissModalAndOpenReportInInboxTab(report?.reportID, undefined, reportTransactions.length > 0);
                } else {
                    cleanupAfterExpenseCreate({draftTransactionIDs: [CONST.IOU.OPTIMISTIC_TRANSACTION_ID]});
                }
            }
            markSubmitExpenseEnd();
            return false;
        }

        // If the split expense is created from the global create menu, we also navigate the user to the group report
        if (currentUserPersonalDetails.login && !!transaction) {
            const {optimisticSplitChatReportID, chatReportID} = resolveOptimisticSplitChatReportID(undefined, splitParticipants, currentUserPersonalDetails.accountID);
            splitBillAndOpenReport({
                isVendorMatchingBetaEnabled,
                getCurrencyDecimals,
                writeBarrier,
                participants: splitParticipants,
                currentUserLogin: currentUserPersonalDetails.login,
                currentUserAccountID: currentUserPersonalDetails.accountID,
                amount: transaction.amount,
                comment: trimmedComment,
                currency: transaction.currency,
                merchant: transaction.merchant,
                created: transaction.created,
                category: transaction.category,
                tag: transaction.tag,
                billable: !!transaction.billable,
                reimbursable: !!transaction.reimbursable,
                iouRequestType: transaction.iouRequestType,
                splitShares: transaction.splitShares,
                taxCode: transactionTaxCode,
                taxAmount: transactionTaxAmount,
                taxValue: transactionTaxValue,
                policyRecentlyUsedCategories,
                policyRecentlyUsedTags,
                isASAPSubmitBetaEnabled,
                transactionViolations: transactionViolationsRef.current,
                quickAction,
                policyRecentlyUsedCurrencies,
                personalDetails,
                optimisticSplitChatReportID,
                delegateAccountID,
                isTrackIntentUser,
                formatPhoneNumber,
                participantsPolicyTags,
                rules,
            });
            if (shouldHandleNavigation) {
                cleanupAfterExpenseCreate({draftTransactionIDs: [CONST.IOU.OPTIMISTIC_TRANSACTION_ID], shouldWaitForUpcomingTransition: true});
                // A split lands in a group DM or 1:1 chat, and transactions are never attached to a chat report.
                dismissModalAndOpenReportInInboxTab(chatReportID, undefined, false);
            } else {
                cleanupAfterExpenseCreate({draftTransactionIDs: [CONST.IOU.OPTIMISTIC_TRANSACTION_ID]});
            }
        }
        markSubmitExpenseEnd();
        return false;
    }

    return {createTransaction};
}

export default useSplitSubmission;
