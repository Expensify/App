import {CommonActions} from '@react-navigation/native';
import type {NavigationRoute, ParamListBase, PartialState, Router, RouterConfigOptions, StackNavigationState} from '@react-navigation/native';
import addPushParamsRouterExtension from '@libs/Navigation/AppNavigator/routerExtensions/addPushParamsRouterExtension';
import type {CustomHistoryEntry, HistoryStackNavigatorAction} from '@libs/Navigation/AppNavigator/routerExtensions/types';
import type {PlatformStackRouterOptions} from '@libs/Navigation/PlatformStackNavigation/types';
import CONST from '@src/CONST';

type TestState = StackNavigationState<ParamListBase> & {history?: CustomHistoryEntry[]};

function makeRoute(name: string, key: string, params?: Record<string, unknown>): NavigationRoute<ParamListBase, string> {
    return {key, name, params} as NavigationRoute<ParamListBase, string>;
}

function makeState(routes: Array<NavigationRoute<ParamListBase, string>>, overrides?: Partial<TestState>): TestState {
    return {
        key: 'stack-test',
        index: routes.length - 1,
        routeNames: routes.map((r) => r.name),
        routes,
        type: 'stack',
        stale: false as const,
        preloadedRoutes: [],
        ...overrides,
    };
}

const CONFIG_OPTIONS: RouterConfigOptions = {
    routeNames: ['ScreenA', 'ScreenB'],
    routeParamList: {},
    routeGetIdList: {},
};

function createMockRouterFactory(actionHandler?: (state: TestState, action: HistoryStackNavigatorAction) => TestState | null) {
    const mockRouterFactory = jest.fn((routerOptions: PlatformStackRouterOptions) => {
        const baseRouter: Router<TestState, HistoryStackNavigatorAction> = {
            type: 'stack',

            getInitialState(configOptions: RouterConfigOptions): TestState {
                const route = makeRoute(configOptions.routeNames.at(0) ?? routerOptions.initialRouteName ?? 'Screen', 'initial-key-0');
                return makeState([route]);
            },

            getRehydratedState(partialState: PartialState<TestState>): TestState {
                const routes = partialState.routes.map((r) => ({
                    key: r.key ?? `${r.name}-rehydrated`,
                    name: r.name,
                    params: r.params,
                })) as Array<NavigationRoute<ParamListBase, string>>;
                return makeState(routes, {
                    history: partialState.history as CustomHistoryEntry[] | undefined,
                });
            },

            getStateForRouteNamesChange(state: TestState): TestState {
                return state;
            },

            getStateForRouteFocus(state: TestState): TestState {
                return state;
            },

            getStateForAction(state: TestState, action: HistoryStackNavigatorAction): TestState | null {
                if (actionHandler) {
                    return actionHandler(state, action);
                }

                if (action.type === 'SET_PARAMS') {
                    const routes = [...state.routes];
                    const focused = routes.at(state.index);
                    if (!focused) {
                        return state;
                    }
                    routes[state.index] = {
                        ...focused,
                        params: {...(focused.params as Record<string, unknown>), ...(action.payload as {params?: Record<string, unknown>}).params},
                    } as NavigationRoute<ParamListBase, string>;
                    return makeState(routes, {history: state.history});
                }

                if (action.type === 'GO_BACK' || action.type === 'POP') {
                    if (state.routes.length <= 1) {
                        return null;
                    }
                    const routes = state.routes.slice(0, -1);
                    return makeState(routes);
                }

                if (action.type === 'NAVIGATE') {
                    const payload = action.payload as {name: string; params?: Record<string, unknown>};
                    const newRoute = makeRoute(payload.name, `${payload.name}-key-${Date.now()}`, payload.params);
                    return makeState([...state.routes, newRoute]);
                }

                if (action.type === 'RESET') {
                    const payload = action.payload as {routes: Array<{name: string; key?: string; params?: Record<string, unknown>}>; index?: number} | undefined;
                    if (!payload?.routes) {
                        return state;
                    }
                    const routes = payload.routes.map((r) => makeRoute(r.name, r.key ?? `${r.name}-reset`, r.params));
                    return makeState(routes, {index: payload.index ?? routes.length - 1});
                }

                return state;
            },

            shouldActionChangeFocus(): boolean {
                return false;
            },
        };

        return baseRouter;
    });

    return mockRouterFactory;
}

function asRouteEntry(entry: CustomHistoryEntry): NavigationRoute<ParamListBase, string> {
    return entry as NavigationRoute<ParamListBase, string>;
}

describe('addPushParamsRouterExtension', () => {
    it('PUSH_PARAMS action sets params on focused route AND appends a snapshot to history', () => {
        const factory = createMockRouterFactory();
        const enhancedRouter = addPushParamsRouterExtension(factory)({} as PlatformStackRouterOptions);

        const route = makeRoute('Search', 'search-1', {q: 'initial'});
        const state = makeState([route], {
            history: [{...route}] as CustomHistoryEntry[],
        });

        const pushParamsAction: HistoryStackNavigatorAction = {
            type: CONST.NAVIGATION.ACTION_TYPE.PUSH_PARAMS,
            payload: {params: {q: 'updated'}},
        };

        const newState = enhancedRouter.getStateForAction(state, pushParamsAction, CONFIG_OPTIONS);

        expect(newState).not.toBeNull();
        expect((newState?.routes.at(0)?.params as {q: string}).q).toBe('updated');
        expect(newState?.history).toHaveLength(2);
        const lastHistoryEntry = asRouteEntry(newState?.history?.at(1) as CustomHistoryEntry);
        expect(lastHistoryEntry.key).toBe('search-1');
        expect((lastHistoryEntry.params as {q: string}).q).toBe('updated');
    });

    it('GO_BACK with surplus history (same key) reverts params to previous snapshot and pops history', () => {
        const factory = createMockRouterFactory();
        const enhancedRouter = addPushParamsRouterExtension(factory)({} as PlatformStackRouterOptions);

        const route = makeRoute('Search', 'search-1', {q: 'updated'});
        const state = makeState([route], {
            history: [
                {key: 'search-1', name: 'Search', params: {q: 'initial'}} as NavigationRoute<ParamListBase, string>,
                {key: 'search-1', name: 'Search', params: {q: 'updated'}} as NavigationRoute<ParamListBase, string>,
            ],
        });

        const goBackAction = CommonActions.goBack();

        const newState = enhancedRouter.getStateForAction(state, goBackAction, CONFIG_OPTIONS);

        expect(newState).not.toBeNull();
        expect(newState?.routes).toHaveLength(1);
        expect((newState?.routes.at(0)?.params as {q: string}).q).toBe('initial');
        expect(newState?.history).toHaveLength(1);
    });

    it('GO_BACK with surplus history (different keys) falls through to normal POP, preserving history for surviving routes', () => {
        const factory = createMockRouterFactory();
        const enhancedRouter = addPushParamsRouterExtension(factory)({} as PlatformStackRouterOptions);

        const routeA = makeRoute('ScreenA', 'a-1', {p: 1});
        const routeB = makeRoute('ScreenB', 'b-1');
        const state = makeState([routeA, routeB], {
            history: [
                {key: 'a-1', name: 'ScreenA', params: {p: 1}} as NavigationRoute<ParamListBase, string>,
                {key: 'a-1', name: 'ScreenA', params: {p: 2}} as NavigationRoute<ParamListBase, string>,
                {key: 'b-1', name: 'ScreenB'} as NavigationRoute<ParamListBase, string>,
            ],
        });

        const goBackAction = CommonActions.goBack();

        const newState = enhancedRouter.getStateForAction(state, goBackAction, CONFIG_OPTIONS);

        expect(newState).not.toBeNull();
        expect(newState?.routes).toHaveLength(1);
        expect(newState?.routes.at(0)?.key).toBe('a-1');

        const routeHistory = (newState?.history ?? []).filter((e): e is NavigationRoute<ParamListBase, string> => typeof e !== 'string');
        expect(routeHistory.some((e) => e.key === 'a-1')).toBe(true);
        expect(routeHistory.every((e) => e.key !== 'b-1')).toBe(true);
    });

    it('GO_BACK without surplus history delegates to underlying router normally', () => {
        const factory = createMockRouterFactory();
        const enhancedRouter = addPushParamsRouterExtension(factory)({} as PlatformStackRouterOptions);

        const routeA = makeRoute('ScreenA', 'a-1');
        const routeB = makeRoute('ScreenB', 'b-1');
        const state = makeState([routeA, routeB], {
            history: [{key: 'a-1', name: 'ScreenA'} as NavigationRoute<ParamListBase, string>, {key: 'b-1', name: 'ScreenB'} as NavigationRoute<ParamListBase, string>],
        });

        const goBackAction = CommonActions.goBack();

        const newState = enhancedRouter.getStateForAction(state, goBackAction, CONFIG_OPTIONS);

        expect(newState).not.toBeNull();
        expect(newState?.routes).toHaveLength(1);
        expect(newState?.routes.at(0)?.key).toBe('a-1');
    });

    it('POP behaves the same as GO_BACK for param revert', () => {
        const factory = createMockRouterFactory();
        const enhancedRouter = addPushParamsRouterExtension(factory)({} as PlatformStackRouterOptions);

        const route = makeRoute('Search', 'search-1', {q: 'updated'});
        const state = makeState([route], {
            history: [
                {key: 'search-1', name: 'Search', params: {q: 'initial'}} as NavigationRoute<ParamListBase, string>,
                {key: 'search-1', name: 'Search', params: {q: 'updated'}} as NavigationRoute<ParamListBase, string>,
            ],
        });

        const popAction: HistoryStackNavigatorAction = {type: 'POP', payload: {count: 1}};

        const newState = enhancedRouter.getStateForAction(state, popAction, CONFIG_OPTIONS);

        expect(newState).not.toBeNull();
        expect(newState?.routes).toHaveLength(1);
        expect((newState?.routes.at(0)?.params as {q: string}).q).toBe('initial');
        expect(newState?.history).toHaveLength(1);
    });

    it('SET_PARAMS preserves existing history (does not rebuild)', () => {
        const factory = createMockRouterFactory();
        const enhancedRouter = addPushParamsRouterExtension(factory)({} as PlatformStackRouterOptions);

        const route = makeRoute('Search', 'search-1', {q: 'v2'});
        const originalHistory: CustomHistoryEntry[] = [
            {key: 'search-1', name: 'Search', params: {q: 'v1'}} as NavigationRoute<ParamListBase, string>,
            {key: 'search-1', name: 'Search', params: {q: 'v2'}} as NavigationRoute<ParamListBase, string>,
        ];
        const state = makeState([route], {history: originalHistory});

        const setParamsAction: HistoryStackNavigatorAction = {
            type: CONST.NAVIGATION.ACTION_TYPE.SET_PARAMS,
            payload: {params: {q: 'v3'}},
        };

        const newState = enhancedRouter.getStateForAction(state, setParamsAction, CONFIG_OPTIONS);

        expect(newState).not.toBeNull();
        expect(newState?.history).toHaveLength(2);
        expect(newState?.history?.at(0)).toEqual(originalHistory.at(0));
        expect(newState?.history?.at(1)).toEqual(originalHistory.at(1));
    });

    it('RESET preserves history entries for routes that survive the reset', () => {
        const factory = createMockRouterFactory();
        const enhancedRouter = addPushParamsRouterExtension(factory)({} as PlatformStackRouterOptions);

        const routeA = makeRoute('ScreenA', 'a-1', {p: 1});
        const routeB = makeRoute('ScreenB', 'b-1');
        const originalHistory: CustomHistoryEntry[] = [
            {key: 'a-1', name: 'ScreenA', params: {p: 1}} as NavigationRoute<ParamListBase, string>,
            {key: 'a-1', name: 'ScreenA', params: {p: 2}} as NavigationRoute<ParamListBase, string>,
            {key: 'b-1', name: 'ScreenB'} as NavigationRoute<ParamListBase, string>,
        ];
        const state = makeState([routeA, routeB], {history: originalHistory});

        const resetAction: HistoryStackNavigatorAction = {
            type: 'RESET',
            payload: {
                routes: [{name: 'ScreenA', key: 'a-1'}],
                index: 0,
            },
        };

        const newState = enhancedRouter.getStateForAction(state, resetAction, CONFIG_OPTIONS);

        expect(newState).not.toBeNull();
        expect(newState?.routes).toHaveLength(1);

        const routeHistory = (newState?.history ?? []).filter((e): e is NavigationRoute<ParamListBase, string> => typeof e !== 'string');
        expect(routeHistory.every((e) => e.key === 'a-1')).toBe(true);
        expect(routeHistory).toHaveLength(2);
    });

    it('Other actions rebuild history from routes via getRehydratedState', () => {
        const factory = createMockRouterFactory();
        const enhancedRouter = addPushParamsRouterExtension(factory)({} as PlatformStackRouterOptions);

        const route = makeRoute('ScreenA', 'a-1');
        const state = makeState([route], {
            history: [{key: 'a-1', name: 'ScreenA'} as NavigationRoute<ParamListBase, string>],
        });

        const navigateAction: HistoryStackNavigatorAction = {
            type: 'NAVIGATE',
            payload: {name: 'ScreenB'},
        };

        const newState = enhancedRouter.getStateForAction(state, navigateAction, CONFIG_OPTIONS);

        expect(newState).not.toBeNull();
        expect(newState?.history).toHaveLength(newState?.routes.length ?? -1);
        for (const [i, r] of (newState?.routes ?? []).entries()) {
            const entry = asRouteEntry(newState?.history?.at(i) as CustomHistoryEntry);
            expect(entry.key).toBe(r.key);
        }
    });

    it('returns null when underlying router returns null for unhandled action', () => {
        const factory = createMockRouterFactory(() => null);
        const enhancedRouter = addPushParamsRouterExtension(factory)({} as PlatformStackRouterOptions);

        const route = makeRoute('ScreenA', 'a-1');
        const state = makeState([route], {
            history: [{key: 'a-1', name: 'ScreenA'} as NavigationRoute<ParamListBase, string>],
        });

        const navigateAction: HistoryStackNavigatorAction = {
            type: 'NAVIGATE',
            payload: {name: 'ScreenC'},
        };

        const newState = enhancedRouter.getStateForAction(state, navigateAction, CONFIG_OPTIONS);
        expect(newState).toBeNull();
    });

    it('PUSH_PARAMS returns state without appending when underlying router returns state without history', () => {
        const factory = createMockRouterFactory((state, action) => {
            if (action.type === 'SET_PARAMS') {
                const routes = [...state.routes];
                const focused = routes.at(state.index);
                if (!focused) {
                    return state;
                }
                routes[state.index] = {
                    ...focused,
                    params: {...(focused.params as Record<string, unknown>), ...(action.payload as {params?: Record<string, unknown>}).params},
                } as NavigationRoute<ParamListBase, string>;
                return {...makeState(routes), history: undefined};
            }
            return state;
        });
        const enhancedRouter = addPushParamsRouterExtension(factory)({} as PlatformStackRouterOptions);

        const route = makeRoute('Search', 'search-1', {q: 'initial'});
        const state = makeState([route], {
            history: [{...route}] as CustomHistoryEntry[],
        });

        const pushParamsAction: HistoryStackNavigatorAction = {
            type: CONST.NAVIGATION.ACTION_TYPE.PUSH_PARAMS,
            payload: {params: {q: 'updated'}},
        };

        const newState = enhancedRouter.getStateForAction(state, pushParamsAction, CONFIG_OPTIONS);

        expect(newState).not.toBeNull();
        expect(newState?.history).toBeUndefined();
    });

    it('GO_BACK with surplus history returns null when single route and underlying router returns null', () => {
        const factory = createMockRouterFactory(() => null);
        const enhancedRouter = addPushParamsRouterExtension(factory)({} as PlatformStackRouterOptions);

        const route = makeRoute('Search', 'search-1', {q: 'v1'});
        const state = makeState([route], {
            history: [
                {key: 'search-1', name: 'Search', params: {q: 'v1'}} as NavigationRoute<ParamListBase, string>,
                {key: 'other-key', name: 'Other', params: {}} as NavigationRoute<ParamListBase, string>,
            ],
        });

        const goBackAction = CommonActions.goBack();
        const newState = enhancedRouter.getStateForAction(state, goBackAction, CONFIG_OPTIONS);

        expect(newState).toBeNull();
    });

    it('multiple PUSH_PARAMS followed by multiple GO_BACKs reverts params step-by-step', () => {
        const factory = createMockRouterFactory();
        const enhancedRouter = addPushParamsRouterExtension(factory)({} as PlatformStackRouterOptions);

        const initialRoute = makeRoute('Search', 'search-1', {q: 'v1'});
        let state: TestState = makeState([initialRoute], {
            history: [{...initialRoute}] as CustomHistoryEntry[],
        });

        state = enhancedRouter.getStateForAction(
            state,
            {
                type: CONST.NAVIGATION.ACTION_TYPE.PUSH_PARAMS,
                payload: {params: {q: 'v2'}},
            },
            CONFIG_OPTIONS,
        ) as TestState;
        expect((state.routes.at(0)?.params as {q: string}).q).toBe('v2');
        expect(state.history).toHaveLength(2);

        state = enhancedRouter.getStateForAction(
            state,
            {
                type: CONST.NAVIGATION.ACTION_TYPE.PUSH_PARAMS,
                payload: {params: {q: 'v3'}},
            },
            CONFIG_OPTIONS,
        ) as TestState;
        expect((state.routes.at(0)?.params as {q: string}).q).toBe('v3');
        expect(state.history).toHaveLength(3);

        state = enhancedRouter.getStateForAction(state, CommonActions.goBack(), CONFIG_OPTIONS) as TestState;
        expect((state.routes.at(0)?.params as {q: string}).q).toBe('v2');
        expect(state.history).toHaveLength(2);

        state = enhancedRouter.getStateForAction(state, CommonActions.goBack(), CONFIG_OPTIONS) as TestState;
        expect((state.routes.at(0)?.params as {q: string}).q).toBe('v1');
        expect(state.history).toHaveLength(1);
    });
});
