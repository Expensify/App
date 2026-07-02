import type {AnyStateNode} from 'xstate';

type SettleableLeafState = {description: string};

// A leaf state is settleable when the UI walk can stop on it and assert. A leaf that auto-advances is not
// settleable, because it only passes through: `always` routes onward unconditionally, and an invoked actor
// routes onward through its `onDone`/`onError`. Neither can end a walk, so both are excluded here.
function getSettleableLeafStates(node: AnyStateNode): SettleableLeafState[] {
    const children = Object.values(node.states);
    if (children.length > 0) {
        return children.flatMap(getSettleableLeafStates);
    }
    const autoAdvances = (node.always?.length ?? 0) > 0 || (node.invoke?.length ?? 0) > 0;
    if (autoAdvances) {
        return [];
    }
    // The dot-path description doubles as a state-value key: `matchesState` splits it on `.` before comparing.
    return [{description: node.path.join('.')}];
}

export default getSettleableLeafStates;
export type {SettleableLeafState};
