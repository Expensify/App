import {adjacencyMapToArray, getAdjacencyMap, serializeSnapshot} from 'xstate/graph';
import mfaMachine from '@components/MultifactorAuthentication/machine/mfaMachine';
import {describeTraversalEvent} from './flowFixtures';
import type {MfaStatePath} from './flowPaths';
import {DELAYED_EVENT_PREFIX, getTraversalEvents} from './flowPaths';

// This module measures transition coverage: which transitions the walk is expected to drive, which ones a
// set of walked paths actually drove, and where the INIT edges land. `flowPaths` builds the paths the walk
// executes; this module only compares them against the machine's adjacency map.

type UiDrivableTransition = {
    key: string;
    description: string;
};

function getTransitionKey(sourceVertex: string, event: unknown): string {
    return `${sourceVertex} | ${JSON.stringify(event)}`;
}

/**
 * Returns the adjacency-map edges that leave their source vertex. No-op edges that land back in the
 * identical vertex are excluded because the walk cannot observe them.
 */
function getStateChangingEdges() {
    const edges = adjacencyMapToArray(getAdjacencyMap(mfaMachine, {events: getTraversalEvents}));
    return edges.filter((edge) => serializeSnapshot(edge.nextState) !== serializeSnapshot(edge.state));
}

/**
 * Returns every transition the walk is expected to drive: one entry per (source vertex, event) pair among
 * the state-changing edges. Delayed transitions are excluded because the walk cannot drive a timer.
 */
function getUiDrivableTransitions(): UiDrivableTransition[] {
    return getStateChangingEdges()
        .filter((edge) => !edge.event.type.startsWith(DELAYED_EVENT_PREFIX))
        .map((edge) => ({
            key: getTransitionKey(serializeSnapshot(edge.state), edge.event),
            description: `${JSON.stringify(edge.state.value)} --${describeTraversalEvent(edge.event)}--> ${JSON.stringify(edge.nextState.value)}`,
        }));
}

/**
 * Returns the state-changing INIT edges as (serialized event, serialized landing vertex) pairs. The
 * payload fixture is meant to give the payload flow its own context vertices, and the guard built on these
 * pairs fails when the machine stops copying the payload and the landings merge.
 */
function getInitEdgeLandings(): Array<{eventKey: string; landingKey: string}> {
    return getStateChangingEdges()
        .filter((edge) => edge.event.type === 'INIT')
        .map((edge) => ({eventKey: JSON.stringify(edge.event), landingKey: serializeSnapshot(edge.nextState)}));
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

export {getExercisedTransitionKeys, getInitEdgeLandings, getUiDrivableTransitions};
export type {UiDrivableTransition};
