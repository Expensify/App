import type {OnyxEntry} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
import mapOnyxCollectionItems from '@src/utils/mapOnyxCollectionItems';
import useOnyx from './useOnyx';

/**
 * Subscribes to all policies and transforms each one via the provided mapper.
 * Unlike passing a selector directly to useOnyx (which triggers expensive deepEqual
 * comparisons on the entire mapped collection), this hook lets Onyx use cheap
 * shallowEqual on raw policy references, then maps the collection inline.
 */
function useMappedPolicies<T>(mapper: (policy: OnyxEntry<Policy>) => T) {
    const [policies, metadata] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const transformedPolicies = mapOnyxCollectionItems(policies, mapper);

    return [transformedPolicies, metadata] as const;
}

export default useMappedPolicies;
