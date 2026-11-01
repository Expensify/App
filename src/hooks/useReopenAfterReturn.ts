import TransitionTracker from '@libs/Navigation/TransitionTracker';

import {useFocusEffect, useIsFocused} from '@react-navigation/native';
import {useEffect, useRef} from 'react';

/** Idle until `setIsDeparting(true)` (departing), away once the screen blurs, returned when it is focused again, then idle once `onReturn` ran or the return was dropped. */
type ReturnStep = 'idle' | 'departing' | 'away' | 'returned';

type UseReopenAfterReturnParams = {
    /** Runs once the screen is focused again and the transition back to it has finished */
    onReturn: () => void;

    /** Drops the pending return, e.g. the user came back without what `onReturn` needs */
    shouldCancel?: boolean;

    /** While false, the return stays pending until this flips or the screen is left again */
    canReopen?: boolean;
};

/**
 * Runs `onReturn` when the user comes back to this screen after leaving it through `setIsDeparting(true)`. Scoped to that
 * one departure: leaving the screen again after coming back drops it, so a later unrelated focus never triggers it.
 */
function useReopenAfterReturn({onReturn, shouldCancel = false, canReopen = true}: UseReopenAfterReturnParams) {
    const isFocused = useIsFocused();
    const stepRef = useRef<ReturnStep>('idle');

    useEffect(() => {
        if (isFocused) {
            return;
        }
        if (stepRef.current === 'departing') {
            stepRef.current = 'away';
        } else if (stepRef.current === 'returned') {
            stepRef.current = 'idle';
        }
    }, [isFocused]);

    useFocusEffect(() => {
        if (stepRef.current === 'away') {
            stepRef.current = 'returned';
        }
        if (stepRef.current !== 'returned') {
            return;
        }
        if (shouldCancel) {
            stepRef.current = 'idle';
            return;
        }
        if (!canReopen) {
            return;
        }

        const handle = TransitionTracker.runAfterTransitions({
            callback: () => {
                stepRef.current = 'idle';
                onReturn();
            },
            waitForUpcomingTransition: 'navigation',
        });
        return () => handle.cancel();
    });

    const setIsDeparting = (isDeparting: boolean) => {
        stepRef.current = isDeparting ? 'departing' : 'idle';
    };

    return {setIsDeparting};
}

export default useReopenAfterReturn;
export type {UseReopenAfterReturnParams};
