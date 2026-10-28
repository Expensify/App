import getMinimalAction from '@libs/Navigation/helpers/linkTo/getMinimalAction';

import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

import type {NavigationAction, ParamListBase, StackNavigationState} from '@react-navigation/native';

const POLICY_A = 'policy-a';
const POLICY_B = 'policy-b';

function buildNavigationState(key: string, index: number, routes: StackNavigationState<ParamListBase>['routes']): StackNavigationState<ParamListBase> {
    return {
        key,
        index,
        preloadedRoutes: [],
        routeNames: routes.map((route) => route.name),
        routes,
        stale: false,
        type: 'stack',
    };
}

function buildRootState(sidebarPolicyID: string) {
    const splitState = buildNavigationState('split-state', 1, [
        {key: 'sidebar-route', name: SCREENS.WORKSPACE.INITIAL, params: {policyID: sidebarPolicyID}},
        {key: 'central-route', name: SCREENS.WORKSPACE.PROFILE, params: {policyID: sidebarPolicyID}},
    ]);
    const workspaceState = buildNavigationState('workspace-state', 0, [
        {
            key: 'split-route',
            name: NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR,
            state: splitState,
        },
    ]);
    const tabState = buildNavigationState('tab-state', 0, [
        {
            key: 'workspace-route',
            name: NAVIGATORS.WORKSPACE_NAVIGATOR,
            state: workspaceState,
        },
    ]);

    return buildNavigationState('root-state', 0, [
        {
            key: 'tab-route',
            name: NAVIGATORS.TAB_NAVIGATOR,
            state: tabState,
        },
    ]);
}

function buildWorkspaceAction(policyID: string): NavigationAction {
    return {
        type: 'NAVIGATE',
        payload: {
            name: NAVIGATORS.TAB_NAVIGATOR,
            params: {
                screen: NAVIGATORS.WORKSPACE_NAVIGATOR,
                params: {
                    screen: NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR,
                    params: {
                        screen: SCREENS.WORKSPACE.MORE_FEATURES,
                        params: {policyID},
                    },
                },
            },
        },
    };
}

describe('getMinimalAction', () => {
    it('targets the existing split navigator when the workspace does not change', () => {
        const result = getMinimalAction(buildWorkspaceAction(POLICY_A), buildRootState(POLICY_A));

        expect(result.isFocusedRouteInDifferentScope).toBe(false);
        expect(result.action).toMatchObject({
            type: 'NAVIGATE',
            target: 'split-state',
            payload: {name: SCREENS.WORKSPACE.MORE_FEATURES, params: {policyID: POLICY_A}},
        });
    });

    it('stops at the focused split and reports its scope when the workspace changes', () => {
        const result = getMinimalAction(buildWorkspaceAction(POLICY_A), buildRootState(POLICY_B));

        expect(result.isFocusedRouteInDifferentScope).toBe(true);
        // The action type is left alone; the callers decide what to do with the reported boundary.
        expect(result.action).toMatchObject({
            type: 'NAVIGATE',
            target: 'workspace-state',
            payload: {
                name: NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR,
                params: {
                    screen: SCREENS.WORKSPACE.MORE_FEATURES,
                    params: {policyID: POLICY_A},
                },
            },
        });
    });

    it('preserves an explicit replace action when the workspace changes', () => {
        const action: NavigationAction = {...buildWorkspaceAction(POLICY_A), type: 'REPLACE'};
        const result = getMinimalAction(action, buildRootState(POLICY_B));

        // The boundary is reported for every action type, and `linkTo` leaves a replace alone.
        expect(result.isFocusedRouteInDifferentScope).toBe(true);
        expect(result.action).toMatchObject({
            type: 'REPLACE',
            target: 'workspace-state',
            payload: {
                name: NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR,
                params: {
                    screen: SCREENS.WORKSPACE.MORE_FEATURES,
                    params: {policyID: POLICY_A},
                },
            },
        });
    });
});
