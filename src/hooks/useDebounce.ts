// eslint-disable-next-line lodash/import-scope
import type {DebouncedFunc, DebounceSettings} from 'lodash';

import lodashDebounce from 'lodash/debounce';
import {useEffect, useRef} from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GenericFunction = (...args: any[]) => void;

type UseDebounceOptions = DebounceSettings & {
    /**
     * When true, any pending trailing invocation is flushed on component unmount instead of cancelled.
     * Opt-in only; default behavior remains cancel-on-unmount.
     */
    shouldExecuteOnUnmount?: boolean;
};

/**
 * Create and return a debounced function.
 *
 * Every time the identity of any of the arguments changes, the debounce operation will restart (canceling any ongoing debounce).
 * This is especially important in the case of func. To prevent that, pass stable references.
 *
 * @param func The function to debounce.
 * @param wait The number of milliseconds to delay.
 * @param options The options object.
 * @param options.leading Specify invoking on the leading edge of the timeout.
 * @param options.maxWait The maximum time func is allowed to be delayed before it's invoked.
 * @param options.trailing Specify invoking on the trailing edge of the timeout.
 * @param options.shouldExecuteOnUnmount When true, flush pending invocations on unmount instead of cancelling them.
 * @returns Returns a function to call the debounced function.
 */
export default function useDebounce<T extends GenericFunction>(func: T, wait: number, options?: UseDebounceOptions): T {
    const debouncedFnRef = useRef<DebouncedFunc<T> | undefined>(undefined);
    const {leading, maxWait, trailing = true, shouldExecuteOnUnmount = false} = options ?? {};

    // Registered after the debounce effect so this cleanup runs first on unmount and can flush
    // before the debounced function is cancelled.
    useEffect(() => {
        return () => {
            if (!shouldExecuteOnUnmount) {
                return;
            }
            debouncedFnRef.current?.flush();
        };
    }, [shouldExecuteOnUnmount]);

    useEffect(() => {
        const debouncedFn = lodashDebounce(func, wait, {leading, maxWait, trailing});

        debouncedFnRef.current = debouncedFn;

        return () => {
            debouncedFn.cancel();
        };
    }, [func, wait, leading, maxWait, trailing]);

    const debounceCallback = (...args: Parameters<T>) => {
        const debouncedFn = debouncedFnRef.current;

        if (debouncedFn) {
            debouncedFn(...args);
        }
    };

    return debounceCallback as T;
}

export type {UseDebounceOptions};
