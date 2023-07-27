import _ from 'underscore';
import {useEffect, useRef, useCallback} from 'react';

export default function useThrottledEffect(effect, rateLimit, dependencies) {
    const callback = useRef(effect);
    callback.current = effect;

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const throttledEffect = useCallback(
        _.throttle(() => {
            if (!_.isFunction(effect.current)) {
                return;
            }
            return effect.current();
        }, rateLimit),
        [rateLimit],
    );

    useEffect(throttledEffect, [throttledEffect, ...dependencies]);
}
