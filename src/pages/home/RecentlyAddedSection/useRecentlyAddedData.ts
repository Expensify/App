import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';

import {search} from '@libs/actions/Search';
import {getIOUActionForTransactionID} from '@libs/ReportActionsUtils';
import {buildQueryStringFromFilterFormValues, buildSearchQueryJSON} from '@libs/SearchQueryUtils';
import {getAmount, getCreated, getCurrency, getMerchantName, getTransactionPendingAction} from '@libs/TransactionUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction, Transaction} from '@src/types/onyx';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';

import {useIsFocused} from '@react-navigation/native';
import {useEffect, useEffectEvent, useMemo, useState} from 'react';

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

    /** Pending action for locally-created expenses not yet synced, so the row can render the offline pending treatment */
    pendingAction?: PendingAction;

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
 *
 * The Search snapshot is only refreshed by an online API call, so a just-created expense (e.g. one added while
 * offline) is absent from it until the next successful search. To keep the slot reflecting optimistic data, any
 * locally-created expense the snapshot hasn't confirmed yet is merged in and deduped against the
 * snapshot by `transactionID`. This mirrors how other transaction lists surface offline-pending rows.
 *
 * Offline edits and deletes mutate only the local `transactions_` copy, never the snapshot, so each row prefers
 * its local copy when present. That keeps the displayed values fresh and lets the row render the offline pending
 * treatment for edits (`pendingFields` -> UPDATE) and deletes (DELETE), not just creates.
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
    const [localTransactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION);

    // Maps transactionID -> local `transactions_` copy. When present it carries the freshest optimistic state
    // (edited values and `pendingFields`) for an offline edit, which the server-backed snapshot doesn't yet reflect.
    const localTransactionByID = useMemo(() => {
        const map = new Map<string, Transaction>();
        for (const [key, transaction] of Object.entries(localTransactions ?? {})) {
            if (!transaction) {
                continue;
            }
            map.set(transaction.transactionID ?? key.slice(ONYXKEYS.COLLECTION.TRANSACTION.length), transaction);
        }
        return map;
    }, [localTransactions]);

    // Holding a just-created expense here keeps it in the slot after `pendingAction` clears on sync but before the
    // refreshed snapshot arrives (otherwise it briefly disappears and reappears).
    const [unconfirmedTransactionIDs, setUnconfirmedTransactionIDs] = useState(() => new Set<string>());

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

    const {transactions, nextUnconfirmedTransactionIDs} = useMemo(() => {
        const data = snapshotData ?? {};

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

        // Merge in locally-pending expenses, skipping any already in the snapshot so a row never appears twice.
        // A local optimistic ADD always belongs to the current user, so no ownership check is needed (unlike the snapshot path).
        const snapshotTransactionIDs = new Set(snapshotTransactions.map((transaction) => transaction.transactionID));
        const pendingAddIDs = Object.values(localTransactions ?? {})
            .filter((transaction): transaction is Transaction => transaction?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD)
            .map((transaction) => transaction.transactionID);
        const nextUnconfirmed = new Set([...unconfirmedTransactionIDs, ...pendingAddIDs].filter((transactionID) => !snapshotTransactionIDs.has(transactionID)));
        const combined = [
            ...filtered,
            ...Object.values(localTransactions ?? {}).filter(
                (transaction): transaction is Transaction & {reportID: string} => !!transaction?.reportID && nextUnconfirmed.has(transaction.transactionID),
            ),
        ]
            // When an expense is split, its (local) copy is reassigned to the synthetic SPLIT_REPORT_ID and the
            // resulting split children are added as new expenses. Drop the now-orphaned original so the slot shows
            // only the splits. Prefer the local copy's reportID, which reflects the split even before the snapshot refreshes.
            .filter((transaction) => (localTransactionByID.get(transaction.transactionID)?.reportID ?? transaction.reportID) !== CONST.REPORT.SPLIT_REPORT_ID);

        // Order by the transaction's `inserted` timestamp (the immutable insertion time), most recent first.
        const transactionsList = combined
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
                // An offline edit only mutates the local `transactions_` copy (updated values + `pendingFields`); the
                // snapshot keeps the stale, pre-edit copy. Prefer the local copy when present so the row reflects the
                // edit and can render the offline pending treatment, matching how the Search transaction list behaves.
                const sourceTransaction = localTransactionByID.get(transaction.transactionID) ?? transaction;
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
                    created: getCreated(sourceTransaction),
                    merchant: getMerchantName(sourceTransaction, translate),
                    // Expense-report, self-DM, and tracked transactions are stored with an inverted sign, so the
                    // displayed amount must be negated for them (mirrors the Search transaction list).
                    amount: getAmount(sourceTransaction, isFromExpenseReport, isFromTrackedExpense),
                    currency: getCurrency(sourceTransaction),
                    reportAction: getIOUActionForTransactionID(snapshotReportActions, transaction.transactionID),
                    report: reportByReportID.get(transaction.reportID),
                    // Derive from the local copy so an offline edit (which sets `pendingFields`, not `pendingAction`)
                    // still surfaces the pending state, alongside offline creates (ADD) and deletes (DELETE).
                    pendingAction: getTransactionPendingAction(sourceTransaction),
                    transaction: sourceTransaction,
                };
            });

        return {transactions: transactionsList, nextUnconfirmedTransactionIDs: nextUnconfirmed};
    }, [snapshotData, unconfirmedTransactionIDs, accountID, localTransactions, localTransactionByID, translate]);

    const hasSameUnconfirmedIDs =
        nextUnconfirmedTransactionIDs.size === unconfirmedTransactionIDs.size && [...nextUnconfirmedTransactionIDs].every((id) => unconfirmedTransactionIDs.has(id));
    if (!hasSameUnconfirmedIDs) {
        setUnconfirmedTransactionIDs(nextUnconfirmedTransactionIDs);
    }

    return {transactions};
}

export {useRecentlyAddedData};
export type {RecentlyAddedExpense};
