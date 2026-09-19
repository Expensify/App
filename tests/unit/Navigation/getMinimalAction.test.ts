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

function buildWorkspaceStates(sidebarPolicyID: string, includeSidebar = true) {
    const splitState = buildNavigationState('split-state', includeSidebar ? 1 : 0, [
        ...(includeSidebar ? [{key: 'sidebar-route', name: SCREENS.WORKSPACE.INITIAL, params: {policyID: sidebarPolicyID}}] : []),
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

function buildDomainState(sidebarDomainAccountID: number, includeSidebar = true) {
    const splitState = buildNavigationState('domain-split-state', includeSidebar ? 1 : 0, [
        ...(includeSidebar ? [{key: 'domain-sidebar-route', name: SCREENS.DOMAIN.INITIAL, params: {domainAccountID: sidebarDomainAccountID}}] : []),
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

describe.each([
    {
        scope: 'workspace',
        buildState: () => buildWorkspaceStates(POLICY_A, false).rootState,
        matchingAction: () => buildWorkspaceAction(POLICY_A),
        differentAction: () => buildWorkspaceAction(POLICY_B),
        scopeKey: 'policyID',
    },
    {
        scope: 'domain',
        buildState: () => buildDomainState(DOMAIN_A, false),
        matchingAction: () => buildDomainAction(String(DOMAIN_A)),
        differentAction: () => buildDomainAction(DOMAIN_B),
        scopeKey: 'domainAccountID',
    },
])('central-only $scope split', ({buildState, matchingAction, differentAction, scopeKey}) => {
    function getSplitRoute(state: ReturnType<typeof buildState>) {
        const split = state.routes.at(0)?.state?.routes.at(0)?.state?.routes.at(0);
        if (!split?.state) {
            throw new Error('Expected nested split state');
        }
        return split;
    }

    it('reuses the split for the same scope', () => {
        const state = buildState();
        const result = getMinimalAction(matchingAction(), state);
        expect(result.action).toMatchObject({type: 'NAVIGATE', target: getSplitRoute(state).state?.key});
        expect(result.scopedSplitPayload).toBeUndefined();
    });

    it('pushes a separate split for a different scope and matches central-only history', () => {
        const state = buildState();
        const result = getMinimalAction(differentAction(), state);
        expect(result.action).toMatchObject({type: 'PUSH', target: 'workspace-state'});
        expect(result.scopedSplitPayload).toBe(result.action.payload);
        expect(hasMatchingSplitScope(getSplitRoute(state), result.action.payload)).toBe(false);
        const split = getSplitRoute(state);
        const action = matchingAction();
        // The original nested action is minimized through the wrapper navigators below, up to the unmounted split.
        const unmountedState = buildState();
        getSplitRoute(unmountedState).state = undefined;
        const matchingPayload = getMinimalAction(action, unmountedState).action.payload;
        expect(hasMatchingSplitScope(split, matchingPayload)).toBe(true);
    });

    it('preserves explicit replacement across scopes', () => {
        const result = getMinimalAction({...differentAction(), type: 'REPLACE'}, buildState());
        expect(result.action).toMatchObject({type: 'REPLACE', target: 'workspace-state'});
        expect(result.scopedSplitPayload).toBeUndefined();
    });

    it('does not classify an existing same-scope PUSH as a scope change', () => {
        const result = getMinimalAction({...matchingAction(), type: 'PUSH'}, buildState());
        expect(result.action.type).toBe('PUSH');
        expect(result.scopedSplitPayload).toBeUndefined();
    });

    it('uses the focused central route rather than a stale historical route', () => {
        const state = buildState();
        const split = getSplitRoute(state);
        const focused = split.state?.routes.at(0);
        if (!focused) {
            throw new Error('Expected focused central screen');
        }
        split.state = buildNavigationState('central-history', 1, [
            {...focused, key: 'stale-central', params: {[scopeKey]: 'other-scope'}},
            {...focused, key: 'focused-central'},
        ]);
        expect(getMinimalAction(matchingAction(), state).action).toMatchObject({type: 'NAVIGATE', target: 'central-history'});
    });

    it('does not guess the scope from historical routes when focused parameters are absent', () => {
        const state = buildState();
        const split = getSplitRoute(state);
        const focused = split.state?.routes.at(0);
        if (!focused) {
            throw new Error('Expected focused central screen');
        }
        split.state = buildNavigationState('unknown-scope', 1, [
            {...focused, key: 'focused-central'},
            {...focused, key: 'unknown-central', params: undefined},
        ]);
        expect(getMinimalAction(differentAction(), state).action.type).toBe('NAVIGATE');
        const unmountedState = buildState();
        getSplitRoute(unmountedState).state = undefined;
        expect(hasMatchingSplitScope(split, getMinimalAction(matchingAction(), unmountedState).action.payload)).toBe(false);
    });

    it('does not replace an existing sidebar scope with the central scope', () => {
        const state = buildState();
        const split = getSplitRoute(state);
        const focused = split.state?.routes.at(0);
        if (!focused) {
            throw new Error('Expected focused central screen');
        }
        const sidebarName = scopeKey === 'policyID' ? SCREENS.WORKSPACE.INITIAL : SCREENS.DOMAIN.INITIAL;
        split.state = buildNavigationState('sidebar-authority', 1, [
            {key: 'sidebar', name: sidebarName, params: {[scopeKey]: 'other-scope'}},
            {...focused, key: 'focused-central'},
        ]);
        expect(getMinimalAction(matchingAction(), state).action).toMatchObject({type: 'PUSH', target: 'workspace-state'});
        split.state = buildNavigationState('sidebar-unknown', 1, [
            {key: 'sidebar', name: sidebarName},
            {...focused, key: 'focused-central'},
        ]);
        expect(getMinimalAction(differentAction(), state).action.type).toBe('NAVIGATE');
    });
});
