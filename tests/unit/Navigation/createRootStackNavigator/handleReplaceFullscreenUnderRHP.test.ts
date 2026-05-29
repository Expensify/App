import type {
    CommonActions,
    NavigationRoute,
    NavigationState,
    ParamListBase,
    PartialState,
    Router,
    RouterConfigOptions,
    StackActionType,
    StackNavigationState,
} from '@react-navigation/native';
import {handleReplaceFullscreenUnderRHP} from '@libs/Navigation/AppNavigator/createRootStackNavigator/GetStateForActionHandlers';
import type {ReplaceFullscreenUnderRHPActionType} from '@libs/Navigation/AppNavigator/createRootStackNavigator/types';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import type {Route} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

// Stub the linking parser so the test does not depend on the production linking config.
// Each test sets the parsed state returned by the next `getStateFromPath` call.
let mockStubbedParsedState: PartialState<NavigationState> | undefined;
jest.mock('@libs/Navigation/helpers/getStateFromPath', () => ({
    __esModule: true,
    default: jest.fn(() => mockStubbedParsedState),
}));

type TestRoute = NavigationRoute<ParamListBase, string>;

function makeRoute(name: string, params?: Record<string, unknown>, state?: PartialState<NavigationState>, key?: string): TestRoute {
    return {key: key ?? `${name}-key`, name, params, state} as TestRoute;
}

function makeStackState(routes: TestRoute[]): StackNavigationState<ParamListBase> {
    return {
        key: 'root-stack',
        index: routes.length - 1,
        routeNames: routes.map((r) => r.name),
        routes,
        type: 'stack',
        stale: false as const,
        preloadedRoutes: [],
    };
}

const CONFIG_OPTIONS: RouterConfigOptions = {
    routeNames: [],
    routeParamList: {},
    routeGetIdList: {},
};

// Identity rehydration: we are only asserting on the routes/index that the handler
// computed before passing them to the router; the router's own rehydration is exercised
// by other tests.
const stackRouter = {
    getRehydratedState: (partial: PartialState<NavigationState>) => partial as unknown as StackNavigationState<ParamListBase>,
} as unknown as Router<StackNavigationState<ParamListBase>, CommonActions.Action | StackActionType>;

const WORKSPACE_TAB_PARSED_STATE: PartialState<NavigationState> = {
    routes: [
        {
            name: NAVIGATORS.TAB_NAVIGATOR,
            state: {
                index: 0,
                routes: [
                    {
                        name: NAVIGATORS.WORKSPACE_NAVIGATOR,
                        state: {
                            index: 1,
                            routes: [{name: SCREENS.WORKSPACES_LIST}, {name: NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR, params: {policyID: 'NEW'}}],
                        },
                    },
                ],
            },
        },
    ],
};

function makeRHPRoute(): TestRoute {
    return makeRoute(NAVIGATORS.RIGHT_MODAL_NAVIGATOR, undefined, undefined, 'rhp-key');
}

function makeExistingState(workspaceNavNestedRoutes: TestRoute[], workspaceNavIndex: number): StackNavigationState<ParamListBase> {
    const tabNavRoute = makeRoute(
        NAVIGATORS.TAB_NAVIGATOR,
        undefined,
        {
            index: 0,
            routes: [
                {
                    key: 'workspace-nav-key',
                    name: NAVIGATORS.WORKSPACE_NAVIGATOR,
                    state: {
                        index: workspaceNavIndex,
                        routes: workspaceNavNestedRoutes as unknown as PartialState<NavigationState>['routes'],
                    },
                },
            ],
        },
        'tab-nav-key',
    );
    return makeStackState([tabNavRoute, makeRHPRoute()]);
}

function makeAction(collapseTabToLeaf?: boolean): ReplaceFullscreenUnderRHPActionType {
    return {
        type: CONST.NAVIGATION.ACTION_TYPE.REPLACE_FULLSCREEN_UNDER_RHP,
        payload: {route: '/workspaces/NEW' as Route, collapseTabToLeaf},
    };
}

beforeEach(() => {
    mockStubbedParsedState = WORKSPACE_TAB_PARSED_STATE;
});

describe('handleReplaceFullscreenUnderRHP — tab merge behaviour', () => {
    it('with collapseTabToLeaf=true: keeps WORKSPACES_LIST as the back stack and focuses the new leaf', () => {
        // Existing state: WORKSPACE_NAVIGATOR has just WORKSPACES_LIST under it.
        const existing = makeExistingState([makeRoute(SCREENS.WORKSPACES_LIST, undefined, undefined, 'list-key')], 0);

        const result = handleReplaceFullscreenUnderRHP(existing, makeAction(true), CONFIG_OPTIONS, stackRouter);

        expect(result).not.toBeNull();
        const tabNav = result?.routes.find((r) => r.name === NAVIGATORS.TAB_NAVIGATOR);
        const workspaceNav = (tabNav?.state as NavigationState | undefined)?.routes?.find((r) => r.name === NAVIGATORS.WORKSPACE_NAVIGATOR);
        const workspaceNavInnerRoutes = (workspaceNav?.state as NavigationState | undefined)?.routes;

        expect(workspaceNavInnerRoutes).toHaveLength(2);
        expect(workspaceNavInnerRoutes?.at(0)?.name).toBe(SCREENS.WORKSPACES_LIST);
        expect(workspaceNavInnerRoutes?.at(1)?.name).toBe(NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR);
        expect((workspaceNav?.state as NavigationState | undefined)?.index).toBe(1);
        // Leaf is tagged with `noEnterAnimation` so navigators that opt in (WorkspaceNavigator) read it
        // synchronously when computing screenOptions and skip the SLIDE_FROM_RIGHT entry animation.
        expect(workspaceNavInnerRoutes?.at(1)?.params).toEqual({policyID: 'NEW', noEnterAnimation: true});
    });

    it('with collapseTabToLeaf=true: rebuilds to [WORKSPACES_LIST, new leaf] even when the existing nested stack already has WORKSPACE_SPLIT_NAVIGATOR at index 0', () => {
        // This simulates the pre-existing bug input: an earlier custom helper had collapsed the tab.
        // collapseTabToLeaf rebuilds the nested stack as [WORKSPACES_LIST, new leaf] so the prior split is
        // dropped and swipe-back from the new workspace lands on the list.
        const existing = makeExistingState([makeRoute(NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR, {policyID: 'OLD'}, undefined, 'old-split-key')], 0);

        const result = handleReplaceFullscreenUnderRHP(existing, makeAction(true), CONFIG_OPTIONS, stackRouter);

        const tabNav = result?.routes.find((r) => r.name === NAVIGATORS.TAB_NAVIGATOR);
        const workspaceNav = (tabNav?.state as NavigationState | undefined)?.routes?.find((r) => r.name === NAVIGATORS.WORKSPACE_NAVIGATOR);
        const workspaceNavInnerRoutes = (workspaceNav?.state as NavigationState | undefined)?.routes;

        expect(workspaceNavInnerRoutes).toHaveLength(2);
        expect(workspaceNavInnerRoutes?.at(0)?.name).toBe(SCREENS.WORKSPACES_LIST);
        expect(workspaceNavInnerRoutes?.at(1)?.name).toBe(NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR);
        expect((workspaceNav?.state as NavigationState | undefined)?.index).toBe(1);
        expect(workspaceNavInnerRoutes?.at(1)?.params).toEqual({policyID: 'NEW', noEnterAnimation: true});
    });

    it('with collapseTabToLeaf=false (default): keeps the existing sidebar prepend behaviour so back navigation lands on it', () => {
        // Existing state: WORKSPACE_NAVIGATOR previously collapsed to a single WORKSPACE_SPLIT_NAVIGATOR.
        const existing = makeExistingState([makeRoute(NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR, {policyID: 'OLD'}, undefined, 'old-split-key')], 0);

        const result = handleReplaceFullscreenUnderRHP(existing, makeAction(false), CONFIG_OPTIONS, stackRouter);

        const tabNav = result?.routes.find((r) => r.name === NAVIGATORS.TAB_NAVIGATOR);
        const workspaceNav = (tabNav?.state as NavigationState | undefined)?.routes?.find((r) => r.name === NAVIGATORS.WORKSPACE_NAVIGATOR);
        const workspaceNavInnerRoutes = (workspaceNav?.state as NavigationState | undefined)?.routes;

        // Existing first route (WORKSPACE_SPLIT_NAVIGATOR) differs from incoming first route (WORKSPACES_LIST),
        // so the handler prepends the existing one.
        expect(workspaceNavInnerRoutes?.map((r) => r.name)).toEqual([NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR, SCREENS.WORKSPACES_LIST, NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR]);
        expect((workspaceNav?.state as NavigationState | undefined)?.index).toBe(2);
    });

    it('with collapseTabToLeaf undefined: defaults to legacy prepend behaviour', () => {
        const existing = makeExistingState([makeRoute(SCREENS.WORKSPACES_LIST, undefined, undefined, 'list-key')], 0);

        const result = handleReplaceFullscreenUnderRHP(existing, makeAction(undefined), CONFIG_OPTIONS, stackRouter);

        const tabNav = result?.routes.find((r) => r.name === NAVIGATORS.TAB_NAVIGATOR);
        const workspaceNav = (tabNav?.state as NavigationState | undefined)?.routes?.find((r) => r.name === NAVIGATORS.WORKSPACE_NAVIGATOR);
        const workspaceNavInnerRoutes = (workspaceNav?.state as NavigationState | undefined)?.routes;

        // Existing first = WORKSPACES_LIST; incoming first = WORKSPACES_LIST → match, no prepend.
        // Final state is just whatever was parsed: [WORKSPACES_LIST, WORKSPACE_SPLIT_NAVIGATOR].
        expect(workspaceNavInnerRoutes?.map((r) => r.name)).toEqual([SCREENS.WORKSPACES_LIST, NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR]);
    });
});
