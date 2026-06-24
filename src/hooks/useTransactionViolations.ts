import {useMemo} from 'react';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getVisibleTransactionViolations} from '@libs/TransactionUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {TransactionViolation, TransactionViolations} from '@src/types/onyx';
import getEmptyArray from '@src/types/utils/getEmptyArray';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useOnyx from './useOnyx';

function useTransactionViolations(transactionID?: string, shouldShowRterForSettledReport = true): TransactionViolations {
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(transactionID)}`);
    const [transactionViolations = getEmptyArray<TransactionViolation>()] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`);
    const [iouReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(transaction?.reportID)}`);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${iouReport?.policyID}`);
    const currentUserDetails = useCurrentUserPersonalDetails();

    return useMemo(
        () =>
            getVisibleTransactionViolations(
                transaction,
                transactionViolations,
                currentUserDetails.email ?? '',
                currentUserDetails.accountID,
                iouReport,
                policy,
                shouldShowRterForSettledReport,
            ),
        [transaction, transactionViolations, iouReport, policy, shouldShowRterForSettledReport, currentUserDetails.email, currentUserDetails.accountID],
    );
}

export default useTransactionViolations;
