import type {AnyStateNode} from 'xstate';

type SettleableLeafState = {description: string};

function getSettleableLeafStates(node: AnyStateNode): SettleableLeafState[] {
    const children = Object.values(node.states);
    if (children.length > 0) {
        return children.flatMap(getSettleableLeafStates);
    }
    // A leaf with an `always` transition is treated as a transient router that leaves on entry and never
    // settles. This assumes the machine convention that `always` on a leaf is unconditional (the current
    // `preparing` router is). A GUARDED `always` that can fail to fire would settle and should count as a
    // leaf; revisit this (and cover parent-level `always`) before adding conditional routers.
    if ((node.always?.length ?? 0) > 0) {
        return [];
    }
    // The dot-path description doubles as a state-value key: `matchesState` splits it on `.` before comparing.
    return [{description: node.path.join('.')}];
}

export default getSettleableLeafStates;
export type {SettleableLeafState};
