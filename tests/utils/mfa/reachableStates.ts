import type {AnyStateNode} from 'xstate';

type SettleableLeafState = {description: string};

function getSettleableLeafStates(node: AnyStateNode): SettleableLeafState[] {
    const children = Object.values(node.states);
    if (children.length > 0) {
        return children.flatMap(getSettleableLeafStates);
    }
    // This machine uses leaf-level `always` transitions only as unconditional routers, so those leaves cannot
    // settle. Revisit this rule before adding guarded or parent-level `always` transitions.
    if ((node.always?.length ?? 0) > 0) {
        return [];
    }
    // The dot-path description doubles as a state-value key: `matchesState` splits it on `.` before comparing.
    return [{description: node.path.join('.')}];
}

export default getSettleableLeafStates;
export type {SettleableLeafState};
