import TransitionTracker from '@libs/Navigation/TransitionTracker';

import CONST from '@src/CONST';

import {useCallback, useRef, useState} from 'react';

type Action<T extends unknown[]> = (...params: T) => void | Promise<void>;

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
                if (isExecutingRef.current) {
                    return;
                }

                setIsExecuting(true);
                isExecutingRef.current = true;

                const execution = action(...params);
                setTimeout(() => {
                    TransitionTracker.runAfterTransitions({
                        callback: () => {
                            if (!(execution instanceof Promise)) {
                                setIsExecuting(false);
                                return;
                            }
                            execution.finally(() => {
                                setIsExecuting(false);
                            });
                        },
                    });
                }, CONST.TIMING.SINGLE_EXECUTION_DEBOUNCE_TIME);
            },
        [],
    );

    return {isExecuting, singleExecution};
}
