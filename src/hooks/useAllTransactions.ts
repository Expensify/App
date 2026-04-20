import type {OnyxEntry} from 'react-native-onyx';
import {useSearchStateContext} from '@components/Search/SearchContext';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction} from '@src/types/onyx';
import useOnyx from './useOnyx';

/**
 * Hook that returns all transactions, filtered by current search results if a search data is available
 */
function useAllTransactions() {
    const {currentSearchResults} = useSearchStateContext();
    const [allTransactionsCollection] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION);

    const data = currentSearchResults?.data;
    if (!data) {
        return allTransactionsCollection;
    }

    // Only allocate a new merged object if the search actually surfaces a transaction that
    // isn't already in Onyx; otherwise the Onyx collection reference is already the answer.
    let allTransactions: Record<string, OnyxEntry<Transaction>> | undefined;
    for (const key in data) {
        if (!key.startsWith(ONYXKEYS.COLLECTION.TRANSACTION) || allTransactionsCollection?.[key]) {
            continue;
        }
        const value = data[key as keyof typeof data] as OnyxEntry<Transaction> | undefined;
        if (!value) {
            continue;
        }
        if (!allTransactions) {
            allTransactions = {...allTransactionsCollection};
        }
        allTransactions[key] = value;
    }
    return allTransactions ?? allTransactionsCollection ?? {};
}

export default useAllTransactions;
