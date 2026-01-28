import {useIsFocused} from '@react-navigation/native';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {InteractionManager} from 'react-native';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {SearchQueryJSON} from '@components/Search/types';
import type {SearchListItem, SelectionListHandle, TransactionGroupListItemType, TransactionListItemType} from '@components/SelectionListWithSections/types';
import {search} from '@libs/actions/Search';
import {isReportActionEntry} from '@libs/SearchUIUtils';
import type {SearchKey} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportActions, SearchResults, Transaction} from '@src/types/onyx';
import useNetwork from './useNetwork';
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

    const existingSearchResultIDs = useMemo(() => {
        if (!searchResults?.data) {
            return [];
        }
        return isChat ? extractReportActionIDsFromSearchResults(searchResults.data) : extractTransactionIDsFromSearchResults(searchResults.data);
    }, [searchResults?.data, isChat]);

    const newTransactions = useMemo(() => {
        const previousTransactionsIDs = Object.keys(previousTransactions ?? {});

        if (previousTransactionsIDs.length === 0) {
            return [];
        }

        const previousIDs = new Set(previousTransactionsIDs);
        const result: Transaction[] = [];

        for (const [id, transaction] of Object.entries(transactions ?? {})) {
            if (!previousIDs.has(id) && transaction) {
                result.push(transaction);
            }
        }

        return result;
    }, [previousTransactions, transactions]);

    // Trigger search when a new report action is added while on chat or when a new transaction is added for the other search types.
    useEffect(() => {
        const previousTransactionsIDs = Object.keys(previousTransactions ?? {});
        const transactionsIDs = Object.keys(transactions ?? {});

        const reportActionsIDs = Object.values(reportActions ?? {})
            .map((actions) => Object.keys(actions ?? {}))
            .flat();
        const previousReportActionsIDs = Object.values(previousReportActions ?? {})
            .map((actions) => Object.keys(actions ?? {}))
            .flat();

        // Only proceed if we have previous data to compare against
        // This prevents triggering on initial data load
        if ((previousTransactionsIDs.length === 0 && previousReportActionsIDs.length === 0) || searchTriggeredRef.current) {
            return;
        }

        const previousTransactionsIDsSet = new Set(previousTransactionsIDs);
        const previousReportActionsIDsSet = new Set(previousReportActionsIDs);
        const hasTransactionsIDsChange = transactionsIDs.length !== previousTransactionsIDs.length || transactionsIDs.some((id) => !previousTransactionsIDsSet.has(id));
        const hasReportActionsIDsChange = reportActionsIDs.some((id) => !previousReportActionsIDsSet.has(id));

        // Check if there is a change in the transactions or report actions list
        if ((!isChat && hasTransactionsIDsChange) || hasReportActionsIDsChange || hasPendingSearchRef.current) {
            // If we're not focused or offline, don't trigger search
            if (!isFocused || isOffline) {
                hasPendingSearchRef.current = true;
                return;
            }
            hasPendingSearchRef.current = false;

            const newIDs = isChat ? reportActionsIDs : transactionsIDs;
            const existingSearchResultIDsSet = new Set(existingSearchResultIDs);
            const hasAGenuinelyNewID = newIDs.some((id) => !existingSearchResultIDsSet.has(id));

            // Only skip search if there are no new items AND search results aren't empty
            // This ensures deletions that result in empty data still trigger search
            if (!hasAGenuinelyNewID && existingSearchResultIDs.length > 0) {
                const newIDsSet = new Set(newIDs);
                const hasDeletedID = existingSearchResultIDs.some((id) => !newIDsSet.has(id));
                if (!hasDeletedID) {
                    return;
                }
            }
            // We only want to highlight new items if the addition of transactions or report actions triggered the search.
            // This is because, on deletion of items, the backend sometimes returns old items in place of the deleted ones.
            // We don't want to highlight these old items, even if they appear new in the current search results.
            hasNewItemsRef.current = isChat ? reportActionsIDs.length > previousReportActionsIDs.length : transactionsIDs.length > previousTransactionsIDs.length;

            // Set the flag indicating the search is triggered by the hook
            triggeredByHookRef.current = true;

            // Trigger the search
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            InteractionManager.runAfterInteractions(() => {
                search({queryJSON, searchKey, offset, shouldCalculateTotals, isLoading: !!searchResults?.search?.isLoading});
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
        searchResults?.data,
        existingSearchResultIDs,
        isOffline,
        searchResults?.search?.isLoading,
    ]);

    useEffect(() => {
        if (searchResults?.search?.isLoading) {
            return;
        }

        searchTriggeredRef.current = false;
    }, [searchResults?.search?.isLoading]);

    // Initialize the set with existing IDs only once
    useEffect(() => {
        if (initializedRef.current || !searchResults?.data) {
            return;
        }

        highlightedIDs.current = new Set(existingSearchResultIDs);
        initializedRef.current = true;
    }, [searchResults?.data, isChat, existingSearchResultIDs]);

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

            // Find new transaction IDs that are not in the previousTransactionIDs and not already highlighted
            const newTransactionIDs = currentTransactionIDs.filter((id) => !previousTransactionIDs.includes(id) && !highlightedIDs.current.has(id));

            if (!triggeredByHookRef.current || newTransactionIDs.length === 0 || !hasNewItemsRef.current) {
                return;
            }

            const newKeys = new Set<string>();
            for (const id of newTransactionIDs) {
                const newTransactionKey = `${ONYXKEYS.COLLECTION.TRANSACTION}${id}`;
                highlightedIDs.current.add(newTransactionKey);
                newKeys.add(newTransactionKey);
            }
            setNewSearchResultKeys(newKeys);
        }
    }, [searchResults?.data, previousSearchResults, isChat]);

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
    const handleSelectionListScroll = useCallback(
        (data: SearchListItem[], ref: SelectionListHandle | null) => {
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
            if (indexOfNewItem <= 0) {
                return;
            }

            // Perform the scrolling action
            ref.scrollToIndex(indexOfNewItem);
            // Reset the trigger flag to prevent unintended future scrolls and highlights
            triggeredByHookRef.current = false;
        },
        [newSearchResultKeys, isChat],
    );

    return {newSearchResultKeys, handleSelectionListScroll, newTransactions};
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

export default useSearchHighlightAndScroll;
export type {UseSearchHighlightAndScroll};
