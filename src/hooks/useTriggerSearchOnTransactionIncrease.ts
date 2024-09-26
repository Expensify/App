import {useEffect, useRef} from 'react';
import type {OnyxCollection} from 'react-native-onyx';
import type {SearchQueryJSON} from '@components/Search/types';
import * as SearchActions from '@libs/actions/Search';
import type {Transaction} from '@src/types/onyx';

type UseTriggerSearchOnNewTransaction = {
    transactions: OnyxCollection<Transaction>;
    previousTransactions: OnyxCollection<Transaction>;
    queryJSON: SearchQueryJSON;
    offset: number;
};

/**
 * Hook used to trigger a new Search API call when a new transaction is created.
 */
function useTriggerSearchOnNewTransaction({transactions, previousTransactions, queryJSON, offset}: UseTriggerSearchOnNewTransaction) {
    const searchTriggeredRef = useRef(false);

    useEffect(() => {
        const previousTransactionsLength = previousTransactions && Object.keys(previousTransactions).length;
        const transactionsLength = transactions && Object.keys(transactions).length;

        // Return early if search was already triggered or there's no change in transactions length
        if (searchTriggeredRef.current || previousTransactionsLength === transactionsLength) {
            return;
        }

        // Checking if length exists (we check if previousTransactionsLength is number because
        // if we check for existance and initially it's 0 then the check will fail)
        if (transactionsLength && typeof previousTransactionsLength === 'number' && transactionsLength > previousTransactionsLength) {
            // A new transaction was added, trigger the action
            SearchActions.search({queryJSON, offset});
            // Set the flag to true to prevent further triggers
            searchTriggeredRef.current = true;
        }

        // Reset the flag when transactions are updated
        return () => {
            searchTriggeredRef.current = false;
        };
    }, [transactions, previousTransactions, queryJSON, offset]);
}

export default useTriggerSearchOnNewTransaction;
