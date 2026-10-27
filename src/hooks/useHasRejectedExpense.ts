import {hasReportBeenRejectedToSubmitter, isCurrentUserSubmitter} from '@libs/ReportUtils';
import {isExpenseUnreported} from '@libs/TransactionUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, Transaction, TransactionViolations} from '@src/types/onyx';
import getEmptyArray from '@src/types/utils/getEmptyArray';

import type {OnyxCollection} from 'react-native-onyx';

import {sessionEmailAndAccountIDSelector} from '@selectors/Session';
// We need direct access to useOnyx from react-native-onyx to avoid reading search snapshots instead of live data
// eslint-disable-next-line no-restricted-imports
import {useOnyx} from 'react-native-onyx';

type RejectedTransactionsLocation = {
    /** Whether a rejected expense is unreported */
    hasUnreportedRejectedTransaction: boolean;

    /** IDs of the reports that hold a rejected expense */
    reportIDs: string[];
};

// Approvers and admins also keep the rejected-expense violation of expenses they rejected, so skip the current user's own rejections.
const rejectedTransactionIDsSelector =
    (currentUserEmail: string | undefined) =>
    (allTransactionViolations: OnyxCollection<TransactionViolations>): string[] =>
        Object.entries(allTransactionViolations ?? {})
            .filter(([, transactionViolations]) =>
                transactionViolations?.some(
                    (violation) => violation.name === CONST.VIOLATIONS.AUTO_REPORTED_REJECTED_EXPENSE && (!currentUserEmail || violation.data?.rejectedBy !== currentUserEmail),
                ),
            )
            .map(([key]) => key.replace(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, ''));

// The violation doesn't say who submitted the expense, so find where each rejected expense lives to check its owner.
const rejectedTransactionsLocationSelector =
    (rejectedTransactionIDs: string[]) =>
    (allTransactions: OnyxCollection<Transaction>): RejectedTransactionsLocation => {
        const location: RejectedTransactionsLocation = {hasUnreportedRejectedTransaction: false, reportIDs: []};
        for (const transactionID of rejectedTransactionIDs) {
            const transaction = allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
            if (!transaction) {
                continue;
            }
            // Rejecting an expense on an instantly submitted report moves it out of the report. Unreported expenses are
            // only synced to their owner.
            if (!transaction.reportID || isExpenseUnreported(transaction)) {
                location.hasUnreportedRejectedTransaction = true;
                continue;
            }
            location.reportIDs.push(transaction.reportID);
        }
        return location;
    };

// A whole-report rejection doesn't add a violation to the report's transactions, so it has to be checked on the report.
const hasOwnRejectedReportSelector =
    (currentUserAccountID: number | undefined, rejectedTransactionReportIDs: string[]) =>
    (allReports: OnyxCollection<Report>): boolean =>
        Object.values(allReports ?? {}).some(
            (report) =>
                !!currentUserAccountID &&
                isCurrentUserSubmitter(report, currentUserAccountID) &&
                (hasReportBeenRejectedToSubmitter(report) || (!!report?.reportID && rejectedTransactionReportIDs.includes(report.reportID))),
        );

/**
 * Whether the current user has at least one of their own expenses rejected, either on its own or as part of a rejected report.
 * The last selector returns a boolean so consumers only re-render when the answer changes.
 */
function useHasRejectedExpense(): boolean {
    const [session] = useOnyx(ONYXKEYS.SESSION, {selector: sessionEmailAndAccountIDSelector});
    const [rejectedTransactionIDs = getEmptyArray<string>()] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, {selector: rejectedTransactionIDsSelector(session?.email)});
    const [rejectedTransactionsLocation] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {selector: rejectedTransactionsLocationSelector(rejectedTransactionIDs)});
    const [hasOwnRejectedReport = false] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {
        selector: hasOwnRejectedReportSelector(session?.accountID, rejectedTransactionsLocation?.reportIDs ?? getEmptyArray<string>()),
    });

    return !!rejectedTransactionsLocation?.hasUnreportedRejectedTransaction || hasOwnRejectedReport;
}

export default useHasRejectedExpense;
