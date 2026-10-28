/** The part of a navigation object the flow root gate reads. `useNavigation()` may have no state yet, so `getState` can return undefined. */
type FlowRootGuardNavigation = {
    getState: () => Readonly<{type: string; key: string; index: number; routes: ReadonlyArray<{key: string}>}> | undefined;
    getParent: () => FlowRootGuardNavigation | undefined;
    isFocused: () => boolean;
};

/**
 * Returns the navigator that hosts the flow root: the root's own stack, or the stack above it when the root is a tab of a tab navigator.
 */
function getFlowRootHost(navigation: FlowRootGuardNavigation): FlowRootGuardNavigation {
    if (navigation.getState()?.type !== 'tab') {
        return navigation;
    }
    return navigation.getParent() ?? navigation;
}

/**
 * Whether a flow-root discard guard should react to its route being removed. Unlike the default focus gate, later steps of the flow
 * may be stacked on top of the root, but the flow itself (the navigator hosting the root) must be the visible one.
 * Hidden sibling tabs never react: closing the flow fires `beforeRemove` on every mounted tab.
 */
function getIsFlowRootGuardActive(navigation: FlowRootGuardNavigation, routeKey: string): boolean {
    const ownState = navigation.getState();
    if (ownState?.type === 'tab' && ownState.routes.at(ownState.index)?.key !== routeKey) {
        return false;
    }

    return getFlowRootHost(navigation).getParent()?.isFocused() ?? true;
}

/** The key of the stack that hosts the flow root, so in-flow REPLACEs targeting it can be told apart. */
function getFlowRootStackKey(navigation: FlowRootGuardNavigation): string | undefined {
    return getFlowRootHost(navigation).getState()?.key;
}

export default getIsFlowRootGuardActive;
export {getFlowRootStackKey};
export type {FlowRootGuardNavigation};
