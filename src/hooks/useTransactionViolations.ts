import {useMemo} from 'react';
import {isViolationDismissed, shouldShowViolation} from '@libs/TransactionUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {TransactionViolation, TransactionViolations} from '@src/types/onyx';
import useOnyx from './useOnyx';

function useTransactionViolations(transactionID?: string): TransactionViolations {
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {
        canBeMissing: true,
    });
    const [transactionViolations = []] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`, {
        canBeMissing: true,
    });
    const [iouReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${transaction?.reportID}`);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${iouReport?.policyID}`);

    return useMemo(
        () => transactionViolations.filter((violation: TransactionViolation) => !isViolationDismissed(transaction, violation) && shouldShowViolation(iouReport, policy, violation.name)),
        [transaction, transactionViolations, iouReport, policy],
    );
}

export default useTransactionViolations;
