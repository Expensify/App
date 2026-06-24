import type {InspectionEvent, Observer} from 'xstate';

/**
 * Holds back each `@xstate.actor` registration until a later inspection event arrives for the same
 * session, which keeps "ghost" actors out of the inspector.
 *
 * A ghost appears because `useMachine` calls `createActor` during render, which registers the actor
 * with the inspector immediately. A render that React discards, under Strict Mode or a hot reload,
 * leaves an actor that was registered but never started, which the Stately UI would otherwise show
 * forever. A real actor is started and emits follow-up events that flush its held-back registration,
 * while a ghost is never started, emits nothing more, and stays hidden.
 *
 * This filter is a workaround for an upstream limitation tracked at https://github.com/statelyai/inspect/issues/58.
 *
 * @param downstreamObserver Receives the forwarded inspection events. It is the Stately inspector's `inspect` observer from `createBrowserInspector().inspect`.
 */
function filterGhostActorRegistrations(downstreamObserver: Observer<InspectionEvent>): Observer<InspectionEvent> {
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
        downstreamObserver.next?.(registration);
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
            downstreamObserver.next?.(event);
        },
        error: (err) => downstreamObserver.error?.(err),
        complete: () => downstreamObserver.complete?.(),
    };
}

export default filterGhostActorRegistrations;
