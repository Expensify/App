import type {MfaActorId, MfaActorOutput, MfaInternalEvent, MfaMachineEvent} from '@components/MultifactorAuthentication/machine/machineEvents';
import mfaMachine from '@components/MultifactorAuthentication/machine/mfaMachine';
import type {MfaEvent} from '@components/MultifactorAuthentication/machine/types';

import {createLocalMFAError} from '@libs/MultifactorAuthentication/shared/MFAResult';

import CONST from '@src/CONST';

import type {ActorLogic, DoneActorEvent, ErrorActorEvent, InputFrom, SnapshotFrom} from 'xstate';

import {matchesState} from 'xstate';
import {getShortestPaths, TestModel} from 'xstate/graph';

import createInitEvent, {
    MFA_TEST_AUTH_METHOD,
    MFA_TEST_AUTHORIZATION_ORDINARY_ERROR,
    MFA_TEST_CREDENTIAL_CREATION_ERROR,
    MFA_TEST_FATAL_REGISTRATION_CHALLENGE_ERROR,
    MFA_TEST_INVALID_CODE_ERROR,
    MFA_TEST_REGISTRATION_CHALLENGE,
    MFA_TEST_SCENARIO_RESPONSE,
    MFA_TEST_VALIDATE_CODE,
} from './flowFixtures';

const MFA_STATE = CONST.MULTIFACTOR_AUTHENTICATION.MFA_STATE;

const FRAMEWORK_EVENT_PREFIX = 'xstate.';
const DELAYED_EVENT_PREFIX = `${FRAMEWORK_EVENT_PREFIX}after`;

/** Names the event XState raises when the given actor resolves. */
function actorDoneEventType<Id extends MfaActorId>(actorId: Id) {
    return `xstate.done.actor.${actorId}` as const;
}

/** Names the event XState raises when the given actor rejects. */
function actorErrorEventType<Id extends MfaActorId>(actorId: Id) {
    return `xstate.error.actor.${actorId}` as const;
}

/**
 * Builds the completion event of one invoked actor, keeping its event type tied to that actor's output.
 */
function createActorDoneEvent<Id extends MfaActorId>(actorId: Id, output: NoInfer<MfaActorOutput<Id>>): DoneActorEvent<MfaActorOutput<Id>, Id> {
    return {type: actorDoneEventType(actorId), output, actorId};
}

/** Everything XState raises for one invoked actor, which is a done event per output plus its rejection. */
type MfaActorEvent<Id extends MfaActorId> = DoneActorEvent<MfaActorOutput<Id>, Id> | ErrorActorEvent<unknown, Id>;

/**
 * Builds every traversal event of one invoked actor. The non-empty return type carries the "at least
 * one output variant" guarantee of the parameter list through to the fixture table.
 */
function createActorEvents<Id extends MfaActorId>(
    actorId: Id,
    ...outputs: [NoInfer<MfaActorOutput<Id>>, ...Array<NoInfer<MfaActorOutput<Id>>>]
): [MfaActorEvent<Id>, ...Array<MfaActorEvent<Id>>] {
    const [firstOutput, ...otherOutputs] = outputs;
    return [
        createActorDoneEvent(actorId, firstOutput),
        ...otherOutputs.map((output) => createActorDoneEvent(actorId, output)),
        {type: actorErrorEventType(actorId), actorId, error: new Error(`Graph-traversal rejection for actor "${actorId}"`)},
    ];
}

type DrivingJourney = {
    /** Names the journey in test titles. */
    description: string;
    /** The event sequence the walk drives, in order. */
    events: MfaMachineEvent[];
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
            createActorDoneEvent('validateDevice', {success: true}),
            createActorDoneEvent('loadRegistrationState', {hasLocalCredentials: false, hasEverAcceptedSoftPrompt: false}),
            {type: 'RESEND_VALIDATE_CODE'},
            {type: 'VALIDATE_CODE_ENTERED', validateCode: MFA_TEST_VALIDATE_CODE},
            createActorDoneEvent('requestRegistrationChallenge', {success: true, challenge: MFA_TEST_REGISTRATION_CHALLENGE}),
        ],
        endState: `${MFA_STATE.OPEN}.${MFA_STATE.PROMPT}.${MFA_STATE.AWAITING_SOFT_PROMPT}`,
    },
    {
        description: 'the invalid-code journey clears the inline error and accepts a corrected code',
        events: [
            createInitEvent(),
            createActorDoneEvent('validateDevice', {success: true}),
            createActorDoneEvent('loadRegistrationState', {hasLocalCredentials: false, hasEverAcceptedSoftPrompt: false}),
            {type: 'VALIDATE_CODE_ENTERED', validateCode: MFA_TEST_VALIDATE_CODE},
            createActorDoneEvent('requestRegistrationChallenge', {success: false, error: MFA_TEST_INVALID_CODE_ERROR}),
            {type: 'VALIDATE_CODE_CHANGED'},
            {type: 'VALIDATE_CODE_ENTERED', validateCode: MFA_TEST_VALIDATE_CODE},
            createActorDoneEvent('requestRegistrationChallenge', {success: true, challenge: MFA_TEST_REGISTRATION_CHALLENGE}),
        ],
        endState: `${MFA_STATE.OPEN}.${MFA_STATE.PROMPT}.${MFA_STATE.AWAITING_SOFT_PROMPT}`,
    },
    {
        description: 'the credential-creation journey reaches creatingCredential after the user accepts the soft prompt',
        events: [
            createInitEvent(),
            createActorDoneEvent('validateDevice', {success: true}),
            createActorDoneEvent('loadRegistrationState', {hasLocalCredentials: false, hasEverAcceptedSoftPrompt: false}),
            {type: 'VALIDATE_CODE_ENTERED', validateCode: MFA_TEST_VALIDATE_CODE},
            createActorDoneEvent('requestRegistrationChallenge', {success: true, challenge: MFA_TEST_REGISTRATION_CHALLENGE}),
            {type: 'SOFT_PROMPT_APPROVED'},
        ],
        endState: `${MFA_STATE.OPEN}.${MFA_STATE.PROMPT}.${MFA_STATE.CREATING_CREDENTIAL}`,
    },
    // A (re-)registration always requires approval, even if the account accepted the soft prompt
    // before - the persisted flag only matters on the returning-user branch below.
    {
        description: 'the registration journey still requires soft-prompt approval even though the account already accepted it before',
        events: [
            createInitEvent(),
            createActorDoneEvent('validateDevice', {success: true}),
            createActorDoneEvent('loadRegistrationState', {hasLocalCredentials: false, hasEverAcceptedSoftPrompt: true}),
            {type: 'VALIDATE_CODE_ENTERED', validateCode: MFA_TEST_VALIDATE_CODE},
            createActorDoneEvent('requestRegistrationChallenge', {success: true, challenge: MFA_TEST_REGISTRATION_CHALLENGE}),
        ],
        endState: `${MFA_STATE.OPEN}.${MFA_STATE.PROMPT}.${MFA_STATE.AWAITING_SOFT_PROMPT}`,
    },
    // A returning user who already accepted the soft prompt skips the soft prompt entirely and lands
    // directly on authorization instead of re-confirming.
    {
        description: 'the returning-user journey skips the soft prompt when the account already accepted it on this device',
        events: [
            createInitEvent(),
            createActorDoneEvent('validateDevice', {success: true}),
            createActorDoneEvent('loadRegistrationState', {hasLocalCredentials: true, hasEverAcceptedSoftPrompt: true}),
        ],
        endState: `${MFA_STATE.OPEN}.${MFA_STATE.PROMPT}.${MFA_STATE.AUTHORIZING}`,
    },
    // A fresh registration continues straight into authorization once the credential is created,
    // rather than stopping at the outcome.
    {
        description: 'the registration journey reaches the success outcome after authorization',
        events: [
            createInitEvent(),
            createActorDoneEvent('validateDevice', {success: true}),
            createActorDoneEvent('loadRegistrationState', {hasLocalCredentials: false, hasEverAcceptedSoftPrompt: false}),
            {type: 'VALIDATE_CODE_ENTERED', validateCode: MFA_TEST_VALIDATE_CODE},
            createActorDoneEvent('requestRegistrationChallenge', {success: true, challenge: MFA_TEST_REGISTRATION_CHALLENGE}),
            {type: 'SOFT_PROMPT_APPROVED'},
            createActorDoneEvent('createCredential', {success: true}),
            createActorDoneEvent('authorize', {success: true, scenarioResponse: MFA_TEST_SCENARIO_RESPONSE, authenticationMethod: MFA_TEST_AUTH_METHOD}),
        ],
        endState: `${MFA_STATE.OPEN}.${MFA_STATE.OUTCOME}.${MFA_STATE.SUCCESS}`,
    },
    // A returning user who skipped the soft prompt still authorizes before reaching the outcome.
    {
        description: 'the returning-user journey reaches the success outcome after authorization',
        events: [
            createInitEvent(),
            createActorDoneEvent('validateDevice', {success: true}),
            createActorDoneEvent('loadRegistrationState', {hasLocalCredentials: true, hasEverAcceptedSoftPrompt: true}),
            createActorDoneEvent('authorize', {success: true, scenarioResponse: MFA_TEST_SCENARIO_RESPONSE, authenticationMethod: MFA_TEST_AUTH_METHOD}),
        ],
        endState: `${MFA_STATE.OPEN}.${MFA_STATE.OUTCOME}.${MFA_STATE.SUCCESS}`,
    },
];

type MfaEventFixtures = {
    readonly [Type in MfaEvent['type']]: readonly [Extract<MfaEvent, {type: Type}>, ...Array<Extract<MfaEvent, {type: Type}>>];
};

/** Pins each slot to the events of that one actor, so a fixture cannot drift to another actor's key. */
type MfaActorEventFixtures = {
    readonly [Id in MfaActorId]: readonly [MfaActorEvent<Id>, ...Array<MfaActorEvent<Id>>];
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
    VALIDATE_CODE_CHANGED: [{type: 'VALIDATE_CODE_CHANGED'}],
} satisfies MfaEventFixtures;

/**
 * Holds the traversal events of every invoked actor. The machine routes done events through guards
 * on the actor's output, so the traversal must offer every output shape a branch depends on. XState's
 * bare `{type}` synthesis would make those guards read an undefined output. The exhaustive keyed type
 * makes a new actor fail compilation until its variants are added.
 */
const MFA_ACTOR_EVENT_FIXTURES = {
    // The refusal variants mirror the actor's gates. Each reason maps to its own failure screen, so
    // every variant needs a graph branch for the walk to reach that screen.
    validateDevice: createActorEvents(
        'validateDevice',
        {success: true},
        {success: false, error: createLocalMFAError(CONST.MULTIFACTOR_AUTHENTICATION.REASON.LOCAL_ERRORS.AUTHENTICATION_TYPE_NOT_SUPPORTED, 'Graph-traversal device-check refusal')},
        {
            success: false,
            error: createLocalMFAError(CONST.MULTIFACTOR_AUTHENTICATION.REASON.LOCAL_ERRORS.NO_AUTHENTICATION_METHODS_ENROLLED, 'Graph-traversal device-check enrollment refusal'),
        },
    ),
    loadRegistrationState: createActorEvents(
        'loadRegistrationState',
        {hasLocalCredentials: false, hasEverAcceptedSoftPrompt: false},
        {hasLocalCredentials: false, hasEverAcceptedSoftPrompt: true},
        {hasLocalCredentials: true, hasEverAcceptedSoftPrompt: false},
        {hasLocalCredentials: true, hasEverAcceptedSoftPrompt: true},
    ),
    requestRegistrationChallenge: createActorEvents(
        'requestRegistrationChallenge',
        {success: true, challenge: MFA_TEST_REGISTRATION_CHALLENGE},
        {success: false, error: MFA_TEST_INVALID_CODE_ERROR},
        {success: false, error: MFA_TEST_FATAL_REGISTRATION_CHALLENGE_ERROR},
    ),
    createCredential: createActorEvents('createCredential', {success: true}, {success: false, error: MFA_TEST_CREDENTIAL_CREATION_ERROR}),
    // Deliberately two variants: every authorization failure reason routes through the same branch and
    // renders the same generic screen, so a third fixture would only multiply walked paths without
    // adding coverage. `authorizationTransition.test.ts` pins the individual reasons by hand instead.
    authorize: createActorEvents(
        'authorize',
        {success: true, scenarioResponse: MFA_TEST_SCENARIO_RESPONSE, authenticationMethod: MFA_TEST_AUTH_METHOD},
        {success: false, error: MFA_TEST_AUTHORIZATION_ORDINARY_ERROR},
    ),
} satisfies MfaActorEventFixtures;

/** Every concrete event the traversal can offer, in the order its fixtures declare them. */
const MFA_TRAVERSAL_EVENT_FIXTURES: readonly MfaMachineEvent[] = [...Object.values(MFA_GRAPH_EVENT_FIXTURES).flat(), ...Object.values(MFA_ACTOR_EVENT_FIXTURES).flat()];

/** Tells whether XState raises this event on its own, in which case its bare `{type}` is the whole event. */
function isMfaInternalEventType(type: string): type is MfaInternalEvent['type'] {
    return type === 'xstate.init' || type.startsWith(DELAYED_EVENT_PREFIX);
}

type PathSteps = ReadonlyArray<{event: {type: string}}>;

type MfaSnapshot = SnapshotFrom<typeof mfaMachine>;

/**
 * Tells whether this event happens without a user gesture. Every event that XState synthesizes,
 * such as actor completion or a delayed transition firing, carries the `xstate.` prefix, and none
 * of them corresponds to a gesture, so the prefix check matches exactly the framework events.
 */
function isAutoDrivenEvent(eventType: string): boolean {
    return eventType.startsWith(FRAMEWORK_EVENT_PREFIX);
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
 * Supplies the fixtures of every event the current state declares. A custom `events` function
 * replaces XState's default traversal events entirely, so the events XState raises on its own are
 * supplied here as well.
 */
function getTraversalEvents(snapshot: MfaSnapshot): MfaMachineEvent[] {
    // `_nodes` is part of the snapshot's public type. XState exports an equivalent helper only as
    // `__unsafe_getAllOwnEventDescriptors`, whose `any[]` return type would weaken the typing, so this
    // reads `_nodes` directly.
    // eslint-disable-next-line no-underscore-dangle
    const declaredEventTypes = new Set<string>(snapshot._nodes.flatMap((node) => node.ownEvents));
    const events: MfaMachineEvent[] = [];
    for (const type of declaredEventTypes) {
        const fixtures = MFA_TRAVERSAL_EVENT_FIXTURES.filter((event) => event.type === type);
        if (fixtures.length > 0) {
            events.push(...fixtures);
            continue;
        }
        if (isMfaInternalEventType(type)) {
            events.push({type});
            continue;
        }
        // A framework event outside `MfaMachineEvent` cannot be given a fixture, so it needs the union
        // widened first rather than a fixture added.
        if (type.startsWith(FRAMEWORK_EVENT_PREFIX)) {
            throw new Error(`Unsupported MFA framework event "${type}". Declare it in MfaMachineEvent before the traversal can drive it.`);
        }
        throw new Error(`Missing MFA graph event fixture for "${type}"`);
    }
    return events;
}

/**
 * The machine re-typed over `MfaMachineEvent`, so the tests can send the events XState raises
 * itself. The assertion is safe because the running machine really handles that union, and it goes
 * through `unknown` because the two unions are not assignable to each other.
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
const mfaMachineWithLifecycleEvents = mfaMachine as unknown as ActorLogic<MfaSnapshot, MfaMachineEvent, InputFrom<typeof mfaMachine>>;

// `createTestModel` rejects the machine's `after` transition, so this uses the constructor directly.
// The custom matcher lets state assertion keys use dot paths such as `open.outcome.success`.
const mfaTestModel = new TestModel(mfaMachineWithLifecycleEvents, {
    stateMatcher: (state, stateValue) => matchesState(stateValue, state.value),
});

/** Returns the shortest coverage paths over the machine graph. */
function getMfaShortestPaths() {
    return getShortestPaths(mfaMachineWithLifecycleEvents, {events: getTraversalEvents});
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
export {actorDoneEventType, actorErrorEventType, createActorDoneEvent, getDrivingJourneyPaths, getMfaShortestPaths, isAutoDrivenEvent, mfaMachineWithLifecycleEvents};
