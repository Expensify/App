/** Detects the current user's rejected expenses without counting expenses visible only as an approver. */
import {hasReportBeenRejectedToSubmitter, isCurrentUserSubmitter} from '@libs/ReportUtils';
import {isExpenseUnreported} from '@libs/TransactionUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, Transaction, TransactionViolations} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

import {accountIDSelector, emailSelector} from '@selectors/Session';
// Suggested-search visibility must use live data, not the currently displayed search snapshot.
// eslint-disable-next-line no-restricted-imports
import {useOnyx} from 'react-native-onyx';

type RejectedTransactionsLocation = {
    hasUnreportedRejectedTransaction: boolean;
    reportIDs: string[];
};

// Approvers also retain violations for expenses they rejected, including expenses moved out of a report.
const getRejectedTransactionIDs = (allTransactionViolations: OnyxCollection<TransactionViolations>, currentUserEmail: string | undefined): string[] =>
    Object.entries(allTransactionViolations ?? {})
        .filter(([, transactionViolations]) =>
            transactionViolations?.some(
                (violation) => violation.name === CONST.VIOLATIONS.AUTO_REPORTED_REJECTED_EXPENSE && (!currentUserEmail || violation.data?.rejectedBy !== currentUserEmail),
            ),
        )
        .map(([key]) => key.replace(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, ''));

// Violations have no submitter, so join rejected transactions to their reports to check ownership.
const getRejectedTransactionsLocation = (allTransactions: OnyxCollection<Transaction>, rejectedTransactionIDs: string[]): RejectedTransactionsLocation => {
    const location: RejectedTransactionsLocation = {hasUnreportedRejectedTransaction: false, reportIDs: []};
    for (const transactionID of rejectedTransactionIDs) {
        const transaction = allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
        if (!transaction) {
            continue;
        }
        // Rejection on an instantly submitted report moves the expense back to the owner's unreported expenses.
        if (!transaction.reportID || isExpenseUnreported(transaction)) {
            location.hasUnreportedRejectedTransaction = true;
            continue;
        }
        location.reportIDs.push(transaction.reportID);
    }
    return location;
};

// Whole-report rejections do not add per-transaction violations.
const hasOwnRejectedReportSelector =
    (currentUserAccountID: number | undefined, rejectedTransactionReportIDs: string[]) =>
    (allReports: OnyxCollection<Report>): boolean =>
        !!currentUserAccountID &&
        Object.values(allReports ?? {}).some(
            (report) =>
                isCurrentUserSubmitter(report, currentUserAccountID) &&
                (hasReportBeenRejectedToSubmitter(report) || (!!report?.reportID && rejectedTransactionReportIDs.includes(report.reportID))),
        );

function useHasRejectedExpense(): boolean {
    const [accountID] = useOnyx(ONYXKEYS.SESSION, {selector: accountIDSelector});
    const [email] = useOnyx(ONYXKEYS.SESSION, {selector: emailSelector});
    // The ownership join needs IDs from both collections. Raw reads avoid deep-comparing intermediate ID arrays.
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const [transactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION);
    const rejectedTransactionIDs = getRejectedTransactionIDs(transactionViolations, email);
    const rejectedTransactionsLocation = getRejectedTransactionsLocation(transactions, rejectedTransactionIDs);
    const [hasOwnRejectedReport = false] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {
        selector: hasOwnRejectedReportSelector(accountID, rejectedTransactionsLocation.reportIDs),
    });

    return !!accountID && (rejectedTransactionsLocation.hasUnreportedRejectedTransaction || hasOwnRejectedReport);
}

export default useHasRejectedExpense;
