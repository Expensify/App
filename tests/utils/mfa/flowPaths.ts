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
 * DRIVING_JOURNEYS holds the explicit event sequences that `getWalkedPaths` drives on top of the
 * generated coverage paths. Coverage comes from the graph traversal, not from this list.
 *
 * Every generated oracle in the suite follows the machine under test, so a retargeted transition
 * regenerates matching expectations as long as every state stays reachable. Each journey therefore
 * pins the state it must end in. These endpoints are the only hand-written expectations, and they
 * fail when such a retarget slips through the generated coverage.
 */
const DRIVING_JOURNEYS: DrivingJourney[] = [
    {
        description: 'the teardown journey ends back in the closed state',
        events: [createInitEvent(), {type: 'CLOSE_MODAL'}, {type: 'MODAL_CLOSED'}],
        endState: MFA_STATE.CLOSED,
    },
    // The payload flow keeps its payload in the context until `closed` wipes it, so its `closing` is a
    // distinct vertex whose MODAL_CLOSED edge no other journey drives.
    {
        description: 'the payload teardown journey ends back in the closed state',
        events: [createInitEvent(MFA_TEST_PAYLOAD), {type: 'CLOSE_MODAL'}, {type: 'MODAL_CLOSED'}],
        endState: MFA_STATE.CLOSED,
    },
    // Shortest paths keep one route per vertex and a completed flow returns to the initial vertex, so no
    // generated path ever starts a second flow. This journey is the only coverage that runs flow N+1 over
    // the module-level state the first flow leaves behind, such as the buffered navigation.
    {
        description: 'the re-entry journey starts a second flow after a full teardown',
        events: [createInitEvent(), {type: 'CLOSE_MODAL'}, {type: 'MODAL_CLOSED'}, createInitEvent()],
        endState: `${MFA_STATE.OPEN}.${MFA_STATE.OUTCOME}.${MFA_STATE.SUCCESS}`,
    },
];

/**
 * Concrete event fixtures for graph traversal. XState synthesizes a bare event for every transition a
 * state declares, but it cannot invent a payload a guard or an assign needs, so every event whose payload
 * matters gets an explicit case here. Types absent from this list stay covered by synthesis, which
 * `getTraversalEvents` guarantees.
 *
 * INIT appears twice, once bare and once with a payload, so the two flows occupy distinct context
 * vertices. A machine that stops copying the payload into its context merges those vertices, and the
 * exercised-transitions guard reports the edge that lost its route.
 */
const MFA_GRAPH_EVENTS: readonly MfaEvent[] = [createInitEvent(), createInitEvent(MFA_TEST_PAYLOAD)];

const DELAYED_EVENT_PREFIX = 'xstate.after';

type MfaSnapshot = SnapshotFrom<typeof mfaMachine>;
type MfaStatePath = StatePath<MfaSnapshot, MfaEvent>;

/**
 * A path is UI-drivable when the walk can produce every step; a delayed transition would need real
 * timers.
 */
function isUiDrivablePath(path: {steps: ReadonlyArray<{event: {type: string}}>}): boolean {
    return path.steps.every((step) => !step.event.type.startsWith(DELAYED_EVENT_PREFIX));
}

/**
 * Supplies traversal events: the `MFA_GRAPH_EVENTS` fixtures for their event types and a synthesized bare
 * event for every other type the state declares. Passing the fixture array to the traversal directly
 * would replace synthesis entirely, so an event type added to the machine without a fixture would
 * silently drop out of coverage. This function restores the merge.
 */
function getTraversalEvents(snapshot: MfaSnapshot): MfaEvent[] {
    // `_nodes` is part of the snapshot's public type. XState exports an equivalent helper only as
    // `__unsafe_getAllOwnEventDescriptors`, whose `any[]` return type would weaken this fully typed
    // read, so the local read stays.
    // eslint-disable-next-line no-underscore-dangle
    const declaredEventTypes = [...new Set(snapshot._nodes.flatMap((node) => node.ownEvents))];
    return declaredEventTypes.flatMap((type) => {
        const fixtures = MFA_GRAPH_EVENTS.filter((fixture) => fixture.type === type);
        if (fixtures.length > 0) {
            return fixtures;
        }
        // A synthesized bare event is a traversal-only construct: it intentionally lacks the payload the
        // app-level union declares for its type and never leaves the graph walk.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        return [{type} as MfaEvent];
    });
}

// `createTestModel` rejects the machine's `after` transition, so this uses the constructor directly.
// The custom matcher lets state assertion keys use dot paths such as `open.outcome.success`.
const mfaTestModel = new TestModel(mfaMachine, {
    stateMatcher: (state, stateValue) => matchesState(stateValue, state.value),
});

/** Returns the shortest coverage paths over the chart, shared by the reachability spec and the UI walk. */
function getMfaShortestPaths() {
    return getShortestPaths(mfaMachine, {events: getTraversalEvents});
}

/** Returns each driving journey together with the paths the test model builds from its event sequence. */
function getDrivingJourneyPaths() {
    return DRIVING_JOURNEYS.map((journey) => ({...journey, paths: mfaTestModel.getPathsFromEvents(journey.events)}));
}

/**
 * Returns the shortest coverage paths and the explicit driving journeys, because the shortest path to the
 * initial `closed` state contains no events. Duplicate paths are retained so every settleable leaf remains
 * a path endpoint. Paths with a delayed step are filtered out because the walk cannot drive a timer; the
 * states they visit must stay reachable through some drivable route or the reachability guards fail.
 *
 * `path.test` skips a step whose event has no executor, which keeps framework steps such as `xstate.init`
 * harmless while the executor table still forces an executor for every application event.
 */
function getWalkedPaths() {
    const coveragePaths = mfaTestModel.getPaths(() => getMfaShortestPaths(), {allowDuplicatePaths: true});
    const journeyPaths = getDrivingJourneyPaths().flatMap((journey) => journey.paths);
    return [...coveragePaths, ...journeyPaths].filter(isUiDrivablePath);
}

export default getWalkedPaths;
export {DELAYED_EVENT_PREFIX, getDrivingJourneyPaths, getMfaShortestPaths, getTraversalEvents};
export type {MfaStatePath};
