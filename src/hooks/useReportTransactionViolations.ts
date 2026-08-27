import ONYXKEYS from '@src/ONYXKEYS';
import {transactionViolationsByIDsSelector} from '@src/selectors/TransactionViolations';
import type {Transaction} from '@src/types/onyx';

import {useMemo} from 'react';

import useOnyx from './useOnyx';

/**
 * Subscribes only to the violations of the given transactions instead of the whole collection, so a violation change
 * in an unrelated report does not re-render the consumer.
 */
function useReportTransactionViolations(transactions: Transaction[]) {
    const transactionIDs = useMemo(() => transactions.map((transaction) => transaction.transactionID), [transactions]);
    return useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, {selector: transactionViolationsByIDsSelector(transactionIDs)});
}

export default useReportTransactionViolations;
