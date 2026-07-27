import type createActors from '@components/MultifactorAuthentication/machine/mfaActors';
import mfaMachine from '@components/MultifactorAuthentication/machine/mfaMachine';
import type {MfaEvent} from '@components/MultifactorAuthentication/machine/types';

import {createLocalMFAError} from '@libs/MultifactorAuthentication/shared/MFAResult';

import CONST from '@src/CONST';

import type {OutputFrom, SnapshotFrom} from 'xstate';

import {matchesState} from 'xstate';
import {getShortestPaths, TestModel} from 'xstate/graph';

import createInitEvent, {MFA_TEST_FATAL_REGISTRATION_CHALLENGE_ERROR, MFA_TEST_INVALID_CODE_ERROR, MFA_TEST_REGISTRATION_CHALLENGE, MFA_TEST_VALIDATE_CODE} from './flowFixtures';

const MFA_STATE = CONST.MULTIFACTOR_AUTHENTICATION.MFA_STATE;

const DELAYED_EVENT_PREFIX = 'xstate.after';
const ACTOR_DONE_EVENT_PREFIX = 'xstate.done.actor.';
const ACTOR_ERROR_EVENT_PREFIX = 'xstate.error.actor.';
const VALIDATE_DEVICE_DONE_EVENT_TYPE = `${ACTOR_DONE_EVENT_PREFIX}validateDevice`;
const VALIDATE_DEVICE_ERROR_EVENT_TYPE = `${ACTOR_ERROR_EVENT_PREFIX}validateDevice`;
const READ_HAS_ACCEPTED_SOFT_PROMPT_DONE_EVENT_TYPE = `${ACTOR_DONE_EVENT_PREFIX}readHasAcceptedSoftPrompt`;
const READ_HAS_ACCEPTED_SOFT_PROMPT_ERROR_EVENT_TYPE = `${ACTOR_ERROR_EVENT_PREFIX}readHasAcceptedSoftPrompt`;
const CHECK_LOCAL_CREDENTIALS_DONE_EVENT_TYPE = `${ACTOR_DONE_EVENT_PREFIX}checkLocalCredentials`;
const CHECK_LOCAL_CREDENTIALS_ERROR_EVENT_TYPE = `${ACTOR_ERROR_EVENT_PREFIX}checkLocalCredentials`;
const REQUEST_REGISTRATION_CHALLENGE_DONE_EVENT_TYPE = `${ACTOR_DONE_EVENT_PREFIX}requestRegistrationChallenge`;
const REQUEST_REGISTRATION_CHALLENGE_ERROR_EVENT_TYPE = `${ACTOR_ERROR_EVENT_PREFIX}requestRegistrationChallenge`;

/**
 * Framework actor events are not part of the application's event union, but TestModel accepts them
 * in explicit journeys and forwards their output to the invoked actor transition.
 */
function createActorDoneEvent(type: string, output: unknown): MfaEvent {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    return {type, output} as MfaEvent;
}

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
    // A resend is a self-transition, and a self-transition never lies on a shortest path, so only
    // this journey drives the resend gesture through the real UI.
    {
        description: 'the resend journey requests a fresh code and still accepts the emailed code',
        events: [
            createInitEvent(),
            createActorDoneEvent(VALIDATE_DEVICE_DONE_EVENT_TYPE, {success: true}),
            createActorDoneEvent(CHECK_LOCAL_CREDENTIALS_DONE_EVENT_TYPE, false),
            {type: 'RESEND_VALIDATE_CODE'},
            {type: 'VALIDATE_CODE_ENTERED', validateCode: MFA_TEST_VALIDATE_CODE},
            createActorDoneEvent(REQUEST_REGISTRATION_CHALLENGE_DONE_EVENT_TYPE, {success: true, challenge: MFA_TEST_REGISTRATION_CHALLENGE}),
        ],
        endState: `${MFA_STATE.OPEN}.${MFA_STATE.PREPARING}.${MFA_STATE.CHECKING_SOFT_PROMPT_ACCEPTANCE}`,
    },
    {
        description: 'the invalid-code journey clears the inline error and accepts a corrected code',
        events: [
            createInitEvent(),
            createActorDoneEvent(VALIDATE_DEVICE_DONE_EVENT_TYPE, {success: true}),
            createActorDoneEvent(CHECK_LOCAL_CREDENTIALS_DONE_EVENT_TYPE, false),
            {type: 'VALIDATE_CODE_ENTERED', validateCode: MFA_TEST_VALIDATE_CODE},
            createActorDoneEvent(REQUEST_REGISTRATION_CHALLENGE_DONE_EVENT_TYPE, {success: false, error: MFA_TEST_INVALID_CODE_ERROR}),
            {type: 'CLEAR_CONTINUABLE_ERROR'},
            {type: 'VALIDATE_CODE_ENTERED', validateCode: MFA_TEST_VALIDATE_CODE},
            createActorDoneEvent(REQUEST_REGISTRATION_CHALLENGE_DONE_EVENT_TYPE, {success: true, challenge: MFA_TEST_REGISTRATION_CHALLENGE}),
        ],
        endState: `${MFA_STATE.OPEN}.${MFA_STATE.PREPARING}.${MFA_STATE.CHECKING_SOFT_PROMPT_ACCEPTANCE}`,
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
    CLOSE_MODAL: [{type: 'CLOSE_MODAL'}],
    MODAL_CLOSED: [{type: 'MODAL_CLOSED'}],
    SOFT_PROMPT_APPROVED: [{type: 'SOFT_PROMPT_APPROVED'}],
    VALIDATE_CODE_ENTERED: [{type: 'VALIDATE_CODE_ENTERED', validateCode: MFA_TEST_VALIDATE_CODE}],
    RESEND_VALIDATE_CODE: [{type: 'RESEND_VALIDATE_CODE'}],
    CLEAR_CONTINUABLE_ERROR: [{type: 'CLEAR_CONTINUABLE_ERROR'}],
} satisfies MfaEventFixtures;

function hasMfaEventFixtures(type: string): type is MfaEvent['type'] {
    return Object.hasOwn(MFA_GRAPH_EVENT_FIXTURES, type);
}

type MfaActors = ReturnType<typeof createActors>;

type MfaActorDoneOutputFixtures = {
    readonly [Id in keyof MfaActors]: readonly [OutputFrom<MfaActors[Id]>, ...Array<OutputFrom<MfaActors[Id]>>];
};

/**
 * Holds the output variants for each invoked actor's done event, keyed by invoke id. The machine
 * routes a done event through guards on the actor's output, so the traversal must offer every output
 * shape a branch depends on. XState's bare `{type}` synthesis would make those guards read an
 * undefined output. The exhaustive keyed type makes a new actor fail compilation until its output
 * variants are added.
 */
const MFA_ACTOR_DONE_OUTPUT_FIXTURES = {
    // The refusal variants mirror the actor's gates. Each reason maps to its own failure screen, so
    // every variant needs a graph branch for the walk to reach that screen.
    validateDevice: [
        {success: true},
        {success: false, error: createLocalMFAError(CONST.MULTIFACTOR_AUTHENTICATION.REASON.LOCAL_ERRORS.AUTHENTICATION_TYPE_NOT_SUPPORTED, 'Graph-traversal device-check refusal')},
        {
            success: false,
            error: createLocalMFAError(CONST.MULTIFACTOR_AUTHENTICATION.REASON.LOCAL_ERRORS.NO_AUTHENTICATION_METHODS_ENROLLED, 'Graph-traversal device-check enrollment refusal'),
        },
    ],
    readHasAcceptedSoftPrompt: [false, true],
    checkLocalCredentials: [false, true],
    requestRegistrationChallenge: [
        {success: true, challenge: MFA_TEST_REGISTRATION_CHALLENGE},
        {success: false, error: MFA_TEST_INVALID_CODE_ERROR},
        {success: false, error: MFA_TEST_FATAL_REGISTRATION_CHALLENGE_ERROR},
    ],
} satisfies MfaActorDoneOutputFixtures;

function hasActorDoneOutputFixtures(actorId: string): actorId is keyof typeof MFA_ACTOR_DONE_OUTPUT_FIXTURES {
    return Object.hasOwn(MFA_ACTOR_DONE_OUTPUT_FIXTURES, actorId);
}

type PathSteps = ReadonlyArray<{event: {type: string}}>;

type MfaSnapshot = SnapshotFrom<typeof mfaMachine>;

/**
 * Tells whether this event happens without a user gesture. Every event that XState synthesizes,
 * such as actor completion or a delayed transition firing, carries the `xstate.` prefix, and none
 * of them corresponds to a gesture, so the prefix check matches exactly the framework events.
 */
function isAutoDrivenEvent(eventType: string): boolean {
    return eventType.startsWith('xstate.');
}

/**
 * A path is UI-drivable when the walk can produce every step. A delayed transition would need real
 * timers, so a path containing one is not drivable. Actor completion events stay in the path so their
 * executors can settle the controlled actor mocks at the correct transition.
 */
function isUiDrivablePath(path: {steps: PathSteps}): boolean {
    return path.steps.every((step) => !step.event.type.startsWith(DELAYED_EVENT_PREFIX));
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
        if (type.startsWith(ACTOR_DONE_EVENT_PREFIX)) {
            const actorId = type.slice(ACTOR_DONE_EVENT_PREFIX.length);
            if (!hasActorDoneOutputFixtures(actorId)) {
                throw new Error(`Missing MFA actor done-output fixtures for invoked actor "${actorId}"`);
            }
            // XState types `events` as the machine's event union, which cannot name framework events, so
            // this widens the synthesized done events.
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
            events.push(...MFA_ACTOR_DONE_OUTPUT_FIXTURES[actorId].map((output) => ({type, output}) as MfaEvent));
            continue;
        }
        // This widens the remaining framework events for the same reason as the done events above.
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
 * Returns the generated coverage paths plus the explicit driving journeys, keeping only UI-drivable
 * paths. The journeys are needed because a shortest path can be empty, such as the path to the
 * initial `closed` state, so the generated paths alone would never drive the teardown.
 * `everyStateReachable.test.ts` checks stable-state reachability over the unfiltered graph, while
 * the walk-coverage guard in `viewMatchesMachine.test.tsx` catches a state that loses every
 * UI-drivable route. `path.test` skips framework steps without an executor, such as `xstate.init`.
 */
function getWalkedPaths() {
    const coveragePaths = mfaTestModel.getPaths(() => getMfaShortestPaths());
    const journeyPaths = getDrivingJourneyPaths().flatMap((journey) => journey.paths);
    return [...coveragePaths, ...journeyPaths].filter(isUiDrivablePath);
}

export default getWalkedPaths;
export {
    CHECK_LOCAL_CREDENTIALS_DONE_EVENT_TYPE,
    CHECK_LOCAL_CREDENTIALS_ERROR_EVENT_TYPE,
    getDrivingJourneyPaths,
    getMfaShortestPaths,
    isAutoDrivenEvent,
    READ_HAS_ACCEPTED_SOFT_PROMPT_DONE_EVENT_TYPE,
    READ_HAS_ACCEPTED_SOFT_PROMPT_ERROR_EVENT_TYPE,
    REQUEST_REGISTRATION_CHALLENGE_DONE_EVENT_TYPE,
    REQUEST_REGISTRATION_CHALLENGE_ERROR_EVENT_TYPE,
    VALIDATE_DEVICE_DONE_EVENT_TYPE,
    VALIDATE_DEVICE_ERROR_EVENT_TYPE,
};
