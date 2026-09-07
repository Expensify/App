// eslint-disable-next-line lodash/import-scope
import type {DebouncedFunc, DebounceSettings} from 'lodash';

import lodashDebounce from 'lodash/debounce';
import {useEffect, useRef} from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GenericFunction = (...args: any[]) => void;

type DebounceControls<T extends GenericFunction> = {
    /** Calls the debounced function, restarting the wait. */
    invoke: T;

    /** Drops a pending invocation. */
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
        // Lodash reads whether `maxWait` was given, not what it holds, so the key is left out when there is no cap to
        // apply. With the key present it caps the wait at `wait` even when the value is `undefined`.
        const debouncedFn = maxWait === undefined ? lodashDebounce(func, wait, {leading, trailing}) : lodashDebounce(func, wait, {leading, maxWait, trailing});

        debouncedFnRef.current = debouncedFn;

        return () => {
            debouncedFn.cancel();
        };
    }, [func, wait, leading, maxWait, trailing]);

    // The debounced function is rebuilt whenever func or wait change, so both controls read it from the ref.
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
 * Same as `useDebounce`, with a `cancel` that drops a pending invocation.
 *
 * The controls come back as an object rather than as properties of the debounced function, because OXC's React Compiler
 * fails on a function value carrying methods that read a ref ("Ref type environment did not converge").
 *
 * @param func The function to debounce.
 * @param wait The number of milliseconds to delay.
 * @param options The options object, the same one `useDebounce` takes.
 * @returns The debounced function under `invoke`, and `cancel` for the invocation it has pending.
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
 * Every call pushes the wait back, so func runs once the calls stop for `wait`. Pass `maxWait` to cap how far the wait
 * can be pushed: a burst of calls then invokes func every `maxWait` instead of only after it stops.
 *
 * @param func The function to debounce.
 * @param wait The number of milliseconds to delay.
 * @param options The options object.
 * @param options.leading Specify invoking on the leading edge of the timeout.
 * @param options.maxWait The maximum time func is allowed to be delayed before it's invoked. Left out, the wait is uncapped.
 * @param options.trailing Specify invoking on the trailing edge of the timeout.
 * @param options.shouldExecuteOnUnmount When true, flush pending invocations on unmount instead of cancelling them.
 * @returns Returns a function to call the debounced function. Use `useDebounceWithControls` when the wait has to be cancellable.
 */
export default function useDebounce<T extends GenericFunction>(func: T, wait: number, options?: UseDebounceOptions): T {
    return useDebounceWithControls(func, wait, options).invoke;
}

export {useDebounceWithControls};

export type {DebounceControls, UseDebounceOptions};
