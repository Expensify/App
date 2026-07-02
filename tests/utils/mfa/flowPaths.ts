import type {SnapshotFrom} from 'xstate';
import {matchesState} from 'xstate';
import type {StatePath} from 'xstate/graph';
import {adjacencyMapToArray, getAdjacencyMap, getShortestPaths, serializeSnapshot, TestModel} from 'xstate/graph';
import mfaMachine from '@components/MultifactorAuthentication/machine/mfaMachine';
import type {MfaEvent} from '@components/MultifactorAuthentication/machine/types';
import createInitEvent from './flowFixtures';

// This list adds the explicit teardown path and is not the coverage source.
// `INIT` carries the scenario payload, while `CLOSE_MODAL` and `MODAL_CLOSED` are bare.
const DRIVING_EVENTS: MfaEvent[] = [createInitEvent(), {type: 'CLOSE_MODAL'}, {type: 'MODAL_CLOSED'}];

/**
 * Concrete event fixtures for graph traversal. XState synthesizes a bare event for every transition a
 * state declares, but it cannot invent a payload a guard or an assign needs, so every event whose payload
 * matters gets an explicit case here. Types absent from this list stay covered by synthesis, which
 * `getTraversalEvents` guarantees.
 */
const MFA_GRAPH_EVENTS: readonly MfaEvent[] = [createInitEvent()];

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
    // `_nodes` is part of the snapshot's public type; XState does not export a helper that lists a
    // snapshot's own event descriptors.
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

/**
 * Returns the shortest coverage paths and the explicit teardown path, because the shortest path to the
 * initial `closed` state contains no events. Duplicate paths are retained so every settleable leaf remains
 * a path endpoint. Paths with a delayed step are filtered out because the walk cannot drive a timer; the
 * states they visit must stay reachable through some drivable route or the reachability guards fail.
 *
 * `path.test` skips a step whose event has no executor, which keeps framework steps such as `xstate.init`
 * harmless while the executor table still forces an executor for every application event.
 */
function getWalkedPaths() {
    return [...mfaTestModel.getPaths(() => getMfaShortestPaths(), {allowDuplicatePaths: true}), ...mfaTestModel.getPathsFromEvents(DRIVING_EVENTS)].filter(isUiDrivablePath);
}

type UiDrivableTransition = {
    key: string;
    description: string;
};

function getTransitionKey(sourceVertex: string, event: unknown): string {
    return `${sourceVertex} | ${JSON.stringify(event)}`;
}

/**
 * Returns every transition the walk is expected to drive: one entry per (source vertex, event) pair from
 * the full adjacency map. Delayed transitions and no-op edges that land back in the identical vertex are
 * excluded because the walk cannot observe them.
 */
function getUiDrivableTransitions(): UiDrivableTransition[] {
    const edges = adjacencyMapToArray(getAdjacencyMap(mfaMachine, {events: getTraversalEvents}));
    return edges
        .filter((edge) => serializeSnapshot(edge.nextState) !== serializeSnapshot(edge.state))
        .filter((edge) => !edge.event.type.startsWith(DELAYED_EVENT_PREFIX))
        .map((edge) => ({
            key: getTransitionKey(serializeSnapshot(edge.state), edge.event),
            description: `${JSON.stringify(edge.state.value)} --${edge.event.type}--> ${JSON.stringify(edge.nextState.value)}`,
        }));
}

/**
 * Returns the (source vertex, event) pairs a set of walked paths drives. A step holds the state its event
 * produced, so the source of step `i` is the state of step `i - 1`.
 */
function getExercisedTransitionKeys(paths: ReadonlyArray<Pick<MfaStatePath, 'steps'>>): Set<string> {
    const keys = new Set<string>();
    for (const path of paths) {
        for (let i = 1; i < path.steps.length; i++) {
            const source = path.steps.at(i - 1);
            const step = path.steps.at(i);
            if (!source || !step) {
                continue;
            }
            keys.add(getTransitionKey(serializeSnapshot(source.state), step.event));
        }
    }
    return keys;
}

export default getWalkedPaths;
export {getExercisedTransitionKeys, getMfaShortestPaths, getUiDrivableTransitions};
