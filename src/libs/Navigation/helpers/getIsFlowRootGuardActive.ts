/** The navigation methods this file uses. `getState` can return undefined before the navigator has any state. */
type FlowRootGuardNavigation = {
    getState: () => Readonly<{type: string; key: string; index: number; routes: ReadonlyArray<{key: string}>}> | undefined;
    getParent: () => FlowRootGuardNavigation | undefined;
    isFocused: () => boolean;
};

/**
 * Returns the stack the flow's first screen is in. When that screen is a tab, such as the Scan tab of the start page, it's the
 * stack that holds the tabs.
 */
function getFlowRootHost(navigation: FlowRootGuardNavigation): FlowRootGuardNavigation {
    if (navigation.getState()?.type !== 'tab') {
        return navigation;
    }
    return navigation.getParent() ?? navigation;
}

/**
 * Whether the flow's first screen should prompt when it's about to be removed. Other screens prompt only when the user is
 * looking at them, but this one also prompts while the flow's other steps are open on top of it. It still doesn't prompt when:
 * - it's a tab that isn't selected. Closing the RHP removes every tab, and only the selected one should prompt.
 * - its flow isn't the one on screen.
 */
function getIsFlowRootGuardActive(navigation: FlowRootGuardNavigation, routeKey: string): boolean {
    const ownState = navigation.getState();
    if (ownState?.type === 'tab' && ownState.routes.at(ownState.index)?.key !== routeKey) {
        return false;
    }

    return getFlowRootHost(navigation).getParent()?.isFocused() ?? true;
}

/** The key of the stack the flow's first screen is in, to tell whether a REPLACE stays inside the flow. */
function getFlowRootStackKey(navigation: FlowRootGuardNavigation): string | undefined {
    return getFlowRootHost(navigation).getState()?.key;
}

export default getIsFlowRootGuardActive;
export {getFlowRootStackKey};
export type {FlowRootGuardNavigation};
