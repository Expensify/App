/**
 * Helpers that read, filter, and check transaction violations (RTER, broken connection, duplicates,
 * notice/warning types, and submission-blocking violations).
 * Extracted from TransactionUtils/index.ts to keep that file smaller.
 */
import {isPersonalCard} from '@libs/CardUtils';
import DateUtils from '@libs/DateUtils';
import {isAttendeeTrackingEnabled as isAttendeeTrackingEnabledForPolicy, isInstantSubmitEnabled, isPolicyAdmin, isPolicyMember as isPolicyMemberPolicyUtils} from '@libs/PolicyUtils';
import {isCurrentUserSubmitter, isIOUReport, isOpenExpenseReport, isProcessingReport, isReportManager, isSettled} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {CardList, Policy, Report, Transaction, TransactionViolation, TransactionViolations, ViolationName} from '@src/types/onyx';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

// This cycle import is safe because this file was extracted from TransactionUtils/index.ts, which re-exports it.
// The functions imported here are pure helpers that aren't called at initialization time.
// eslint-disable-next-line import/no-cycle
import {getCreated, hasSmartScanFailedWithMissingFields, isCategoryBeingAnalyzed, isExpensifyCardTransaction, isPending, isScanning} from './index';

/**
 * Get all transaction violations of the transaction with given transactionID.
 */
function getTransactionViolations(
    transaction: OnyxEntry<Transaction>,
    transactionViolations: OnyxCollection<TransactionViolations>,
    currentUserEmail: string,
    currentUserAccountID: number,
    iouReport: OnyxEntry<Report>,
    iouReportOwnerLogin: string | undefined,
    policy: OnyxEntry<Policy>,
): TransactionViolations | undefined {
    if (!transaction || !transactionViolations) {
        return undefined;
    }

    const violations =
        transactionViolations?.[ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS + transaction.transactionID]?.filter(
            (violation) => !isViolationDismissed(transaction, violation, currentUserEmail, currentUserAccountID, iouReport, iouReportOwnerLogin, policy),
        ) ?? [];

    return violations;
}

/**
 * Check if a transaction has been rejected
 */
function hasTransactionBeenRejected(transactionViolations: OnyxEntry<TransactionViolations>): boolean {
    return !!transactionViolations && transactionViolations.some((violation) => violation.name === CONST.VIOLATIONS.AUTO_REPORTED_REJECTED_EXPENSE);
}

/**
 * Check if there is pending rter violation in transactionViolations.
 */
function hasPendingRTERViolation(transactionViolations?: TransactionViolations | null): boolean {
    return !!transactionViolations?.some(
        (transactionViolation: TransactionViolation) =>
            transactionViolation.name === CONST.VIOLATIONS.RTER && transactionViolation.data?.pendingPattern && !isBrokenConnectionViolation(transactionViolation),
    );
}

/**
 * Check if any of the given transactions have a pending RTER violation that has not been dismissed (e.g. via mark-as-cash).
 */
function hasAnyPendingRTERViolation(
    transactions: Array<OnyxEntry<Transaction>>,
    allTransactionViolations: OnyxCollection<TransactionViolations>,
    currentUserEmail: string,
    currentUserAccountID: number,
    report: OnyxEntry<Report>,
    reportOwnerLogin: string | undefined,
    policy: OnyxEntry<Policy>,
): boolean {
    return transactions.some((t) => {
        const filteredViolations = getTransactionViolations(t, allTransactionViolations, currentUserEmail, currentUserAccountID, report, reportOwnerLogin, policy);
        return hasPendingRTERViolation(filteredViolations);
    });
}

/**
 * Check if there is a custom unit out of policy violation in transactionViolations.
 */
function hasCustomUnitOutOfPolicyViolation(transactionViolations?: TransactionViolations | null): boolean {
    return !!transactionViolations?.some((violation) => violation.name === CONST.VIOLATIONS.CUSTOM_UNIT_OUT_OF_POLICY);
}

/**
 * Check if there is broken connection violation.
 */
function hasBrokenConnectionViolation(
    transaction: Transaction,
    transactionViolations: OnyxCollection<TransactionViolations> | undefined,
    currentUserEmail: string,
    currentUserAccountID: number,
    report: OnyxEntry<Report>,
    reportOwnerLogin: string | undefined,
    policy: OnyxEntry<Policy>,
): boolean {
    const violations = getTransactionViolations(transaction, transactionViolations, currentUserEmail, currentUserAccountID, report, reportOwnerLogin, policy);
    return !!violations?.find((violation) => isBrokenConnectionViolation(violation));
}

function isBrokenConnectionViolation(violation: TransactionViolation) {
    return (
        violation.name === CONST.VIOLATIONS.RTER &&
        (violation.data?.rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION ||
            violation.data?.rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION_530 ||
            violation.data?.rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION_531 ||
            violation.data?.rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION_REAUTH)
    );
}

/**
 * Suppresses the report-level status only when every broken connection belongs to a personal card.
 * Reports with company-card or retry-later violations must retain a status so their required action is visible.
 */
function shouldSuppressBrokenConnectionStatus(brokenConnectionViolations: TransactionViolation[], cardList: OnyxEntry<CardList>) {
    return (
        brokenConnectionViolations.length > 0 &&
        brokenConnectionViolations.every((violation) => {
            if (violation.data?.rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION_530 || violation.data?.rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION_531) {
                return false;
            }

            const cardID = violation.data?.cardID;
            const card = cardID ? cardList?.[cardID] : undefined;
            return !!card && isPersonalCard(card);
        })
    );
}

/** Returns a report transaction that has a broken connection status which must remain visible. */
function getUnsuppressibleBrokenConnectionTransactionID(
    transactions: Transaction[],
    transactionViolations: OnyxCollection<TransactionViolations>,
    cardList: OnyxEntry<CardList>,
): string | undefined {
    return transactions.find((transaction) => {
        const brokenConnectionViolations = (transactionViolations?.[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction.transactionID}`] ?? []).filter(isBrokenConnectionViolation);
        return brokenConnectionViolations.length > 0 && !shouldSuppressBrokenConnectionStatus(brokenConnectionViolations, cardList);
    })?.transactionID;
}

function shouldShowBrokenConnectionViolationInternal(brokenConnectionViolations: TransactionViolation[], report: OnyxEntry<Report>, policy: OnyxEntry<Policy>) {
    if (brokenConnectionViolations.length === 0) {
        return false;
    }

    if (!isPolicyAdmin(policy) || isCurrentUserSubmitter(report)) {
        return true;
    }

    if (isOpenExpenseReport(report)) {
        return true;
    }

    return isProcessingReport(report) && isInstantSubmitEnabled(policy);
}

/**
 * Check if user should see broken connection violation warning based on violations list.
 */
function shouldShowBrokenConnectionViolation(report: OnyxEntry<Report>, policy: OnyxEntry<Policy>, transactionViolations: TransactionViolation[]): boolean {
    const brokenConnectionViolations = transactionViolations.filter((violation) => isBrokenConnectionViolation(violation));

    return shouldShowBrokenConnectionViolationInternal(brokenConnectionViolations, report, policy);
}

/**
 * Check if user should see broken connection violation warning based on selected transactions. RTER violations stop being actionable once the report is paid, so they are hidden on settled reports.
 */
function shouldShowBrokenConnectionViolationForMultipleTransactions(
    transactions: Transaction[],
    report: OnyxEntry<Report>,
    reportOwnerLogin: string | undefined,
    policy: OnyxEntry<Policy>,
    transactionViolations: OnyxCollection<TransactionViolation[]>,
    currentUserEmail: string,
    currentUserAccountID: number,
): boolean {
    const brokenConnectionViolations = transactions.flatMap((transaction) => {
        const violations = transactionViolations?.[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction.transactionID}`] ?? [];

        if (!transaction) {
            return [];
        }

        return violations.filter((violation) => {
            if (!isBrokenConnectionViolation(violation)) {
                return false;
            }

            if (isViolationDismissed(transaction, violation, currentUserEmail, currentUserAccountID, report, reportOwnerLogin, policy)) {
                return false;
            }

            return shouldShowViolation(report, policy, violation.name, currentUserEmail, currentUserAccountID, false, transaction);
        });
    });

    return shouldShowBrokenConnectionViolationInternal(brokenConnectionViolations, report, policy);
}

/**
 * Merge prohibited violations into one violation.
 */
function mergeProhibitedViolations(transactionViolations: TransactionViolations): TransactionViolations {
    const prohibitedViolations = transactionViolations.filter((violation: TransactionViolation) => violation.name === CONST.VIOLATIONS.PROHIBITED_EXPENSE);

    if (prohibitedViolations.length === 0) {
        return transactionViolations;
    }

    const prohibitedExpenses = prohibitedViolations.flatMap((violation: TransactionViolation) => violation.data?.prohibitedExpenseRule ?? []);
    const mergedProhibitedViolations: TransactionViolation = {
        name: CONST.VIOLATIONS.PROHIBITED_EXPENSE,
        data: {
            prohibitedExpenseRule: prohibitedExpenses,
        },
        type: CONST.VIOLATION_TYPES.VIOLATION,
        showInReview: prohibitedViolations.some((v) => v.showInReview),
    };

    return [...transactionViolations.filter((violation: TransactionViolation) => violation.name !== CONST.VIOLATIONS.PROHIBITED_EXPENSE), mergedProhibitedViolations];
}

/**
 * Returns transaction violations visible to the current user after applying dismiss/show filters
 * and merging prohibited-expense violations.
 */
function getVisibleTransactionViolations(
    transaction: OnyxEntry<Transaction>,
    transactionViolations: TransactionViolations,
    currentUserEmail: string,
    currentUserAccountID: number,
    iouReport: OnyxEntry<Report>,
    iouReportOwnerLogin: string | undefined,
    policy: OnyxEntry<Policy>,
    shouldShowRterForSettledReport = true,
): TransactionViolations {
    return mergeProhibitedViolations(
        transactionViolations.filter(
            (violation) =>
                !isViolationDismissed(transaction, violation, currentUserEmail, currentUserAccountID, iouReport, iouReportOwnerLogin, policy) &&
                shouldShowViolation(iouReport, policy, violation.name, currentUserEmail, currentUserAccountID, shouldShowRterForSettledReport, transaction),
        ),
    );
}

/**
 * Check if the user should see the violation
 */
function shouldShowViolation(
    iouReport: OnyxEntry<Report>,
    policy: OnyxEntry<Policy>,
    violationName: ViolationName,
    currentUserEmail: string,
    currentUserAccountID: number,
    shouldShowRterForSettledReport = true,
    transaction?: OnyxEntry<Transaction>,
): boolean {
    const isSubmitter = isCurrentUserSubmitter(iouReport, currentUserAccountID);
    const isPolicyMember = isPolicyMemberPolicyUtils(policy, currentUserEmail);
    const isReportOpen = isOpenExpenseReport(iouReport);
    if (violationName === CONST.VIOLATIONS.AUTO_REPORTED_REJECTED_EXPENSE) {
        return isSubmitter || isPolicyAdmin(policy);
    }

    // The violation is not saved in the backend cache, so it has to be re-evaluated here rather than trusted from
    // whenever the expense was created or edited.
    if (violationName === CONST.VIOLATIONS.FUTURE_DATE) {
        // Without a transaction the rule cannot be evaluated, so show the violation rather than hiding one the
        // backend reported.
        if (!transaction) {
            return true;
        }
        return DateUtils.isTransactionDateFuture(getCreated(transaction));
    }

    if (violationName === CONST.VIOLATIONS.OVER_AUTO_APPROVAL_LIMIT) {
        // Submitters are not shown this notice because they cannot act on it, but a submitter who is also the report's
        // approver is the person who has to approve it manually, so they still need to know why it was not auto-approved.
        return isPolicyAdmin(policy) && (!isSubmitter || isReportManager(iouReport, currentUserAccountID)) && isProcessingReport(iouReport);
    }

    if (violationName === CONST.VIOLATIONS.RTER) {
        return (isSubmitter || isInstantSubmitEnabled(policy)) && (shouldShowRterForSettledReport || !isSettled(iouReport));
    }

    if (violationName === CONST.VIOLATIONS.RECEIPT_NOT_SMART_SCANNED) {
        return isPolicyMember && !isSubmitter && !isReportOpen;
    }

    if (violationName === CONST.VIOLATIONS.MISSING_ATTENDEES) {
        return isAttendeeTrackingEnabledForPolicy(policy);
    }

    if (violationName === CONST.VIOLATIONS.MISSING_CATEGORY && isCategoryBeingAnalyzed(transaction, iouReport, policy)) {
        return false;
    }

    if (violationName === CONST.VIOLATIONS.DUPLICATED_TRANSACTION && isIOUReport(iouReport)) {
        return false;
    }

    return true;
}

/**
 * Check if there is pending rter violation in all transactionViolations with given transactionIDs.
 */
function allHavePendingRTERViolation(
    transactions: OnyxEntry<Transaction[]>,
    transactionViolations: OnyxCollection<TransactionViolations> | undefined,
    currentUserEmail: string,
    currentUserAccountID: number,
    report: OnyxEntry<Report>,
    reportOwnerLogin: string | undefined,
    policy: OnyxEntry<Policy>,
): boolean {
    if (!transactions) {
        return false;
    }

    const transactionsWithRTERViolations = transactions.map((transaction) => {
        // Get violations not dismissed by current user
        const filteredTransactionViolations = getTransactionViolations(transaction, transactionViolations, currentUserEmail, currentUserAccountID, report, reportOwnerLogin, policy)?.filter(
            (violation) =>
                // Further filter to only violations visible to the current user
                shouldShowViolation(report, policy, violation.name, currentUserEmail, currentUserAccountID, true, transaction),
        );
        // Check if there is pending rter violation in the filtered violations
        return hasPendingRTERViolation(filteredTransactionViolations);
    });
    return transactionsWithRTERViolations.length > 0 && transactionsWithRTERViolations.every((value) => value === true);
}

/**
 * Check if there is any transaction without RTER violation within the given transactionIDs.
 */
function hasAnyTransactionWithoutRTERViolation(
    transactions: Transaction[],
    transactionViolations: OnyxCollection<TransactionViolations> | undefined,
    currentUserEmail: string,
    currentUserAccountID: number,
    report: OnyxEntry<Report>,
    reportOwnerLogin: string | undefined,
    policy: OnyxEntry<Policy>,
): boolean {
    return (
        transactions.length > 0 &&
        transactions.some((transaction) => {
            return !hasBrokenConnectionViolation(transaction, transactionViolations, currentUserEmail, currentUserAccountID, report, reportOwnerLogin, policy);
        })
    );
}

/**
 * Check if the transaction is pending or has a pending rter violation.
 */
function hasPendingUI(transaction: OnyxEntry<Transaction>, transactionViolations?: TransactionViolations | null): boolean {
    return isScanning(transaction) || isPending(transaction) || (!!transaction && hasPendingRTERViolation(transactionViolations));
}

/**
 * Check if transaction has duplicatedTransaction violation.
 * @param transactionID - the transaction to check
 */
function isDuplicate(
    transaction: OnyxEntry<Transaction>,
    currentUserEmail: string,
    currentUserAccountID: number,
    iouReport: OnyxEntry<Report>,
    iouReportOwnerLogin: string | undefined,
    policy: OnyxEntry<Policy>,
    transactionViolation: OnyxEntry<TransactionViolations>,
): boolean {
    if (!transaction || !shouldShowViolation(iouReport, policy, CONST.VIOLATIONS.DUPLICATED_TRANSACTION, currentUserEmail, currentUserAccountID, true, transaction)) {
        return false;
    }

    const duplicatedTransactionViolation = transactionViolation?.find((violation: TransactionViolation) => violation.name === CONST.VIOLATIONS.DUPLICATED_TRANSACTION);
    const hasDuplicatedTransactionViolation = !!duplicatedTransactionViolation;
    const isDuplicatedTransactionViolationDismissed = isViolationDismissed(
        transaction,
        duplicatedTransactionViolation,
        currentUserEmail,
        currentUserAccountID,
        iouReport,
        iouReportOwnerLogin,
        policy,
    );

    return hasDuplicatedTransactionViolation && !isDuplicatedTransactionViolationDismissed;
}

/**
 * Checks if a violation is dismissed for the given transaction.
 */
function isViolationDismissed(
    transaction: OnyxEntry<Transaction>,
    violation: TransactionViolation | undefined,
    currentUserEmail: string,
    currentUserAccountID: number,
    iouReport: OnyxEntry<Report>,
    iouReportOwnerLogin: string | undefined,
    policy: OnyxEntry<Policy>,
): boolean {
    if (!transaction || !violation) {
        return false;
    }

    const violationDismissals = transaction.comment?.dismissedViolations?.[violation.name];
    if (!violationDismissals) {
        return false;
    }

    const dismissedByEmails = Object.keys(violationDismissals);

    // Current user dismissed it themselves
    if (dismissedByEmails.includes(currentUserEmail)) {
        return true;
    }

    // RTER violations on instant submit reports only need to be dismissed by one person to be considered dismissed
    if (violation.name === CONST.VIOLATIONS.RTER && policy && isInstantSubmitEnabled(policy)) {
        return dismissedByEmails.length > 0;
    }

    // If the admin is looking at an open report, we check for both, submitter and admin.
    if (!iouReport) {
        return false;
    }

    const isSubmitter = iouReport.ownerAccountID === currentUserAccountID;
    const shouldViewAsSubmitter = !isSubmitter && isOpenExpenseReport(iouReport);

    if (shouldViewAsSubmitter && iouReportOwnerLogin && dismissedByEmails.includes(iouReportOwnerLogin)) {
        return true;
    }

    return false;
}

/**
 * Checks if violations are supported for the given transaction
 */
function doesTransactionSupportViolations(transaction: Transaction | undefined): transaction is Transaction {
    if (!transaction) {
        return false;
    }
    return true;
}

/**
 * Checks if any violations for the provided transaction are of type 'violation'
 */
function hasViolation(
    transaction: Transaction | undefined,
    transactionViolations: TransactionViolation[] | OnyxCollection<TransactionViolation[]>,
    currentUserEmail: string,
    currentUserAccountID: number,
    iouReport: OnyxEntry<Report>,
    iouReportOwnerLogin: string | undefined,
    policy: OnyxEntry<Policy>,
    showInReview?: boolean,
): boolean {
    if (!doesTransactionSupportViolations(transaction)) {
        return false;
    }
    const violations = Array.isArray(transactionViolations) ? transactionViolations : transactionViolations?.[ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS + transaction.transactionID];

    return !!violations?.some(
        (violation) =>
            violation.type === CONST.VIOLATION_TYPES.VIOLATION &&
            (showInReview === undefined || showInReview === (violation.showInReview ?? false)) &&
            (violation.name !== CONST.VIOLATIONS.DUPLICATED_TRANSACTION || !isIOUReport(iouReport)) &&
            !isViolationDismissed(transaction, violation, currentUserEmail, currentUserAccountID, iouReport, iouReportOwnerLogin, policy),
    );
}

function hasDuplicateTransactions(
    currentUserEmail: string,
    currentUserAccountID: number,
    iouReport: OnyxEntry<Report>,
    ownerLogin: string | undefined,
    policy: OnyxEntry<Policy>,
    allTransactionViolations: OnyxCollection<TransactionViolation[]>,
    reportTransactions: Transaction[],
): boolean {
    return (
        reportTransactions.length > 0 &&
        reportTransactions.some((transaction) =>
            isDuplicate(
                transaction,
                currentUserEmail,
                currentUserAccountID,
                iouReport,
                ownerLogin,
                policy,
                allTransactionViolations?.[ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS + transaction.transactionID],
            ),
        )
    );
}

/**
 * Checks if any violations for the provided transaction are of type 'notice'
 */
function hasNoticeTypeViolation(
    transaction: OnyxEntry<Transaction>,
    transactionViolations: TransactionViolation[] | OnyxCollection<TransactionViolation[]>,
    currentUserEmail: string,
    currentUserAccountID: number,
    iouReport: OnyxEntry<Report>,
    iouReportOwnerLogin: string | undefined,
    policy: OnyxEntry<Policy>,
    showInReview?: boolean,
): boolean {
    if (!doesTransactionSupportViolations(transaction)) {
        return false;
    }
    const violations = Array.isArray(transactionViolations) ? transactionViolations : transactionViolations?.[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction?.transactionID}`];

    return !!violations?.some(
        (violation: TransactionViolation) =>
            violation.type === CONST.VIOLATION_TYPES.NOTICE &&
            (showInReview === undefined || showInReview === (violation.showInReview ?? false)) &&
            !isViolationDismissed(transaction, violation, currentUserEmail, currentUserAccountID, iouReport, iouReportOwnerLogin, policy) &&
            shouldShowViolation(iouReport, policy, violation.name, currentUserEmail, currentUserAccountID, true, transaction),
    );
}

/**
 * Checks if any violations for the provided transaction are of type 'warning'
 */
function hasWarningTypeViolation(
    transaction: OnyxEntry<Transaction>,
    transactionViolations: TransactionViolation[] | OnyxCollection<TransactionViolation[]>,
    currentUserEmail: string,
    currentUserAccountID: number,
    iouReport: OnyxEntry<Report>,
    iouReportOwnerLogin: string | undefined,
    policy: OnyxEntry<Policy>,
    showInReview?: boolean,
): boolean {
    if (!doesTransactionSupportViolations(transaction)) {
        return false;
    }
    const violations = Array.isArray(transactionViolations) ? transactionViolations : transactionViolations?.[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction?.transactionID}`];

    const warningTypeViolations =
        violations?.filter(
            (violation: TransactionViolation) =>
                violation.type === CONST.VIOLATION_TYPES.WARNING &&
                (showInReview === undefined || showInReview === (violation.showInReview ?? false)) &&
                !isViolationDismissed(transaction, violation, currentUserEmail, currentUserAccountID, iouReport, iouReportOwnerLogin, policy),
        ) ?? [];

    return warningTypeViolations.length > 0;
}

/**
 * Returns true if the violation should block report submission.
 */
function isSubmissionBlockingViolation(violation: TransactionViolation): boolean {
    return violation.name === CONST.VIOLATIONS.SMARTSCAN_FAILED || violation.name === CONST.VIOLATIONS.NO_ROUTE;
}

/**
 * Returns true if the transaction has at least one violation that should block report submission.
 */
function hasSubmissionBlockingViolationInList(violations: TransactionViolation[] | null | undefined): boolean {
    return !!violations?.some(isSubmissionBlockingViolation);
}

/**
 * Returns true if any report transaction has a violation that should block report submission.
 * Allows callers to use an optimistic violation list for one transaction before it is written to Onyx.
 */
function hasSubmissionBlockingViolationInReport(
    transactions: Array<OnyxEntry<Transaction>>,
    transactionViolations: OnyxCollection<TransactionViolations> | undefined,
    optimisticTransactionID?: string,
    optimisticViolations?: TransactionViolations | null,
): boolean {
    return transactions.some((transaction) => {
        if (!transaction) {
            return false;
        }

        const violations =
            transaction.transactionID === optimisticTransactionID
                ? optimisticViolations
                : transactionViolations?.[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction.transactionID}`];

        return hasSubmissionBlockingViolationInList(violations);
    });
}

/**
 * Returns true if a transaction have violations that should block report submission.
 */
function hasSubmissionBlockingViolations(
    transaction: Transaction,
    transactionViolations: OnyxCollection<TransactionViolations> | undefined,
    currentUserEmail: string,
    currentUserAccountID: number,
    report: OnyxEntry<Report>,
    reportOwnerLogin: string | undefined,
    policy: OnyxEntry<Policy>,
): boolean {
    const violations = getTransactionViolations(transaction, transactionViolations, currentUserEmail, currentUserAccountID, report, reportOwnerLogin, policy);
    return hasSubmissionBlockingViolationInList(violations);
}

function isTransactionSubmittable(
    transaction: Transaction,
    report: OnyxEntry<Report>,
    transactionViolations: OnyxCollection<TransactionViolations> | undefined,
    currentUserEmail: string | undefined,
    currentUserAccountID: number | undefined,
    reportOwnerLogin: string | undefined,
    policy: OnyxEntry<Policy>,
    isTransactionScanning: (transactionToCheck: OnyxEntry<Transaction>) => boolean = isScanning,
): boolean {
    if (isTransactionScanning(transaction) || (isExpensifyCardTransaction(transaction) && isPending(transaction)) || hasSmartScanFailedWithMissingFields([transaction], report)) {
        return false;
    }

    if (transactionViolations && currentUserEmail && currentUserAccountID !== undefined) {
        return !hasSubmissionBlockingViolations(transaction, transactionViolations, currentUserEmail, currentUserAccountID, report, reportOwnerLogin, policy);
    }

    return true;
}

export {
    allHavePendingRTERViolation,
    getTransactionViolations,
    getUnsuppressibleBrokenConnectionTransactionID,
    getVisibleTransactionViolations,
    hasAnyPendingRTERViolation,
    hasAnyTransactionWithoutRTERViolation,
    hasCustomUnitOutOfPolicyViolation,
    hasDuplicateTransactions,
    hasNoticeTypeViolation,
    hasPendingRTERViolation,
    hasPendingUI,
    hasSubmissionBlockingViolationInList,
    hasSubmissionBlockingViolationInReport,
    hasSubmissionBlockingViolations,
    hasTransactionBeenRejected,
    hasViolation,
    hasWarningTypeViolation,
    isBrokenConnectionViolation,
    isDuplicate,
    isTransactionSubmittable,
    isViolationDismissed,
    mergeProhibitedViolations,
    shouldShowBrokenConnectionViolation,
    shouldShowBrokenConnectionViolationForMultipleTransactions,
    shouldShowViolation,
    shouldSuppressBrokenConnectionStatus,
};
