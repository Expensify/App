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
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, {
        selector: (violations: OnyxCollection<TransactionViolations>) => transactionViolationsSelector(violations, eligibleTransactionIDs),
    });

    return transactionViolations;
}

export default useTransactionViolation;
