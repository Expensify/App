import {useOnyx} from 'react-native-onyx';
import {getTransaction, isViolationDismissed} from '@libs/TransactionUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {TransactionViolations} from '@src/types/onyx';

function useTransactionViolations(transactionID?: string): TransactionViolations | undefined {
    const [transactionViolations] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`, {
        selector: (violations) => {
            const transaction = getTransaction(transactionID);
            if (!transaction) {
                return [];
            }
            return (violations ?? []).filter((violation) => !isViolationDismissed(transaction, violation));
        },
    });
    return transactionViolations;
}

export default useTransactionViolations;
