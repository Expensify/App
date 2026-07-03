import type {SnapshotFrom} from 'xstate';
import {matchesState} from 'xstate';
import type {StatePath} from 'xstate/graph';
import {getShortestPaths, TestModel} from 'xstate/graph';
import mfaMachine from '@components/MultifactorAuthentication/machine/mfaMachine';
import type {MfaEvent} from '@components/MultifactorAuthentication/machine/types';
import CONST from '@src/CONST';
import createInitEvent, {MFA_TEST_PAYLOAD} from './flowFixtures';

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
    // The payload flow keeps its payload in the context until `closed` wipes it, so the graph treats
    // its `closing` as a different state and no other journey drives MODAL_CLOSED from there.
    {
        description: 'the payload teardown journey ends back in the closed state',
        events: [createInitEvent(MFA_TEST_PAYLOAD), {type: 'CLOSE_MODAL'}, {type: 'MODAL_CLOSED'}],
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

/**
 * Concrete event fixtures for the graph traversal. XState synthesizes a bare event for every type a
 * state declares, but it cannot invent a payload a guard or an assign needs, so every event whose
 * payload matters gets an explicit case here. Types absent from this list stay covered, because
 * `getTraversalEvents` still synthesizes a bare event for them. INIT appears bare and with a payload
 * so the flow with a payload is covered separately.
 */
const MFA_GRAPH_EVENTS: readonly MfaEvent[] = [createInitEvent(), createInitEvent(MFA_TEST_PAYLOAD)];

const DELAYED_EVENT_PREFIX = 'xstate.after';

type MfaSnapshot = SnapshotFrom<typeof mfaMachine>;
type MfaStatePath = StatePath<MfaSnapshot, MfaEvent>;

/**
 * A path is UI-drivable when the walk can produce every step. A delayed transition would need real
 * timers, so a path containing one is not drivable.
 */
function isUiDrivablePath(path: {steps: ReadonlyArray<{event: {type: string}}>}): boolean {
    return path.steps.every((step) => !step.event.type.startsWith(DELAYED_EVENT_PREFIX));
}

/**
 * Supplies traversal events: the `MFA_GRAPH_EVENTS` fixtures for their event types and a synthesized
 * bare event for every other type the state declares. Passing the fixture array to the traversal
 * directly would turn synthesis off, so an event type added to the machine without a fixture would
 * silently drop out of coverage.
 */
function getTraversalEvents(snapshot: MfaSnapshot): MfaEvent[] {
    // `_nodes` is part of the snapshot's public type. XState exports an equivalent helper only as
    // `__unsafe_getAllOwnEventDescriptors`, whose `any[]` return type would weaken the typing, so this
    // reads `_nodes` directly.
    // eslint-disable-next-line no-underscore-dangle
    const declaredEventTypes = [...new Set(snapshot._nodes.flatMap((node) => node.ownEvents))];
    return declaredEventTypes.flatMap((type) => {
        const fixtures = MFA_GRAPH_EVENTS.filter((fixture) => fixture.type === type);
        if (fixtures.length > 0) {
            return fixtures;
        }
        // The synthesized bare event never leaves the graph walk, so it intentionally lacks the
        // payload that the app-level union declares for its type.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        return [{type} as MfaEvent];
    });
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
 * generated paths alone would never drive the teardown. Duplicate paths are retained so every
 * settleable leaf remains a path endpoint. Paths with a delayed step are filtered out because the walk
 * cannot drive a timer, and the reachability guards catch a state that loses every drivable route.
 *
 * `path.test` skips a step whose event has no executor, which keeps framework steps such as
 * `xstate.init` harmless while the executor table still forces an executor for every application event.
 */
function getWalkedPaths() {
    const coveragePaths = mfaTestModel.getPaths(() => getMfaShortestPaths(), {allowDuplicatePaths: true});
    const journeyPaths = getDrivingJourneyPaths().flatMap((journey) => journey.paths);
    return [...coveragePaths, ...journeyPaths].filter(isUiDrivablePath);
}

export default getWalkedPaths;
export {DELAYED_EVENT_PREFIX, getDrivingJourneyPaths, getMfaShortestPaths, getTraversalEvents};
export type {MfaStatePath};
