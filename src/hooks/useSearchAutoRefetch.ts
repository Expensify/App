import type {TransactionListItemType} from '@components/Search/SearchList/ListItem/types';
import type {SearchQueryJSON} from '@components/Search/types';

import {search} from '@libs/actions/Search';
import isSearchTopmostFullScreenRoute from '@libs/Navigation/helpers/isSearchTopmostFullScreenRoute';
import TransitionTracker from '@libs/Navigation/TransitionTracker';
import {isReportActionEntry} from '@libs/SearchUIUtils';
import type {SearchKey} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportActions, SearchResults, Transaction} from '@src/types/onyx';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import {useIsFocused} from '@react-navigation/native';
import {useEffect, useRef} from 'react';

import useNetwork from './useNetwork';

type UseSearchAutoRefetch = {
    /** Current Search snapshot */
    searchResults: OnyxEntry<SearchResults>;

    /** Current transactions collection */
    transactions: OnyxCollection<Transaction>;

    /** Previous transactions collection, compared against `transactions` to detect newly-added ones */
    previousTransactions: OnyxCollection<Transaction>;

    /** Current report actions collection */
    reportActions: OnyxCollection<ReportActions>;

    /** Previous report actions collection, compared against `reportActions` to detect new entries */
    previousReportActions: OnyxCollection<ReportActions>;

    /** Parsed search query the refetch is issued for */
    queryJSON: SearchQueryJSON;

    /** Key identifying the current search */
    searchKey: SearchKey | undefined;

    /** Pagination offset for the refetch request */
    offset: number;

    /** Whether the refetch should recalculate result totals */
    shouldCalculateTotals: boolean;
};

/**
 * Triggers a search when a transaction or report action is added so the snapshot reflects it.
 * Returns the newly-added transactions, which the grouped views use to refetch each expanded group's child snapshot.
 */
function useSearchAutoRefetch({
    searchResults,
    transactions,
    previousTransactions,
    reportActions,
    previousReportActions,
    queryJSON,
    searchKey,
    offset,
    shouldCalculateTotals,
}: UseSearchAutoRefetch) {
    const isFocused = useIsFocused();
    const {isOffline} = useNetwork();
    const searchTriggeredRef = useRef(false);
    const hasPendingSearchRef = useRef(false);
    const isChat = queryJSON.type === CONST.SEARCH.DATA_TYPES.CHAT;

    const searchResultsData = searchResults?.data;

    const prevTransactionsIDs = Object.keys(previousTransactions ?? {});
    const newTransactions: Transaction[] = [];
    if (prevTransactionsIDs.length > 0) {
        const previousIDs = new Set(prevTransactionsIDs);
        for (const [id, transaction] of Object.entries(transactions ?? {})) {
            if (!previousIDs.has(id) && transaction) {
                newTransactions.push(transaction);
            }
        }
    }

    // Trigger search when a new report action is added while on chat or when a new transaction is added for the other search types.
    useEffect(() => {
        const previousTransactionIDsLocal = Object.keys(previousTransactions ?? {});
        const transactionsIDs = Object.keys(transactions ?? {});

        // Only proceed if we have previous data to compare against
        // This prevents triggering on initial data load
        const hasPreviousReportActions = Object.values(previousReportActions ?? {}).some((actions) => Object.keys(actions ?? {}).length > 0);
        if ((previousTransactionIDsLocal.length === 0 && !hasPreviousReportActions) || searchTriggeredRef.current) {
            return;
        }

        // Only chat searches are driven by report actions, so the rest skip walking that collection entirely.
        const reportActionsIDs = isChat ? Object.values(reportActions ?? {}).flatMap((actions) => Object.keys(actions ?? {})) : [];
        const previousReportActionsIDs = isChat ? Object.values(previousReportActions ?? {}).flatMap((actions) => Object.keys(actions ?? {})) : [];

        const previousTransactionsIDsSet = new Set(previousTransactionIDsLocal);
        const previousReportActionsIDsSet = new Set(previousReportActionsIDs);
        const hasTransactionsIDsChange = transactionsIDs.length !== previousTransactionIDsLocal.length || transactionsIDs.some((id) => !previousTransactionsIDsSet.has(id));
        const hasReportActionsIDsChange = reportActionsIDs.some((id) => !previousReportActionsIDsSet.has(id));

        // Editing an expense that the results already show changes no transaction ID, so the ID checks above miss it.
        // The rows and the footer total are served from the Search snapshot, and the footer total is computed by the
        // server, so those edits only become visible after a refetch.
        const hasChangedResultTransaction =
            !isChat && !hasTransactionsIDsChange && hasChangedTransactionInSearchResults(transactions, previousTransactions, previousTransactionsIDsSet, searchResultsData);

        // Check if there is a change in the transactions or report actions list
        if ((isChat ? hasReportActionsIDsChange : hasTransactionsIDsChange || hasChangedResultTransaction) || hasPendingSearchRef.current) {
            // Skip if offline, or if the user has navigated to a different fullscreen page entirely.
            // An RHP layered on top of Search makes `isFocused` false but keeps Search as the topmost
            // fullscreen route, so we still want to refetch — otherwise the snapshot can't reflect
            // entries the user creates from the RHP until they close it.
            const isSearchStillActive = isFocused || isSearchTopmostFullScreenRoute();
            if (!isSearchStillActive || isOffline) {
                hasPendingSearchRef.current = true;
                return;
            }
            // A deferred refetch is its own reason to search. `usePrevious` advances while Search is inactive, so by
            // the time it becomes active again the change that set the flag has washed out of the comparisons below.
            const hadPendingSearch = hasPendingSearchRef.current;
            hasPendingSearchRef.current = false;

            // Transaction Onyx keys are `transactions_<id>` but search results yield bare IDs, so read the ID off the value.
            const addedTransactionIDs: string[] = [];
            const currentTransactionIDs: string[] = [];
            for (const [key, transaction] of Object.entries(transactions ?? {})) {
                const transactionID = transaction?.transactionID;
                if (!transactionID) {
                    continue;
                }
                currentTransactionIDs.push(transactionID);
                if (!previousTransactionsIDsSet.has(key)) {
                    addedTransactionIDs.push(transactionID);
                }
            }

            let currentSearchResultIDs: string[] = [];
            if (searchResultsData) {
                currentSearchResultIDs = isChat ? extractReportActionIDsFromSearchResults(searchResultsData) : extractTransactionIDsFromSearchResults(searchResultsData);
            }
            const existingSearchResultIDsSet = new Set(currentSearchResultIDs);
            const hasAGenuinelyNewID = (isChat ? reportActionsIDs : addedTransactionIDs).some((id) => !existingSearchResultIDsSet.has(id));

            // Only skip search if there are no new items AND search results aren't empty
            // This ensures deletions that result in empty data still trigger search
            if (!hasAGenuinelyNewID && !hasChangedResultTransaction && !hadPendingSearch && currentSearchResultIDs.length > 0) {
                const currentIDsSet = new Set(isChat ? reportActionsIDs : currentTransactionIDs);
                const hasDeletedID = currentSearchResultIDs.some((id) => !currentIDsSet.has(id));
                if (!hasDeletedID) {
                    return;
                }
            }

            // Trigger the search
            TransitionTracker.runAfterTransitions({
                callback: () => {
                    search({queryJSON, searchKey, offset, shouldCalculateTotals, isLoading: !!searchResults?.search?.isLoading});
                },
            });

            // Set the ref to prevent further triggers until reset
            searchTriggeredRef.current = true;
        }
    }, [
        isFocused,
        transactions,
        previousTransactions,
        queryJSON,
        searchKey,
        offset,
        shouldCalculateTotals,
        reportActions,
        previousReportActions,
        isChat,
        searchResultsData,
        isOffline,
        searchResults?.search?.isLoading,
    ]);

    useEffect(() => {
        // For live data, isLoading is always false, so we also need to reset when searchResultsData changes
        // For snapshot data, we wait for isLoading to become false after the API call completes
        if (searchResults?.search?.isLoading) {
            return;
        }

        searchTriggeredRef.current = false;
    }, [searchResults?.search?.isLoading, searchResultsData]);

    return {newTransactions};
}

function getTransactionIDFromEntry(entry: unknown) {
    if (typeof entry !== 'object' || entry === null || !('transactionID' in entry) || typeof entry.transactionID !== 'string') {
        return undefined;
    }
    return entry.transactionID;
}

function hasNestedTransactions(entry: unknown): entry is {transactions: Array<Partial<TransactionListItemType>>} {
    if (typeof entry !== 'object' || entry === null || !('transactions' in entry)) {
        return false;
    }
    return Array.isArray(entry.transactions);
}

/**
 * Helper function to extract transaction IDs from search results data.
 */
function extractTransactionIDsFromSearchResults(searchResultsData: Partial<SearchResults['data']>): string[] {
    const transactionIDs: string[] = [];

    for (const item of Object.values(searchResultsData)) {
        // Check for transactionID directly on the item (TransactionListItemType)
        const transactionID = getTransactionIDFromEntry(item);
        if (transactionID) {
            transactionIDs.push(transactionID);
        }

        // Check for transactions array within the item (TransactionGroupListItemType)
        if (!hasNestedTransactions(item)) {
            continue;
        }
        for (const transaction of item.transactions) {
            const nestedTransactionID = getTransactionIDFromEntry(transaction);
            if (!nestedTransactionID) {
                continue;
            }
            transactionIDs.push(nestedTransactionID);
        }
    }

    return transactionIDs;
}

/**
 * Helper function to extract report action IDs from search results data.
 */
function extractReportActionIDsFromSearchResults(searchResultsData: Partial<SearchResults['data']>): string[] {
    return Object.keys(searchResultsData ?? {})
        .filter(isReportActionEntry)
        .map((key) => Object.keys(searchResultsData[key] ?? {}))
        .flat();
}

/**
 * Whether a transaction change invalidates what the current search results show.
 *
 * Onyx keeps one value object per collection member and only replaces the ones it writes, so an identity check is
 * enough to spot an edit. A refetch triggered from here can't feed itself, because a Search response only writes
 * snapshot keys and never touches the transaction collection.
 *
 * A move counts too: the report row owes its count and total to the snapshot, so a transaction never on screen still invalidates it.
 */
function hasChangedTransactionInSearchResults(
    transactions: OnyxCollection<Transaction>,
    previousTransactions: OnyxCollection<Transaction>,
    previousTransactionKeys: Set<string>,
    searchResultsData: Partial<SearchResults['data']> | undefined,
): boolean {
    if (!searchResultsData) {
        return false;
    }

    const isReportInSearchResults = (reportID: string | undefined) => !!reportID && !!searchResultsData[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];

    const changedTransactionIDs: string[] = [];
    for (const [key, transaction] of Object.entries(transactions ?? {})) {
        const previousTransaction = previousTransactions?.[key];
        if (!transaction?.transactionID || !previousTransactionKeys.has(key) || previousTransaction === transaction) {
            continue;
        }
        if (transaction.reportID !== previousTransaction?.reportID && (isReportInSearchResults(transaction.reportID) || isReportInSearchResults(previousTransaction?.reportID))) {
            return true;
        }
        changedTransactionIDs.push(transaction.transactionID);
    }

    // Walking the results is the expensive half, so only do it once something actually changed.
    if (changedTransactionIDs.length === 0) {
        return false;
    }

    const searchResultIDs = new Set(extractTransactionIDsFromSearchResults(searchResultsData));
    return changedTransactionIDs.some((transactionID) => searchResultIDs.has(transactionID));
}

export default useSearchAutoRefetch;
export type {UseSearchAutoRefetch};
