import TransitionTracker from '@libs/Navigation/TransitionTracker';

import {useEffect, useRef, useState} from 'react';

/**
 * Controls Activity visibility for a focus-driven subtree: hides immediately when `isActive` becomes false,
 * but waits for the navigation transition to finish before showing again when `isActive` becomes true.
 * When the component first mounts already active, shows immediately without waiting.
 */
function useDeferVisibleUntilFocusTransitionEnd(isActive: boolean): boolean {
    const [isVisible, setIsVisible] = useState(isActive);
    const skipDeferOnFirstActiveRef = useRef(isActive);

    useEffect(() => {
        if (!isActive) {
            setIsVisible(false);
            return;
        }

        if (skipDeferOnFirstActiveRef.current) {
            skipDeferOnFirstActiveRef.current = false;
            setIsVisible(true);
            return;
        }

        const handle = TransitionTracker.runAfterTransitions({
            callback: () => setIsVisible(true),
            waitForUpcomingTransition: true,
        });
        return () => handle.cancel();
    }, [isActive]);

    return isVisible;
}

export default useDeferVisibleUntilFocusTransitionEnd;
