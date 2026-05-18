import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import useOnyx from '@hooks/useOnyx';
import {getPolicyByCustomUnitID} from '@libs/PolicyUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Transaction} from '@src/types/onyx';

type UsePerDiemPolicyDataResult = {
    /** The full POLICY collection — needed by `useReportSelectionActions` for callback-time lookups by user-selected policyID. */
    allPolicies: OnyxCollection<Policy>;

    /** The per-diem policy derived from the transaction's custom-unit ID, if any. */
    perDiemOriginalPolicy: OnyxEntry<Policy>;
};

/**
 * @param transaction — the transaction whose custom-unit ID (if present) is matched against the policy collection.
 */
function usePerDiemPolicyData(transaction: OnyxEntry<Transaction>): UsePerDiemPolicyDataResult {
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const perDiemOriginalPolicy = getPolicyByCustomUnitID(transaction, allPolicies);
    return {allPolicies, perDiemOriginalPolicy};
}

export default usePerDiemPolicyData;
