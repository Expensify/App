import {useEffect, useState} from 'react';
import TransitionTracker from '@libs/Navigation/TransitionTracker';

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
            callback: () => setActive(true),
        });
        return () => handle.cancel();
    }, [ready]);

    return active;
}

export default useRunAfterTransitions;
