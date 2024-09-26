import {useEffect, useRef, useState} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import type {ReportListItemType, TransactionListItemType} from '@components/SelectionList/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchResults} from '@src/types/onyx';
import usePrevious from './usePrevious';

/**
 * Hook used to get the Search results' new transaction key for animation purposes.
 */
function useNewSearchResultKey(searchResults: OnyxEntry<SearchResults>) {
    // Get the previous search results
    const previousSearchResults = usePrevious(searchResults?.data);

    // State to store the new search result key
    const [newSearchResultKey, setNewSearchResultKey] = useState<string | null>(null);

    // Ref to keep track of transaction IDs that have been highlighted
    const highlightedTransactionIDs = useRef<Set<string>>(new Set());

    // Ref to ensure initialization happens only once
    const initializedRef = useRef(false);

    // Initialize the set with existing transaction IDs only once
    useEffect(() => {
        if (initializedRef.current || !searchResults?.data) {
            return;
        }
        const existingTransactionIDs = extractTransactionIDsFromSearchResults(searchResults.data);
        highlightedTransactionIDs.current = new Set(existingTransactionIDs);
        initializedRef.current = true;
    }, [searchResults?.data]);

    useEffect(() => {
        if (!previousSearchResults || !searchResults?.data) {
            return;
        }

        const previousTransactionIDs = extractTransactionIDsFromSearchResults(previousSearchResults);
        const currentTransactionIDs = extractTransactionIDsFromSearchResults(searchResults.data);

        // Find new transaction IDs that are not in the previousTransactionIDs and not already highlighted
        const newTransactionIDs = currentTransactionIDs.filter((id) => !previousTransactionIDs.includes(id) && !highlightedTransactionIDs.current.has(id));

        if (newTransactionIDs.length > 0) {
            const newTransactionID = newTransactionIDs[0];
            const newTransactionKey = `${ONYXKEYS.COLLECTION.TRANSACTION}${newTransactionID}`;

            setNewSearchResultKey(newTransactionKey);
            highlightedTransactionIDs.current.add(newTransactionID);
        }
    }, [searchResults, previousSearchResults]);

    // Reset newSearchResultKey after it's been used
    useEffect(() => {
        if (newSearchResultKey === null) {
            return;
        }
        // Reset after a delay if needed (e.g. match animation highlight duration)
        const timer = setTimeout(() => {
            setNewSearchResultKey(null);
        }, CONST.ANIMATED_HIGHLIGHT_START_DURATION);

        return () => clearTimeout(timer);
    }, [newSearchResultKey]);

    return newSearchResultKey;
}

function extractTransactionIDsFromSearchResults(searchResultsData: SearchResults['data']): string[] {
    const transactionIDs: string[] = [];

    Object.values(searchResultsData).forEach((item) => {
        // Check for transactionID directly on the item (TransactionListItemType)
        if ((item as TransactionListItemType)?.transactionID) {
            transactionIDs.push((item as TransactionListItemType)?.transactionID);
        }

        // Check for transactions array within the item (ReportListItemType)
        if (Array.isArray((item as ReportListItemType)?.transactions)) {
            (item as ReportListItemType)?.transactions?.forEach((transaction) => {
                if (!transaction?.transactionID) {
                    return;
                }
                transactionIDs.push(transaction?.transactionID);
            });
        }
    });

    return transactionIDs;
}

export default useNewSearchResultKey;
