import {useCallback} from 'react';
import type {OnyxCollection} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {TransactionViolations} from '@src/types/onyx';
import useOnyx from './useOnyx';
import useStableArrayReference from './useStableArrayReference';

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
    // Callers may pass a freshly-built Set each render, so project it to a stable, order-independent
    // ID array and have the selector depend on that — otherwise the selector identity changes each
    // render and defeats useOnyx's memoization (re-subscribing endlessly under the store-based engine).
    const eligibleTransactionIDList = useStableArrayReference(eligibleTransactionIDs ? Array.from(eligibleTransactionIDs).sort() : []);
    const transactionViolationSelector = useCallback(
        (violations: OnyxCollection<TransactionViolations>) => transactionViolationsSelector(violations, eligibleTransactionIDList.length ? new Set(eligibleTransactionIDList) : undefined),
        [eligibleTransactionIDList],
    );

    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, {
        selector: transactionViolationSelector,
    });

    return transactionViolations;
}

export default useTransactionViolation;
