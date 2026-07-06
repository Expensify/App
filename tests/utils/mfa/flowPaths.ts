import type {SnapshotFrom} from 'xstate';
import {matchesState} from 'xstate';
import {getShortestPaths, TestModel} from 'xstate/graph';
import mfaMachine from '@components/MultifactorAuthentication/machine/mfaMachine';
import type {MfaEvent} from '@components/MultifactorAuthentication/machine/types';
import CONST from '@src/CONST';
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
    // such as the buffered navigation.
    {
        description: 'the re-entry journey starts a second flow after a full teardown',
        events: [createInitEvent(), {type: 'CLOSE_MODAL'}, {type: 'MODAL_CLOSED'}, createInitEvent()],
        endState: `${MFA_STATE.OPEN}.${MFA_STATE.OUTCOME}.${MFA_STATE.SUCCESS}`,
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
} satisfies MfaEventFixtures;

function hasMfaEventFixtures(type: string): type is MfaEvent['type'] {
    return Object.hasOwn(MFA_GRAPH_EVENT_FIXTURES, type);
}

const DELAYED_EVENT_PREFIX = 'xstate.after';

type MfaSnapshot = SnapshotFrom<typeof mfaMachine>;

/**
 * A path is UI-drivable when the walk can produce every step. A delayed transition would need real
 * timers, so a path containing one is not drivable.
 */
function isUiDrivablePath(path: {steps: ReadonlyArray<{event: {type: string}}>}): boolean {
    return path.steps.every((step) => !step.event.type.startsWith(DELAYED_EVENT_PREFIX));
}

/**
 * Supplies explicit fixtures for application events declared by the current state. XState receives
 * no fixture for its internal event descriptors (for example delayed transitions), so its graph
 * traversal synthesizes those framework events itself.
 */
function getTraversalEvents(snapshot: MfaSnapshot): MfaEvent[] {
    // `_nodes` is part of the snapshot's public type. XState exports an equivalent helper only as
    // `__unsafe_getAllOwnEventDescriptors`, whose `any[]` return type would weaken the typing, so this
    // reads `_nodes` directly.
    // eslint-disable-next-line no-underscore-dangle
    const declaredEventTypes = [...new Set(snapshot._nodes.flatMap((node) => node.ownEvents))];
    const events: MfaEvent[] = [];
    for (const type of declaredEventTypes) {
        if (hasMfaEventFixtures(type)) {
            events.push(...MFA_GRAPH_EVENT_FIXTURES[type]);
            continue;
        }
        if (!type.startsWith('xstate.')) {
            throw new Error(`Missing MFA graph event fixture for application event "${type}"`);
        }
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
 * generated paths alone would never drive the teardown. Paths with a delayed step are filtered out
 * because the UI walk cannot drive a timer. `everyStateReachable.test.ts` checks stable-state
 * reachability over the unfiltered graph, while the walk-coverage guard in
 * `viewMatchesMachine.test.tsx` catches a state that loses every UI-drivable route.
 *
 * `path.test` skips a step whose event has no executor, which keeps framework steps such as
 * `xstate.init` harmless while the executor table still forces an executor for every application event.
 */
function getWalkedPaths() {
    const coveragePaths = mfaTestModel.getPaths(() => getMfaShortestPaths());
    const journeyPaths = getDrivingJourneyPaths().flatMap((journey) => journey.paths);
    return [...coveragePaths, ...journeyPaths].filter(isUiDrivablePath);
}

export default getWalkedPaths;
export {getDrivingJourneyPaths, getMfaShortestPaths};
