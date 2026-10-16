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
    const executionGenerationRef = useRef(0);

    isExecutingRef.current = isExecuting;

    useEffect(
        () => () => {
            transitionHandleRef.current?.cancel();
            transitionHandleRef.current = null;
            executionGenerationRef.current += 1;
            isExecutingRef.current = false;
            setIsExecuting(false);
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

                const executionGeneration = executionGenerationRef.current;
                const execution = action(...params);
                // Re-enables the button once the predicted (or actual) transition triggered by this press
                // ends - or immediately, if the press wasn't predicted to cause one.
                transitionHandleRef.current = runAfterPredictedTransition(() => {
                    const releaseIfCurrent = () => {
                        if (executionGenerationRef.current !== executionGeneration) {
                            return;
                        }

                        isExecutingRef.current = false;
                        setIsExecuting(false);
                    };

                    if (!(execution instanceof Promise)) {
                        releaseIfCurrent();
                        return;
                    }

                    execution.finally(() => {
                        releaseIfCurrent();
                    });
                });
            },
        [],
    );

    return {isExecuting, singleExecution};
}
