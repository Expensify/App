import type {InspectionEvent, Observer} from 'xstate';

/**
 * Wraps the inspector's observer so that each `@xstate.actor` registration is held back until a
 * later inspection event arrives for the same session, which keeps "ghost" actors out of the
 * inspector.
 *
 * A ghost appears because `useMachine` calls `createActor` during render, and XState announces the
 * actor to inspectors in the Actor constructor, before `start()` runs. Whenever React discards a
 * render pass and runs it again, for example under Strict Mode or a machine hot reload, the
 * discarded pass leaves an actor that was registered but never started. The Stately UI would
 * otherwise show that actor forever, stuck in its initial state. Because a registration that never
 * receives a later event is never forwarded, those ghosts stay hidden, while a real actor emits its
 * first snapshot on start and therefore has its registration forwarded immediately and in order.
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
                // An actor can send an event before its own first snapshot is emitted, for example
                // from an entry action that runs while it is starting. We therefore flush the sender
                // as well, so the inspector can attribute the event to the correct actor.
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
