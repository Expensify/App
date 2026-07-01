import type {AnyStateNode, StateValue} from 'xstate';

type SettleableLeafState = {description: string; value: StateValue};

function toStateValue(path: string[]): StateValue {
    if (path.length <= 1) {
        return path.at(0) ?? '';
    }
    const [head, ...rest] = path;
    return {[head]: toStateValue(rest)};
}

function getSettleableLeafStates(node: AnyStateNode): SettleableLeafState[] {
    const children = Object.values(node.states);
    if (children.length > 0) {
        return children.flatMap(getSettleableLeafStates);
    }
    // A leaf with an `always` transition is a transient router that leaves on entry and never settles.
    if ((node.always?.length ?? 0) > 0) {
        return [];
    }
    return [{description: node.path.join('.'), value: toStateValue(node.path)}];
}

export default getSettleableLeafStates;
export {toStateValue};
export type {SettleableLeafState};
