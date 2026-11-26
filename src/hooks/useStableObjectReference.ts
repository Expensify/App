import {shallowEqual} from 'fast-equals';

import useStableReference from './useStableReference';

function areObjectsShallowEqual<T extends Record<string, unknown> | undefined>(previous: T, next: T) {
    return previous === next || (!!previous && !!next && shallowEqual(previous, next));
}

/**
 * Preserves the previous object reference when its values are the same references.
 *
 * Useful for objects rebuilt from whole Onyx collections: a write to an unrelated member gives a new
 * container whose values are still the same Onyx entries, and downstream consumers shouldn't re-render for it.
 */
function useStableObjectReference<T extends Record<string, unknown> | undefined>(value: T): T {
    return useStableReference(value, areObjectsShallowEqual);
}

export default useStableObjectReference;
