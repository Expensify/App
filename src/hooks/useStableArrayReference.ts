import arraysEqual from '@src/utils/arraysEqual';

import useStableReference from './useStableReference';

/**
 * Preserves the previous array reference when its contents are equal.
 *
 * Useful for absorbing fresh array allocations from pure derivation utilities
 * (e.g. functions returning `.filter(...)`/`.map(...)` results) so downstream
 * consumers don't re-render on identity churn that doesn't reflect a real change.
 */
function useStableArrayReference<T>(value: T[]): T[] {
    return useStableReference(value, arraysEqual);
}

export default useStableArrayReference;
