import {useCallback} from 'react';
import type {OnyxCollection} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {TransactionViolations} from '@src/types/onyx';
import useOnyx from './useOnyx';

const transactionViolationsSelector = (violations: OnyxCollection<TransactionViolations>, eligibleTransactionIDs?: Set<string>) => {
    if (!eligibleTransactionIDs || eligibleTransactionIDs.size === 0) {
        return undefined;
    }
    return Object.fromEntries(
        Object.entries(violations ?? {}).filter(([key]) => {
            const id = key.replace(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, '');
            return eligibleTransactionIDs?.has(id);
        }),
    );
};

function useTransactionViolation(eligibleTransactionIDs?: Set<string>) {
    // Callers may pass a freshly-built Set each render, so key the memoized selector on its contents
    // (a stable, order-independent string) rather than the Set reference — otherwise the selector
    // identity changes each render and defeats useOnyx's memoization (re-subscribing endlessly under
    // the store-based engine).
    const eligibleTransactionIDsKey = eligibleTransactionIDs ? Array.from(eligibleTransactionIDs).sort().join(',') : '';
    const transactionViolationSelector = useCallback(
        (violations: OnyxCollection<TransactionViolations>) => transactionViolationsSelector(violations, eligibleTransactionIDs),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [eligibleTransactionIDsKey],
    );

    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, {
        selector: transactionViolationSelector,
    });

    return transactionViolations;
}

export default useTransactionViolation;
