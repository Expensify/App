import {useIsFocused} from '@react-navigation/native';
import {useEffect, useEffectEvent, useMemo} from 'react';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import {search} from '@libs/actions/Search';
import {getIOUActionForTransactionID} from '@libs/ReportActionsUtils';
import {buildQueryStringFromFilterFormValues, buildSearchQueryJSON} from '@libs/SearchQueryUtils';
import {getAmount, getCreated, getCurrency, getMerchant} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction, Transaction} from '@src/types/onyx';

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

    /**
     * The transaction thread report to open for this expense, resolved from the snapshot's IOU action.
     * Needed for unreported (tracked) expenses, whose thread lives in the self-DM and is absent from the
     * main Onyx collection.
     */
    threadReportID?: string;

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
 *
 * Expenses come from the user's expense Search snapshot rather than the `transactions_` collection, which holds
 * only on-demand data and may be missing most expenses.
 */
function useRecentlyAddedData(): {transactions: RecentlyAddedExpense[]} {
    const {accountID} = useCurrentUserPersonalDetails();
    const {isOffline} = useNetwork();
    const isFocused = useIsFocused();

    const query = useMemo(
        () =>
            buildQueryStringFromFilterFormValues({
                type: CONST.SEARCH.DATA_TYPES.EXPENSE,
                from: [String(accountID)],
            }),
        [accountID],
    );
    const queryJSON = useMemo(() => buildSearchQueryJSON(query), [query]);
    const hash = queryJSON?.hash;

    const [searchResults] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${hash}`);

    const fireSearch = useEffectEvent(() => {
        if (isOffline || !queryJSON) {
            return;
        }
        search({
            queryJSON,
            searchKey: undefined,
            offset: 0,
            isOffline,
            isLoading: false,
            shouldCalculateTotals: false,
            shouldUpdateLastSearchParams: false,
        });
    });

    useEffect(() => {
        if (!isFocused) {
            return;
        }
        fireSearch();
    }, [isFocused, isOffline, hash]);

    const snapshotData = searchResults?.data;

    const transactions = useMemo(() => {
        const data = snapshotData;
        if (!data) {
            return [];
        }

        const reportOwnerByReportID = new Map<string, number | undefined>();
        const snapshotTransactions: Transaction[] = [];
        const snapshotReportActions: ReportAction[] = [];
        // Snapshot data is a keyed record where the key prefix determines the value type.
        for (const [key, value] of Object.entries(data)) {
            if (key.startsWith(ONYXKEYS.COLLECTION.REPORT_ACTIONS)) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
                snapshotReportActions.push(...Object.values((value ?? {}) as Record<string, ReportAction>));
                continue;
            }
            if (key.startsWith(ONYXKEYS.COLLECTION.REPORT)) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
                const report = value as Report;
                if (report?.reportID) {
                    reportOwnerByReportID.set(report.reportID, report.ownerAccountID);
                }
                continue;
            }
            if (key.startsWith(ONYXKEYS.COLLECTION.TRANSACTION)) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
                snapshotTransactions.push(value as Transaction);
            }
        }

        return snapshotTransactions
            .filter((transaction): transaction is Transaction & {reportID: string} => {
                if (!transaction?.reportID) {
                    return false;
                }
                // Unreported expenses have no parent report to resolve ownership from, but always belong to the user.
                if (transaction.reportID === CONST.REPORT.UNREPORTED_REPORT_ID) {
                    return true;
                }
                const ownerAccountID = reportOwnerByReportID.get(transaction.reportID);
                return ownerAccountID === undefined || ownerAccountID === accountID;
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
                threadReportID: getIOUActionForTransactionID(snapshotReportActions, transaction.transactionID)?.childReportID,
                transaction,
            }));
    }, [snapshotData, accountID]);

    return {transactions};
}

export {useRecentlyAddedData};
export type {RecentlyAddedExpense};
