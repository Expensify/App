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

import type {OnyxCollection} from 'react-native-onyx';

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

/** Selecting inside the subscription scans the (very large) collection once per update rather than once per render. */
const pendingTransactionIDsSelector = (transactions: OnyxCollection<Transaction>): {added: string[]; deleted: string[]} => {
    const added: string[] = [];
    const deleted: string[] = [];
    for (const transaction of Object.values(transactions ?? {})) {
        if (transaction?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD) {
            added.push(transaction.transactionID);
        } else if (transaction?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
            deleted.push(transaction.transactionID);
        }
    }
    return {added, deleted};
};

const getLocalTransaction = (localTransactions: OnyxCollection<Transaction>, transactionID: string) => localTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];

type RecentlyAddedData = {
    /** The expenses to show, most recently inserted first, capped at CONST.HOME.SECTION_VISIBLE_LIMIT */
    transactions: RecentlyAddedExpense[];

    /** False means the outcome is settled, so an empty `transactions` is the real answer and not a gap in knowledge. */
    isAwaitingFirstResult: boolean;
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
 *
 * A successful delete then removes that local copy while leaving the snapshot untouched, which would make the row
 * fall back to the snapshot and reappear as a live expense. Deleted IDs are therefore remembered and suppressed
 * until the snapshot stops listing them.
 */
function useRecentlyAddedData(): RecentlyAddedData {
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
    // Read by key only, never iterated: the collection holds tens of thousands of entries.
    const [localTransactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION);
    const [pendingTransactionIDs] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {selector: pendingTransactionIDsSelector});

    // Holding a just-created expense here keeps it in the slot after `pendingAction` clears on sync but before the
    // refreshed snapshot arrives (otherwise it briefly disappears and reappears).
    const [unconfirmedTransactionIDs, setUnconfirmedTransactionIDs] = useState(() => new Set<string>());

    // The mirror of the above: a delete removes the local `transactions_` copy on success but never touches the
    // snapshot, so a snapshot that still lists the expense would resurrect it as a live row. Remembering the ID
    // keeps it suppressed until the snapshot catches up.
    const [deletedTransactionIDs, setDeletedTransactionIDs] = useState(() => new Set<string>());

    const fireSearch = useEffectEvent(() => {
        if (isOffline || !queryJSON) {
            return;
        }
        search({
            queryJSON,
            searchKey: undefined,
            offset: 0,
            isLoading: false,
            shouldCalculateTotals: false,
            shouldUpdateLastSearchParams: false,
            // The query only filters on the current accountID, which is available before OpenApp responds. Don't sit behind it.
            skipWaitForWrites: true,
        });
    });

    useEffect(() => {
        if (!isFocused) {
            return;
        }
        fireSearch();
    }, [isFocused, isOffline, hash]);

    const snapshotData = searchResults?.data;

    const hasSearchErrors = Object.keys(searchResults?.errors ?? {}).length > 0;

    // Every term below is terminal, so the slot resolves to rows or to the empty state rather than an endless skeleton.
    // `state: loaded` cannot be read alone because failures reach it too, and snapshot data without `state` counts as
    // terminal because the IOU optimistic update writes data without it.
    // `SearchUIUtils.isSearchDataLoaded` is deliberately not reused: it recomputes hashes for sort round-tripping this
    // fixed query never does.
    const hasResolved = searchResults?.search?.state === CONST.SEARCH.SNAPSHOT_STATE.LOADED || !!snapshotData;
    const isAwaitingFirstResult = !!queryJSON && !hasResolved && !hasSearchErrors && !isOffline;

    const {transactions, nextUnconfirmedTransactionIDs, nextDeletedTransactionIDs} = useMemo(() => {
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
        const nextUnconfirmed = new Set([...unconfirmedTransactionIDs, ...(pendingTransactionIDs?.added ?? [])].filter((transactionID) => !snapshotTransactionIDs.has(transactionID)));

        // A locally-deleted expense stays suppressed only while the snapshot still lists it. An ID is released once
        // the snapshot drops it (the delete is fully reflected) or once a local copy reappears without a DELETE
        // pending action, which is how a failed delete rolls the expense back.
        const nextDeleted = new Set(
            [...deletedTransactionIDs, ...(pendingTransactionIDs?.deleted ?? [])].filter((transactionID) => {
                if (!snapshotTransactionIDs.has(transactionID)) {
                    return false;
                }
                const localTransaction = getLocalTransaction(localTransactions, transactionID);
                return !localTransaction || localTransaction.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
            }),
        );

        const combined = [
            ...filtered,
            // Resolved by key, not from `pendingTransactionIDs.added`: an ID held over from `unconfirmedTransactionIDs` may
            // have had its `pendingAction` cleared by a sync.
            ...[...nextUnconfirmed]
                .map((transactionID) => getLocalTransaction(localTransactions, transactionID))
                .filter((transaction): transaction is Transaction & {reportID: string} => !!transaction?.reportID),
        ].filter((transaction) => {
            const localTransaction = getLocalTransaction(localTransactions, transaction.transactionID);

            // When an expense is split, its (local) copy is reassigned to the synthetic SPLIT_REPORT_ID and the
            // resulting split children are added as new expenses. Drop the now-orphaned original so the slot shows
            // only the splits. Prefer the local copy's reportID, which reflects the split even before the snapshot refreshes.
            if ((localTransaction?.reportID ?? transaction.reportID) === CONST.REPORT.SPLIT_REPORT_ID) {
                return false;
            }

            // Drop a watched delete only once its local copy is gone (the delete succeeded). While the local copy is
            // still there the row stays visible so it can render the DELETE pending treatment.
            return !nextDeleted.has(transaction.transactionID) || !!localTransaction;
        });

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
                const sourceTransaction = getLocalTransaction(localTransactions, transaction.transactionID) ?? transaction;
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

        return {transactions: transactionsList, nextUnconfirmedTransactionIDs: nextUnconfirmed, nextDeletedTransactionIDs: nextDeleted};
    }, [snapshotData, unconfirmedTransactionIDs, deletedTransactionIDs, accountID, localTransactions, pendingTransactionIDs?.added, pendingTransactionIDs?.deleted, translate]);

    const hasSameUnconfirmedIDs =
        nextUnconfirmedTransactionIDs.size === unconfirmedTransactionIDs.size && [...nextUnconfirmedTransactionIDs].every((id) => unconfirmedTransactionIDs.has(id));
    if (!hasSameUnconfirmedIDs) {
        setUnconfirmedTransactionIDs(nextUnconfirmedTransactionIDs);
    }

    const hasSameDeletedIDs = nextDeletedTransactionIDs.size === deletedTransactionIDs.size && [...nextDeletedTransactionIDs].every((id) => deletedTransactionIDs.has(id));
    if (!hasSameDeletedIDs) {
        setDeletedTransactionIDs(nextDeletedTransactionIDs);
    }

    return {transactions, isAwaitingFirstResult};
}

export {useRecentlyAddedData};
export type {RecentlyAddedExpense};
