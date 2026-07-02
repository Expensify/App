import {useState} from 'react';
import arraysEqual from '@src/utils/arraysEqual';

/**
 * Preserves the previous array reference when its contents are equal.
 *
 * Useful for absorbing fresh array allocations from pure derivation utilities
 * (e.g. functions returning `.filter(...)`/`.map(...)` results) so downstream
 * consumers don't re-render on identity churn that doesn't reflect a real change.
 *
 * Uses the "storing information from previous renders" pattern documented at
 * https://react.dev/reference/react/useState#storing-information-from-previous-renders
 * — the equality check bounds the re-render loop to a single extra pass.
 */
function useStableArrayReference<T>(value: T[]): T[] {
    const [stable, setStable] = useState<T[]>(value);
    const isEqual = arraysEqual(stable, value);

    if (!isEqual) {
        setStable(value);
    }

    return isEqual ? stable : value;
}

export default useStableArrayReference;
