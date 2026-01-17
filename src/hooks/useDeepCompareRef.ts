import {deepEqual} from 'fast-equals';
import {useRef} from 'react';

/**
 * This hook returns a reference to the provided value,
 * but only updates that reference if a deep comparison indicates that the value has changed.
 *
 * This is useful when working with objects or arrays as dependencies to other hooks like `useEffect` or `useMemo`,
 * where you want the hook to trigger not just on reference changes, but also when the contents of the object or array change.
 *
 * @example
 * const myArray = // some array
 * const deepComparedArray = useDeepCompareRef(myArray);
 * useEffect(() => {
 *   // This will run not just when myArray is a new array, but also when its contents change.
 * }, [deepComparedArray]);
 */
export default function useDeepCompareRef<T>(value: T): T | undefined {
    const ref = useRef<T | undefined>(undefined);
    if (!deepEqual(value, ref.current)) {
        ref.current = value;
    }
    return ref.current;
}
