import TransitionTracker from '@libs/Navigation/TransitionTracker';

import {useEffect, useState} from 'react';

/**
 * Controls Activity visibility for a focus-driven subtree: hides immediately when `isActive` becomes false,
 * but waits for the navigation transition to finish before showing again when `isActive` becomes true.
 * When the component first mounts already active, shows immediately without waiting.
 */
function useDeferVisibleUntilFocusTransitionEnd(isActive: boolean): boolean {
    const [visible, setVisible] = useState(isActive);
    const [wasActive, setWasActive] = useState(isActive);

    if (isActive !== wasActive) {
        setWasActive(isActive);
        if (!isActive) {
            setVisible(false);
        }
    }
    useEffect(() => {
        if (!isActive) {
            return;
        }
        const handle = TransitionTracker.runAfterTransitions({
            callback: () => setVisible(true),
            waitForUpcomingTransition: true,
        });
        return () => handle.cancel();
    }, [isActive]);
    return isActive && visible;
}

export default useDeferVisibleUntilFocusTransitionEnd;
