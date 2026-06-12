import {useMemo} from 'react';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useOnyx from '@hooks/useOnyx';
import {getAmount, getCreated, getCurrency, getMerchant} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction} from '@src/types/onyx';

/** A single expense row surfaced by the Recently added slot. */
type RecentlyAddedExpense = {
    /** The transaction's ID */
    transactionID: string;

    /** The report to open when the row is pressed */
    reportID: string;

    /** The expense date (used for display only, never for ordering) */
    created: string;

    /** The merchant name */
    merchant: string;

    /** The expense amount */
    amount: number;

    /** The expense currency */
    currency: string;

    /** The full transaction, used to render the receipt thumbnail */
    transaction?: Transaction;
};

/** The insertion timestamp drives ordering; fall back to the expense date when it is missing. */
function getInsertionSortKey(transaction: Transaction): string {
    return transaction.inserted ?? transaction.created ?? '';
}

/**
 * Returns the signed-in user's most recently added expenses, ordered by insertion timestamp (most recent first)
 * and capped at CONST.HOME.SECTION_VISIBLE_LIMIT. Ordering is independent of the expense date.
 */
function useRecentlyAddedData(): {transactions: RecentlyAddedExpense[]} {
    const {accountID} = useCurrentUserPersonalDetails();
    const [transactionsCollection] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION);
    const [reportsCollection] = useOnyx(ONYXKEYS.COLLECTION.REPORT);

    const transactions = useMemo(() => {
        const reportOwnerByReportID = new Map<string, number | undefined>();
        for (const report of Object.values(reportsCollection ?? {})) {
            if (!report?.reportID) {
                continue;
            }
            reportOwnerByReportID.set(report.reportID, report.ownerAccountID);
        }

        return Object.values(transactionsCollection ?? {})
            .filter((transaction): transaction is Transaction & {reportID: string} => {
                if (!transaction?.reportID) {
                    return false;
                }
                const ownerAccountID = reportOwnerByReportID.get(transaction.reportID);
                return ownerAccountID !== undefined && ownerAccountID === accountID;
            })
            .sort((firstTransaction, secondTransaction) => {
                const firstKey = getInsertionSortKey(firstTransaction);
                const secondKey = getInsertionSortKey(secondTransaction);
                if (firstKey === secondKey) {
                    return 0;
                }
                return firstKey < secondKey ? 1 : -1;
            })
            .slice(0, CONST.HOME.SECTION_VISIBLE_LIMIT)
            .map((transaction) => ({
                transactionID: transaction.transactionID,
                reportID: transaction.reportID,
                created: getCreated(transaction),
                merchant: getMerchant(transaction),
                amount: getAmount(transaction),
                currency: getCurrency(transaction),
                transaction,
            }));
    }, [transactionsCollection, reportsCollection, accountID]);

    return {transactions};
}

export {useRecentlyAddedData};
export type {RecentlyAddedExpense};
