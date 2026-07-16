import ONYXKEYS from '@src/ONYXKEYS';
import {transactionViolationsByIDsSelector} from '@src/selectors/TransactionViolations';
import type {Transaction, TransactionViolations} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

import {useCallback, useMemo} from 'react';

import useOnyx from './useOnyx';

/**
 * Subscribes only to the violations of the given transactions instead of the whole collection, so a violation change
 * in an unrelated report does not re-render the consumer.
 */
function useReportTransactionViolations(transactions: Transaction[]) {
    const transactionIDs = useMemo(() => transactions.map((transaction) => transaction.transactionID), [transactions]);
    const selectTransactionViolations = useCallback(
        (allViolations: OnyxCollection<TransactionViolations>) => transactionViolationsByIDsSelector(transactionIDs)(allViolations),
        [transactionIDs],
    );
    // Pass `transactionIDs` as a dependency so the selector re-runs once the transactions hydrate (otherwise
    // it stays closed over the initial empty list and violations would never be selected on first load).
    return useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, {selector: selectTransactionViolations}, [transactionIDs]);
}

export default useReportTransactionViolations;
