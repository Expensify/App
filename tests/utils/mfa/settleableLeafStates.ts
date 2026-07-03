import type {AnyStateNode} from 'xstate';

type SettleableLeafState = {description: string};

/**
 * A leaf state is settleable when the UI walk can stop on it and assert. A leaf that auto-advances is
 * not settleable, because it only passes through and cannot end a walk.
 *
 * Auto-advance is a static approximation here. An unguarded `always` transition must fire, so it
 * always disqualifies the leaf, while a guarded one may keep the machine in place, so it never does.
 * An invoked actor counts as auto-advancing once it registers `onDone` or `onError`, which is true for
 * an actor that completes immediately (the mocked promise actors this harness expects) but not for one
 * that stays pending. Revisit this predicate when the first real invoke state is added to the machine.
 */
function getSettleableLeafStates(node: AnyStateNode): SettleableLeafState[] {
    const children = Object.values(node.states);
    if (children.length > 0) {
        return children.flatMap(getSettleableLeafStates);
    }
    const hasUnguardedAlways = node.always?.some((transition) => transition.guard === undefined) ?? false;
    const hasRoutingInvoke = node.invoke.some((definition) => definition.onDone !== undefined || definition.onError !== undefined);
    if (hasUnguardedAlways || hasRoutingInvoke) {
        return [];
    }
    // The dot-path description doubles as a state-value key: `matchesState` splits it on `.` before comparing.
    return [{description: node.path.join('.')}];
}

export default getSettleableLeafStates;
export type {SettleableLeafState};
