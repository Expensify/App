import {useRef} from 'react';

/**
 * Non-generic implementation so OXC's React Compiler can memoize the hook.
 * OXC bails on type params inside hooks ("Unsupported declaration type for hoisting").
 */
function useStableIndexedHandlerImpl(handler: (index: number, ...args: unknown[]) => void): (index: number) => (...args: unknown[]) => void {
    const cacheRef = useRef<Map<number, (...args: unknown[]) => void>>(new Map());

    return (index: number) => {
        const cache = cacheRef.current;
        const cached = cache.get(index);
        if (cached) {
            return cached;
        }
        const bound = (...args: unknown[]) => handler(index, ...args);
        cache.set(index, bound);
        return bound;
    };
}

/**
 * Returns a factory that, given an index, returns a referentially-stable
 * handler bound to that index. Same index → same handler across renders.
 *
 * Useful in virtualized lists where rows need per-index callbacks but allocating
 * a fresh closure per row per render causes downstream re-renders.
 *
 * The cache grows monotonically with unique indices visited and is released
 * with the consuming component, so this is safe for list-bounded index spaces.
 *
 * Caller must pass a stable `handler` reference (compiler-memoized by React
 * Compiler, or a `useState` setter). If `handler` flips between renders, the
 * factory does too — and any compiler-memoized consumer that depends on the
 * factory will be invalidated each render.
 */
function useStableIndexedHandler<Args extends unknown[]>(handler: (index: number, ...args: Args) => void): (index: number) => (...args: Args) => void {
    return useStableIndexedHandlerImpl(handler as (index: number, ...args: unknown[]) => void) as (index: number) => (...args: Args) => void;
}

export default useStableIndexedHandler;
