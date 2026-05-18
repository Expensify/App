// eslint-disable-next-line lodash/import-scope
import type {DebouncedFunc, DebounceSettings} from 'lodash';
import lodashDebounce from 'lodash/debounce';
import {useCallback, useEffect, useRef} from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GenericFunction = (...args: any[]) => void;

/**
 * Create and return a debounced function.
 *
 * Every time the identity of any of the arguments changes, the debounce operation will restart (canceling any ongoing debounce).
 * This hook doesn't react on function identity changes and will not cancel the debounce in case of function identity change.
 * This is important because we want to debounce the function call and not the function reference.
 *
 * @param func The function to debounce.
 * @param wait The number of milliseconds to delay.
 * @param options The options object.
 * @param options.leading Specify invoking on the leading edge of the timeout.
 * @param options.maxWait The maximum time func is allowed to be delayed before it’s invoked.
 * @param options.trailing Specify invoking on the trailing edge of the timeout.
 * @returns Returns a function to call the debounced function.
 */
export default function useDebounceNonReactive<T extends GenericFunction>(func: T, wait: number, options?: DebounceSettings): T {
    const funcRef = useRef<T>(func); // Store the latest func reference
    const debouncedFnRef = useRef<DebouncedFunc<T> | undefined>(undefined);
    const {leading, maxWait, trailing = true} = options ?? {};

    useEffect(() => {
        // Update the funcRef dynamically to avoid recreating debounce
        funcRef.current = func;
    }, [func]);

    // Recreate the debounce instance only if debounce settings change
    useEffect(() => {
        const debouncedFn = lodashDebounce(
            (...args: Parameters<T>) => {
                funcRef.current(...args); // Use the latest func reference
            },
            wait,
            {leading, maxWait, trailing},
        );

        debouncedFnRef.current = debouncedFn;

        return () => {
            debouncedFn.cancel();
        };
    }, [wait, leading, maxWait, trailing]);

    const debounceCallback = useCallback((...args: Parameters<T>) => {
        debouncedFnRef.current?.(...args);
    }, []);

    return debounceCallback as T;
}
