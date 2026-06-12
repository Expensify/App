import type {InspectionEvent, Observer} from 'xstate';

/**
 * Wraps the inspector's observer to hold back each `@xstate.actor` registration until that actor
 * shows life (any later inspection event for its session).
 *
 * Why: `useMachine` calls `createActor` during render (inside a `useState` initializer) and XState
 * announces the actor to inspectors in the Actor constructor - before `start()`. Whenever React
 * throws a render pass away and redoes it (concurrent restarts, Strict Mode, machine hot reloads),
 * the discarded pass leaves a "ghost" actor that is registered but never started, which the Stately
 * UI then shows forever stuck in its initial state with no events. A registration that never
 * activates is never forwarded, so ghosts stay out of the inspector; real actors emit their init
 * snapshot immediately on start, so their registration is flushed - in order - right away.
 */
function filterGhostActorRegistrations(target: Observer<InspectionEvent>): Observer<InspectionEvent> {
    const pendingRegistrations = new Map<string, InspectionEvent>();

    const flushRegistration = (sessionId: string | undefined) => {
        if (sessionId === undefined) {
            return;
        }
        const registration = pendingRegistrations.get(sessionId);
        if (!registration) {
            return;
        }
        pendingRegistrations.delete(sessionId);
        target.next?.(registration);
    };

    return {
        next: (event) => {
            if (event.type === '@xstate.actor') {
                pendingRegistrations.set(event.actorRef.sessionId, event);
                return;
            }
            flushRegistration(event.actorRef.sessionId);
            if (event.type === '@xstate.event') {
                // An actor can send before its own first snapshot is emitted (e.g. from an entry
                // action while starting); flush the sender too so the UI knows the source lane.
                flushRegistration(event.sourceRef?.sessionId);
            }
            target.next?.(event);
        },
        error: (err) => target.error?.(err),
        complete: () => target.complete?.(),
    };
}

// eslint-disable-next-line import/prefer-default-export
export {filterGhostActorRegistrations};
