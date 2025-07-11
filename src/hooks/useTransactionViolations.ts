import {useMemo} from 'react';
import {isViolationDismissed} from '@libs/TransactionUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {TransactionViolation, TransactionViolations} from '@src/types/onyx';
import getEmptyArray from '@src/types/utils/getEmptyArray';
import useOnyx from './useOnyx';

function useTransactionViolations(transactionID?: string): TransactionViolations {
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {
        canBeMissing: true,
    });
    const [transactionViolations = getEmptyArray<TransactionViolation>()] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`, {
        canBeMissing: true,
    });

    return useMemo(() => transactionViolations.filter((violation) => !isViolationDismissed(transaction, violation)), [transaction, transactionViolations]);
}

export default useTransactionViolations;
