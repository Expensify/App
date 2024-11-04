import type {EffectCallback} from 'react';
import {useEffect, useRef} from 'react';

function useEffectOnce(callback: EffectCallback, condition = true) {
    const hasRunCallbackBefore = useRef(false);

    useEffect(() => {
        if (!condition || hasRunCallbackBefore.current === true) {
            return;
        }

        hasRunCallbackBefore.current = true;
        callback();
    }, [condition, callback]);
}

export default useEffectOnce;
