import {useEffect, useRef, useCallback} from 'react';
import _ from 'underscore';

function useStateWithCallback(state, setState) {
    const callbackRef = useRef(null);

    const enhancedSetState = useCallback(
        (value, callback) => {
            callbackRef.current = callback;
            setState(value);
        },
        [setState],
    );

    useEffect(() => {
        if (!_.isFunction(callbackRef.current)) {
            return;
        }
        callbackRef.current(state);
        callbackRef.current = null;
    }, [enhancedSetState, state]);

    return enhancedSetState;
}

export default useStateWithCallback;
