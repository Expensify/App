import {useLayoutEffect, useRef} from 'react';
// eslint-disable-next-line no-restricted-imports
import {InteractionManager} from 'react-native';
// eslint-disable-next-line no-restricted-imports
import TransitionTracker from '@libs/Navigation/TransitionTracker';
// eslint-disable-next-line no-restricted-imports
import type {TransitionHandle} from '@libs/Navigation/TransitionTracker';

/**
 * Manages TransitionTracker and InteractionManager handle lifecycle directly from
 * component mount/unmount and animation-completion callbacks, bypassing React state.
 *
 * A transition handle is started when the component mounts (entering animation begins)
 * and when the component is about to unmount (exiting animation begins via Reanimated's
 * ghost-node mechanism). The returned `onAnimationComplete` callback ends the handle
 * when the animation finishes.
 *
 * The `endTransition`-before-`startTransition` pattern in `startTransition` makes the
 * hook resilient to React Strict Mode's mount→cleanup→remount double-invoke: handles
 * are always balanced (every start has a matching end before the next start begins).
 */
function useAnimationTransition() {
    const handleRef = useRef<TransitionHandle | null>(null);
    const interactionHandleRef = useRef<number | undefined>(undefined);

    const endTransition = () => {
        if (handleRef.current) {
            TransitionTracker.endTransition(handleRef.current);
            handleRef.current = null;
        }
        if (interactionHandleRef.current !== undefined) {
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            InteractionManager.clearInteractionHandle(interactionHandleRef.current);
            interactionHandleRef.current = undefined;
        }
    };

    const startTransition = () => {
        endTransition();
        handleRef.current = TransitionTracker.startTransition();
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        interactionHandleRef.current = InteractionManager.createInteractionHandle();
    };

    useLayoutEffect(() => {
        startTransition(); // entering animation starts on mount
        return () => {
            startTransition(); // exiting animation starts on React unmount (ghost-node mechanism)
        };
    }, [startTransition]);

    return {onAnimationComplete: endTransition};
}

export default useAnimationTransition;
