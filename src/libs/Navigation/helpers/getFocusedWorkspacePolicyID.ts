import type {NavigationState, PartialState} from '@react-navigation/native';

/**
 * Walks down the focused route chain and returns the leaf screen's policyID when it is a workspace page, meaning it
 * has a policyID param and no reportID param. A screen that shows a report belongs to that report's workspace instead.
 */
function getFocusedWorkspacePolicyID(state: NavigationState | PartialState<NavigationState> | undefined): string | undefined {
    if (!state?.routes?.length) {
        return undefined;
    }
    // PartialState (e.g. from getStateFromPath on cold-start) may omit index; React Navigation treats the last route as focused.
    const focused = state.routes[state.index ?? state.routes.length - 1];
    if (focused?.state) {
        return getFocusedWorkspacePolicyID(focused.state);
    }
    const params = focused?.params;
    if (!params || typeof params !== 'object' || 'reportID' in params || !('policyID' in params) || typeof params.policyID !== 'string') {
        return undefined;
    }
    return params.policyID || undefined;
}

export default getFocusedWorkspacePolicyID;
