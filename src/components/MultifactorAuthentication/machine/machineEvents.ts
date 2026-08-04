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
 * Everything the machine receives at runtime. The machine declares only `MfaEvent` so that
 * production code cannot send the events XState raises itself, such as a fabricated actor result.
 * The test harness drives them explicitly through the widened view in `tests/utils/mfa/flowPaths.ts`.
 */
type MfaMachineEvent = MfaEvent | MfaActorDoneEvent | MfaActorErrorEvent | MfaInternalEvent;

export type {MfaActorDoneEvent, MfaActorErrorEvent, MfaActorId, MfaActorOutput, MfaInternalEvent, MfaMachineEvent};
