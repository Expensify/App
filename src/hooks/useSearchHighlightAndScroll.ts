import {useCallback, useEffect, useRef, useState} from 'react';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {SearchQueryJSON} from '@components/Search/types';
import type {ReportActionListItemType, ReportListItemType, SelectionListHandle, TransactionListItemType} from '@components/SelectionList/types';
import * as SearchActions from '@libs/actions/Search';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchResults, Transaction} from '@src/types/onyx';
import usePrevious from './usePrevious';

type UseSearchHighlightAndScroll = {
    searchResults: OnyxEntry<SearchResults>;
    transactions: OnyxCollection<Transaction>;
    previousTransactions: OnyxCollection<Transaction>;
    queryJSON: SearchQueryJSON;
    offset: number;
};

/**
 * Hook used to trigger a search when a new transaction is added and handle highlighting and scrolling.
 */
function useSearchHighlightAndScroll({searchResults, transactions, previousTransactions, queryJSON, offset}: UseSearchHighlightAndScroll) {
    // Ref to track if the search was triggered by this hook
    const triggeredByHookRef = useRef(false);
    const searchTriggeredRef = useRef(false);
    const previousSearchResults = usePrevious(searchResults?.data);
    const [newSearchResultKey, setNewSearchResultKey] = useState<string | null>(null);
    const highlightedTransactionIDs = useRef<Set<string>>(new Set());
    const initializedRef = useRef(false);

    // Trigger search when a new transaction is added
    useEffect(() => {
        const previousTransactionsLength = previousTransactions && Object.keys(previousTransactions).length;
        const transactionsLength = transactions && Object.keys(transactions).length;

        // Return early if search was already triggered or there's no change in transactions length
        if (searchTriggeredRef.current || previousTransactionsLength === transactionsLength) {
            return;
        }

        // Check if a new transaction was added
        if (transactionsLength && typeof previousTransactionsLength === 'number' && transactionsLength > previousTransactionsLength) {
            // Set the flag indicating the search is triggered by the hook
            triggeredByHookRef.current = true;

            // Trigger the search
            SearchActions.search({queryJSON, offset});

            // Set the ref to prevent further triggers until reset
            searchTriggeredRef.current = true;
        }

        // Reset the ref when transactions are updated
        return () => {
            searchTriggeredRef.current = false;
        };
    }, [transactions, previousTransactions, queryJSON, offset]);

    // Initialize the set with existing transaction IDs only once
    useEffect(() => {
        if (initializedRef.current || !searchResults?.data) {
            return;
        }

        const existingTransactionIDs = extractTransactionIDsFromSearchResults(searchResults.data);
        highlightedTransactionIDs.current = new Set(existingTransactionIDs);
        initializedRef.current = true;
    }, [searchResults?.data]);

    // Detect new transactions
    useEffect(() => {
        if (!previousSearchResults || !searchResults?.data) {
            return;
        }

        const previousTransactionIDs = extractTransactionIDsFromSearchResults(previousSearchResults);
        const currentTransactionIDs = extractTransactionIDsFromSearchResults(searchResults.data);

        // Find new transaction IDs that are not in the previousTransactionIDs and not already highlighted
        const newTransactionIDs = currentTransactionIDs.filter((id) => !previousTransactionIDs.includes(id) && !highlightedTransactionIDs.current.has(id));

        if (!triggeredByHookRef.current || newTransactionIDs.length === 0) {
            return;
        }

        const newTransactionID = newTransactionIDs.at(0) ?? '';
        const newTransactionKey = `${ONYXKEYS.COLLECTION.TRANSACTION}${newTransactionID}`;

        setNewSearchResultKey(newTransactionKey);
        highlightedTransactionIDs.current.add(newTransactionID);
    }, [searchResults, previousSearchResults]);

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
        (data: Array<TransactionListItemType | ReportActionListItemType | ReportListItemType>) => (ref: SelectionListHandle | null) => {
            // Early return if there's no ref, new transaction wasn't brought in by this hook
            // or there's no new search result key
            if (!ref || !triggeredByHookRef.current || newSearchResultKey === null) {
                return;
            }

            // Extract the transaction ID from the newSearchResultKey
            const newTransactionID = newSearchResultKey.replace(ONYXKEYS.COLLECTION.TRANSACTION, '');

            // Find the index of the new transaction in the data array
            const indexOfNewTransaction = data.findIndex((item) => {
                // Handle TransactionListItemType
                if ('transactionID' in item && item.transactionID === newTransactionID) {
                    return true;
                }

                // Handle ReportListItemType with transactions array
                if ('transactions' in item && Array.isArray(item.transactions)) {
                    return item.transactions.some((transaction) => transaction?.transactionID === newTransactionID);
                }

                return false;
            });

            // Early return if the transaction is not found in the data array
            if (indexOfNewTransaction <= 0) {
                return;
            }

            // Perform the scrolling action
            ref.scrollToIndex(indexOfNewTransaction);
            // Reset the trigger flag to prevent unintended future scrolls and highlights
            triggeredByHookRef.current = false;
        },
        [newSearchResultKey],
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

export default useSearchHighlightAndScroll;
