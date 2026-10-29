import TransitionTracker from '@libs/Navigation/TransitionTracker';

import {useEffect, useRef, useState} from 'react';

/**
 * Controls Activity visibility for a focus-driven subtree: hides immediately when `isActive` becomes false,
 * but waits for the navigation transition to finish before showing again when `isActive` becomes true.
 * When the component first mounts already active, shows immediately without waiting. A ref seeded with
 * `isActive` skips transition scheduling on that mount; `visible` alone would not, and `true` would break
 * inactive-then-active deferral.
 *
 * Differs from `useIsFocusedUntilTransitionEnd` + `useRunAfterTransitions` (see `DeferredSearchAutocompleteList`):
 * those hooks defer unmounting on blur and defer the first mount behind a skeleton, while this hook keeps the
 * subtree mounted and toggles Activity mode - hiding immediately on blur, showing only after the transition on
 * refocus, and skipping the entry defer on the initial mount when already active.
 */
function useDeferVisibleUntilFocusTransitionEnd(isActive: boolean): boolean {
    const [visible, setVisible] = useState(isActive);
    const [wasActive, setWasActive] = useState(isActive);
    const skipDeferOnFirstActiveEffectRef = useRef(isActive);

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

        if (skipDeferOnFirstActiveEffectRef.current) {
            skipDeferOnFirstActiveEffectRef.current = false;
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
