import {useMemo} from 'react';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {isViolationDismissed, mergeProhibitedViolations, shouldShowViolation} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {TransactionViolation, TransactionViolations} from '@src/types/onyx';
import getEmptyArray from '@src/types/utils/getEmptyArray';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useOnyx from './useOnyx';

function useTransactionViolations(transactionID?: string, shouldShowRterForSettledReport = true): TransactionViolations {
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(transactionID)}`, {
        canBeMissing: true,
    });
    const [transactionViolations = getEmptyArray<TransactionViolation>()] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`, {
        canBeMissing: true,
    });
    const [iouReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(transaction?.reportID)}`, {
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
                        !isViolationDismissed(transaction, violation, currentUserDetails.email ?? '', currentUserDetails.accountID, iouReport, policy) &&
                        shouldShowViolation(iouReport, policy, violation.name, currentUserDetails.email ?? '', shouldShowRterForSettledReport, transaction) &&
                        (!CONST.IS_ATTENDEES_REQUIRED_FEATURE_DISABLED || violation.name !== CONST.VIOLATIONS.MISSING_ATTENDEES),
                ),
            ),
        [transaction, transactionViolations, iouReport, policy, shouldShowRterForSettledReport, currentUserDetails.email, currentUserDetails.accountID],
    );
}

export default useTransactionViolations;
