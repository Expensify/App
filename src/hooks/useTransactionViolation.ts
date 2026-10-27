import ONYXKEYS from '@src/ONYXKEYS';
import type {TransactionViolations} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

import useOnyx from './useOnyx';

const transactionViolationsSelector = (violations: OnyxCollection<TransactionViolations>, eligibleTransactionIDs?: string[]) => {
    if (!eligibleTransactionIDs?.length) {
        return undefined;
    }
    const eligibleTransactionIDSet = new Set(eligibleTransactionIDs);
    return Object.fromEntries(
        Object.entries(violations ?? {}).filter(([key]) => {
            const id = key.replace(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, '');
            return eligibleTransactionIDSet.has(id);
        }),
    );
};

function useTransactionViolation(eligibleTransactionIDs?: string[]) {
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, {
        selector: (violations: OnyxCollection<TransactionViolations>) => transactionViolationsSelector(violations, eligibleTransactionIDs),
    });

    return transactionViolations;
}

export default useTransactionViolation;
