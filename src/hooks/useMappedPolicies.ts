import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
import mapOnyxCollectionItems from '@src/utils/mapOnyxCollectionItems';
import useOnyx from './useOnyx';

/**
 * Subscribes to all policies and transforms each one via the provided mapper.
 * Uses Onyx's built-in deepEqual comparison on the mapped collection so that
 * consumers get a stable reference when the mapper output hasn't changed —
 * even if unrelated policy fields were updated.
 */
function useMappedPolicies<T>(mapper: (policy: OnyxEntry<Policy>) => T) {
    const selector = (policies: OnyxCollection<Policy>) => mapOnyxCollectionItems(policies, mapper);
    const [transformedPolicies, metadata] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector});

    return [transformedPolicies, metadata] as const;
}

export default useMappedPolicies;
