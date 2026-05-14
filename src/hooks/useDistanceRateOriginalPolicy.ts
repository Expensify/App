import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {getDistanceRateCustomUnit} from '@libs/PolicyUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
import useOnyx from './useOnyx';

/**
 * Finds the policy that owns the given customUnitRateID by searching all policies
 * for one whose distance custom unit contains the rate.
 */
function useDistanceRateOriginalPolicy(customUnitRateID: string | undefined): OnyxEntry<Policy> {
    const [distanceOriginalPolicy] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {
        selector: (policies: OnyxCollection<Policy>) => {
            if (!customUnitRateID) {
                return undefined;
            }
            return Object.values(policies ?? {}).find((p) => {
                const distanceUnit = getDistanceRateCustomUnit(p);
                return !!distanceUnit?.rates && customUnitRateID in distanceUnit.rates;
            });
        },
    });

    return distanceOriginalPolicy;
}

export default useDistanceRateOriginalPolicy;
