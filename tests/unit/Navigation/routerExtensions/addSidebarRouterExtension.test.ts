import type {NavigationRoute, ParamListBase, PartialState, Router, RouterConfigOptions, StackNavigationState} from '@react-navigation/native';
import addSidebarRouterExtension from '@libs/Navigation/AppNavigator/routerExtensions/addSidebarRouterExtension';
import type {CustomHistoryEntry, HistoryStackNavigatorAction} from '@libs/Navigation/AppNavigator/routerExtensions/types';
import type {PlatformStackRouterOptions} from '@libs/Navigation/PlatformStackNavigation/types';
import CONST from '@src/CONST';

type TestState = StackNavigationState<ParamListBase> & {history?: CustomHistoryEntry[]};

const SIDE_PANEL = CONST.NAVIGATION.CUSTOM_HISTORY_ENTRY_SIDE_PANEL;

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

                if (action.type === 'NAVIGATE') {
                    const payload = action.payload as {name: string; params?: Record<string, unknown>};
                    const newRoute = makeRoute(payload.name, `${payload.name}-key-${Date.now()}`, payload.params);
                    return makeState([...state.routes, newRoute]);
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

describe('addSidebarRouterExtension', () => {
    it('getInitialState attaches a history array mirroring routes', () => {
        const factory = createMockRouterFactory();
        const enhancedRouter = addSidebarRouterExtension(factory)({} as PlatformStackRouterOptions);

        const state = enhancedRouter.getInitialState(CONFIG_OPTIONS);

        expect(state.history).toBeDefined();
        expect(state.history).toHaveLength(state.routes.length);
        for (const [i, route] of state.routes.entries()) {
            const entry = asRouteEntry(state.history?.at(i) as CustomHistoryEntry);
            expect(entry.key).toBe(route.key);
            expect(entry.name).toBe(route.name);
        }
    });

    it('getRehydratedState attaches history from routes', () => {
        const factory = createMockRouterFactory();
        const enhancedRouter = addSidebarRouterExtension(factory)({} as PlatformStackRouterOptions);

        const partialState = {
            routes: [
                {name: 'ScreenA', key: 'a-1', params: {foo: 1}},
                {name: 'ScreenB', key: 'b-1'},
            ],
            stale: true as const,
        };

        const state = enhancedRouter.getRehydratedState(partialState as PartialState<TestState>, CONFIG_OPTIONS);

        expect(state.history).toBeDefined();
        expect(state.history).toHaveLength(2);
        expect(asRouteEntry(state.history?.at(0) as CustomHistoryEntry).key).toBe('a-1');
        expect(asRouteEntry(state.history?.at(1) as CustomHistoryEntry).key).toBe('b-1');
    });

    it('getRehydratedState preserves CUSTOM_HISTORY_ENTRY_SIDE_PANEL when present as last entry in partial state history', () => {
        const factory = createMockRouterFactory();
        const enhancedRouter = addSidebarRouterExtension(factory)({} as PlatformStackRouterOptions);

        const partialState = {
            routes: [{name: 'ScreenA', key: 'a-1'}],
            stale: true as const,
            history: [{key: 'a-1', name: 'ScreenA'}, SIDE_PANEL],
        };

        const state = enhancedRouter.getRehydratedState(partialState as PartialState<TestState>, CONFIG_OPTIONS);

        expect(state.history).toBeDefined();
        expect(state.history?.at(-1)).toBe(SIDE_PANEL);
        const routeEntries = state.history?.filter((e): e is NavigationRoute<ParamListBase, string> => typeof e !== 'string') ?? [];
        expect(routeEntries).toHaveLength(1);
    });

    it('getRehydratedState does NOT add SIDE_PANEL when it is absent from partial state', () => {
        const factory = createMockRouterFactory();
        const enhancedRouter = addSidebarRouterExtension(factory)({} as PlatformStackRouterOptions);

        const partialState = {
            routes: [{name: 'ScreenA', key: 'a-1'}],
            stale: true as const,
            history: [{key: 'a-1', name: 'ScreenA'}],
        };

        const state = enhancedRouter.getRehydratedState(partialState as PartialState<TestState>, CONFIG_OPTIONS);

        expect(state.history?.every((e) => e !== SIDE_PANEL)).toBe(true);
    });

    it('getStateForAction re-attaches history after a generic NAVIGATE action (history rebuilt via getRehydratedState)', () => {
        const factory = createMockRouterFactory();
        const enhancedRouter = addSidebarRouterExtension(factory)({} as PlatformStackRouterOptions);

        const initialState = enhancedRouter.getInitialState(CONFIG_OPTIONS);

        const navigateAction: HistoryStackNavigatorAction = {
            type: 'NAVIGATE',
            payload: {name: 'ScreenB'},
        };

        const newState = enhancedRouter.getStateForAction(initialState, navigateAction, CONFIG_OPTIONS);

        expect(newState).not.toBeNull();
        expect(newState?.history).toBeDefined();
        expect(newState?.history).toHaveLength(newState?.routes.length ?? -1);
        for (const [i, r] of (newState?.routes ?? []).entries()) {
            const entry = asRouteEntry(newState?.history?.at(i) as CustomHistoryEntry);
            expect(entry.key).toBe(r.key);
        }
    });
});
