import {startTransition, useEffect, useState} from 'react';
import type {ReactNode} from 'react';
import TransitionTracker from '@libs/Navigation/TransitionTracker';

type NavigationDeferredMountProps = {
    /** Shown until `children` hydrate. Render something cheap with stable sizing to avoid layout jumps. */
    placeholder?: ReactNode;

    /** The tree to defer. Mounted as a non-urgent transition after the in-flight (or upcoming) navigation transition ends. */
    children: ReactNode;
};

/**
 * Gates a heavy subtree behind navigation transition completion via `TransitionTracker`, so the tree
 * hydrates only after the nav animation has finished. The swap is wrapped in `startTransition` so React
 * treats the hydrate as non-urgent and can yield to user input.
 *
 * Use it for: heavy subtrees that mount as part of a navigation transition (report headers, page-level
 * actions, dropdowns rendered on a freshly navigated screen) where the hydrate risks competing with the
 * nav animation frame budget.
 *
 * Do NOT use it for: subtrees that mount in response to user interaction after navigation has settled
 * (modals, accordions, popovers opened on tap). If no transition is in flight or upcoming, this component
 * waits for the `MAX_TRANSITION_START_WAIT_MS` safety timeout before hydrating, which adds latency with
 * no benefit outside navigation contexts.
 */
function NavigationDeferredMount({placeholder = null, children}: NavigationDeferredMountProps): ReactNode {
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const handle = TransitionTracker.runAfterTransitions({
            waitForUpcomingTransition: true,
            callback: () => startTransition(() => setIsReady(true)),
        });
        return () => handle.cancel();
    }, []);

    return isReady ? children : placeholder;
}

export default NavigationDeferredMount;
export type {NavigationDeferredMountProps};
