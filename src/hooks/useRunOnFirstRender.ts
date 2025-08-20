import {useEffect, useRef} from 'react';
import useBeforeRemove from './useBeforeRemove';

/**
 * Hook that runs a callback **only once on the first render** of a component,
 * and resets its "first render" state when the component is removed from navigation.
 *
 * @param firstRenderCb - The callback function to execute on the component's first render.
 * @param shouldSkip - Optional condition to control whether the callback should run.
 *   - If `true`, the callback will be skipped.
 *   - If `false` (default), AND it's a first render, the callback will be executed.
 *
 * @example
 * useRunOnFirstRender(() => {
 *   console.log("Component mounted for the first time!");
 * });
 *
 * @example
 * // Run the callback only if condition is true
 * useRunOnFirstRender(() => {
 *   console.log("Runs on first render when condition is true");
 * }, someBooleanCondition);
 */
function useRunOnFirstRender(firstRenderCb: () => void, shouldSkip = false) {
    const firstRenderRef = useRef(true);

    useEffect(() => {
        if (!firstRenderRef.current || shouldSkip) {
            return;
        }
        firstRenderRef.current = false;
        firstRenderCb();
        // We only want to run firstRenderCb on first render, so we don't add dependencies.
        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useBeforeRemove(() => {
        firstRenderRef.current = true;
    });
}

export default useRunOnFirstRender;
