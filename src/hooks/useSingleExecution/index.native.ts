import TransitionTracker from '@libs/Navigation/TransitionTracker';
import type {CancelHandle} from '@libs/Navigation/TransitionTracker';

import CONST from '@src/CONST';

import {useCallback, useEffect, useRef, useState} from 'react';

type Action<T extends unknown[]> = (...params: T) => void | Promise<void>;

/**
 * With any action passed in, it will only allow 1 such action to occur at a time.
 */
export default function useSingleExecution() {
    const [isExecuting, setIsExecuting] = useState(false);
    const isExecutingRef = useRef<boolean | undefined>(undefined);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const transitionHandleRef = useRef<CancelHandle | null>(null);

    isExecutingRef.current = isExecuting;

    useEffect(
        () => () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
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
                // The timeout is a minimum debounce applied to every press; checking TransitionTracker afterwards
                // is an extra safety net in case a transition is still in progress once the debounce ends.
                timeoutRef.current = setTimeout(() => {
                    transitionHandleRef.current = TransitionTracker.runAfterTransitions({
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
