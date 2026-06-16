import {useCallback, useRef, useState} from 'react';
import TransitionTracker from '@libs/Navigation/TransitionTracker';

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

                // Defer one event loop tick before checking transitions.
                // This mirrors InteractionManager.runAfterInteractions semantics:
                // by the next macrotask, React will have committed the navigation
                // state change (useLayoutEffect → TransitionTracker.startTransition),
                // so runAfterTransitions will correctly wait for active transitions.
                // Without navigation, no transitions are active and the callback
                // fires immediately in that same tick (~0-16ms total delay).
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
                }, 0);
            },
        [],
    );

    return {isExecuting, singleExecution};
}
