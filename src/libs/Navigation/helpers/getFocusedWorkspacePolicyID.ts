import type {NavigationState, PartialState} from '@react-navigation/native';

type State = NavigationState | PartialState<NavigationState>;

function findFocusedWorkspacePolicyID(state: State, parentPolicyID: string | undefined): string | undefined {
    if (!state.routes?.length) {
        return undefined;
    }
    // PartialState (e.g. from getStateFromPath on cold-start) may omit index; React Navigation treats the last route as focused.
    const focused = state.routes[state.index ?? state.routes.length - 1];
    const params = focused?.params && typeof focused.params === 'object' ? focused.params : undefined;
    if (params && 'reportID' in params) {
        return undefined;
    }
    const policyID = params && 'policyID' in params && typeof params.policyID === 'string' && params.policyID ? params.policyID : parentPolicyID;

    // Tabs inside a workspace page (e.g. receipt partner invites) have no params of their own, so they inherit the page's policyID.
    if (focused?.state) {
        return findFocusedWorkspacePolicyID(focused.state, policyID);
    }
    return policyID;
}

/**
 * Walks down the focused route chain and returns the policyID of the workspace page on screen, meaning the focused
 * screen or the screen hosting its tab has a policyID param and nothing on the chain has a reportID param. A screen
 * that shows a report belongs to that report's workspace instead.
 */
function getFocusedWorkspacePolicyID(state: State | undefined): string | undefined {
    if (!state) {
        return undefined;
    }
    return findFocusedWorkspacePolicyID(state, undefined);
}

export default getFocusedWorkspacePolicyID;
