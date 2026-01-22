import {useMemo} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {useSearchContext} from '@components/Search/SearchContext';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction} from '@src/types/onyx';
import useOnyx from './useOnyx';

/**
 * Hook that returns all transactions, filtered by current search results if a search data is available
 */
function useAllTransactions() {
    const {state} = useSearchContext();
    const {currentSearchResults} = state;
    const [allTransactionsCollection] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {canBeMissing: false});

    const allTransactions = useMemo(() => {
        const data = currentSearchResults?.data;
        if (!data) {
            return allTransactionsCollection;
        }

        const filteredSearchTransactions = Object.keys(data)
            .filter((key): key is `${typeof ONYXKEYS.COLLECTION.TRANSACTION}${string}` => key.startsWith(ONYXKEYS.COLLECTION.TRANSACTION))
            .reduce(
                (acc, key) => {
                    const value = data?.[key] as OnyxEntry<Transaction> | undefined;
                    if (value) {
                        acc[key] = value;
                    }
                    return acc;
                },
                {} as Record<string, OnyxEntry<Transaction>>,
            );

        return {
            ...filteredSearchTransactions,
            ...allTransactionsCollection,
        };
    }, [currentSearchResults?.data, allTransactionsCollection]);

    return allTransactions;
}

export default useAllTransactions;
