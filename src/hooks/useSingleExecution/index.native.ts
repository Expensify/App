import TransitionTracker from '@libs/Navigation/TransitionTracker';

import {useCallback, useRef, useState} from 'react';

type Action<T extends unknown[]> = (...params: T) => void | Promise<void>;

/**
 * `action()` may itself kick off a navigation/modal transition, but TransitionTracker won't have
 * registered it yet in this same tick. This delay is a guess at how long that registration takes,
 * so `isExecuting` isn't cleared before the transition it triggered has actually started.
 */
const TRANSITION_START_GUARD_DELAY_MS = 500;

/**
 * With any action passed in, it will only allow 1 such action to occur at a time.
 */
export default function useSingleExecution() {
    const [isExecuting, setIsExecuting] = useState(false);
    const isExecutingRef = useRef<boolean | undefined>(undefined);

    isExecutingRef.current = isExecuting;

    const singleExecution = useCallback(
        <T extends unknown[]>(action: Action<T>) =>
            (...params: T) => {
                if (isExecutingRef.current || TransitionTracker.hasActiveTransitions()) {
                    return;
                }

                setIsExecuting(true);
                isExecutingRef.current = true;

                const execution = action(...params);
                setTimeout(() => {
                    if (!(execution instanceof Promise)) {
                        setIsExecuting(false);
                        return;
                    }
                    execution.finally(() => {
                        setIsExecuting(false);
                    });
                }, TRANSITION_START_GUARD_DELAY_MS);
            },
        [],
    );

    return {isExecuting, singleExecution};
}
