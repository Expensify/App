import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';

import {search} from '@libs/actions/Search';
import {getIOUActionForTransactionID} from '@libs/ReportActionsUtils';
import {buildQueryStringFromFilterFormValues, buildSearchQueryJSON} from '@libs/SearchQueryUtils';
import {getAmount, getCreated, getCurrency, getMerchantName} from '@libs/TransactionUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction, Transaction} from '@src/types/onyx';

import {useIsFocused} from '@react-navigation/native';
import {useEffect, useEffectEvent, useMemo} from 'react';

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
    transaction: Transaction;

    /** The expense's parent IOU report action, from the snapshot */
    reportAction?: ReportAction;

    /** The expense's parent report, from the snapshot */
    report?: Report;
};

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
    const {translate} = useLocalize();
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

        const reportByReportID = new Map<string, Report>();
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
                    reportByReportID.set(report.reportID, report);
                }
                continue;
            }
            if (key.startsWith(ONYXKEYS.COLLECTION.TRANSACTION)) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
                snapshotTransactions.push(value as Transaction);
            }
        }

        const filtered = snapshotTransactions.filter((transaction): transaction is Transaction & {reportID: string} => {
            if (!transaction?.reportID) {
                return false;
            }
            // Unreported expenses have no parent report to resolve ownership from, but always belong to the user.
            if (transaction.reportID === CONST.REPORT.UNREPORTED_REPORT_ID) {
                return true;
            }
            const ownerAccountID = reportByReportID.get(transaction.reportID)?.ownerAccountID;
            return ownerAccountID === undefined || ownerAccountID === accountID;
        });

        // Order by the snapshot's `inserted` timestamp (the immutable insertion time), most recent first.
        return filtered
            .sort((firstTransaction, secondTransaction) => {
                const firstInserted = firstTransaction.inserted ?? '';
                const secondInserted = secondTransaction.inserted ?? '';
                if (firstInserted !== secondInserted) {
                    return firstInserted < secondInserted ? 1 : -1;
                }
                return firstTransaction.transactionID < secondTransaction.transactionID ? 1 : -1;
            })
            .slice(0, CONST.HOME.SECTION_VISIBLE_LIMIT)
            .map((transaction) => {
                const reportType = reportByReportID.get(transaction.reportID)?.type;
                const isFromExpenseReport = reportType === CONST.REPORT.TYPE.EXPENSE;
                // Self-DM and unreported (tracked) expenses support signed amounts like expense reports, so their
                // sign must be preserved too. Without this, a self-DM credit/refund is collapsed to its absolute
                // value and loses its negative sign.
                const isFromTrackedExpense =
                    transaction.reportID === CONST.REPORT.UNREPORTED_REPORT_ID || reportByReportID.get(transaction.reportID)?.chatType === CONST.REPORT.CHAT_TYPE.SELF_DM;
                return {
                    transactionID: transaction.transactionID,
                    reportID: transaction.reportID,
                    created: getCreated(transaction),
                    merchant: getMerchantName(transaction, translate),
                    // Expense-report, self-DM, and tracked transactions are stored with an inverted sign, so the
                    // displayed amount must be negated for them (mirrors the Search transaction list).
                    amount: getAmount(transaction, isFromExpenseReport, isFromTrackedExpense),
                    currency: getCurrency(transaction),
                    reportAction: getIOUActionForTransactionID(snapshotReportActions, transaction.transactionID),
                    report: reportByReportID.get(transaction.reportID),
                    transaction,
                };
            });
    }, [snapshotData, accountID, translate]);

    return {transactions};
}

export {useRecentlyAddedData};
export type {RecentlyAddedExpense};
