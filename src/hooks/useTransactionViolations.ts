import {useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import {isViolationDismissed} from '@libs/TransactionUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {TransactionViolations} from '@src/types/onyx';

function useTransactionViolations(transactionID?: string): TransactionViolations {
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`);
    const [transactionViolations = []] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`);
    return useMemo(() => transactionViolations.filter((violation) => !isViolationDismissed(transaction, violation)), [transaction, transactionViolations]);
}

export default useTransactionViolations;
