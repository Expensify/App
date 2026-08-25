// eslint-disable-next-line lodash/import-scope
import type {DebouncedFunc, DebounceSettings} from 'lodash';

import lodashDebounce from 'lodash/debounce';
import {useEffect, useEffectEvent, useRef} from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GenericFunction = (...args: any[]) => void;
type DebouncedFunction<T extends GenericFunction> = T & {cancel: () => void};

/**
 * Non-generic implementation so OXC's React Compiler can memoize the hook.
 * OXC bails on type params inside hooks ("Unsupported declaration type for hoisting").
 */
function useDebounceNonReactiveImpl(func: GenericFunction, wait: number, options?: DebounceSettings): DebouncedFunction<GenericFunction> {
    const {leading, maxWait, trailing = true} = options ?? {};
    // Keeps one identity for the lifetime of the hook while always calling the latest `func`, so the debounced function
    // below is only ever recreated when a debounce setting changes.
    const callFunction = useEffectEvent((...args: unknown[]) => func(...args));
    const debouncedFnRef = useRef<DebouncedFunc<GenericFunction> | undefined>(undefined);

    useEffect(() => {
        const debouncedFn = lodashDebounce(callFunction, wait, {leading, maxWait, trailing});

        debouncedFnRef.current = debouncedFn;

        return () => {
            debouncedFn.cancel();
        };
    }, [wait, leading, maxWait, trailing]);

    const debouncedFunction = (...args: unknown[]) => {
        debouncedFnRef.current?.(...args);
    };
    debouncedFunction.cancel = () => debouncedFnRef.current?.cancel();
    return debouncedFunction;
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
 * @returns Returns a function to call the debounced function, with a `cancel` method dropping a pending call.
 */
export default function useDebounceNonReactive<T extends GenericFunction>(func: T, wait: number, options?: DebounceSettings): DebouncedFunction<T> {
    return useDebounceNonReactiveImpl(func, wait, options) as DebouncedFunction<T>;
}
