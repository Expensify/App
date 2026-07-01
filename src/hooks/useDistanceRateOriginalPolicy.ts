import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getPolicyForDistanceRateID, getPolicyIDOrDefault} from '@libs/PolicyUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
import useOnyx from './useOnyx';

/**
 * Finds the policy that owns the given customUnitRateID.
 * Resolves the policy ID via a collection selector (scalar output) and subscribes
 * only to that policy key for reactive updates.
 *
 * @param shouldLookup When false, skips the cross-policy scan (e.g. when the rate is already on the report policy).
 */
function useDistanceRateOriginalPolicy(customUnitRateID: string | undefined, shouldLookup = true): OnyxEntry<Policy> {
    const [policyID] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {
        selector: (policies: OnyxCollection<Policy>) => {
            if (!shouldLookup || !customUnitRateID) {
                return undefined;
            }
            return getPolicyForDistanceRateID(customUnitRateID, policies)?.id;
        },
    });

    const resolvedPolicyID = getNonEmptyStringOnyxID(policyID);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getPolicyIDOrDefault(resolvedPolicyID)}`);

    return shouldLookup && customUnitRateID && resolvedPolicyID ? policy : undefined;
}

export default useDistanceRateOriginalPolicy;
