import {adjacencyMapToArray, getAdjacencyMap, serializeSnapshot} from 'xstate/graph';
import mfaMachine from '@components/MultifactorAuthentication/machine/mfaMachine';
import type {MfaStatePath} from './flowPaths';
import {DELAYED_EVENT_PREFIX, getTraversalEvents} from './flowPaths';

// This module measures transition coverage: which transitions the walk is expected to drive and which
// ones a set of walked paths actually drove. `flowPaths` builds the paths the walk executes, while this
// module only compares them against the machine's adjacency map.

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
            description: `${JSON.stringify(edge.state.value)} --${edge.event.type}--> ${JSON.stringify(edge.nextState.value)}`,
        }));
}

/** Returns the (source vertex, event) pairs a set of walked paths drives. */
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

export {getExercisedTransitionKeys, getUiDrivableTransitions};
export type {UiDrivableTransition};
