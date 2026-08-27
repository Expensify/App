import runAfterPredictedTransition from '@libs/Navigation/runAfterPredictedTransition';
import type {CancelHandle} from '@libs/Navigation/TransitionTracker';

import {useCallback, useEffect, useRef, useState} from 'react';

type Action<T extends unknown[]> = (...params: T) => void | Promise<void>;

/**
 * With any action passed in, it will only allow 1 such action to occur at a time.
 */
export default function useSingleExecution() {
    const [isExecuting, setIsExecuting] = useState(false);
    const isExecutingRef = useRef<boolean | undefined>(undefined);
    const transitionHandleRef = useRef<CancelHandle | null>(null);

    isExecutingRef.current = isExecuting;

    useEffect(
        () => () => {
            transitionHandleRef.current?.cancel();
        },
        [],
    );

    const singleExecution = useCallback(
        <T extends unknown[]>(action: Action<T>) =>
            (...params: T) => {
                if (isExecutingRef.current) {
                    return;
                }

                setIsExecuting(true);
                isExecutingRef.current = true;

                const execution = action(...params);
                // Re-enables the button once the predicted (or actual) transition triggered by this press
                // ends - or immediately, if the press wasn't predicted to cause one.
                transitionHandleRef.current = runAfterPredictedTransition(() => {
                    if (!(execution instanceof Promise)) {
                        setIsExecuting(false);
                        return;
                    }
                    execution.finally(() => {
                        setIsExecuting(false);
                    });
                });
            },
        [],
    );

    return {isExecuting, singleExecution};
}
