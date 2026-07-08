import type {AnyStateNode} from 'xstate';

type LeafState = {description: string};

function getLeafNodes(node: AnyStateNode): AnyStateNode[] {
    const children = Object.values(node.states);
    if (children.length > 0) {
        return children.flatMap(getLeafNodes);
    }
    return [node];
}

function hasUnguardedAlways(node: AnyStateNode): boolean {
    return node.always?.some((transition) => transition.guard === undefined) ?? false;
}

// The dot-path description doubles as a state-value key: `matchesState` splits it on `.` before comparing.
function toLeafState(node: AnyStateNode): LeafState {
    return {description: node.path.join('.')};
}

/**
 * Returns leaf states that can exist as snapshots after an XState macrostep. An unguarded `always`
 * transition is resolved in the same macrostep that enters the state, so graph paths cannot observe
 * that leaf. A guarded `always` may keep the machine in place, so it remains part of machine
 * reachability.
 */
function getStableLeafStates(node: AnyStateNode): LeafState[] {
    return getLeafNodes(node)
        .filter((leaf) => !hasUnguardedAlways(leaf))
        .map(toLeafState);
}

/**
 * Returns the stable leaf states that the UI walk can also stop on and assert. This is separate from
 * `getStableLeafStates` so the UI contract can diverge when the machine adds a leaf type the real UI
 * walk cannot settle on.
 */
function getSettleableLeafStates(node: AnyStateNode): LeafState[] {
    return getLeafNodes(node)
        .filter((leaf) => !hasUnguardedAlways(leaf))
        .map(toLeafState);
}

export {getStableLeafStates, getSettleableLeafStates};
