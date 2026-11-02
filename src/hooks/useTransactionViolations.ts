import {useMemo} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getDistanceRateCustomUnitRate} from '@libs/PolicyUtils';
import {getVisibleTransactionViolations, isDistanceRequest} from '@libs/TransactionUtils';
import {syncCustomUnitRateOutOfDateRangeViolation} from '@libs/Violations/ViolationsUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, TransactionViolation, TransactionViolations} from '@src/types/onyx';
import getEmptyArray from '@src/types/utils/getEmptyArray';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useDistanceRateOriginalPolicy from './useDistanceRateOriginalPolicy';
import useOnyx from './useOnyx';

function useTransactionViolations(transactionID?: string, shouldShowRterForSettledReport = true, policyOverride?: OnyxEntry<Policy>): TransactionViolations {
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(transactionID)}`);
    const [transactionViolations = getEmptyArray<TransactionViolation>()] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`);
    const [iouReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(transaction?.reportID)}`);
    const [reportPolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${iouReport?.policyID}`);
    const customUnitRateID = isDistanceRequest(transaction) ? transaction?.comment?.customUnit?.customUnitRateID : undefined;
    const shouldLookupDistancePolicy = !policyOverride && !!customUnitRateID && !getDistanceRateCustomUnitRate(reportPolicy, customUnitRateID);
    const distanceOriginalPolicy = useDistanceRateOriginalPolicy(customUnitRateID, shouldLookupDistancePolicy);
    const policy = policyOverride ?? distanceOriginalPolicy ?? reportPolicy;
    const currentUserDetails = useCurrentUserPersonalDetails();

    return useMemo(() => {
        const syncedViolations = syncCustomUnitRateOutOfDateRangeViolation(transactionViolations, transaction, policy);

        return getVisibleTransactionViolations(
            transaction,
            syncedViolations,
            currentUserDetails.email ?? '',
            currentUserDetails.accountID,
            iouReport,
            policy,
            shouldShowRterForSettledReport,
        );
    }, [transaction, transactionViolations, iouReport, policy, shouldShowRterForSettledReport, currentUserDetails.email, currentUserDetails.accountID]);
}

export default useTransactionViolations;
