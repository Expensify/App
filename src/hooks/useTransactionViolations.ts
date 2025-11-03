import {useMemo} from 'react';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {isViolationDismissed, shouldShowViolation} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {TransactionViolation, TransactionViolations} from '@src/types/onyx';
import getEmptyArray from '@src/types/utils/getEmptyArray';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useOnyx from './useOnyx';

function mergeProhibitedViolations(transactionViolations: TransactionViolations): TransactionViolations {
    const prohibitedViolations = transactionViolations.filter((violation: TransactionViolation) => violation.name === CONST.VIOLATIONS.PROHIBITED_EXPENSE);

    if (prohibitedViolations.length === 0) {
        return transactionViolations;
    }

    const prohibitedExpenses = prohibitedViolations.flatMap((violation: TransactionViolation) => violation.data?.prohibitedExpenseRule ?? []);
    const mergedProhibitedViolations: TransactionViolation = {
        name: CONST.VIOLATIONS.PROHIBITED_EXPENSE,
        data: {
            prohibitedExpenseRule: prohibitedExpenses,
        },
        type: CONST.VIOLATION_TYPES.VIOLATION,
    };

    return [...transactionViolations.filter((violation: TransactionViolation) => violation.name !== CONST.VIOLATIONS.PROHIBITED_EXPENSE), mergedProhibitedViolations];
}

function useTransactionViolations(transactionID?: string, shouldShowRterForSettledReport = true): TransactionViolations {
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(transactionID)}`, {
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
    const currentUserDetails = useCurrentUserPersonalDetails();

    return useMemo(
        () =>
            mergeProhibitedViolations(
                transactionViolations.filter(
                    (violation: TransactionViolation) =>
                        !isViolationDismissed(transaction, violation, currentUserDetails.email ?? '') &&
                        shouldShowViolation(iouReport, policy, violation.name, currentUserDetails.email ?? '', shouldShowRterForSettledReport),
                ),
            ),
        [transaction, transactionViolations, iouReport, policy, shouldShowRterForSettledReport, currentUserDetails.email],
    );
}

export default useTransactionViolations;
