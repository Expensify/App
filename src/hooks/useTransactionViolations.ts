import {useMemo} from 'react';
import {isViolationDismissed, shouldShowViolation} from '@libs/TransactionUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {TransactionViolation, TransactionViolations} from '@src/types/onyx';
import getEmptyArray from '@src/types/utils/getEmptyArray';
import useOnyx from './useOnyx';

function useTransactionViolations(transactionID?: string, shouldShowRterForSettledReport = true): TransactionViolations {
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {
        canBeMissing: true,
    });
    const [transactionViolations = getEmptyArray<TransactionViolation>()] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`, {
        canBeMissing: true,
    });
    const [iouReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${transaction?.reportID}`, {
        canBeMissing: true,
    });
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${iouReport?.policyID}`, {
        canBeMissing: true,
    });

    return useMemo(
        () =>
            transactionViolations.filter(
                (violation: TransactionViolation) => !isViolationDismissed(transaction, violation) && shouldShowViolation(iouReport, policy, violation.name, shouldShowRterForSettledReport),
            ),
        [transaction, transactionViolations, iouReport, policy, shouldShowRterForSettledReport],
    );
}

export default useTransactionViolations;
