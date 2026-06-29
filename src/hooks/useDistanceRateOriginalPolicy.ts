import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {getPolicyForDistanceRateID} from '@libs/PolicyUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
import useOnyx from './useOnyx';

/**
 * Finds the policy that owns the given customUnitRateID by searching all policies
 * for one whose distance custom unit contains the rate.
 */
function useDistanceRateOriginalPolicy(customUnitRateID: string | undefined): OnyxEntry<Policy> {
    const [distanceOriginalPolicy] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {
        selector: (policies: OnyxCollection<Policy>) => getPolicyForDistanceRateID(customUnitRateID, policies),
    });

    return distanceOriginalPolicy;
}

export default useDistanceRateOriginalPolicy;
