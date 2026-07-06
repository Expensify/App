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

function hasRoutingInvoke(node: AnyStateNode): boolean {
    return node.invoke.some((definition) => definition.onDone !== undefined || definition.onError !== undefined);
}

// The dot-path description doubles as a state-value key: `matchesState` splits it on `.` before comparing.
function toLeafState(node: AnyStateNode): LeafState {
    return {description: node.path.join('.')};
}

/**
 * Returns leaf states that can exist as snapshots after an XState macrostep. An unguarded `always`
 * transition is resolved in the same macrostep that enters the state, so graph paths cannot observe
 * that leaf. A guarded `always` may keep the machine in place, and an invoked actor completes through
 * a later event, so both remain part of machine reachability.
 */
function getStableLeafStates(node: AnyStateNode): LeafState[] {
    return getLeafNodes(node)
        .filter((leaf) => !hasUnguardedAlways(leaf))
        .map(toLeafState);
}

/**
 * Returns the stable leaf states that the UI walk can also stop on and assert. An invoked actor
 * counts as auto-advancing once it registers `onDone` or `onError`, which is true for an actor that
 * completes immediately (the mocked promise actors this harness expects) but not for one that stays
 * pending. Revisit this predicate when the first real invoke state is added to the machine.
 */
function getSettleableLeafStates(node: AnyStateNode): LeafState[] {
    return getLeafNodes(node)
        .filter((leaf) => !hasUnguardedAlways(leaf) && !hasRoutingInvoke(leaf))
        .map(toLeafState);
}

export {getStableLeafStates, getSettleableLeafStates};
