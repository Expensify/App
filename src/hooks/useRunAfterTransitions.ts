import TransitionTracker from '@libs/Navigation/TransitionTracker';

import {useEffect, useState} from 'react';

/**
 * Defers `active` from `false` to `true` until after navigation transitions finish, once `ready` becomes true.
 * Unlike `startTransition`/`useDeferredValue`, the update runs as a plain, synchronous render that can't be
 * interrupted and redone by a competing update.
 */
function useRunAfterTransitions(ready: boolean): boolean {
    const [active, setActive] = useState(false);

    useEffect(() => {
        if (!ready) {
            return;
        }
        const handle = TransitionTracker.runAfterTransitions({
            // The mount effect runs before the nav animation's `transitionStart` fires, so without waiting
            // for the upcoming navigation transition the callback would run synchronously right here
            // (no transitions are active yet) and the deferral would be a no-op. If no navigation
            // transition starts (e.g. remount without navigating), the tracker's start-wait timeout
            // fires the callback anyway.
            waitForUpcomingTransition: 'navigation',
            callback: () => setActive(true),
        });
        return () => handle.cancel();
    }, [ready]);

    return active;
}

export default useRunAfterTransitions;
