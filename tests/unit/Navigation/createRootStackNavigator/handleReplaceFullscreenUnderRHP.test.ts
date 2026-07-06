import {handleReplaceFullscreenUnderRHP} from '@libs/Navigation/AppNavigator/createRootStackNavigator/GetStateForActionHandlers';
import type {ReplaceFullscreenUnderRHPActionType} from '@libs/Navigation/AppNavigator/createRootStackNavigator/types';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import type {Route} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

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

// Stub the linking parser so the test does not depend on the production linking config.
// Each test sets the parsed state (what getStateFromPath returns for the incoming route).
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

// Identity rehydration: we only assert on the routes/index the handler computed before passing
// them to the router; the router's own rehydration is exercised by other tests.
const stackRouter = {
    getRehydratedState: (partial: PartialState<NavigationState>) => partial as unknown as StackNavigationState<ParamListBase>,
} as unknown as Router<StackNavigationState<ParamListBase>, CommonActions.Action | StackActionType>;

/** Builds the state returned by the stubbed getStateFromPath: a TAB_NAVIGATOR focused on WORKSPACE_NAVIGATOR with the given nested routes. */
function makeParsedState(workspaceNavNestedRoutes: PartialState<NavigationState>['routes']): PartialState<NavigationState> {
    return {
        routes: [
            {
                name: NAVIGATORS.TAB_NAVIGATOR,
                state: {
                    index: 0,
                    routes: [
                        {
                            name: NAVIGATORS.WORKSPACE_NAVIGATOR,
                            state: {index: workspaceNavNestedRoutes.length - 1, routes: workspaceNavNestedRoutes},
                        },
                    ],
                },
            },
        ],
    };
}

const INCOMING_SPLIT_ONLY = [{name: NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR, params: {policyID: 'NEW'}}] as PartialState<NavigationState>['routes'];
const INCOMING_WITH_LIST = [{name: SCREENS.WORKSPACES_LIST}, {name: NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR, params: {policyID: 'NEW'}}] as PartialState<NavigationState>['routes'];

function makeRHPRoute(): TestRoute {
    return makeRoute(NAVIGATORS.RIGHT_MODAL_NAVIGATOR, undefined, undefined, 'rhp-key');
}

/**
 * Builds the existing root state: [TAB_NAVIGATOR(WORKSPACE_NAVIGATOR), RHP].
 * Pass `undefined` for workspaceNavNestedRoutes to model a WORKSPACE_NAVIGATOR that was never
 * mounted (no nested state) — e.g. a workspace created from Inbox.
 */
function makeExistingState(workspaceNavNestedRoutes: TestRoute[] | undefined, workspaceNavIndex = 0): StackNavigationState<ParamListBase> {
    const workspaceNavRoute = {
        key: 'workspace-nav-key',
        name: NAVIGATORS.WORKSPACE_NAVIGATOR,
        ...(workspaceNavNestedRoutes ? {state: {index: workspaceNavIndex, routes: workspaceNavNestedRoutes as unknown as PartialState<NavigationState>['routes']}} : {}),
    };
    const tabNavRoute = makeRoute(NAVIGATORS.TAB_NAVIGATOR, undefined, {index: 0, routes: [workspaceNavRoute]}, 'tab-nav-key');
    return makeStackState([tabNavRoute, makeRHPRoute()]);
}

function makeAction(): ReplaceFullscreenUnderRHPActionType {
    return {
        type: CONST.NAVIGATION.ACTION_TYPE.REPLACE_FULLSCREEN_UNDER_RHP,
        payload: {route: '/workspaces/NEW' as Route},
    };
}

function getWorkspaceNavInnerRoutes(result: StackNavigationState<ParamListBase> | null) {
    const tabRoute = result?.routes.find((r) => r.name === NAVIGATORS.TAB_NAVIGATOR);
    const tabState = tabRoute?.state as NavigationState | undefined;
    const workspaceNav = tabState?.routes.find((r) => r.name === NAVIGATORS.WORKSPACE_NAVIGATOR);
    const workspaceNavState = workspaceNav?.state as NavigationState | undefined;
    const list = workspaceNavState?.routes?.find((r) => r.name === SCREENS.WORKSPACES_LIST);
    return {
        names: workspaceNavState?.routes?.map((r) => r.name),
        index: workspaceNavState?.index,
        listKey: list?.key,
        listParams: list?.params,
        navigatorKey: workspaceNav?.key,
    };
}

describe('handleReplaceFullscreenUnderRHP — WORKSPACE_NAVIGATOR seeding', () => {
    it('seeds [WORKSPACES_LIST, split] when the workspace tab was never mounted (guards iOS swipe-back regression #93003)', () => {
        mockStubbedParsedState = makeParsedState(INCOMING_SPLIT_ONLY);
        const result = handleReplaceFullscreenUnderRHP(makeExistingState(undefined), makeAction(), CONFIG_OPTIONS, stackRouter);

        expect(result).not.toBeNull();
        const {names, index} = getWorkspaceNavInnerRoutes(result);
        expect(names).toEqual([SCREENS.WORKSPACES_LIST, NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR]);
        expect(index).toBe(1);
        // RHP stays on top of the root stack so its dismiss animation can reveal the new workspace.
        expect(result?.routes.at(-1)?.name).toBe(NAVIGATORS.RIGHT_MODAL_NAVIGATOR);
    });

    it('rebuilds to [WORKSPACES_LIST, split] when the tab only has a stale split underneath (no list)', () => {
        mockStubbedParsedState = makeParsedState(INCOMING_SPLIT_ONLY);
        const existing = makeExistingState([makeRoute(NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR, {policyID: 'OLD'})], 0);
        const result = handleReplaceFullscreenUnderRHP(existing, makeAction(), CONFIG_OPTIONS, stackRouter);

        const {names, index} = getWorkspaceNavInnerRoutes(result);
        expect(names).toEqual([SCREENS.WORKSPACES_LIST, NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR]);
        expect(index).toBe(1);
    });

    it('seeds a fresh (keyless) WORKSPACES_LIST when it is the visible top, so the reveal does not reorder it and flash the list (#90985)', () => {
        mockStubbedParsedState = makeParsedState(INCOMING_SPLIT_ONLY);
        // The user backed into WORKSPACES_LIST: it is the only nested route and the mounted, visible top.
        const existing = makeExistingState([makeRoute(SCREENS.WORKSPACES_LIST, undefined, undefined, 'list-key')], 0);
        const result = handleReplaceFullscreenUnderRHP(existing, makeAction(), CONFIG_OPTIONS, stackRouter);

        const {names, index, listKey} = getWorkspaceNavInnerRoutes(result);
        expect(names).toEqual([SCREENS.WORKSPACES_LIST, NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR]);
        expect(index).toBe(1);
        // The list must NOT reuse the visible top's key, otherwise react-native-screens reorders it top->non-top
        // and flashes it during the reveal. A keyless route is born-non-top and gets a fresh key on rehydration.
        expect(listKey).toBeUndefined();
    });

    it('remounts the WORKSPACE_NAVIGATOR by dropping its key so it mounts the [list, split] cleanly instead of an incremental update that flashes (#90985)', () => {
        mockStubbedParsedState = makeParsedState(INCOMING_SPLIT_ONLY);
        // makeExistingState gives the workspace navigator route the key 'workspace-nav-key'.
        const existing = makeExistingState([makeRoute(SCREENS.WORKSPACES_LIST, undefined, undefined, 'list-key')], 0);
        const result = handleReplaceFullscreenUnderRHP(existing, makeAction(), CONFIG_OPTIONS, stackRouter);

        // The focused tab route is marked for remount by dropping its key; TabRouter.getRehydratedState()
        // then assigns a fresh key, so react-native-screens remounts the navigator instead of doing an
        // incremental update that flashes. The stale key must not survive.
        const {navigatorKey} = getWorkspaceNavInnerRoutes(result);
        expect(navigatorKey).not.toBe('workspace-nav-key');
    });

    it('seeds a fresh WORKSPACES_LIST and reveals the new split when already viewing another workspace', () => {
        mockStubbedParsedState = makeParsedState(INCOMING_SPLIT_ONLY);
        const existing = makeExistingState([makeRoute(SCREENS.WORKSPACES_LIST, undefined, undefined, 'list-key'), makeRoute(NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR, {policyID: 'OLD'})], 1);
        const result = handleReplaceFullscreenUnderRHP(existing, makeAction(), CONFIG_OPTIONS, stackRouter);

        const {names, index, listKey} = getWorkspaceNavInnerRoutes(result);
        expect(names).toEqual([SCREENS.WORKSPACES_LIST, NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR]);
        expect(index).toBe(1);
        // The stale split between the list and the new split is dropped, and the list is reseeded keyless.
        expect(listKey).toBeUndefined();
    });

    it('preserves the existing WORKSPACES_LIST params (e.g. backTo) on the freshly seeded sidebar', () => {
        mockStubbedParsedState = makeParsedState(INCOMING_SPLIT_ONLY);
        const existing = makeExistingState(
            [makeRoute(SCREENS.WORKSPACES_LIST, {backTo: '/settings'}, undefined, 'list-key'), makeRoute(NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR, {policyID: 'OLD'})],
            1,
        );
        const result = handleReplaceFullscreenUnderRHP(existing, makeAction(), CONFIG_OPTIONS, stackRouter);

        const {names, listKey, listParams} = getWorkspaceNavInnerRoutes(result);
        expect(names).toEqual([SCREENS.WORKSPACES_LIST, NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR]);
        // Params survive so the back target is preserved, but the key is dropped to keep the route born-non-top.
        expect(listParams).toEqual({backTo: '/settings'});
        expect(listKey).toBeUndefined();
    });

    it('does not duplicate WORKSPACES_LIST when the incoming parsed state already includes it (idempotent)', () => {
        mockStubbedParsedState = makeParsedState(INCOMING_WITH_LIST);
        const result = handleReplaceFullscreenUnderRHP(makeExistingState(undefined), makeAction(), CONFIG_OPTIONS, stackRouter);

        const {names, index} = getWorkspaceNavInnerRoutes(result);
        expect(names).toEqual([SCREENS.WORKSPACES_LIST, NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR]);
        expect(index).toBe(1);
    });

    it('returns null (no-op) when there is no modal on top of the stack', () => {
        mockStubbedParsedState = makeParsedState(INCOMING_SPLIT_ONLY);
        const tabOnly = makeStackState([makeRoute(NAVIGATORS.TAB_NAVIGATOR, undefined, {index: 0, routes: [{name: NAVIGATORS.WORKSPACE_NAVIGATOR}]}, 'tab-nav-key')]);
        const result = handleReplaceFullscreenUnderRHP(tabOnly, makeAction(), CONFIG_OPTIONS, stackRouter);

        expect(result).toBeNull();
    });
});
