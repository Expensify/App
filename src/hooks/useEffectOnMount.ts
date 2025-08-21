import type {EffectCallback} from 'react';
import {useEffect, useRef} from 'react';
import useBeforeRemove from './useBeforeRemove';

/**
 * A drop-in replacement for `useEffect` that runs the provided effect **only once on mount**
 * (during the first render). Unlike `useEffect`, this hook does not re-run
 * when dependencies change, and it resets its "first render" state
 * when the component is removed from the navigation stack.
 * 
 * @example
 * useEffectOnMount(() => {
 *   console.log("Component mounted");
 *   return () => console.log("Cleanup on unmount");
 * });
 */
function useEffectOnMount(effect: EffectCallback) {
    const firstRenderRef = useRef(true);

    useEffect(() => {
        if (!firstRenderRef.current) {
            return;
        }
        firstRenderRef.current = false;
        const cleanup = effect();
        return cleanup;

        // We only want to run effect on first render, so we don't add dependencies.
        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useBeforeRemove(() => {
        firstRenderRef.current = true;
    });
}

export default useEffectOnMount;
