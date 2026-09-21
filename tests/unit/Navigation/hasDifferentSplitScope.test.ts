import {setPreservedNavigatorState} from '@libs/Navigation/AppNavigator/createSplitNavigator/usePreserveNavigatorState';
import getParamsFromRoute from '@libs/Navigation/helpers/getParamsFromRoute';
import hasDifferentSplitScope from '@libs/Navigation/helpers/hasDifferentSplitScope';
import type {NavigationRoute} from '@libs/Navigation/types';

import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

import type {NavigationState, ParamListBase, StackNavigationState} from '@react-navigation/native';

// Every split's sidebar has exactly one scope param today, so pinning the multi-param semantics of
// `scopeParams.some(...)` means stating the sidebar's params directly. Every test gets the real implementation back.
jest.mock('@libs/Navigation/helpers/getParamsFromRoute');

const actualGetParamsFromRoute = jest.requireActual<{default: typeof getParamsFromRoute}>('@libs/Navigation/helpers/getParamsFromRoute').default;
const mockedGetParamsFromRoute = jest.mocked(getParamsFromRoute);

beforeEach(() => {
    mockedGetParamsFromRoute.mockImplementation(actualGetParamsFromRoute);
});

const POLICY_A = 'policy-a';
const POLICY_B = 'policy-b';
const DOMAIN_A = 1;
const DOMAIN_B = 2;

type TestRoute = {key?: string; name: string; params?: Record<string, unknown>};

function buildSplitState(key: string, routes: TestRoute[], index = routes.length - 1): StackNavigationState<ParamListBase> {
    return {
        key,
        index,
        preloadedRoutes: [],
        routeNames: routes.map((route) => route.name),
        routes: routes.map((route, position) => ({key: route.key ?? `${route.name}-${position}`, name: route.name, params: route.params})),
        stale: false,
        type: 'stack',
    } as StackNavigationState<ParamListBase>;
}

function buildSplitRoute({
    name = NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR,
    key = 'split-route',
    routes,
    index,
    params,
}: {
    name?: string;
    key?: string;
    routes?: TestRoute[];
    index?: number;
    params?: Record<string, unknown>;
}): NavigationRoute {
    return {
        key,
        name,
        params,
        state: routes ? buildSplitState(`${key}-state`, routes, index) : undefined,
    } as NavigationRoute;
}

function buildPayload(policyID: string, name: string = NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR) {
    return {name, params: {screen: SCREENS.WORKSPACE.MORE_FEATURES, params: {policyID}}};
}

function buildDomainPayload(domainAccountID: number | string) {
    return {name: NAVIGATORS.DOMAIN_SPLIT_NAVIGATOR, params: {screen: SCREENS.DOMAIN.MEMBERS, params: {domainAccountID}}};
}

describe('hasDifferentSplitScope', () => {
    it('compares the scope of the split sidebar', () => {
        const routes = [
            {name: SCREENS.WORKSPACE.INITIAL, params: {policyID: POLICY_A}},
            {name: SCREENS.WORKSPACE.PROFILE, params: {policyID: POLICY_A}},
        ];

        expect(hasDifferentSplitScope(buildSplitRoute({routes}), buildPayload(POLICY_A))).toBe(false);
        expect(hasDifferentSplitScope(buildSplitRoute({routes}), buildPayload(POLICY_B))).toBe(true);
    });

    it('keeps the sidebar authoritative over the focused central screen', () => {
        // A central screen can be left behind with params of its own. The sidebar is what the split belongs to.
        const route = buildSplitRoute({
            routes: [
                {name: SCREENS.WORKSPACE.INITIAL, params: {policyID: POLICY_B}},
                {name: SCREENS.WORKSPACE.PROFILE, params: {policyID: POLICY_A}},
            ],
        });

        expect(hasDifferentSplitScope(route, buildPayload(POLICY_A))).toBe(true);
        expect(hasDifferentSplitScope(route, buildPayload(POLICY_B))).toBe(false);
    });

    it('falls back to the focused screen when the split holds central screens only', () => {
        const route = buildSplitRoute({routes: [{name: SCREENS.WORKSPACE.PROFILE, params: {policyID: POLICY_A}}]});

        expect(hasDifferentSplitScope(route, buildPayload(POLICY_A))).toBe(false);
        expect(hasDifferentSplitScope(route, buildPayload(POLICY_B))).toBe(true);
    });

    it('reads the focused screen rather than a historical one', () => {
        const route = buildSplitRoute({
            routes: [
                {name: SCREENS.WORKSPACE.PROFILE, params: {policyID: POLICY_B}},
                {name: SCREENS.WORKSPACE.PROFILE, params: {policyID: POLICY_A}},
            ],
        });

        expect(hasDifferentSplitScope(route, buildPayload(POLICY_A))).toBe(false);
    });

    it('does not guess a scope when the focused screen carries no params', () => {
        const route = buildSplitRoute({
            routes: [
                {name: SCREENS.WORKSPACE.PROFILE, params: {policyID: POLICY_A}},
                {name: SCREENS.WORKSPACE.PROFILE, params: undefined},
            ],
        });

        expect(hasDifferentSplitScope(route, buildPayload(POLICY_B))).toBe(false);
    });

    it('compares scope values across parameter types', () => {
        const routes = [{name: SCREENS.DOMAIN.INITIAL, params: {domainAccountID: DOMAIN_A}}];

        expect(hasDifferentSplitScope(buildSplitRoute({name: NAVIGATORS.DOMAIN_SPLIT_NAVIGATOR, routes}), buildDomainPayload(String(DOMAIN_A)))).toBe(false);
        expect(hasDifferentSplitScope(buildSplitRoute({name: NAVIGATORS.DOMAIN_SPLIT_NAVIGATOR, routes}), buildDomainPayload(DOMAIN_B))).toBe(true);
    });

    it('reads the preserved state of a split that is not mounted', () => {
        const preservedKey = 'unmounted-split';
        setPreservedNavigatorState(preservedKey, buildSplitState('preserved-state', [{name: SCREENS.WORKSPACE.INITIAL, params: {policyID: POLICY_A}}]) as NavigationState);
        const route = buildSplitRoute({key: preservedKey});

        expect(hasDifferentSplitScope(route, buildPayload(POLICY_A))).toBe(false);
        expect(hasDifferentSplitScope(route, buildPayload(POLICY_B))).toBe(true);
    });

    it('falls back to the params the split was created with when it has no state at all', () => {
        const route = buildSplitRoute({key: 'never-mounted', params: {screen: SCREENS.WORKSPACE.PROFILE, params: {policyID: POLICY_A}}});

        expect(hasDifferentSplitScope(route, buildPayload(POLICY_A))).toBe(false);
        expect(hasDifferentSplitScope(route, buildPayload(POLICY_B))).toBe(true);
    });

    describe('a sidebar with more than one scope param', () => {
        function buildTwoParamPayload(params: Record<string, unknown>) {
            return {name: NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR, params: {screen: SCREENS.WORKSPACE.MORE_FEATURES, params}};
        }

        it('treats one differing param as a different scope', () => {
            mockedGetParamsFromRoute.mockReturnValue(['policyID', 'domainAccountID']);
            const route = buildSplitRoute({routes: [{name: SCREENS.WORKSPACE.INITIAL, params: {policyID: POLICY_A, domainAccountID: DOMAIN_A}}]});

            expect(hasDifferentSplitScope(route, buildTwoParamPayload({policyID: POLICY_A, domainAccountID: DOMAIN_A}))).toBe(false);
            expect(hasDifferentSplitScope(route, buildTwoParamPayload({policyID: POLICY_A, domainAccountID: DOMAIN_B}))).toBe(true);
        });

        it('ignores a param that is missing on either side', () => {
            mockedGetParamsFromRoute.mockReturnValue(['policyID', 'domainAccountID']);
            const route = buildSplitRoute({routes: [{name: SCREENS.WORKSPACE.INITIAL, params: {policyID: POLICY_A}}]});

            // Only the params both sides carry are comparable, so a missing one cannot make the scopes differ.
            expect(hasDifferentSplitScope(route, buildTwoParamPayload({policyID: POLICY_A, domainAccountID: DOMAIN_B}))).toBe(false);
            expect(hasDifferentSplitScope(route, buildTwoParamPayload({policyID: POLICY_B, domainAccountID: DOMAIN_B}))).toBe(true);
        });
    });

    it('reports no difference when there is nothing to compare', () => {
        const workspaceRoutes = [{name: SCREENS.WORKSPACE.INITIAL, params: {policyID: POLICY_A}}];

        // A split with no scope params in its sidebar keeps matching by name, exactly as before.
        expect(
            hasDifferentSplitScope(
                buildSplitRoute({name: NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR, routes: [{name: SCREENS.SETTINGS.ROOT}]}),
                buildPayload(POLICY_B, NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR),
            ),
        ).toBe(false);
        // A payload for another navigator is not this route's business.
        expect(hasDifferentSplitScope(buildSplitRoute({routes: workspaceRoutes}), buildDomainPayload(DOMAIN_B))).toBe(false);
        // Neither is a route that is not a split navigator.
        expect(hasDifferentSplitScope(buildSplitRoute({name: SCREENS.WORKSPACES_LIST, routes: workspaceRoutes}), buildPayload(POLICY_B))).toBe(false);
        // A split with no state and no params has nothing to say about its scope.
        expect(hasDifferentSplitScope(buildSplitRoute({key: 'empty-split'}), buildPayload(POLICY_B))).toBe(false);
    });
});
