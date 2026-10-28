import getPlatform from '@libs/getPlatform';
import {
    clearPreInsertedOriginalTabRoute,
    consumePreMountReplaceOutcome,
    removeStalePreMountsFromResetAction,
    handleRemoveFullscreenUnderRHP,
    handleReplaceFullscreenUnderRHP,
} from '@libs/Navigation/AppNavigator/createRootStackNavigator/GetStateForActionHandlers';
import type {RemoveFullscreenUnderRHPActionType, ReplaceFullscreenUnderRHPActionType} from '@libs/Navigation/AppNavigator/createRootStackNavigator/types';
import {buildWideTabPreMount} from '@libs/Navigation/helpers/wideTabPreMount';
import type {TabStateWithPreloads} from '@libs/Navigation/helpers/wideTabPreMount';
import {markWideTabPreMountRouteKeyRevealed, setLiveWideTabPreMountRouteKey} from '@libs/Navigation/helpers/wideTabPreMountRouteKey';
import type {NavigationPartialRoute, NavigationStateRoute, ReportsSplitNavigatorParamList} from '@libs/Navigation/types';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import type {NavigationState, ParamListBase, PartialState, Router, RouterConfigOptions, StackActionType, StackNavigationState} from '@react-navigation/native';

import {CommonActions, StackRouter} from '@react-navigation/native';

import createMock from '../../../utils/createMock';

// Stub the linking parser so the test does not depend on the production linking config.
// Each test sets the parsed state (what getStateFromPath returns for the incoming route).
let mockStubbedParsedState: PartialState<NavigationState> | undefined;
jest.mock('@libs/Navigation/helpers/getStateFromPath', () => ({
    __esModule: true,
    default: jest.fn(() => mockStubbedParsedState),
}));
jest.mock('@libs/getPlatform', () => jest.fn());
const mockGetIsNarrowLayout = jest.fn(() => false);
jest.mock('@libs/getIsNarrowLayout', () => () => mockGetIsNarrowLayout());

const mockGetPlatform = jest.mocked(getPlatform);

type TestRoute = NavigationPartialRoute & Pick<NavigationStateRoute, 'key'>;

function makeRoute(name: string, params?: Record<string, unknown>, state?: PartialState<NavigationState>, key?: string): TestRoute {
    return createMock<TestRoute>({key: key ?? `${name}-key`, name, params, state});
}

function makeStackState(routes: TestRoute[]): StackNavigationState<ParamListBase> {
    return {
        key: 'root-stack',
        index: routes.length - 1,
        routeNames: routes.map((r) => r.name),
        routes,
        type: 'stack',
        stale: false,
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
const stackRouter = createMock<Router<StackNavigationState<ParamListBase>, CommonActions.Action | StackActionType>>({
    getRehydratedState: (partialState) => {
        if (partialState.stale !== false) {
            throw new Error('Expected the test router to receive a rehydrated navigation state.');
        }
        return partialState;
    },
});

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

const INCOMING_SPLIT_ONLY = [{name: NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR, params: {policyID: 'NEW'}}] satisfies PartialState<NavigationState>['routes'];
const INCOMING_WITH_LIST = [{name: SCREENS.WORKSPACES_LIST}, {name: NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR, params: {policyID: 'NEW'}}] satisfies PartialState<NavigationState>['routes'];

function makeRHPRoute(): TestRoute {
    return makeRoute(NAVIGATORS.RIGHT_MODAL_NAVIGATOR, undefined, undefined, 'rhp-key');
}

/**
 * Builds the existing root state: [TAB_NAVIGATOR(WORKSPACE_NAVIGATOR), RHP].
 * Pass `undefined` for workspaceNavNestedRoutes to model a WORKSPACE_NAVIGATOR that was never
 * mounted (no nested state) — e.g. a workspace created from Inbox.
 */
function makeExistingState(
    workspaceNavNestedRoutes: PartialState<NavigationState>['routes'] | undefined,
    workspaceNavIndex = 0,
    tabParams?: Record<string, unknown>,
): StackNavigationState<ParamListBase> {
    const workspaceNavRoute = {
        key: 'workspace-nav-key',
        name: NAVIGATORS.WORKSPACE_NAVIGATOR,
        ...(workspaceNavNestedRoutes ? {state: {index: workspaceNavIndex, routes: workspaceNavNestedRoutes}} : {}),
    };
    const tabNavRoute = makeRoute(NAVIGATORS.TAB_NAVIGATOR, tabParams, {index: 0, routes: [workspaceNavRoute]}, 'tab-nav-key');
    return makeStackState([tabNavRoute, makeRHPRoute()]);
}

function makeAction(shouldInsertPreMountBuffer?: boolean): ReplaceFullscreenUnderRHPActionType {
    return {
        type: CONST.NAVIGATION.ACTION_TYPE.REPLACE_FULLSCREEN_UNDER_RHP,
        payload: {route: ROUTES.WORKSPACE_INITIAL.getRoute('NEW'), shouldInsertPreMountBuffer},
    };
}

function getBufferRoute(result: StackNavigationState<ParamListBase> | null) {
    return result?.routes.find((r) => r.name === SCREENS.PRE_MOUNT_BUFFER);
}

function makeReportsParsedState(reportID: string): PartialState<NavigationState> {
    return {
        routes: [
            {
                name: NAVIGATORS.TAB_NAVIGATOR,
                state: {
                    index: 0,
                    routes: [
                        {
                            name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR,
                            state: {index: 0, routes: [{name: SCREENS.REPORT, params: {reportID}}]},
                        },
                    ],
                },
            },
        ],
    };
}

function makeReportsAction(reportID: string): ReplaceFullscreenUnderRHPActionType {
    return {
        type: CONST.NAVIGATION.ACTION_TYPE.REPLACE_FULLSCREEN_UNDER_RHP,
        payload: {route: ROUTES.REPORT_WITH_ID.getRoute(reportID)},
    };
}

function makeRemoveAction(expectedRouteName: string = NAVIGATORS.TAB_NAVIGATOR): RemoveFullscreenUnderRHPActionType {
    return {
        type: CONST.NAVIGATION.ACTION_TYPE.REMOVE_FULLSCREEN_UNDER_RHP,
        payload: {expectedRouteName},
    };
}

function makeExistingReportsState(reportRoutes: TestRoute[], reportIndex: number, isReportsTabFocused = true, rootRoutesBeforeTab: TestRoute[] = []): StackNavigationState<ParamListBase> {
    const reportsTabRoute = makeRoute(NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, undefined, {index: reportIndex, routes: reportRoutes}, 'reports-split-key');
    const searchTabRoute = makeRoute(NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, undefined, undefined, 'search-tab-key');
    const tabNavRoute = makeRoute(NAVIGATORS.TAB_NAVIGATOR, undefined, {index: isReportsTabFocused ? 0 : 1, routes: [reportsTabRoute, searchTabRoute]}, 'tab-nav-key');

    return makeStackState([...rootRoutesBeforeTab, tabNavRoute, makeRHPRoute()]);
}

function getReportsSplitState(result: StackNavigationState<ParamListBase> | null) {
    const tabRoute = result?.routes.findLast((route) => route.name === NAVIGATORS.TAB_NAVIGATOR);
    const reportsSplitRoute = tabRoute?.state?.routes.find((route) => route.name === NAVIGATORS.REPORTS_SPLIT_NAVIGATOR);
    return reportsSplitRoute?.state;
}

function getReportsSplitRouteKey(result: StackNavigationState<ParamListBase> | null) {
    const tabRoute = result?.routes.findLast((route) => route.name === NAVIGATORS.TAB_NAVIGATOR);
    return tabRoute?.state?.routes.find((route) => route.name === NAVIGATORS.REPORTS_SPLIT_NAVIGATOR)?.key;
}

function hasReportParams(params: unknown): params is ReportsSplitNavigatorParamList[typeof SCREENS.REPORT] {
    return typeof params === 'object' && params !== null && 'reportID' in params && typeof params.reportID === 'string';
}

function getReportIDs(result: StackNavigationState<ParamListBase> | null) {
    return getReportsSplitState(result)?.routes.map((route) => (hasReportParams(route.params) ? route.params.reportID : undefined));
}

function getWorkspaceNavInnerRoutes(result: StackNavigationState<ParamListBase> | null) {
    const tabRoute = result?.routes.find((r) => r.name === NAVIGATORS.TAB_NAVIGATOR);
    const tabState = tabRoute?.state;
    const workspaceNav = tabState?.routes.find((r) => r.name === NAVIGATORS.WORKSPACE_NAVIGATOR);
    const workspaceNavState = workspaceNav?.state;
    const list = workspaceNavState?.routes?.find((r) => r.name === SCREENS.WORKSPACES_LIST);
    return {
        names: workspaceNavState?.routes?.map((r) => r.name),
        index: workspaceNavState?.index,
        listKey: list?.key,
        listParams: list?.params,
        navigatorKey: workspaceNav?.key,
        splitParams: workspaceNavState?.routes?.find((r) => r.name === NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR)?.params,
        tabParams: tabRoute?.params,
    };
}

const staleDistanceRatesDeepLinkParams = {
    screen: NAVIGATORS.WORKSPACE_NAVIGATOR,
    params: {
        screen: NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR,
        params: {
            screen: SCREENS.WORKSPACE.DISTANCE_RATES,
            params: {policyID: 'OLD'},
        },
    },
};

const staleLongFormDeepLinkParams = {
    state: {
        index: 0,
        routes: [{name: NAVIGATORS.WORKSPACE_NAVIGATOR}],
    },
};

beforeEach(() => {
    clearPreInsertedOriginalTabRoute();
    mockGetPlatform.mockReturnValue(CONST.PLATFORM.IOS);
    mockGetIsNarrowLayout.mockReturnValue(false);
});

describe('handleReplaceFullscreenUnderRHP — focused Reports stack preservation', () => {
    it('preserves Inbox and the focused report without its key, then appends the destination report', () => {
        mockStubbedParsedState = makeReportsParsedState('B');
        const result = handleReplaceFullscreenUnderRHP(
            makeExistingReportsState([makeRoute(SCREENS.INBOX, undefined, undefined, 'inbox-key'), makeRoute(SCREENS.REPORT, {reportID: 'A'}, undefined, 'report-a-key')], 1),
            makeReportsAction('B'),
            CONFIG_OPTIONS,
            stackRouter,
        );

        const reportsState = getReportsSplitState(result);
        const routes = reportsState?.routes;
        expect(routes?.map((route) => route.name)).toEqual([SCREENS.INBOX, SCREENS.REPORT, SCREENS.REPORT]);
        expect(getReportIDs(result)).toEqual([undefined, 'A', 'B']);
        expect(reportsState?.index).toBe(2);
        expect(routes?.at(0)?.key).toBe('inbox-key');
        expect(routes?.at(1)?.key).toBeUndefined();
    });

    it('handles the no-sidebar shape when the focused report is at index zero', () => {
        mockStubbedParsedState = makeReportsParsedState('B');
        const earlierTabRoute = makeRoute(
            NAVIGATORS.TAB_NAVIGATOR,
            undefined,
            {index: 0, routes: [makeRoute(NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, undefined, undefined, 'earlier-search-key')]},
            'earlier-tab-key',
        );
        const originalState = makeExistingReportsState([makeRoute(SCREENS.REPORT, {reportID: 'A'}, undefined, 'report-a-key')], 0, true, [earlierTabRoute]);
        const result = handleReplaceFullscreenUnderRHP(originalState, makeReportsAction('B'), CONFIG_OPTIONS, stackRouter);

        const reportsState = getReportsSplitState(result);
        const routes = reportsState?.routes;
        expect(result?.routes.filter((route) => route.name === NAVIGATORS.TAB_NAVIGATOR)).toHaveLength(2);
        expect(result?.routes.at(0)).toEqual(earlierTabRoute);
        expect(getReportIDs(result)).toEqual(['A', 'B']);
        expect(reportsState?.index).toBe(1);
        expect(routes?.at(0)?.key).toBeUndefined();

        if (!result) {
            throw new Error('Expected the report pre-insert to return a navigation state');
        }
        const restoredState = handleRemoveFullscreenUnderRHP(result, makeRemoveAction(), CONFIG_OPTIONS, stackRouter);
        expect(restoredState?.routes.at(0)).toEqual(earlierTabRoute);
        expect(getReportIDs(restoredState)).toEqual(['A']);
        expect(getReportsSplitState(restoredState)?.routes.at(0)?.key).toBe('report-a-key');
    });

    it('drops forward history above the focused report', () => {
        mockStubbedParsedState = makeReportsParsedState('C');
        const result = handleReplaceFullscreenUnderRHP(
            makeExistingReportsState(
                [
                    makeRoute(SCREENS.INBOX, undefined, undefined, 'inbox-key'),
                    makeRoute(SCREENS.REPORT, {reportID: 'A'}, undefined, 'report-a-key'),
                    makeRoute(SCREENS.REPORT, {reportID: 'B'}, undefined, 'report-b-key'),
                ],
                1,
            ),
            makeReportsAction('C'),
            CONFIG_OPTIONS,
            stackRouter,
        );

        expect(getReportIDs(result)).toEqual([undefined, 'A', 'C']);
    });

    it('preserves history when skip-confirmation pre-inserts the already focused report without duplicating it', () => {
        mockStubbedParsedState = makeReportsParsedState('B');
        const result = handleReplaceFullscreenUnderRHP(
            makeExistingReportsState(
                [
                    makeRoute(SCREENS.INBOX, undefined, undefined, 'inbox-key'),
                    makeRoute(SCREENS.REPORT, {reportID: 'A'}, undefined, 'report-a-key'),
                    makeRoute(SCREENS.REPORT, {reportID: 'B'}, undefined, 'report-b-key'),
                ],
                2,
            ),
            makeReportsAction('B'),
            CONFIG_OPTIONS,
            stackRouter,
        );

        const reportIDs = getReportIDs(result);
        expect(reportIDs).toEqual([undefined, 'A', 'B']);
        expect(reportIDs?.filter((reportID) => reportID === 'B')).toHaveLength(1);
    });

    it('does not preserve the Reports stack when another tab is focused', () => {
        mockStubbedParsedState = makeReportsParsedState('B');
        const result = handleReplaceFullscreenUnderRHP(
            makeExistingReportsState([makeRoute(SCREENS.INBOX, undefined, undefined, 'inbox-key'), makeRoute(SCREENS.REPORT, {reportID: 'A'}, undefined, 'report-a-key')], 1, false),
            makeReportsAction('B'),
            CONFIG_OPTIONS,
            stackRouter,
        );

        expect(getReportIDs(result)).toEqual([undefined, 'B']);
    });

    it('keeps web behavior unchanged', () => {
        mockGetPlatform.mockReturnValue(CONST.PLATFORM.WEB);
        mockStubbedParsedState = makeReportsParsedState('B');
        const result = handleReplaceFullscreenUnderRHP(
            makeExistingReportsState([makeRoute(SCREENS.INBOX, undefined, undefined, 'inbox-key'), makeRoute(SCREENS.REPORT, {reportID: 'A'}, undefined, 'report-a-key')], 1),
            makeReportsAction('B'),
            CONFIG_OPTIONS,
            stackRouter,
        );

        expect(getReportIDs(result)).toEqual([undefined, 'B']);
    });

    it('drops the focused tab route key on wide layout when no pre-mount is revealed', () => {
        // Given a wide layout with the Reports tab focused on report A and no wide pre-mount
        mockGetPlatform.mockReturnValue(CONST.PLATFORM.WEB);
        mockGetIsNarrowLayout.mockReturnValue(false);
        mockStubbedParsedState = makeReportsParsedState('B');

        // When report B is put under the RHP
        const result = handleReplaceFullscreenUnderRHP(
            makeExistingReportsState([makeRoute(SCREENS.INBOX, undefined, undefined, 'inbox-key'), makeRoute(SCREENS.REPORT, {reportID: 'A'}, undefined, 'report-a-key')], 1),
            makeReportsAction('B'),
            CONFIG_OPTIONS,
            stackRouter,
        );

        // Then the Reports split route is keyless and remounts, so reveals that do not use a pre-mount behave as before
        expect(getReportsSplitRouteKey(result)).toBeUndefined();
        expect(getReportIDs(result)).toEqual([undefined, 'B']);
    });

    it('drops the focused tab route key on narrow layout so the destination mounts fresh behind the RHP (#90985)', () => {
        // Given a narrow layout with the Reports tab focused on report A
        mockGetPlatform.mockReturnValue(CONST.PLATFORM.WEB);
        mockGetIsNarrowLayout.mockReturnValue(true);
        mockStubbedParsedState = makeReportsParsedState('B');

        // When report B is pre-inserted under the RHP
        const result = handleReplaceFullscreenUnderRHP(
            makeExistingReportsState([makeRoute(SCREENS.INBOX, undefined, undefined, 'inbox-key'), makeRoute(SCREENS.REPORT, {reportID: 'A'}, undefined, 'report-a-key')], 1),
            makeReportsAction('B'),
            CONFIG_OPTIONS,
            stackRouter,
        );

        // Then the Reports split route is keyless, which forces a remount and avoids the previous page flashing
        expect(getReportsSplitRouteKey(result)).toBeUndefined();
    });

    it('reveals the wide pre-mounted report by giving the built destination its key, with the rest built as without it', () => {
        // Given a wide layout with report B pre-mounted under the focused report A
        mockGetPlatform.mockReturnValue(CONST.PLATFORM.WEB);
        mockStubbedParsedState = makeReportsParsedState('B');
        const state = makeExistingReportsState(
            [
                makeRoute(SCREENS.INBOX, undefined, undefined, 'inbox-key'),
                makeRoute(SCREENS.REPORT, {reportID: 'B'}, undefined, 'Report-wide-pre-mount-1'),
                makeRoute(SCREENS.REPORT, {reportID: 'A'}, undefined, 'report-a-key'),
            ],
            2,
        );
        const action: ReplaceFullscreenUnderRHPActionType = {...makeReportsAction('B'), payload: {...makeReportsAction('B').payload, preMountedRouteKey: 'Report-wide-pre-mount-1'}};

        // When report B is revealed under the RHP
        const result = handleReplaceFullscreenUnderRHP(state, action, CONFIG_OPTIONS, stackRouter);

        // Then the stack is the one the replace builds without a pre-mount, and only the destination reuses the mounted screen
        expect(getReportIDs(result)).toEqual([undefined, 'B']);
        expect(getReportsSplitState(result)?.routes.map((route) => route.key)).toEqual(['inbox-key', 'Report-wide-pre-mount-1']);
        expect(getReportsSplitRouteKey(result)).toBe('reports-split-key');

        // And the outcome says the pre-mounted screen was shown, so the reveal can end the live pre-mount
        expect(consumePreMountReplaceOutcome()).toEqual({routeKey: 'Report-wide-pre-mount-1', isRevealed: true});
    });

    it('reveals the wide pre-mount in the mounted stack state with the params of the built destination', () => {
        // Given a wide layout with a mounted Reports stack where report B was pre-mounted with params the reveal no longer asks for
        mockGetPlatform.mockReturnValue(CONST.PLATFORM.WEB);
        mockStubbedParsedState = makeReportsParsedState('B');
        const state = makeExistingReportsState(
            [
                makeRoute(SCREENS.INBOX, undefined, undefined, 'inbox-key'),
                makeRoute(SCREENS.REPORT, {reportID: 'B', reportActionID: 'old-action'}, undefined, 'Report-wide-pre-mount-5'),
                makeRoute(SCREENS.REPORT, {reportID: 'A'}, undefined, 'report-a-key'),
            ],
            2,
        );
        const reportsSplitState = getReportsSplitState(state);
        if (reportsSplitState) {
            Object.assign(reportsSplitState, {stale: false, key: 'reports-split-state-key'});
        }
        const action: ReplaceFullscreenUnderRHPActionType = {...makeReportsAction('B'), payload: {...makeReportsAction('B').payload, preMountedRouteKey: 'Report-wide-pre-mount-5'}};

        // When report B is revealed under the RHP
        const result = handleReplaceFullscreenUnderRHP(state, action, CONFIG_OPTIONS, stackRouter);

        // Then the mounted stack state is kept so its screens are not re-rendered, but the destination shows what the action asked for
        expect(getReportsSplitState(result)?.key).toBe('reports-split-state-key');
        expect(getReportsSplitState(result)?.routes.at(-1)?.key).toBe('Report-wide-pre-mount-5');
        expect(getReportsSplitState(result)?.routes.at(-1)?.params).toEqual({reportID: 'B'});
    });

    it('rebuilds the route snapshot history of the mounted stack from the revealed routes', () => {
        // Given a wide layout with a mounted stack whose route snapshot history still holds report A and an older params snapshot
        mockGetPlatform.mockReturnValue(CONST.PLATFORM.WEB);
        mockStubbedParsedState = makeReportsParsedState('B');
        const state = makeExistingReportsState(
            [
                makeRoute(SCREENS.INBOX, undefined, undefined, 'inbox-key'),
                makeRoute(SCREENS.REPORT, {reportID: 'B', reportActionID: 'old-action'}, undefined, 'Report-wide-pre-mount-8'),
                makeRoute(SCREENS.REPORT, {reportID: 'A'}, undefined, 'report-a-key'),
            ],
            2,
        );
        const reportsSplitState = getReportsSplitState(state);
        if (reportsSplitState) {
            Object.assign(reportsSplitState, {
                stale: false,
                key: 'reports-split-state-key',
                history: [
                    {key: 'inbox-key', name: SCREENS.INBOX},
                    {key: 'Report-wide-pre-mount-8', name: SCREENS.REPORT, params: {reportID: 'B', reportActionID: 'old-action'}},
                    {key: 'report-a-key', name: SCREENS.REPORT, params: {reportID: 'A'}},
                ],
            });
        }
        const action: ReplaceFullscreenUnderRHPActionType = {...makeReportsAction('B'), payload: {...makeReportsAction('B').payload, preMountedRouteKey: 'Report-wide-pre-mount-8'}};

        // When report B is revealed under the RHP
        const result = handleReplaceFullscreenUnderRHP(state, action, CONFIG_OPTIONS, stackRouter);

        // Then the history matches the revealed routes one to one, like a rehydrated stack, so back cannot land on the dropped report A
        const resultHistory: unknown[] = getReportsSplitState(result)?.history ?? [];
        expect(resultHistory).toEqual([expect.objectContaining({key: 'inbox-key'}), expect.objectContaining({key: 'Report-wide-pre-mount-8', params: {reportID: 'B'}})]);
    });

    it.each([CONST.PLATFORM.WEB, CONST.PLATFORM.IOS])('reveals the pre-mount with the key and params it was mounted with on %s', (platform) => {
        // Given a wide layout where report B was pre-mounted under the focused report A the way the submit flow builds it
        mockGetPlatform.mockReturnValue(platform);
        mockGetIsNarrowLayout.mockReturnValue(false);
        mockStubbedParsedState = makeReportsParsedState('B');
        const state = makeExistingReportsState([makeRoute(SCREENS.INBOX, undefined, undefined, 'inbox-key'), makeRoute(SCREENS.REPORT, {reportID: 'A'}, undefined, 'report-a-key')], 1);
        const tabRoute = state.routes.at(0);
        const reportsSplitState = getReportsSplitState(state);
        if (!tabRoute?.state || !reportsSplitState) {
            throw new Error('Expected the Reports tab to have a stack');
        }
        Object.assign(reportsSplitState, {stale: false, key: 'reports-split-state-key', routeNames: [SCREENS.INBOX, SCREENS.REPORT]});
        const target = createMock<NavigationPartialRoute>({name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, state: {index: 0, routes: [{name: SCREENS.REPORT, params: {reportID: 'B'}}]}});
        const preMount = buildWideTabPreMount(createMock<TabStateWithPreloads>({...tabRoute.state, key: 'tab-state', stale: false}), target, 'Report-wide-pre-mount-7');
        const preMountedRoute = preMount?.tabState.routes.at(0)?.state?.routes.find((route) => route.key === 'Report-wide-pre-mount-7');
        Object.assign(tabRoute, {state: preMount?.tabState});
        const action: ReplaceFullscreenUnderRHPActionType = {...makeReportsAction('B'), payload: {...makeReportsAction('B').payload, preMountedRouteKey: 'Report-wide-pre-mount-7'}};

        // When report B is revealed under the RHP
        const result = handleReplaceFullscreenUnderRHP(state, action, CONFIG_OPTIONS, stackRouter);
        const destination = getReportsSplitState(result)?.routes.at(-1);

        // Then the destination has the same key and params, which ReportFetchHandler needs to skip the reveal fetch and keep the unread marker
        expect(preMountedRoute).toBeDefined();
        expect(destination?.key).toBe(preMountedRoute?.key);
        expect(destination?.params).toEqual(preMountedRoute?.params);
    });

    it('drops the pre-mount kept in the preserved native history, so the revealed destination is its only copy', () => {
        // Given a wide native layout with the Reports tab focused on report A and report B pre-mounted under it
        mockGetPlatform.mockReturnValue(CONST.PLATFORM.IOS);
        mockGetIsNarrowLayout.mockReturnValue(false);
        mockStubbedParsedState = makeReportsParsedState('B');
        const state = makeExistingReportsState(
            [
                makeRoute(SCREENS.INBOX, undefined, undefined, 'inbox-key'),
                makeRoute(SCREENS.REPORT, {reportID: 'B'}, undefined, 'Report-wide-pre-mount-6'),
                makeRoute(SCREENS.REPORT, {reportID: 'A'}, undefined, 'report-a-key'),
            ],
            2,
        );
        const action: ReplaceFullscreenUnderRHPActionType = {...makeReportsAction('B'), payload: {...makeReportsAction('B').payload, preMountedRouteKey: 'Report-wide-pre-mount-6'}};

        // When report B is revealed under the RHP, which on native keeps the history through the focused report A
        const result = handleReplaceFullscreenUnderRHP(state, action, CONFIG_OPTIONS, stackRouter);

        // Then the pre-mount appears only as the destination, since duplicate keys would let the navigator show the wrong screen
        expect(getReportIDs(result)).toEqual([undefined, 'A', 'B']);
        expect(getReportsSplitState(result)?.routes.map((route) => route.key)).toEqual(['inbox-key', undefined, 'Report-wide-pre-mount-6']);
    });

    it('takes an unrevealed pre-mount out of the preserved native history', () => {
        // Given a wide native layout with a pre-mount under the focused report A that does not match the revealed destination
        mockGetPlatform.mockReturnValue(CONST.PLATFORM.IOS);
        mockGetIsNarrowLayout.mockReturnValue(false);
        mockStubbedParsedState = makeReportsParsedState('B');
        const state = makeExistingReportsState(
            [
                makeRoute(SCREENS.INBOX, undefined, undefined, 'inbox-key'),
                makeRoute(SCREENS.INBOX, undefined, undefined, 'Report-wide-pre-mount-7'),
                makeRoute(SCREENS.REPORT, {reportID: 'A'}, undefined, 'report-a-key'),
            ],
            2,
        );
        const action: ReplaceFullscreenUnderRHPActionType = {...makeReportsAction('B'), payload: {...makeReportsAction('B').payload, preMountedRouteKey: 'Report-wide-pre-mount-7'}};

        // When report B is revealed under the RHP, which on native keeps the history through the focused report A
        const result = handleReplaceFullscreenUnderRHP(state, action, CONFIG_OPTIONS, stackRouter);

        // Then the pre-mount is gone, since the reveal forgets it and it would otherwise stay hidden in the stack
        expect(getReportsSplitState(result)?.routes.map((route) => route.key)).not.toContain('Report-wide-pre-mount-7');
        expect(getReportIDs(result)).toEqual([undefined, 'A', 'B']);
        expect(consumePreMountReplaceOutcome()).toEqual({routeKey: 'Report-wide-pre-mount-7', isRevealed: false});
    });

    it('reveals a report pre-mounted in a covered tab and stops keeping that tab preloaded', () => {
        // Given the Search tab focused and report B pre-mounted on top of the covered Reports tab, which is marked preloaded
        mockGetPlatform.mockReturnValue(CONST.PLATFORM.WEB);
        mockStubbedParsedState = makeReportsParsedState('B');
        const existing = makeExistingReportsState(
            [makeRoute(SCREENS.INBOX, undefined, undefined, 'inbox-key'), makeRoute(SCREENS.REPORT, {reportID: 'B'}, undefined, 'Report-wide-pre-mount-2')],
            1,
            false,
        );
        const tabNavigatorState = existing.routes.at(0)?.state;
        if (tabNavigatorState) {
            Object.assign(tabNavigatorState, {preloadedRouteKeys: ['reports-split-key']});
        }
        const action: ReplaceFullscreenUnderRHPActionType = {...makeReportsAction('B'), payload: {...makeReportsAction('B').payload, preMountedRouteKey: 'Report-wide-pre-mount-2'}};

        // When report B is revealed under the RHP
        const result = handleReplaceFullscreenUnderRHP(existing, action, CONFIG_OPTIONS, stackRouter);
        const resultTabState: {index?: number; preloadedRouteKeys?: string[]} | undefined = result?.routes.at(0)?.state;

        // Then the Reports tab is focused on the mounted report, and it may freeze again once the user leaves it
        expect(resultTabState?.index).toBe(0);
        expect(getReportsSplitState(result)?.routes.at(-1)?.key).toBe('Report-wide-pre-mount-2');
        expect(resultTabState?.preloadedRouteKeys).toEqual([]);
    });

    it('adds the destination tab to the tab history on wide layout, like a tab switch', () => {
        // Given a wide layout with the Search tab focused and in the tab history, and report B pre-mounted in the covered Reports tab
        mockGetPlatform.mockReturnValue(CONST.PLATFORM.WEB);
        mockGetIsNarrowLayout.mockReturnValue(false);
        mockStubbedParsedState = makeReportsParsedState('B');
        const existing = makeExistingReportsState(
            [makeRoute(SCREENS.INBOX, undefined, undefined, 'inbox-key'), makeRoute(SCREENS.REPORT, {reportID: 'B'}, undefined, 'Report-wide-pre-mount-3')],
            1,
            false,
        );
        const tabNavigatorState = existing.routes.at(0)?.state;
        if (tabNavigatorState) {
            Object.assign(tabNavigatorState, {history: [{type: 'route', key: 'search-tab-key'}]});
        }
        const action: ReplaceFullscreenUnderRHPActionType = {...makeReportsAction('B'), payload: {...makeReportsAction('B').payload, preMountedRouteKey: 'Report-wide-pre-mount-3'}};

        // When report B in the Reports tab is revealed under the RHP
        const result = handleReplaceFullscreenUnderRHP(existing, action, CONFIG_OPTIONS, stackRouter);
        const resultHistory: unknown[] = result?.routes.at(0)?.state?.history ?? [];

        // Then the history ends on the Reports tab, so tab back goes to Search instead of treating Reports as never visited
        expect(resultHistory).toEqual([expect.objectContaining({key: 'search-tab-key'}), expect.objectContaining({key: 'reports-split-key'})]);
    });

    it('keeps the tab history as it is on wide layout when the destination is in the focused tab', () => {
        // Given a wide layout with the Reports tab focused on report A, last in the tab history, and report B pre-mounted under A
        mockGetPlatform.mockReturnValue(CONST.PLATFORM.WEB);
        mockGetIsNarrowLayout.mockReturnValue(false);
        mockStubbedParsedState = makeReportsParsedState('B');
        const existing = makeExistingReportsState(
            [
                makeRoute(SCREENS.INBOX, undefined, undefined, 'inbox-key'),
                makeRoute(SCREENS.REPORT, {reportID: 'B'}, undefined, 'Report-wide-pre-mount-4'),
                makeRoute(SCREENS.REPORT, {reportID: 'A'}, undefined, 'report-a-key'),
            ],
            2,
        );
        const tabNavigatorState = existing.routes.at(0)?.state;
        if (tabNavigatorState) {
            Object.assign(tabNavigatorState, {
                history: [
                    {type: 'route', key: 'search-tab-key'},
                    {type: 'route', key: 'reports-split-key'},
                ],
            });
        }

        const action: ReplaceFullscreenUnderRHPActionType = {...makeReportsAction('B'), payload: {...makeReportsAction('B').payload, preMountedRouteKey: 'Report-wide-pre-mount-4'}};

        // When report B in the same tab is revealed under the RHP
        const result = handleReplaceFullscreenUnderRHP(existing, action, CONFIG_OPTIONS, stackRouter);
        const resultHistory: unknown[] = result?.routes.at(0)?.state?.history ?? [];

        // Then no duplicate entry is added, since the user did not switch tabs
        expect(resultHistory).toEqual([expect.objectContaining({key: 'search-tab-key'}), expect.objectContaining({key: 'reports-split-key'})]);
    });

    it('replaces without the pre-mount when its screen is no longer in the destination tab', () => {
        // Given a wide layout where the pre-mounted report was dropped before the reveal
        mockGetPlatform.mockReturnValue(CONST.PLATFORM.WEB);
        mockStubbedParsedState = makeReportsParsedState('B');
        const existing = makeExistingReportsState([makeRoute(SCREENS.INBOX, undefined, undefined, 'inbox-key'), makeRoute(SCREENS.REPORT, {reportID: 'A'}, undefined, 'report-a-key')], 1);
        const action: ReplaceFullscreenUnderRHPActionType = {...makeReportsAction('B'), payload: {...makeReportsAction('B').payload, preMountedRouteKey: 'Report-wide-pre-mount-gone'}};

        // When the destination is revealed under the RHP
        const result = handleReplaceFullscreenUnderRHP(existing, action, CONFIG_OPTIONS, stackRouter);

        // Then the regular in-place tab update runs, with a fresh destination route
        expect(getReportsSplitRouteKey(result)).toBe('reports-split-key');
        expect(getReportIDs(result)).toEqual([undefined, 'B']);
        expect(getReportsSplitState(result)?.routes.at(-1)?.key).toBeUndefined();

        // And the outcome says the pre-mount was not shown, so it is not marked revealed
        expect(consumePreMountReplaceOutcome()).toEqual({routeKey: 'Report-wide-pre-mount-gone', isRevealed: false});
    });

    it('stops keeping the destination tab preloaded when the pre-mount is gone before a cross-tab reveal', () => {
        // Given the Search tab focused and the covered Reports tab still marked preloaded, but its pre-mounted report already removed
        mockGetPlatform.mockReturnValue(CONST.PLATFORM.WEB);
        mockStubbedParsedState = makeReportsParsedState('B');
        const existing = makeExistingReportsState(
            [makeRoute(SCREENS.INBOX, undefined, undefined, 'inbox-key'), makeRoute(SCREENS.REPORT, {reportID: 'A'}, undefined, 'report-a-key')],
            1,
            false,
        );
        const tabNavigatorState = existing.routes.at(0)?.state;
        if (tabNavigatorState) {
            Object.assign(tabNavigatorState, {preloadedRouteKeys: ['reports-split-key']});
        }
        const action: ReplaceFullscreenUnderRHPActionType = {...makeReportsAction('B'), payload: {...makeReportsAction('B').payload, preMountedRouteKey: 'Report-wide-pre-mount-gone'}};

        // When report B is revealed under the RHP without the pre-mount
        const result = handleReplaceFullscreenUnderRHP(existing, action, CONFIG_OPTIONS, stackRouter);
        const resultTabState: {index?: number; preloadedRouteKeys?: string[]} | undefined = result?.routes.at(0)?.state;

        // Then the focused Reports tab leaves the preload list, otherwise its screens keep skipping their fetch and read effects
        expect(resultTabState?.index).toBe(0);
        expect(resultTabState?.preloadedRouteKeys).toEqual([]);
    });

    it('restores the untouched original Reports stack when the user cancels', () => {
        mockStubbedParsedState = makeReportsParsedState('B');
        const originalState = makeExistingReportsState(
            [makeRoute(SCREENS.INBOX, undefined, undefined, 'inbox-key'), makeRoute(SCREENS.REPORT, {reportID: 'A'}, undefined, 'report-a-key')],
            1,
        );
        const preInsertedState = handleReplaceFullscreenUnderRHP(originalState, makeReportsAction('B'), CONFIG_OPTIONS, stackRouter);
        if (!preInsertedState) {
            throw new Error('Expected the report pre-insert to return a navigation state');
        }
        const restoredState = handleRemoveFullscreenUnderRHP(preInsertedState, makeRemoveAction(), CONFIG_OPTIONS, stackRouter);
        const routes = getReportsSplitState(restoredState)?.routes;
        expect(getReportIDs(restoredState)).toEqual([undefined, 'A']);
        expect(routes?.at(0)?.key).toBe('inbox-key');
        expect(routes?.at(1)?.key).toBe('report-a-key');
    });
});

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
        // Given a narrow layout, where the push transition would flash on an in-place update
        mockGetIsNarrowLayout.mockReturnValue(true);
        mockStubbedParsedState = makeParsedState(INCOMING_SPLIT_ONLY);
        // makeExistingState gives the workspace navigator route the key 'workspace-nav-key'.
        const existing = makeExistingState([makeRoute(SCREENS.WORKSPACES_LIST, undefined, undefined, 'list-key')], 0);

        // When the workspace split is revealed under the RHP
        const result = handleReplaceFullscreenUnderRHP(existing, makeAction(), CONFIG_OPTIONS, stackRouter);

        // Then the focused tab route is marked for remount by dropping its key; TabRouter.getRehydratedState()
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

    it('removes stale distance-settings deep-link hints when revealing a newly created workspace', () => {
        mockStubbedParsedState = makeParsedState(INCOMING_SPLIT_ONLY);
        const existing = makeExistingState([makeRoute(SCREENS.WORKSPACES_LIST), makeRoute(NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR, {policyID: 'OLD'})], 1, staleDistanceRatesDeepLinkParams);
        const result = handleReplaceFullscreenUnderRHP(existing, makeAction(), CONFIG_OPTIONS, stackRouter);

        const {splitParams, tabParams} = getWorkspaceNavInnerRoutes(result);
        expect(splitParams).toEqual({policyID: 'NEW'});
        expect(tabParams).toBeUndefined();
    });

    it('removes a stale long-form deep-link hint when revealing a newly created workspace', () => {
        mockStubbedParsedState = makeParsedState(INCOMING_SPLIT_ONLY);
        const existing = makeExistingState([makeRoute(SCREENS.WORKSPACES_LIST), makeRoute(NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR, {policyID: 'OLD'})], 1, staleLongFormDeepLinkParams);
        const result = handleReplaceFullscreenUnderRHP(existing, makeAction(), CONFIG_OPTIONS, stackRouter);

        const {splitParams, tabParams} = getWorkspaceNavInnerRoutes(result);
        expect(splitParams).toEqual({policyID: 'NEW'});
        expect(tabParams).toBeUndefined();
    });

    it('does not replay stale distance-settings hints across repeated workspace creation', () => {
        mockStubbedParsedState = makeParsedState(INCOMING_SPLIT_ONLY);
        const firstResult = handleReplaceFullscreenUnderRHP(
            makeExistingState([makeRoute(SCREENS.WORKSPACES_LIST), makeRoute(NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR, {policyID: 'OLD'})], 1, staleDistanceRatesDeepLinkParams),
            makeAction(),
            CONFIG_OPTIONS,
            stackRouter,
        );
        expect(getWorkspaceNavInnerRoutes(firstResult).tabParams).toBeUndefined();

        const stateBeforeSecondCreate = makeExistingState(
            [makeRoute(SCREENS.WORKSPACES_LIST), makeRoute(NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR, {policyID: 'NEW'})],
            1,
            staleDistanceRatesDeepLinkParams,
        );
        mockStubbedParsedState = makeParsedState([{name: NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR, params: {policyID: 'SECOND'}}]);

        const secondResult = handleReplaceFullscreenUnderRHP(stateBeforeSecondCreate, makeAction(), CONFIG_OPTIONS, stackRouter);

        const {splitParams, tabParams} = getWorkspaceNavInnerRoutes(secondResult);
        expect(splitParams).toEqual({policyID: 'SECOND'});
        expect(tabParams).toBeUndefined();
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

describe('removeStalePreMountsFromResetAction', () => {
    const staleKey = 'Report-wide-pre-mount-1';
    const liveKey = 'Report-wide-pre-mount-2';

    function makeResetWithReportsStack(reportRoutes: TestRoute[], reportIndex: number) {
        const reportsTabRoute = makeRoute(NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, undefined, {index: reportIndex, routes: reportRoutes}, 'reports-split-key');
        return CommonActions.reset({index: 1, routes: [makeRoute(NAVIGATORS.TAB_NAVIGATOR, undefined, {index: 0, routes: [reportsTabRoute]}, 'tab-nav-key'), makeRHPRoute()]});
    }

    type ResetStackState = {routes: Array<{key?: string; state?: unknown}>; index?: number};

    function isResetStackState(state: unknown): state is ResetStackState {
        return typeof state === 'object' && state !== null && 'routes' in state && Array.isArray(state.routes);
    }

    function getResetReportsStack(action: ReturnType<typeof removeStalePreMountsFromResetAction>) {
        const payload = action.type === CONST.NAVIGATION.ACTION_TYPE.RESET ? action.payload : undefined;
        const tabRoute = payload?.routes.at(0);
        const tabState = tabRoute && 'state' in tabRoute ? tabRoute.state : undefined;
        const reportsStack = isResetStackState(tabState) ? tabState.routes.at(0)?.state : undefined;
        return isResetStackState(reportsStack) ? reportsStack : undefined;
    }

    afterEach(() => {
        setLiveWideTabPreMountRouteKey(undefined);
    });

    it('drops a pre-mount restored from a saved browser history entry and keeps focus on the same screen', () => {
        // Given browser forward resetting to a saved state that still holds an old pre-mount under the focused report
        const action = makeResetWithReportsStack(
            [
                makeRoute(SCREENS.INBOX, undefined, undefined, 'inbox-key'),
                makeRoute(SCREENS.REPORT, {reportID: 'B'}, undefined, staleKey),
                makeRoute(SCREENS.REPORT, {reportID: 'A'}, undefined, 'a-key'),
            ],
            2,
        );

        // When the root router sanitizes the RESET
        const reportsStack = getResetReportsStack(removeStalePreMountsFromResetAction(action));

        // Then the stale pre-mount is gone, so it cannot stay mounted and hidden with nothing left to remove it
        expect(reportsStack?.routes.map((route) => route.key)).toEqual(['inbox-key', 'a-key']);
        expect(reportsStack?.index).toBe(1);
    });

    it('drops the state of a tab that held only a stale pre-mount, so the tab builds its initial route again', () => {
        // Given a saved state where a never-visited tab was built only for an old pre-mount
        const action = makeResetWithReportsStack([makeRoute(SCREENS.REPORT, {reportID: 'B'}, undefined, staleKey)], 0);

        // When the root router sanitizes the RESET
        const result = removeStalePreMountsFromResetAction(action);

        // Then the tab has no state instead of an empty routes list, which no navigator can render
        const payload = result.type === CONST.NAVIGATION.ACTION_TYPE.RESET ? result.payload : undefined;
        const tabRoute = payload?.routes.at(0);
        const tabState = tabRoute && 'state' in tabRoute ? tabRoute.state : undefined;
        const reportsTabRoute = isResetStackState(tabState) ? tabState.routes.at(0) : undefined;
        expect(reportsTabRoute?.key).toBe('reports-split-key');
        expect(reportsTabRoute?.state).toBeUndefined();
    });

    it('drops a stale pre-mount from the top of a covered tab and focuses the screen under it', () => {
        // Given a saved state where an old pre-mount sits on top of a tab that was covered when it was saved
        const action = makeResetWithReportsStack([makeRoute(SCREENS.INBOX, undefined, undefined, 'inbox-key'), makeRoute(SCREENS.REPORT, {reportID: 'B'}, undefined, staleKey)], 1);

        // When the root router sanitizes the RESET
        const reportsStack = getResetReportsStack(removeStalePreMountsFromResetAction(action));

        // Then the tab is back to the stack it had before the pre-mount
        expect(reportsStack?.routes.map((route) => route.key)).toEqual(['inbox-key']);
        expect(reportsStack?.index).toBe(0);
    });

    it('keeps the live pre-mount and leaves other actions untouched', () => {
        // Given a RESET that holds the pre-mount the current flow still owns
        setLiveWideTabPreMountRouteKey(liveKey);
        const action = makeResetWithReportsStack([makeRoute(SCREENS.INBOX, undefined, undefined, 'inbox-key'), makeRoute(SCREENS.REPORT, {reportID: 'B'}, undefined, liveKey)], 1);
        const goBack = CommonActions.goBack();

        // When both go through the sanitizer
        // Then neither changes, because only pre-mounts nobody owns anymore are dropped
        expect(removeStalePreMountsFromResetAction(action)).toBe(action);
        expect(removeStalePreMountsFromResetAction(goBack)).toBe(goBack);
    });

    it('keeps a revealed pre-mount, which is a regular screen after submit', () => {
        // Given a pre-mount that a submit revealed, so browser forward can restore it as the visible report
        const revealedKey = 'Report-wide-pre-mount-3';
        markWideTabPreMountRouteKeyRevealed(revealedKey);
        const action = makeResetWithReportsStack([makeRoute(SCREENS.INBOX, undefined, undefined, 'inbox-key'), makeRoute(SCREENS.REPORT, {reportID: 'B'}, undefined, revealedKey)], 1);

        // When the root router sanitizes the RESET
        // Then the route survives, or the restored page would lose the report it shows
        expect(removeStalePreMountsFromResetAction(action)).toBe(action);
    });

    it('drops a revealed pre-mount from a history entry saved before the reveal, where it is still under its covering report', () => {
        // Given a pre-mount of report B mounted under report A and revealed, and browser history returning to an entry saved before that
        const revealedKey = 'Report-wide-pre-mount-4';
        markWideTabPreMountRouteKeyRevealed(revealedKey, 'a-key');
        const action = makeResetWithReportsStack(
            [
                makeRoute(SCREENS.INBOX, undefined, undefined, 'inbox-key'),
                makeRoute(SCREENS.REPORT, {reportID: 'B'}, undefined, revealedKey),
                makeRoute(SCREENS.REPORT, {reportID: 'A'}, undefined, 'a-key'),
            ],
            2,
        );

        // When the root router sanitizes the RESET
        const reportsStack = getResetReportsStack(removeStalePreMountsFromResetAction(action));

        // Then report B is gone and report A stays focused, so in-app back from A does not open a report the user never opened there
        expect(reportsStack?.routes.map((route) => route.key)).toEqual(['inbox-key', 'a-key']);
        expect(reportsStack?.index).toBe(1);
    });

    it('drops a cross-tab revealed pre-mount from a history entry saved before the reveal, where its RHP is still open', () => {
        // Given report B pre-mounted on top of a covered Reports tab behind the RHP and revealed, so no screen was above it
        const revealedKey = 'Report-wide-pre-mount-8';
        markWideTabPreMountRouteKeyRevealed(revealedKey, undefined, 'rhp-key');
        const action = makeResetWithReportsStack([makeRoute(SCREENS.INBOX, undefined, undefined, 'inbox-key'), makeRoute(SCREENS.REPORT, {reportID: 'B'}, undefined, revealedKey)], 1);

        // When browser back resets to an entry saved before the reveal, which still holds that RHP
        const reportsStack = getResetReportsStack(removeStalePreMountsFromResetAction(action));

        // Then report B is gone, so selecting the Reports tab later does not show a screen that entry never had
        expect(reportsStack?.routes.map((route) => route.key)).toEqual(['inbox-key']);
        expect(reportsStack?.index).toBe(0);
    });

    it('keeps a cross-tab revealed pre-mount once the RHP it was mounted behind is gone', () => {
        // Given report B revealed from behind an RHP that was closed by the reveal, and a later entry with another RHP open
        const revealedKey = 'Report-wide-pre-mount-9';
        markWideTabPreMountRouteKeyRevealed(revealedKey, undefined, 'closed-rhp-key');
        const action = makeResetWithReportsStack([makeRoute(SCREENS.INBOX, undefined, undefined, 'inbox-key'), makeRoute(SCREENS.REPORT, {reportID: 'B'}, undefined, revealedKey)], 1);

        // When the root router sanitizes the RESET
        // Then nothing changes, because report B is a regular screen after the reveal
        expect(removeStalePreMountsFromResetAction(action)).toBe(action);
    });

    it('keeps a revealed pre-mount that another report was opened on top of after the reveal', () => {
        // Given a pre-mount of report B mounted under report A and revealed, and report C opened on top of B afterwards
        const revealedKey = 'Report-wide-pre-mount-5';
        markWideTabPreMountRouteKeyRevealed(revealedKey, 'a-key');
        const action = makeResetWithReportsStack(
            [
                makeRoute(SCREENS.INBOX, undefined, undefined, 'inbox-key'),
                makeRoute(SCREENS.REPORT, {reportID: 'B'}, undefined, revealedKey),
                makeRoute(SCREENS.REPORT, {reportID: 'C'}, undefined, 'c-key'),
            ],
            2,
        );

        // When the root router sanitizes the RESET
        // Then nothing changes, because only report A right above B means the entry is from before the reveal
        expect(removeStalePreMountsFromResetAction(action)).toBe(action);
    });
});

describe('handleRemoveFullscreenUnderRHP — Share modal host', () => {
    it('restores the original tab route when the Share modal, not the RHP, is on top', () => {
        // Given a tab-switch pre-insert performed under the Share modal (#100767)
        mockStubbedParsedState = makeParsedState(INCOMING_SPLIT_ONLY);
        const shareRoute = makeRoute(NAVIGATORS.SHARE_MODAL_NAVIGATOR, undefined, undefined, 'share-key');
        const originalTabRoute = makeRoute(NAVIGATORS.TAB_NAVIGATOR, undefined, {index: 0, routes: [{key: 'workspace-nav-key', name: NAVIGATORS.WORKSPACE_NAVIGATOR}]}, 'tab-nav-key');
        const existingState = makeStackState([originalTabRoute, shareRoute]);
        const preInsertedState = handleReplaceFullscreenUnderRHP(existingState, makeAction(true), CONFIG_OPTIONS, stackRouter);
        if (!preInsertedState) {
            throw new Error('Expected the pre-insert to return a navigation state');
        }
        expect(getBufferRoute(preInsertedState)).toBeDefined();

        // When the user backs out and the teardown action is dispatched
        const restoredState = handleRemoveFullscreenUnderRHP(preInsertedState, makeRemoveAction(), CONFIG_OPTIONS, stackRouter);

        // Then the handler does not bail: the buffer is gone and the original tab route is back under the Share modal
        expect(restoredState).not.toBeNull();
        expect(getBufferRoute(restoredState)).toBeUndefined();
        expect(restoredState?.routes.map((r) => r.name)).toEqual([NAVIGATORS.TAB_NAVIGATOR, NAVIGATORS.SHARE_MODAL_NAVIGATOR]);
        expect(restoredState?.routes.at(0)?.key).toBe('tab-nav-key');
    });
});

describe('handleReplaceFullscreenUnderRHP / handleRemoveFullscreenUnderRHP — shouldInsertPreMountBuffer', () => {
    it('inserts the buffer route directly under the RHP on the tab-switch path when shouldInsertPreMountBuffer is true', () => {
        // Given a tab-switch pre-insert that needs protection from native RHP dismissal
        mockStubbedParsedState = makeParsedState(INCOMING_SPLIT_ONLY);
        // When the root state handler replaces the fullscreen destination
        const result = handleReplaceFullscreenUnderRHP(makeExistingState(undefined), makeAction(true), CONFIG_OPTIONS, stackRouter);

        // Then the buffer sits next to the RHP so it intercepts an interrupted transition
        expect(getBufferRoute(result)?.key).toBe(`pre-mount-buffer-${makeRHPRoute().key}`);
        expect(result?.routes.at(-2)?.name).toBe(SCREENS.PRE_MOUNT_BUFFER);
        expect(result?.routes.at(-1)?.name).toBe(NAVIGATORS.RIGHT_MODAL_NAVIGATOR);
    });

    it('does not insert a buffer route on the tab-switch path when shouldInsertPreMountBuffer is false/undefined', () => {
        // Given a tab-switch pre-insert that does not need swipe-dismiss protection
        mockStubbedParsedState = makeParsedState(INCOMING_SPLIT_ONLY);
        // When the root state handler replaces the fullscreen destination
        const result = handleReplaceFullscreenUnderRHP(makeExistingState(undefined), makeAction(false), CONFIG_OPTIONS, stackRouter);

        // Then no buffer is added because the caller opted out of recovery routing
        expect(getBufferRoute(result)).toBeUndefined();
        expect(result?.routes.at(-1)?.name).toBe(NAVIGATORS.RIGHT_MODAL_NAVIGATOR);
    });

    it('inserts the buffer route directly under the RHP on the push path when shouldInsertPreMountBuffer is true', () => {
        // Given a pushed fullscreen destination that needs protection from RHP dismissal
        const routeNames = [NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, NAVIGATORS.RIGHT_MODAL_NAVIGATOR];
        const realStackRouter = StackRouter({});
        const configOptions: RouterConfigOptions = {routeNames, routeParamList: {}, routeGetIdList: {}};
        mockStubbedParsedState = {routes: [{name: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR}]};
        const existing = makeStackState([
            makeRoute(NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, undefined, undefined, 'search-key'),
            makeRoute(NAVIGATORS.RIGHT_MODAL_NAVIGATOR, undefined, undefined, 'rhp-key'),
        ]);

        // When the root state handler inserts the pushed destination
        const result = handleReplaceFullscreenUnderRHP(existing, makeAction(true), configOptions, realStackRouter);

        // Then the buffer is adjacent to the RHP so recovery can remove the speculative push
        expect(getBufferRoute(result)?.key).toBe('pre-mount-buffer-rhp-key');
        expect(result?.routes.at(-2)?.name).toBe(SCREENS.PRE_MOUNT_BUFFER);
        expect(result?.routes.at(-1)?.name).toBe(NAVIGATORS.RIGHT_MODAL_NAVIGATOR);
    });

    it('does not insert a buffer route on the push path when shouldInsertPreMountBuffer is false/undefined', () => {
        // Given a pushed fullscreen destination without swipe-dismiss buffering enabled
        const routeNames = [NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, NAVIGATORS.RIGHT_MODAL_NAVIGATOR];
        const realStackRouter = StackRouter({});
        const configOptions: RouterConfigOptions = {routeNames, routeParamList: {}, routeGetIdList: {}};
        mockStubbedParsedState = {routes: [{name: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR}]};
        const existing = makeStackState([
            makeRoute(NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, undefined, undefined, 'search-key'),
            makeRoute(NAVIGATORS.RIGHT_MODAL_NAVIGATOR, undefined, undefined, 'rhp-key'),
        ]);

        // When the root state handler inserts the pushed destination
        const result = handleReplaceFullscreenUnderRHP(existing, makeAction(false), configOptions, realStackRouter);

        // Then the route stack stays buffer-free because recovery was not requested
        expect(getBufferRoute(result)).toBeUndefined();
        expect(result?.routes.at(-1)?.name).toBe(NAVIGATORS.RIGHT_MODAL_NAVIGATOR);
    });

    it('cancel (tab restore) drops any buffer route left between the restored tab and the RHP', () => {
        // Given a tab-switch buffer route that's still around at cancel time (normally stripped earlier;
        // this is a defensive check in case that ever stops happening)
        mockStubbedParsedState = makeParsedState(INCOMING_SPLIT_ONLY);
        const insertResult = handleReplaceFullscreenUnderRHP(makeExistingState(undefined), makeAction(true), CONFIG_OPTIONS, stackRouter);
        expect(getBufferRoute(insertResult)).not.toBeUndefined();
        if (!insertResult) {
            throw new Error('Expected handleReplaceFullscreenUnderRHP to return a state.');
        }

        // When the root handler restores the original tab after cancellation
        const removeResult = handleRemoveFullscreenUnderRHP(insertResult, makeRemoveAction(NAVIGATORS.WORKSPACE_NAVIGATOR), CONFIG_OPTIONS, stackRouter);

        // Then the leftover buffer is discarded so it cannot surface after the RHP closes
        expect(getBufferRoute(removeResult)).toBeUndefined();
        expect(removeResult?.routes.at(-1)?.name).toBe(NAVIGATORS.RIGHT_MODAL_NAVIGATOR);
    });
});
