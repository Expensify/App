// eslint-disable-next-line lodash/import-scope
import type {DebouncedFunc, DebounceSettings} from 'lodash';

import lodashDebounce from 'lodash/debounce';
import {useEffect, useRef} from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GenericFunction = (...args: any[]) => void;

type DebounceControls<T extends GenericFunction> = {
    /** Calls the debounced function, restarting the wait. */
    invoke: T;

    cancel: () => void;
};

type UseDebounceOptions = DebounceSettings & {
    /**
     * When true, any pending trailing invocation is flushed on component unmount instead of cancelled.
     * Opt-in only; default behavior remains cancel-on-unmount.
     */
    shouldExecuteOnUnmount?: boolean;
};

/**
 * Non-generic implementation so OXC's React Compiler can memoize the hook.
 * OXC bails on type params inside hooks ("Unsupported declaration type for hoisting").
 */
function useDebounceImpl(func: GenericFunction, wait: number, options?: UseDebounceOptions): DebounceControls<GenericFunction> {
    const debouncedFnRef = useRef<DebouncedFunc<GenericFunction> | undefined>(undefined);
    const {leading, maxWait, trailing = true, shouldExecuteOnUnmount = false} = options ?? {};

    // Registered before the debounce effect so this cleanup runs first on unmount and can flush
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
        // Lodash checks whether `maxWait` is present, not its value, so `{maxWait: undefined}` would cap the wait at `wait`.
        const debouncedFn = maxWait === undefined ? lodashDebounce(func, wait, {leading, trailing}) : lodashDebounce(func, wait, {leading, maxWait, trailing});

        debouncedFnRef.current = debouncedFn;

        return () => {
            debouncedFn.cancel();
        };
    }, [func, wait, leading, maxWait, trailing]);

    return {
        invoke: (...args: unknown[]) => {
            debouncedFnRef.current?.(...args);
        },
        cancel: () => {
            debouncedFnRef.current?.cancel();
        },
    };
}

/**
 * Same as `useDebounce`, with a `cancel` that drops a pending invocation. See `useDebounce` for the parameters.
 *
 * Returns an object because OXC's React Compiler fails on a function value whose methods read a ref
 * ("Ref type environment did not converge").
 */
function useDebounceWithControls<T extends GenericFunction>(func: T, wait: number, options?: UseDebounceOptions): DebounceControls<T> {
    return useDebounceImpl(func, wait, options) as DebounceControls<T>;
}

/**
 * Create and return a debounced function.
 *
 * Every time the identity of any of the arguments changes, the debounce operation will restart (canceling any ongoing debounce).
 * This is especially important in the case of func. To prevent that, pass stable references.
 *
 * Use `useDebounceWithControls` when the wait has to be cancellable.
 *
 * @param func The function to debounce.
 * @param wait The number of milliseconds to delay.
 * @param options The options object.
 * @param options.leading Specify invoking on the leading edge of the timeout.
 * @param options.maxWait The maximum time func is allowed to be delayed before it's invoked, raised to `wait` when lower. Left out, a burst of calls pushes the wait back without limit.
 * @param options.trailing Specify invoking on the trailing edge of the timeout.
 * @param options.shouldExecuteOnUnmount When true, flush pending invocations on unmount instead of cancelling them.
 * @returns Returns a function to call the debounced function.
 */
export default function useDebounce<T extends GenericFunction>(func: T, wait: number, options?: UseDebounceOptions): T {
    return useDebounceWithControls(func, wait, options).invoke;
}

export {useDebounceWithControls};

export type {UseDebounceOptions};
