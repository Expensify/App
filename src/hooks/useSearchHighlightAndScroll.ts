import {useCallback, useEffect, useRef, useState} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import type {SearchQueryJSON} from '@components/Search/types';
import type {ReportListItemType, SearchListItem, SelectionListHandle, TransactionListItemType} from '@components/SelectionList/types';
import {isReportActionEntry} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchResults} from '@src/types/onyx';
import usePrevious from './usePrevious';

type UseSearchHighlightAndScroll = {
    searchResults: OnyxEntry<SearchResults>;
    queryJSON: SearchQueryJSON;
};

/**
 * Hook used to handle highlighting and scrolling for new search results.
 */
function useSearchHighlightAndScroll({searchResults, queryJSON}: UseSearchHighlightAndScroll) {
    const [newSearchResultKey, setNewSearchResultKey] = useState<string | null>(null);
    const highlightedIDs = useRef<Set<string>>(new Set());
    const initializedRef = useRef(false);
    const previousSearchResults = usePrevious(searchResults?.data);
    const isChat = queryJSON.type === CONST.SEARCH.DATA_TYPES.CHAT;

    // Initialize the set with existing IDs only once
    useEffect(() => {
        if (initializedRef.current || !searchResults?.data) {
            return;
        }

        const existingIDs = isChat ? extractReportActionIDsFromSearchResults(searchResults.data) : extractTransactionIDsFromSearchResults(searchResults.data);
        highlightedIDs.current = new Set(existingIDs);
        initializedRef.current = true;
    }, [searchResults?.data, isChat]);

    // Detect new items in search results after a change in transactions or report actions
    useEffect(() => {
        if (!previousSearchResults || !searchResults?.data) {
            return;
        }
        if (isChat) {
            const previousReportActionIDs = extractReportActionIDsFromSearchResults(previousSearchResults);
            const currentReportActionIDs = extractReportActionIDsFromSearchResults(searchResults.data);

            // Find new report action IDs that are not in the previousReportActionIDs and not already highlighted
            const newReportActionIDs = currentReportActionIDs.filter((id) => !previousReportActionIDs.includes(id) && !highlightedIDs.current.has(id));

            if (newReportActionIDs.length === 0) {
                return;
            }

            const newReportActionID = newReportActionIDs.at(0) ?? '';
            const newReportActionKey = `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${newReportActionID}`;

            setNewSearchResultKey(newReportActionKey);
            highlightedIDs.current.add(newReportActionID);
            return;
        }

        // For expenses/transactions
        const previousTransactionIDs = extractTransactionIDsFromSearchResults(previousSearchResults);
        const currentTransactionIDs = extractTransactionIDsFromSearchResults(searchResults.data);

        // Find new transaction IDs not in previous search results and not already highlighted
        const newTransactionIDs = currentTransactionIDs.filter((id) => !previousTransactionIDs.includes(id) && !highlightedIDs.current.has(id));

        if (newTransactionIDs.length === 0) {
            return;
        }

        const newTransactionID = newTransactionIDs.at(0) ?? '';
        const newTransactionKey = `${ONYXKEYS.COLLECTION.TRANSACTION}${newTransactionID}`;

        setNewSearchResultKey(newTransactionKey);
        highlightedIDs.current.add(newTransactionID);
    }, [searchResults?.data, previousSearchResults, isChat]);

    // Reset newSearchResultKey after it's been used
    useEffect(() => {
        if (newSearchResultKey === null) {
            return;
        }

        const timer = setTimeout(() => {
            setNewSearchResultKey(null);
        }, CONST.ANIMATED_HIGHLIGHT_START_DURATION);

        return () => clearTimeout(timer);
    }, [newSearchResultKey]);

    /**
     * Callback to handle scrolling to the new search result.
     */
    const handleSelectionListScroll = useCallback(
        (data: SearchListItem[]) => (ref: SelectionListHandle | null) => {
            // Early return if there's no ref, new transaction wasn't brought in by this hook
            // or there's no new search result key
            if (!ref || newSearchResultKey === null) {
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

                    // Handle ReportListItemType with transactions array
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
        },
        [newSearchResultKey, isChat],
    );

    return {newSearchResultKey, handleSelectionListScroll};
}

/**
 * Helper function to extract transaction IDs from search results data.
 */
function extractTransactionIDsFromSearchResults(searchResultsData: Partial<SearchResults['data']>): string[] {
    const transactionIDs: string[] = [];

    Object.values(searchResultsData).forEach((item) => {
        // Check for transactionID directly on the item (TransactionListItemType)
        if ((item as TransactionListItemType)?.transactionID) {
            transactionIDs.push((item as TransactionListItemType).transactionID);
        }

        // Check for transactions array within the item (ReportListItemType)
        if (Array.isArray((item as ReportListItemType)?.transactions)) {
            (item as ReportListItemType).transactions.forEach((transaction) => {
                if (!transaction?.transactionID) {
                    return;
                }
                transactionIDs.push(transaction.transactionID);
            });
        }
    });

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
