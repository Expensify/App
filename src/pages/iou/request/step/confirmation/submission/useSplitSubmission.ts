import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useDelegateAccountID from '@hooks/useDelegateAccountID';
import useLocalize from '@hooks/useLocalize';
import useParticipantsPolicyTags from '@hooks/useParticipantsPolicyTags';
import usePermissions from '@hooks/usePermissions';

import {reserveDeferredWriteChannel} from '@libs/deferredLayoutWrite';
import Log from '@libs/Log';
import cleanupAfterExpenseCreate from '@libs/Navigation/helpers/cleanupAfterExpenseCreate';
import dismissModalAndOpenReportInInboxTab from '@libs/Navigation/helpers/dismissModalAndOpenReportInInboxTab';
import isSearchTopmostFullScreenRoute from '@libs/Navigation/helpers/isSearchTopmostFullScreenRoute';
import markSubmitExpenseEnd from '@libs/telemetry/markSubmitExpenseEnd';
import {isScanRequest as isScanRequestTransactionUtils} from '@libs/TransactionUtils';

import {resolveOptimisticSplitChatReportID, splitBill, splitBillAndOpenReport, startSplitBill} from '@userActions/IOU/Split';

import CONST from '@src/CONST';
import type {PersonalDetailsList, QuickAction, Report, Rule, TransactionViolation} from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';
import type {CurrentUserPersonalDetails} from '@src/types/onyx/PersonalDetails';
import type {Receipt} from '@src/types/onyx/Transaction';
import type Transaction from '@src/types/onyx/Transaction';

import type {RefObject} from 'react';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import type {SubmissionHandle} from './types';
import type {SubmissionRecentlyUsedData} from './useSubmissionRecentlyUsedData';
import type {TransactionTaxValues} from './utils/getTransactionTaxValues';

type UseSplitSubmissionParams = TransactionTaxValues & {
    transaction: OnyxEntry<Transaction>;
    transactions: Transaction[];
    receiptFiles: Record<string, Receipt>;
    report: OnyxEntry<Report>;
    personalDetails: OnyxEntry<PersonalDetailsList>;
    currentUserPersonalDetails: CurrentUserPersonalDetails;
    participants: Participant[];
    selectedParticipants: Participant[];
    splitParticipants: Participant[];
    isTrackIntentUser: boolean;
    releaseSubmitLock: () => void;

    /** TEMP: hoisted in useExpenseSubmission so these Onyx keys open once across all mounted submission hooks.
     *  Read them here again once the page forks into per-path variants and only one hook mounts. */
    recentlyUsedData: SubmissionRecentlyUsedData;
    rules: OnyxCollection<Rule>;
    quickAction: OnyxEntry<QuickAction>;
    transactionViolationsRef: RefObject<OnyxCollection<TransactionViolation[]>>;
    reportTransactions: Transaction[];
};

function useSplitSubmission({
    transaction,
    transactions,
    receiptFiles,
    report,
    personalDetails,
    currentUserPersonalDetails,
    participants,
    selectedParticipants,
    splitParticipants,
    isTrackIntentUser,
    releaseSubmitLock,
    recentlyUsedData,
    rules,
    quickAction,
    transactionViolationsRef,
    reportTransactions,
    transactionTaxCode,
    transactionTaxAmount,
    transactionTaxValue,
}: UseSplitSubmissionParams): SubmissionHandle {
    const {formatPhoneNumber} = useLocalize();
    const {getCurrencyDecimals} = useCurrencyListActions();
    const delegateAccountID = useDelegateAccountID();
    const {isBetaEnabled, isBetaEnabledOrUnknown} = usePermissions();
    const isVendorMatchingBetaEnabled = isBetaEnabledOrUnknown(CONST.BETAS.VENDOR_MATCHING);
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);

    const {policyRecentlyUsedCategories, policyRecentlyUsedTags, policyRecentlyUsedCurrencies} = recentlyUsedData;
    const participantsPolicyTags = useParticipantsPolicyTags(participants ?? []);

    function createTransaction(locationPermissionGranted = false, shouldHandleNavigation = true) {
        const trimmedComment = transaction?.comment?.comment?.trim() ?? '';
        const shouldDeferSplitForSearch = !shouldHandleNavigation && isSearchTopmostFullScreenRoute();
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
            return;
        }

        // Split flows usually navigate to the destination report internally, but dismiss-first
        // handlers can pass shouldHandleNavigation=false after revealing/dismissing first.
        if (scannedItems.length > 0) {
            const currentUserLogin = currentUserPersonalDetails.login;
            if (currentUserLogin) {
                // Re-resolving inside the loop would mint a different chat per scan, so resolve once up front.
                const {optimisticSplitChatReportID, chatReportID} = resolveOptimisticSplitChatReportID(report?.reportID, selectedParticipants, currentUserPersonalDetails.accountID);

                // The action hardcodes shouldDeferForSearch:false, so reserve here for Search. Each scan write flushes the one before it, so only the last one waits.
                if (shouldDeferSplitForSearch) {
                    reserveDeferredWriteChannel(CONST.DEFERRED_LAYOUT_WRITE_KEYS.SEARCH);
                }

                for (const [index, item] of scannedItems.entries()) {
                    const transactionReceiptFile = receiptFiles[item.transactionID];
                    const itemTrimmedComment = item?.comment?.comment?.trim() ?? '';

                    startSplitBill({
                        getCurrencyDecimals,
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
            return;
        }

        // The action hardcodes shouldDeferForSearch:false, so reserve here when a split write will actually run and land back on Search.
        if (shouldDeferSplitForSearch && currentUserPersonalDetails.login && !!transaction) {
            reserveDeferredWriteChannel(CONST.DEFERRED_LAYOUT_WRITE_KEYS.SEARCH);
        }

        // IOUs created from a group report will have a reportID param in the route.
        // Since the user is already viewing the report, we don't need to navigate them to the report
        if (!transaction?.isFromGlobalCreate) {
            if (currentUserPersonalDetails.login && !!transaction) {
                splitBill({
                    isVendorMatchingBetaEnabled,
                    getCurrencyDecimals,
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
            return;
        }

        // If the split expense is created from the global create menu, we also navigate the user to the group report
        if (currentUserPersonalDetails.login && !!transaction) {
            const {optimisticSplitChatReportID, chatReportID} = resolveOptimisticSplitChatReportID(undefined, splitParticipants, currentUserPersonalDetails.accountID);
            splitBillAndOpenReport({
                isVendorMatchingBetaEnabled,
                getCurrencyDecimals,
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
    }

    return {createTransaction};
}

export default useSplitSubmission;
