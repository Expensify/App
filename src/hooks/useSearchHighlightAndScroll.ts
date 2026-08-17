import type {SearchListItem, TransactionGroupListItemType, TransactionListItemType} from '@components/Search/SearchList/ListItem/types';
import type {SearchQueryJSON} from '@components/Search/types';
import type {SelectionListHandle} from '@components/SelectionList/types';

import {search} from '@libs/actions/Search';
import {mergeTransactionIdsHighlightOnSearchRoute} from '@libs/actions/Transaction';
import isSearchTopmostFullScreenRoute from '@libs/Navigation/helpers/isSearchTopmostFullScreenRoute';
import TransitionTracker from '@libs/Navigation/TransitionTracker';
import {isReportActionEntry} from '@libs/SearchUIUtils';
import type {SearchKey} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportActions, SearchResults, Transaction} from '@src/types/onyx';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import {useIsFocused} from '@react-navigation/native';
import {useCallback, useEffect, useRef, useState} from 'react';

import useNetwork from './useNetwork';
import useOnyx from './useOnyx';
import usePrevious from './usePrevious';

type UseSearchHighlightAndScroll = {
    searchResults: OnyxEntry<SearchResults>;
    transactions: OnyxCollection<Transaction>;
    previousTransactions: OnyxCollection<Transaction>;
    reportActions: OnyxCollection<ReportActions>;
    previousReportActions: OnyxCollection<ReportActions>;
    queryJSON: SearchQueryJSON;
    searchKey: SearchKey | undefined;
    offset: number;
    shouldCalculateTotals: boolean;
    shouldUseLiveData: boolean;
};

/**
 * Hook used to trigger a search when a new transaction or report action is added and handle highlighting and scrolling.
 */
function useSearchHighlightAndScroll({
    searchResults,
    transactions,
    previousTransactions,
    reportActions,
    previousReportActions,
    queryJSON,
    searchKey,
    offset,
    shouldCalculateTotals,
    shouldUseLiveData,
}: UseSearchHighlightAndScroll) {
    const isFocused = useIsFocused();
    const {isOffline} = useNetwork();
    // Ref to track if the search was triggered by this hook
    const triggeredByHookRef = useRef(false);
    const searchTriggeredRef = useRef(false);
    const hasNewItemsRef = useRef(false);
    const previousSearchResults = usePrevious(searchResults?.data);
    const [newSearchResultKeys, setNewSearchResultKeys] = useState<Set<string> | null>(null);
    const highlightedIDs = useRef<Set<string>>(new Set());
    const initializedRef = useRef(false);
    const hasPendingSearchRef = useRef(false);
    const isChat = queryJSON.type === CONST.SEARCH.DATA_TYPES.CHAT;

    const transactionIDsToHighlightSelector = useCallback((allTransactionIDs: OnyxEntry<Record<string, Record<string, boolean>>>) => allTransactionIDs?.[queryJSON.type], [queryJSON.type]);
    const [transactionIDsToHighlight] = useOnyx(ONYXKEYS.TRANSACTION_IDS_HIGHLIGHT_ON_SEARCH_ROUTE, {
        selector: transactionIDsToHighlightSelector,
    });
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
            // We only want to highlight new items if the addition of transactions or report actions triggered the search.
            // This is because, on deletion of items, the backend sometimes returns old items in place of the deleted ones.
            // We don't want to highlight these old items, even if they appear new in the current search results.
            hasNewItemsRef.current = isChat ? reportActionsIDs.length > previousReportActionsIDs.length : transactionsIDs.length > previousTransactionIDsLocal.length;

            // Set the flag indicating the search is triggered by the hook
            triggeredByHookRef.current = true;

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
    }, [searchResults?.search?.isLoading, shouldUseLiveData, searchResultsData]);

    // Initialize the set with existing IDs only once
    useEffect(() => {
        if (initializedRef.current || !searchResultsData) {
            return;
        }

        const initialIDs = isChat ? extractReportActionIDsFromSearchResults(searchResultsData) : extractTransactionIDsFromSearchResults(searchResultsData);
        highlightedIDs.current = new Set(initialIDs);
        initializedRef.current = true;
    }, [searchResultsData, isChat]);

    // Detect new items (transactions or report actions)
    useEffect(() => {
        if (!previousSearchResults || !searchResults?.data) {
            return;
        }
        if (isChat) {
            const previousReportActionIDs = extractReportActionIDsFromSearchResults(previousSearchResults);
            const currentReportActionIDs = extractReportActionIDsFromSearchResults(searchResults.data);

            // Find new report action IDs that are not in the previousReportActionIDs and not already highlighted
            const newReportActionIDs = currentReportActionIDs.filter((id) => !previousReportActionIDs.includes(id) && !highlightedIDs.current.has(id));

            if (!triggeredByHookRef.current || newReportActionIDs.length === 0 || !hasNewItemsRef.current) {
                return;
            }

            const newKeys = new Set<string>();
            for (const id of newReportActionIDs) {
                const newReportActionKey = `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${id}`;
                highlightedIDs.current.add(newReportActionKey);
                newKeys.add(newReportActionKey);
            }
            setNewSearchResultKeys(newKeys);
        } else {
            const previousTransactionIDs = extractTransactionIDsFromSearchResults(previousSearchResults);
            const currentTransactionIDs = extractTransactionIDsFromSearchResults(searchResults.data);
            const manualHighlightTransactionIDs = new Set(Object.keys(transactionIDsToHighlight ?? {}).filter((id) => !!transactionIDsToHighlight?.[id]));

            // Find new transaction IDs that are not in the previousTransactionIDs and not already highlighted
            const newTransactionIDs = currentTransactionIDs.filter((id) => {
                if (manualHighlightTransactionIDs.has(id)) {
                    return true;
                }
                if (!triggeredByHookRef.current || !hasNewItemsRef.current) {
                    return false;
                }
                return !previousTransactionIDs.includes(id) && !highlightedIDs.current.has(id);
            });

            if (newTransactionIDs.length === 0) {
                return;
            }

            const newKeys = new Set<string>();
            const consumedManualIDs: string[] = [];
            for (const id of newTransactionIDs) {
                const newTransactionKey = `${ONYXKEYS.COLLECTION.TRANSACTION}${id}`;
                highlightedIDs.current.add(newTransactionKey);
                newKeys.add(newTransactionKey);
                if (manualHighlightTransactionIDs.has(id)) {
                    consumedManualIDs.push(id);
                }
            }
            setNewSearchResultKeys(newKeys);

            // Clear consumed manual highlight flags so subsequent detect runs don't re-highlight the same IDs.
            if (consumedManualIDs.length > 0) {
                mergeTransactionIdsHighlightOnSearchRoute(queryJSON.type, Object.fromEntries(consumedManualIDs.map((id) => [id, false])));
            }
        }
    }, [searchResults?.data, previousSearchResults, isChat, transactionIDsToHighlight, queryJSON.type]);

    // Remove transactionIDsToHighlight when the user leaves the current search type
    useEffect(
        () => () => {
            mergeTransactionIdsHighlightOnSearchRoute(queryJSON.type, null);
        },
        [queryJSON.type],
    );

    // Reset newSearchResultKey after it's been used
    useEffect(() => {
        if (newSearchResultKeys === null) {
            return;
        }

        const timer = setTimeout(() => {
            setNewSearchResultKeys(null);
        }, CONST.ANIMATED_HIGHLIGHT_START_DURATION);

        return () => clearTimeout(timer);
    }, [newSearchResultKeys]);

    /**
     * Callback to handle scrolling to the new search result.
     */
    const handleSelectionListScroll = (data: SearchListItem[], ref: SelectionListHandle<SearchListItem> | null) => {
        // Early return if there's no ref, new transaction wasn't brought in by this hook
        // or there's no new search result key
        const newSearchResultKey = newSearchResultKeys?.values().next().value;
        if (!ref || !triggeredByHookRef.current || !newSearchResultKey) {
            return;
        }

        // Extract the transaction/report action ID from the newSearchResultKey
        const newID = newSearchResultKey.replace(isChat ? ONYXKEYS.COLLECTION.REPORT_ACTIONS : ONYXKEYS.COLLECTION.TRANSACTION, '');

        // Find the index of the new transaction/report action in the data array
        const indexOfNewItem = data.findIndex((item) => {
            if (isChat) {
                if ('reportActionID' in item && item.reportActionID === newID) {
                    return true;
                }
            } else {
                // Handle TransactionListItemType
                if ('transactionID' in item && item.transactionID === newID) {
                    return true;
                }

                // Handle TransactionGroupListItemType with transactions array
                if ('transactions' in item && Array.isArray(item.transactions)) {
                    return item.transactions.some((transaction) => transaction?.transactionID === newID);
                }
            }

            return false;
        });

        // Early return if the new item is not found in the data array
        if (indexOfNewItem < 0) {
            return;
        }

        // Reset the trigger even when the item is already first so a later render cannot scroll or highlight it again.
        triggeredByHookRef.current = false;
        if (indexOfNewItem === 0) {
            return;
        }

        // Perform the scrolling action
        ref.scrollToIndex(indexOfNewItem);
    };

    const hasQueuedHighlights = newSearchResultKeys !== null && newSearchResultKeys.size > 0;

    return {newSearchResultKeys, handleSelectionListScroll, newTransactions, hasQueuedHighlights};
}

/**
 * Helper function to extract transaction IDs from search results data.
 */
function extractTransactionIDsFromSearchResults(searchResultsData: Partial<SearchResults['data']>): string[] {
    const transactionIDs: string[] = [];

    for (const item of Object.values(searchResultsData)) {
        // Check for transactionID directly on the item (TransactionListItemType)
        if ((item as TransactionListItemType)?.transactionID) {
            transactionIDs.push((item as TransactionListItemType).transactionID);
        }

        // Check for transactions array within the item (TransactionGroupListItemType)
        if (Array.isArray((item as TransactionGroupListItemType)?.transactions)) {
            for (const transaction of (item as TransactionGroupListItemType).transactions) {
                if (!transaction?.transactionID) {
                    continue;
                }
                transactionIDs.push(transaction.transactionID);
            }
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

export default useSearchHighlightAndScroll;
export type {UseSearchHighlightAndScroll};
