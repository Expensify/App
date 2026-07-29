import type {DoneActorEvent, ErrorActorEvent, OutputFrom} from 'xstate';

import type createActors from './mfaActors';
import type {MfaEvent} from './types';

type MfaActors = ReturnType<typeof createActors>;
type MfaActorId = keyof MfaActors;
type MfaActorOutput<Id extends MfaActorId> = OutputFrom<MfaActors[Id]>;

/** The event XState raises when an invoked actor resolves, carrying that actor's own output type. */
type MfaActorDoneEvent<Id extends MfaActorId = MfaActorId> = Id extends MfaActorId ? DoneActorEvent<MfaActorOutput<Id>, Id> : never;

/** The event XState raises when an invoked actor rejects. */
type MfaActorErrorEvent<Id extends MfaActorId = MfaActorId> = Id extends MfaActorId ? ErrorActorEvent<unknown, Id> : never;

/** The events XState raises on its own without a payload, which are the initial event and the delayed-transition timers. */
type MfaInternalEvent = {type: 'xstate.init'} | {type: `xstate.after${string}`};

/**
 * Everything the machine receives. XState leaves its own events out of a declared event union, which
 * is enough for the machine itself because `invoke` types its `onDone` and `onError` transitions from
 * the actor. The graph traversal has to drive those events explicitly, so declaring them here keeps
 * its fixtures assignable without an assertion.
 */
type MfaMachineEvent = MfaEvent | MfaActorDoneEvent | MfaActorErrorEvent | MfaInternalEvent;

export type {MfaActorDoneEvent, MfaActorErrorEvent, MfaActorId, MfaActorOutput, MfaInternalEvent, MfaMachineEvent};
