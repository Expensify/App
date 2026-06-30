import mfaMachine from '@components/MultifactorAuthentication/machine/mfaMachine';
import type {MfaEvent} from '@components/MultifactorAuthentication/machine/types';

import {createLocalMFAError} from '@libs/MultifactorAuthentication/shared/MFAResult';

import CONST from '@src/CONST';

import type {SnapshotFrom} from 'xstate';

import {matchesState} from 'xstate';
import {getShortestPaths, TestModel} from 'xstate/graph';

import createInitEvent from './flowFixtures';

const MFA_STATE = CONST.MULTIFACTOR_AUTHENTICATION.MFA_STATE;

type DrivingJourney = {
    /** Names the journey in test titles. */
    description: string;
    /** The event sequence the walk drives, in order. */
    events: MfaEvent[];
    /** Dot-path state value the journey must end in, compared with `matchesState`. */
    endState: string;
};

/**
 * The explicit event sequences that `getWalkedPaths` drives on top of the generated coverage paths.
 * They cover what the generated paths cannot, such as the teardown back to `closed` and a second
 * flow, and each journey pins the state it must end in.
 *
 * Every other expectation is generated from the machine itself, so when a transition points at the
 * wrong target, the generated expectations adjust and still pass. The hand-written `endState` is the
 * only check that can catch that, and only for transitions the journeys drive.
 */
const DRIVING_JOURNEYS: DrivingJourney[] = [
    {
        description: 'the teardown journey ends back in the closed state',
        events: [createInitEvent(), {type: 'CLOSE_MODAL'}, {type: 'MODAL_CLOSED'}],
        endState: MFA_STATE.CLOSED,
    },
    // A completed flow returns to the initial state, so no generated path ever starts a second flow.
    // Only this journey runs a second flow over the module-level state the first one leaves behind,
    // such as the buffered navigation. The graph simulation does not settle invoked actors, so the
    // second INIT pins the device-check state that a freshly started flow waits in.
    {
        description: 'the re-entry journey starts a second flow after a full teardown',
        events: [createInitEvent(), {type: 'CLOSE_MODAL'}, {type: 'MODAL_CLOSED'}, createInitEvent()],
        endState: `${MFA_STATE.OPEN}.${MFA_STATE.PREPARING}.${MFA_STATE.VALIDATING_DEVICE}`,
    },
];

type MfaEventFixtures = {
    readonly [Type in MfaEvent['type']]: readonly [Extract<MfaEvent, {type: Type}>, ...Array<Extract<MfaEvent, {type: Type}>>];
};

/**
 * Concrete graph-traversal fixtures for every application event. The exhaustive keyed type makes a
 * new event fail compilation until its real fixture is added instead of letting XState substitute
 * `{type}` and potentially bypass event-dependent behavior.
 */
const MFA_GRAPH_EVENT_FIXTURES = {
    INIT: [createInitEvent()],
    // The UI cannot produce SET_ERROR directly, so this fixture only serves machine-level traversal
    // and `getWalkedPaths` filters out the paths that need it.
    SET_ERROR: [{type: 'SET_ERROR', error: createLocalMFAError(CONST.MULTIFACTOR_AUTHENTICATION.REASON.LOCAL_ERRORS.UNHANDLED_EXCEPTION, 'Graph-traversal fixture error')}],
    CLOSE_MODAL: [{type: 'CLOSE_MODAL'}],
    MODAL_CLOSED: [{type: 'MODAL_CLOSED'}],
} satisfies MfaEventFixtures;

function hasMfaEventFixtures(type: string): type is MfaEvent['type'] {
    return Object.hasOwn(MFA_GRAPH_EVENT_FIXTURES, type);
}

const INIT_STEP_EVENT_TYPE = 'xstate.init';
const DELAYED_EVENT_PREFIX = 'xstate.after';
const ACTOR_DONE_EVENT_PREFIX = 'xstate.done.actor.';
const ACTOR_ERROR_EVENT_PREFIX = 'xstate.error.actor.';
const UI_UNPRODUCIBLE_EVENT_TYPES = new Set<string>(['SET_ERROR']);

type ActorOutcome = 'resolve' | 'reject';
type PathSteps = ReadonlyArray<{event: {type: string}}>;

type MfaSnapshot = SnapshotFrom<typeof mfaMachine>;

function isAutoDrivenEvent(eventType: string): boolean {
    return eventType === INIT_STEP_EVENT_TYPE || eventType.startsWith(ACTOR_DONE_EVENT_PREFIX) || eventType.startsWith(ACTOR_ERROR_EVENT_PREFIX);
}

/**
 * Derives the outcome each invoked actor must produce from the graph path. This keeps the walk generic:
 * adding another actor only requires a corresponding mock implementation.
 */
function getActorOutcomes(steps: PathSteps): Record<string, ActorOutcome> {
    const outcomes: Record<string, ActorOutcome> = {};
    for (const step of steps) {
        const {type} = step.event;
        if (type.startsWith(ACTOR_DONE_EVENT_PREFIX)) {
            outcomes[type.slice(ACTOR_DONE_EVENT_PREFIX.length)] = 'resolve';
        } else if (type.startsWith(ACTOR_ERROR_EVENT_PREFIX)) {
            outcomes[type.slice(ACTOR_ERROR_EVENT_PREFIX.length)] = 'reject';
        }
    }
    return outcomes;
}

/**
 * A path is UI-drivable when the walk can produce every step. A delayed transition would need real
 * timers and a standalone SET_ERROR has no UI gesture, so a path containing either is not drivable.
 * Actor completion events are auto-driven by promise settlement and stay in the path so their
 * expected outcomes can configure the actor mocks.
 */
function isUiDrivablePath(path: {steps: PathSteps}): boolean {
    return path.steps.every((step) => !step.event.type.startsWith(DELAYED_EVENT_PREFIX) && !UI_UNPRODUCIBLE_EVENT_TYPES.has(step.event.type));
}

/**
 * Supplies explicit fixtures for application events declared by the current state. A custom `events`
 * function replaces XState's default traversal events entirely, so this also mirrors the default bare
 * `{type}` synthesis for the framework event descriptors (delayed transitions and actor completion)
 * that the machine's transitions depend on.
 */
function getTraversalEvents(snapshot: MfaSnapshot): MfaEvent[] {
    // `_nodes` is part of the snapshot's public type. XState exports an equivalent helper only as
    // `__unsafe_getAllOwnEventDescriptors`, whose `any[]` return type would weaken the typing, so this
    // reads `_nodes` directly.
    // eslint-disable-next-line no-underscore-dangle
    const declaredEventTypes: string[] = [...new Set(snapshot._nodes.flatMap((node) => node.ownEvents))];
    const events: MfaEvent[] = [];
    for (const type of declaredEventTypes) {
        if (hasMfaEventFixtures(type)) {
            events.push(...MFA_GRAPH_EVENT_FIXTURES[type]);
            continue;
        }
        if (!type.startsWith('xstate.')) {
            throw new Error(`Missing MFA graph event fixture for application event "${type}"`);
        }
        // XState types `events` as the machine's event union, which cannot name framework events, so
        // this widens the synthesized event exactly like XState's own default traversal does.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        events.push({type} as MfaEvent);
    }
    return events;
}

// `createTestModel` rejects the machine's `after` transition, so this uses the constructor directly.
// The custom matcher lets state assertion keys use dot paths such as `open.outcome.success`.
const mfaTestModel = new TestModel(mfaMachine, {
    stateMatcher: (state, stateValue) => matchesState(stateValue, state.value),
});

/** Returns the shortest coverage paths over the machine graph. */
function getMfaShortestPaths() {
    return getShortestPaths(mfaMachine, {events: getTraversalEvents});
}

/** Returns each driving journey together with the paths the test model builds from its event sequence. */
function getDrivingJourneyPaths() {
    return DRIVING_JOURNEYS.map((journey) => ({...journey, paths: mfaTestModel.getPathsFromEvents(journey.events)}));
}

/**
 * Returns the generated coverage paths plus the explicit driving journeys. The journeys are needed
 * because a shortest path can be empty, such as the path to the initial `closed` state, so the
 * generated paths alone would never drive the teardown. Paths with a delayed step or a standalone
 * `SET_ERROR` are filtered out because the UI walk cannot drive them; the failure state remains
 * covered through the device-check actor's error path. `everyStateReachable.test.ts` checks
 * stable-state reachability over the unfiltered graph, while the walk-coverage guard in
 * `viewMatchesMachine.test.tsx` catches a state that loses every UI-drivable route.
 *
 * `path.test` skips a step whose event has no executor, which keeps framework steps such as
 * `xstate.init` and actor completion harmless while the executor table still forces an executor for
 * every user-driven event.
 */
function getWalkedPaths() {
    const coveragePaths = mfaTestModel.getPaths(() => getMfaShortestPaths());
    const journeyPaths = getDrivingJourneyPaths().flatMap((journey) => journey.paths);
    return [...coveragePaths, ...journeyPaths].filter(isUiDrivablePath);
}

export default getWalkedPaths;
export {getDrivingJourneyPaths, getMfaShortestPaths, getActorOutcomes, isAutoDrivenEvent};
export type {ActorOutcome};
