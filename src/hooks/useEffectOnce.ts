import type {EffectCallback} from 'react';
import {useEffect, useRef} from 'react';

/**
 * This hook is used to run an effect only once, usually on the first render (on mount).
 *
 * @param callback The side effect to run only once.
 * @param condition Run the callback if this condition is true. Defaults to true.
 */
function useEffectOnce(callback: EffectCallback, condition = true) {
    const hasRunCallbackBefore = useRef(false);

    useEffect(() => {
        if (!condition || hasRunCallbackBefore.current === true) {
            return;
        }

        hasRunCallbackBefore.current = true;
        return callback();
    }, [condition, callback]);
}

export default useEffectOnce;
