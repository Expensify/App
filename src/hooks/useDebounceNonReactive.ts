// eslint-disable-next-line lodash/import-scope
import type {DebouncedFunc, DebounceSettings} from 'lodash';

import lodashDebounce from 'lodash/debounce';
import {useEffect, useRef} from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GenericFunction = (...args: any[]) => void;

/**
 * Non-generic implementation so OXC's React Compiler can memoize the hook.
 * OXC bails on type params inside hooks ("Unsupported declaration type for hoisting").
 */
function useDebounceNonReactiveImpl(func: GenericFunction, wait: number, options?: DebounceSettings): GenericFunction {
    const funcRef = useRef<GenericFunction>(func);
    const debouncedFnRef = useRef<DebouncedFunc<GenericFunction> | undefined>(undefined);
    const {leading, maxWait, trailing = true} = options ?? {};

    useEffect(() => {
        funcRef.current = func;
    }, [func]);

    useEffect(() => {
        const debouncedFn = lodashDebounce(
            (...args: unknown[]) => {
                funcRef.current(...args);
            },
            wait,
            {leading, maxWait, trailing},
        );

        debouncedFnRef.current = debouncedFn;

        return () => {
            debouncedFn.cancel();
        };
    }, [wait, leading, maxWait, trailing]);

    return (...args: unknown[]) => {
        debouncedFnRef.current?.(...args);
    };
}

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
 * @param options.maxWait The maximum time func is allowed to be delayed before it's invoked.
 * @param options.trailing Specify invoking on the trailing edge of the timeout.
 * @returns Returns a function to call the debounced function.
 */
export default function useDebounceNonReactive<T extends GenericFunction>(func: T, wait: number, options?: DebounceSettings): T {
    return useDebounceNonReactiveImpl(func, wait, options) as T;
}
