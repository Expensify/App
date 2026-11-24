import {shallowEqual} from 'fast-equals';
import {useState} from 'react';

/**
 * Preserves the previous object reference when its values are the same references.
 *
 * Useful for objects rebuilt from whole Onyx collections: a write to an unrelated member gives a new
 * container whose values are still the same Onyx entries, and downstream consumers shouldn't re-render for it.
 *
 * Uses the "storing information from previous renders" pattern documented at
 * https://react.dev/reference/react/useState#storing-information-from-previous-renders
 * — the equality check bounds the re-render loop to a single extra pass.
 */
function useStableObjectReference<T extends Record<string, unknown> | undefined>(value: T): T {
    const [stable, setStable] = useState<T>(value);
    const isEqual = stable === value || (!!stable && !!value && shallowEqual(stable, value));

    if (!isEqual) {
        setStable(value);
    }

    return isEqual ? stable : value;
}

export default useStableObjectReference;
