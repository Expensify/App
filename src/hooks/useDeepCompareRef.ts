import {deepEqual} from 'fast-equals';
import {useRef} from 'react';

/**
 * ⚠️ **WARNING: ANTI-PATTERN - AVOID IN NEW CODE** ⚠️
 *
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
 *
 * **Why this is problematic:**
 * - Violates React's exhaustive deps rule (can cause stale closures)
 * - Performance overhead from deep equality checks on every render
 * - Incompatible with React Compiler optimizations
 * - Usually indicates a data flow problem that should be fixed at the source
 *
 * **Use instead:**
 * - `useMemo` with primitive dependencies
 * - Fix selectors/data sources to return stable references
 *
 * **Only use when ALL of these apply:**
 * - Legacy infrastructure forces new references (e.g., Onyx collections)
 * - Documented why it's necessary and what the risks are
 * - No feasible alternative without major refactoring
 * - Performance impact measured with tests (e.g., Reassure)
 */
export default function useDeepCompareRef<T>(value: T): T | undefined {
    const ref = useRef<T | undefined>(undefined);
    if (!deepEqual(value, ref.current)) {
        ref.current = value;
    }
    return ref.current;
}
