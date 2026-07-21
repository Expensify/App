import TransitionTracker from '@libs/Navigation/TransitionTracker';

import {useEffect, useRef, useState} from 'react';

/**
 * Controls Activity visibility for a focus-driven subtree: hides immediately when `isActive` becomes false,
 * but waits for the navigation transition to finish before showing again when `isActive` becomes true.
 * When the component first mounts already active, shows immediately without waiting.
 */
function useDeferVisibleUntilFocusTransitionEnd(isActive: boolean): boolean {
    const [isDeferredVisible, setIsDeferredVisible] = useState(isActive);
    const isFirstRenderRef = useRef(true);

    // Hide immediately when becoming inactive (adjust state during render).
    const [prevIsActive, setPrevIsActive] = useState(isActive);
    if (isActive !== prevIsActive) {
        setPrevIsActive(isActive);
        if (!isActive) {
            setIsDeferredVisible(false);
        }
    }

    useEffect(() => {
        if (!isActive) {
            return;
        }

        if (isFirstRenderRef.current) {
            isFirstRenderRef.current = false;
            return;
        }

        const handle = TransitionTracker.runAfterTransitions({
            callback: () => setIsDeferredVisible(true),
            waitForUpcomingTransition: true,
        });
        return () => handle.cancel();
    }, [isActive]);

    return isActive ? isDeferredVisible : false;
}

export default useDeferVisibleUntilFocusTransitionEnd;
