import {startTransition, useEffect, useRef, useState} from 'react';
import type {ReactNode} from 'react';
import TransitionTracker from '@libs/Navigation/TransitionTracker';

type NavigationDeferredMountProps = {
    /** Shown until `children` hydrate. Render something cheap with stable sizing to avoid layout jumps. */
    placeholder?: ReactNode;

    /** The tree to defer. Mounted as a non-urgent transition after any active navigation transition ends. */
    children: ReactNode;

    /**
     * If true, additionally waits for the next navigation transition to start (and then complete) before mounting.
     * This is the natural mode for screens reached via real navigation (push/replace) — the placeholder stays
     * up through the full animation. Default: true.
     *
     * Pass `false` when the consumer can be remounted by a parent without a navigation transition firing
     * (e.g. a parent that uses `key={someParam}` and changes the key via `setParams`). In that case, the
     * upcoming transition never starts and the safety timeout would make the placeholder visible (and
     * unresponsive) for up to `MAX_TRANSITION_START_WAIT_MS`.
     */
    waitForUpcomingTransition?: boolean;
};

/**
 * Gates a heavy subtree behind navigation transition completion via `TransitionTracker`, so the tree
 * hydrates only after any in-flight nav animation has finished. The swap is wrapped in `startTransition`
 * so React treats the hydrate as non-urgent and can yield to user input.
 *
 * Use it for: heavy subtrees that mount as part of a navigation transition (report headers, page-level
 * actions, dropdowns rendered on a freshly navigated screen) where the hydrate risks competing with the
 * nav animation frame budget.
 */
function NavigationDeferredMount({placeholder = null, children, waitForUpcomingTransition = true}: NavigationDeferredMountProps): ReactNode {
    const [isReady, setIsReady] = useState(false);
    // One-shot mount-time config — flipping the prop after mount shouldn't retrigger the wait.
    const waitForUpcomingTransitionRef = useRef(waitForUpcomingTransition);

    useEffect(() => {
        const handle = TransitionTracker.runAfterTransitions({
            waitForUpcomingTransition: waitForUpcomingTransitionRef.current,
            callback: () => startTransition(() => setIsReady(true)),
        });
        return () => handle.cancel();
    }, []);

    return isReady ? children : placeholder;
}

export default NavigationDeferredMount;
export type {NavigationDeferredMountProps};
