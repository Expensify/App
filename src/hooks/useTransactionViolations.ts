import {useMemo} from 'react';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {isBrokenConnectionViolation, isViolationDismissed, mergeProhibitedViolations, shouldShowBrokenConnectionViolation, shouldShowViolation} from '@libs/TransactionUtils';
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
        () => {
            const notDismissed = transactionViolations.filter(
                (violation: TransactionViolation) =>
                    !isViolationDismissed(transaction, violation, currentUserDetails.email ?? '', currentUserDetails.accountID, iouReport, policy),
            );

            // Broken card connection violations have their own display logic that accounts for policy admin visibility
            // on open reports — separate them so we can apply the correct check for each group.
            const brokenConnectionViolations = notDismissed.filter((v) => isBrokenConnectionViolation(v));
            const otherViolations = notDismissed.filter((v) => !isBrokenConnectionViolation(v));

            const visibleOtherViolations = otherViolations.filter((violation: TransactionViolation) =>
                shouldShowViolation(iouReport, policy, violation.name, currentUserDetails.email ?? '', shouldShowRterForSettledReport, transaction),
            );

            // shouldShowBrokenConnectionViolation correctly handles visibility for policy admins on open reports,
            // whereas the general shouldShowViolation RTER branch only checks isSubmitter || isInstantSubmitEnabled.
            const visibleBrokenConnectionViolations = shouldShowBrokenConnectionViolation(iouReport, policy, brokenConnectionViolations) ? brokenConnectionViolations : [];

            return mergeProhibitedViolations([...visibleOtherViolations, ...visibleBrokenConnectionViolations]);
        },
        [transaction, transactionViolations, iouReport, policy, shouldShowRterForSettledReport, currentUserDetails.email, currentUserDetails.accountID],
    );
}

export default useTransactionViolations;
