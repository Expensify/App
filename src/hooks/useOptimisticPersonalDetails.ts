import {optimisticPersonalDetailsSelector} from '@selectors/PersonalDetails';

import {useAllPersonalDetails} from './usePersonalDetails';

/**
 * Subscribes to the personal details that were created optimistically only.
 * Use it instead of `usePersonalDetails` when the consumer only cares about optimistic accounts:
 * the optimistic set is small, so the component re-renders only when an optimistic personal detail changes
 * instead of on every change of the whole personal details list.
 */
function useOptimisticPersonalDetails() {
    const [optimisticPersonalDetails] = useAllPersonalDetails(optimisticPersonalDetailsSelector);
    return optimisticPersonalDetails;
}

export default useOptimisticPersonalDetails;
