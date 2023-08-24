import {useRef} from 'react';
import _ from 'lodash';

/**
 * Custom hook to memoize a value based on deep comparison.
 * Returns the previous value if the current value is deeply equal to the previous one.
 *
 * @function
 * @template T
 * @param {T} value - The value to be memoized.
 * @returns {T} - The memoized value. Returns the previous value if the current value is deeply equal to the previous one.
 * @example
 *
 * const object = { a: 1, b: 2 };
 * const memoizedObject = useDeepCompareMemo(object);
 */
export default function useDeepCompareMemo(value) {
    const ref = useRef(); // Holds the previous value

    // If the new value is not deeply equal to the old value, update the ref
    if (!_.isEqual(value, ref.current)) {
        ref.current = value;
    }

    return ref.current;
}
