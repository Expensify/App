import {deepEqual} from 'fast-equals';
import {useState} from 'react';

/**
 * Preserves the previous reference when the new value is equal to it (deep equality by default).
 *
 * The object counterpart of `useStableArrayReference`: derivation code that rebuilds an object on every run keeps handing
 * consumers a new reference for the same content, and a context value or memo dependency built from it changes for no
 * reason. Uses the "storing information from previous renders" pattern; the equality check bounds the extra pass to one.
 */
function useStableValueReference<T>(value: T, areEqual: (previous: T, next: T) => boolean = deepEqual): T {
    const [stable, setStable] = useState<T>(value);
    const isEqual = stable === value || areEqual(stable, value);

    if (!isEqual) {
        setStable(value);
    }

    return isEqual ? stable : value;
}

export default useStableValueReference;
