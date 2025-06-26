import {useMemo} from 'react';
import {isViolationDismissed} from '@libs/TransactionUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {TransactionViolations} from '@src/types/onyx';
import useOnyx from './useOnyx';

function useTransactionViolations(transactionID?: string): TransactionViolations {
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {
        canBeMissing: true,
    });
    const [transactionViolations = []] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`, {
        canBeMissing: true,
    });

    return useMemo(() => transactionViolations.filter((violation) => !isViolationDismissed(transaction, violation)), [transaction, transactionViolations]);
}

export default useTransactionViolations;
