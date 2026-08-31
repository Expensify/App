import getMinimalAction, {hasMatchingSplitScope} from '@libs/Navigation/helpers/linkTo/getMinimalAction';

import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

import type {NavigationAction, ParamListBase, StackActionType, StackNavigationState} from '@react-navigation/native';

import {CommonActions, StackRouter} from '@react-navigation/native';

const POLICY_A = 'policy-a';
const POLICY_B = 'policy-b';
const DOMAIN_A = 1;
const DOMAIN_B = 2;

const workspaceRouter = StackRouter({});
const workspaceRouterOptions = {
    routeNames: [NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR, NAVIGATORS.DOMAIN_SPLIT_NAVIGATOR],
    routeParamList: {},
    routeGetIdList: {},
};

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isStackPushAction(action: NavigationAction): action is Extract<StackActionType, {type: 'PUSH'}> {
    return action.type === 'PUSH' && isRecord(action.payload) && typeof action.payload.name === 'string' && (action.payload.params === undefined || isRecord(action.payload.params));
}

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

function buildWorkspaceStates(sidebarPolicyID: string) {
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

    return {
        rootState: buildNavigationState('root-state', 0, [
            {
                key: 'tab-route',
                name: NAVIGATORS.TAB_NAVIGATOR,
                state: tabState,
            },
        ]),
        workspaceState,
    };
}

function buildDomainState(sidebarDomainAccountID: number) {
    const splitState = buildNavigationState('domain-split-state', 1, [
        {key: 'domain-sidebar-route', name: SCREENS.DOMAIN.INITIAL, params: {domainAccountID: sidebarDomainAccountID}},
        {key: 'domain-central-route', name: SCREENS.DOMAIN.SAML, params: {domainAccountID: sidebarDomainAccountID}},
    ]);
    const workspaceState = buildNavigationState('workspace-state', 0, [
        {
            key: 'domain-split-route',
            name: NAVIGATORS.DOMAIN_SPLIT_NAVIGATOR,
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

function buildDomainAction(domainAccountID: number | string): NavigationAction {
    return {
        type: 'NAVIGATE',
        payload: {
            name: NAVIGATORS.TAB_NAVIGATOR,
            params: {
                screen: NAVIGATORS.WORKSPACE_NAVIGATOR,
                params: {
                    screen: NAVIGATORS.DOMAIN_SPLIT_NAVIGATOR,
                    params: {
                        screen: SCREENS.DOMAIN.MEMBERS,
                        params: {domainAccountID},
                    },
                },
            },
        },
    };
}

describe('getMinimalAction', () => {
    it('targets the existing split navigator when the workspace does not change', () => {
        const {rootState} = buildWorkspaceStates(POLICY_A);
        const result = getMinimalAction(buildWorkspaceAction(POLICY_A), rootState);

        expect(result.action).toMatchObject({
            type: 'NAVIGATE',
            target: 'split-state',
            payload: {name: SCREENS.WORKSPACE.MORE_FEATURES, params: {policyID: POLICY_A}},
        });
    });

    it('pushes a new split navigator when the workspace changes', () => {
        const {rootState} = buildWorkspaceStates(POLICY_B);
        const result = getMinimalAction(buildWorkspaceAction(POLICY_A), rootState);

        expect(result.action).toMatchObject({
            type: 'PUSH',
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
        const {rootState} = buildWorkspaceStates(POLICY_B);
        const action: NavigationAction = {...buildWorkspaceAction(POLICY_A), type: 'REPLACE'};

        expect(getMinimalAction(action, rootState).action).toMatchObject({
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

    it('preserves the previous workspace split so one Back action restores coherent parameters', () => {
        const {rootState, workspaceState} = buildWorkspaceStates(POLICY_B);
        const {action} = getMinimalAction(buildWorkspaceAction(POLICY_A), rootState);

        if (!isStackPushAction(action)) {
            throw new Error('Expected a valid cross-workspace PUSH action');
        }

        const stateAfterPush = workspaceRouter.getStateForAction(workspaceState, action, workspaceRouterOptions);

        if (!stateAfterPush) {
            throw new Error('Expected the cross-workspace action to be handled');
        }

        const rehydratedStateAfterPush = workspaceRouter.getRehydratedState(stateAfterPush, workspaceRouterOptions);

        expect(rehydratedStateAfterPush.routes).toHaveLength(2);
        expect(rehydratedStateAfterPush.routes.at(1)).toMatchObject({
            name: NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR,
            params: {
                screen: SCREENS.WORKSPACE.MORE_FEATURES,
                params: {policyID: POLICY_A},
            },
        });

        const stateAfterBack = workspaceRouter.getStateForAction(rehydratedStateAfterPush, CommonActions.goBack(), workspaceRouterOptions);

        expect(stateAfterBack?.routes).toHaveLength(1);
        expect(stateAfterBack?.routes.at(0)).toMatchObject({
            name: NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR,
            state: {
                routes: [
                    {name: SCREENS.WORKSPACE.INITIAL, params: {policyID: POLICY_B}},
                    {name: SCREENS.WORKSPACE.PROFILE, params: {policyID: POLICY_B}},
                ],
            },
        });
    });

    it('pushes a new domain split navigator when the domain changes', () => {
        const result = getMinimalAction(buildDomainAction(DOMAIN_A), buildDomainState(DOMAIN_B));

        expect(result.action).toMatchObject({
            type: 'PUSH',
            target: 'workspace-state',
            payload: {
                name: NAVIGATORS.DOMAIN_SPLIT_NAVIGATOR,
                params: {
                    screen: SCREENS.DOMAIN.MEMBERS,
                    params: {domainAccountID: DOMAIN_A},
                },
            },
        });
    });

    it('targets the existing domain split when the path and state parameter types differ', () => {
        const result = getMinimalAction(buildDomainAction(String(DOMAIN_A)), buildDomainState(DOMAIN_A));

        expect(result.action).toMatchObject({
            type: 'NAVIGATE',
            target: 'domain-split-state',
            payload: {name: SCREENS.DOMAIN.MEMBERS, params: {domainAccountID: String(DOMAIN_A)}},
        });
    });

    it('matches domain split history by domain account ID', () => {
        const domainState = buildDomainState(DOMAIN_A);
        const workspaceState = domainState.routes.at(0)?.state?.routes.at(0)?.state;
        const domainSplitRoute = workspaceState?.routes.at(0);
        const minimalAction = getMinimalAction(buildDomainAction(DOMAIN_B), domainState).action;
        if (!domainSplitRoute) {
            throw new Error('Expected a domain split route');
        }

        expect(hasMatchingSplitScope(domainSplitRoute, minimalAction.payload)).toBe(false);

        const matchingAction = getMinimalAction(buildDomainAction(DOMAIN_A), buildDomainState(DOMAIN_B)).action;
        expect(hasMatchingSplitScope(domainSplitRoute, matchingAction.payload)).toBe(true);
    });
});
