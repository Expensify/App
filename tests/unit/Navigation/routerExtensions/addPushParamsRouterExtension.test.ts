import {CommonActions} from '@react-navigation/native';
import type {NavigationRoute, ParamListBase, PartialState, Router, RouterConfigOptions, StackNavigationState} from '@react-navigation/native';
import addPushParamsRouterExtension, {resolveCursorForReset} from '@libs/Navigation/AppNavigator/routerExtensions/addPushParamsRouterExtension';
import type {CustomHistoryEntry, PushParamsRouterAction} from '@libs/Navigation/AppNavigator/routerExtensions/types';
import type {PlatformStackRouterOptions} from '@libs/Navigation/PlatformStackNavigation/types';
import {cancelPendingFocusRestore, notifyPushParamsBackward, notifyPushParamsForward} from '@libs/NavigationFocusReturn';
import CONST from '@src/CONST';

jest.mock('@libs/NavigationFocusReturn', () => ({
    cancelPendingFocusRestore: jest.fn(),
    notifyPushParamsBackward: jest.fn(),
    notifyPushParamsForward: jest.fn(),
}));

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

function createMockRouterFactory(actionHandler?: (state: TestState, action: PushParamsRouterAction) => TestState | null) {
    const mockRouterFactory = jest.fn((routerOptions: PlatformStackRouterOptions) => {
        const baseRouter: Router<TestState, PushParamsRouterAction> = {
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
                    // Preserve explicit index — RESET can install non-terminal focus.
                    ...(typeof partialState.index === 'number' ? {index: partialState.index} : {}),
                });
            },

            getStateForRouteNamesChange(state: TestState): TestState {
                return state;
            },

            getStateForRouteFocus(state: TestState): TestState {
                return state;
            },

            getStateForAction(state: TestState, action: PushParamsRouterAction): TestState | null {
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

        const pushParamsAction: PushParamsRouterAction = {
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

        const popAction: PushParamsRouterAction = {type: 'POP', payload: {count: 1}};

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

        const setParamsAction: PushParamsRouterAction = {
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

        const routeA = makeRoute('ScreenA', 'a-1', {p: 2});
        const routeB = makeRoute('ScreenB', 'b-1');
        const originalHistory: CustomHistoryEntry[] = [
            {key: 'a-1', name: 'ScreenA', params: {p: 1}} as NavigationRoute<ParamListBase, string>,
            {key: 'a-1', name: 'ScreenA', params: {p: 2}} as NavigationRoute<ParamListBase, string>,
            {key: 'b-1', name: 'ScreenB'} as NavigationRoute<ParamListBase, string>,
        ];
        const state = makeState([routeA, routeB], {history: originalHistory});

        // RESET to a snapshot that IS in history ({a-1, p:2}) — outcome is 'noop' (or matches), so preserveHistoryForRoutes keeps the same-key entries.
        const resetAction: PushParamsRouterAction = {
            type: 'RESET',
            payload: {
                routes: [{name: 'ScreenA', key: 'a-1', params: {p: 2}}],
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

        const navigateAction: PushParamsRouterAction = {
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

        const navigateAction: PushParamsRouterAction = {
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

        const pushParamsAction: PushParamsRouterAction = {
            type: CONST.NAVIGATION.ACTION_TYPE.PUSH_PARAMS,
            payload: {params: {q: 'updated'}},
        };

        const newState = enhancedRouter.getStateForAction(state, pushParamsAction, CONFIG_OPTIONS);

        expect(newState).not.toBeNull();
        expect(newState?.history).toBeUndefined();
    });

    it('PUSH_PARAMS does NOT capture a trigger when the inner router returns state without history', () => {
        // Capture must follow the history-presence check — otherwise a no-commit PUSH_PARAMS leaves a stale entry in triggerMap.
        const factory = createMockRouterFactory((state, action) => {
            if (action.type === 'SET_PARAMS') {
                return {...state, history: undefined} as TestState;
            }
            return state;
        });
        const enhancedRouter = addPushParamsRouterExtension(factory)({} as PlatformStackRouterOptions);
        (notifyPushParamsForward as jest.Mock).mockClear();

        const route = makeRoute('Search', 'search-1', {q: 'initial'});
        const state = makeState([route], {history: [{...route}] as CustomHistoryEntry[]});

        enhancedRouter.getStateForAction(state, {type: CONST.NAVIGATION.ACTION_TYPE.PUSH_PARAMS, payload: {params: {q: 'updated'}}}, CONFIG_OPTIONS);

        expect(notifyPushParamsForward).not.toHaveBeenCalled();
    });

    it('PUSH_PARAMS captures on the positive path (history present)', () => {
        const factory = createMockRouterFactory();
        const enhancedRouter = addPushParamsRouterExtension(factory)({} as PlatformStackRouterOptions);
        (notifyPushParamsForward as jest.Mock).mockClear();

        const route = makeRoute('Search', 'search-1', {q: 'initial'});
        const state = makeState([route], {history: [{...route}] as CustomHistoryEntry[]});

        enhancedRouter.getStateForAction(state, {type: CONST.NAVIGATION.ACTION_TYPE.PUSH_PARAMS, payload: {params: {q: 'updated'}}}, CONFIG_OPTIONS);

        expect(notifyPushParamsForward).toHaveBeenCalledTimes(1);
        expect(notifyPushParamsForward).toHaveBeenCalledWith('search-1', {q: 'initial'});
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

    it('PUSH_PARAMS while mid-cursor truncates forward history entries (window.history.pushState semantics)', () => {
        const factory = createMockRouterFactory();
        const enhancedRouter = addPushParamsRouterExtension(factory)({} as PlatformStackRouterOptions);

        const initial = makeRoute('Search', 'search-1', {q: 'A'});
        let state: TestState = makeState([initial], {history: [{...initial}] as CustomHistoryEntry[]});

        state = enhancedRouter.getStateForAction(state, {type: CONST.NAVIGATION.ACTION_TYPE.PUSH_PARAMS, payload: {params: {q: 'B'}}}, CONFIG_OPTIONS) as TestState;
        state = enhancedRouter.getStateForAction(state, {type: CONST.NAVIGATION.ACTION_TYPE.PUSH_PARAMS, payload: {params: {q: 'C'}}}, CONFIG_OPTIONS) as TestState;
        expect(state.history).toHaveLength(3);

        // Simulate browser-back to B via RESET — moves the internal cursor to position 1.
        const resetToB: PushParamsRouterAction = {
            type: CONST.NAVIGATION.ACTION_TYPE.RESET,
            payload: {routes: [{name: 'Search', key: 'search-1', params: {q: 'B'}}], index: 0},
        };
        state = enhancedRouter.getStateForAction(state, resetToB, CONFIG_OPTIONS) as TestState;
        expect((state.routes.at(0)?.params as {q: string}).q).toBe('B');

        // PUSH D from mid-cursor — forward entry [C] must be discarded, as window.history.pushState would.
        state = enhancedRouter.getStateForAction(state, {type: CONST.NAVIGATION.ACTION_TYPE.PUSH_PARAMS, payload: {params: {q: 'D'}}}, CONFIG_OPTIONS) as TestState;
        expect(state.history).toHaveLength(3);
        expect((asRouteEntry(state.history?.at(1) as CustomHistoryEntry).params as {q: string}).q).toBe('B');
        expect((asRouteEntry(state.history?.at(2) as CustomHistoryEntry).params as {q: string}).q).toBe('D');
    });

    it('GO_BACK while mid-cursor reverts to the cursor-relative previous snapshot and preserves forward entries', () => {
        const factory = createMockRouterFactory();
        const enhancedRouter = addPushParamsRouterExtension(factory)({} as PlatformStackRouterOptions);

        const initial = makeRoute('Search', 'search-1', {q: 'A'});
        let state: TestState = makeState([initial], {history: [{...initial}] as CustomHistoryEntry[]});

        state = enhancedRouter.getStateForAction(state, {type: CONST.NAVIGATION.ACTION_TYPE.PUSH_PARAMS, payload: {params: {q: 'B'}}}, CONFIG_OPTIONS) as TestState;
        state = enhancedRouter.getStateForAction(state, {type: CONST.NAVIGATION.ACTION_TYPE.PUSH_PARAMS, payload: {params: {q: 'C'}}}, CONFIG_OPTIONS) as TestState;

        // Browser-back to B via RESET — cursor is now mid-history at position 1.
        state = enhancedRouter.getStateForAction(
            state,
            {type: CONST.NAVIGATION.ACTION_TYPE.RESET, payload: {routes: [{name: 'Search', key: 'search-1', params: {q: 'B'}}], index: 0}},
            CONFIG_OPTIONS,
        ) as TestState;

        // Programmatic GO_BACK from mid-cursor must go to A (history[cursor-1]), not stay on B, and must NOT pop history[last].
        state = enhancedRouter.getStateForAction(state, CommonActions.goBack(), CONFIG_OPTIONS) as TestState;
        expect((state.routes.at(0)?.params as {q: string}).q).toBe('A');
        expect(state.history).toHaveLength(3);
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

    it('non-adjacent same-key RESET cancels any stale pending focus restore', () => {
        const factory = createMockRouterFactory();
        const enhancedRouter = addPushParamsRouterExtension(factory)({} as PlatformStackRouterOptions);
        const initial = makeRoute('Search', 'search-1', {q: 'A'});
        let state: TestState = makeState([initial], {history: [{...initial}] as CustomHistoryEntry[]});

        state = enhancedRouter.getStateForAction(state, {type: CONST.NAVIGATION.ACTION_TYPE.PUSH_PARAMS, payload: {params: {q: 'B'}}}, CONFIG_OPTIONS) as TestState;
        state = enhancedRouter.getStateForAction(state, {type: CONST.NAVIGATION.ACTION_TYPE.PUSH_PARAMS, payload: {params: {q: 'C'}}}, CONFIG_OPTIONS) as TestState;
        (cancelPendingFocusRestore as jest.Mock).mockClear();

        // Jump from C (position 2) directly to a snapshot not at position ±1 — must cancel since handleStateChange classifies same-key as noop.
        const resetToUnknown: PushParamsRouterAction = {
            type: CONST.NAVIGATION.ACTION_TYPE.RESET,
            payload: {routes: [{name: 'Search', key: 'search-1', params: {q: 'Z'}}], index: 0},
        };
        enhancedRouter.getStateForAction(state, resetToUnknown, CONFIG_OPTIONS);

        expect(cancelPendingFocusRestore).toHaveBeenCalledTimes(1);
    });

    it('RESET that shrinks history below the current cursor reinitializes without crashing or misclassifying', () => {
        // Simulates a parent-navigator RESET that would truncate our history (e.g. browser back jumps across the whole PUSH_PARAMS stack).
        // The cursor is out of range relative to the new history length — the guard must snap it back, not throw or leave it out of sync.
        const factory = createMockRouterFactory();
        const enhancedRouter = addPushParamsRouterExtension(factory)({} as PlatformStackRouterOptions);
        const initial = makeRoute('Search', 'search-1', {q: 'A'});
        let state: TestState = makeState([initial], {history: [{...initial}] as CustomHistoryEntry[]});

        state = enhancedRouter.getStateForAction(state, {type: CONST.NAVIGATION.ACTION_TYPE.PUSH_PARAMS, payload: {params: {q: 'B'}}}, CONFIG_OPTIONS) as TestState;
        state = enhancedRouter.getStateForAction(state, {type: CONST.NAVIGATION.ACTION_TYPE.PUSH_PARAMS, payload: {params: {q: 'C'}}}, CONFIG_OPTIONS) as TestState;
        expect(state.history).toHaveLength(3);

        // Hand-craft a RESET whose rehydrated state has a much shorter history than our cursor (cursor=2, new history=[A only]).
        const shrinkReset: PushParamsRouterAction = {
            type: CONST.NAVIGATION.ACTION_TYPE.RESET,
            payload: {routes: [{name: 'Search', key: 'search-1', params: {q: 'A'}}], index: 0, history: [{key: 'search-1', name: 'Search', params: {q: 'A'}}]} as never,
        };
        const resetState = enhancedRouter.getStateForAction(state, shrinkReset, CONFIG_OPTIONS) as TestState;
        expect(resetState).not.toBeNull();
        expect(resetState.history).toBeDefined();

        // After the shrink, a subsequent PUSH_PARAMS must succeed and produce consistent history (no lingering out-of-range cursor).
        const afterPush = enhancedRouter.getStateForAction(resetState, {type: CONST.NAVIGATION.ACTION_TYPE.PUSH_PARAMS, payload: {params: {q: 'D'}}}, CONFIG_OPTIONS) as TestState;
        expect((afterPush.routes.at(0)?.params as {q: string}).q).toBe('D');
        expect(afterPush.history?.length).toBeGreaterThanOrEqual(1);
    });

    it('no-op RESET to the same params at the current cursor does not cancel pending restores', () => {
        // Simulates useNavigationResetOnLayoutChange — fires navigation.reset(navigation.getState()) on breakpoint changes.
        const factory = createMockRouterFactory();
        const enhancedRouter = addPushParamsRouterExtension(factory)({} as PlatformStackRouterOptions);
        const initial = makeRoute('Search', 'search-1', {q: 'A'});
        let state: TestState = makeState([initial], {history: [{...initial}] as CustomHistoryEntry[]});

        state = enhancedRouter.getStateForAction(state, {type: CONST.NAVIGATION.ACTION_TYPE.PUSH_PARAMS, payload: {params: {q: 'B'}}}, CONFIG_OPTIONS) as TestState;
        (cancelPendingFocusRestore as jest.Mock).mockClear();

        // RESET to the same snapshot currently at the cursor.
        const noopReset: PushParamsRouterAction = {
            type: CONST.NAVIGATION.ACTION_TYPE.RESET,
            payload: {routes: [{name: 'Search', key: 'search-1', params: {q: 'B'}}], index: 0},
        };
        enhancedRouter.getStateForAction(state, noopReset, CONFIG_OPTIONS);

        expect(cancelPendingFocusRestore).not.toHaveBeenCalled();
    });

    it('first reflexive RESET before any PUSH_PARAMS is classified as noop (cursor seeded from initial history)', () => {
        // Without cursor seeding, cursor=-1 at startup makes the first reflexive RESET classify as 'forward' and cancel pending Esc-triggered restores.
        const factory = createMockRouterFactory();
        const enhancedRouter = addPushParamsRouterExtension(factory)({} as PlatformStackRouterOptions);
        const initialState = enhancedRouter.getInitialState(CONFIG_OPTIONS);
        (cancelPendingFocusRestore as jest.Mock).mockClear();

        const initialFocused = initialState.routes.at(initialState.index ?? -1);
        if (!initialFocused) {
            throw new Error('expected getInitialState to produce a focused route');
        }
        const reflexiveReset: PushParamsRouterAction = {
            type: CONST.NAVIGATION.ACTION_TYPE.RESET,
            payload: {routes: [{name: initialFocused.name, key: initialFocused.key, params: initialFocused.params}], index: 0},
        };
        enhancedRouter.getStateForAction(initialState as TestState, reflexiveReset, CONFIG_OPTIONS);

        expect(cancelPendingFocusRestore).not.toHaveBeenCalled();
    });

    it('RESET with route removal remaps the cursor to the same logical entry in the preserved history', () => {
        // Two-route history → RESET keeps only one → preservation filters the other → cursor must remap to the entry's new index.
        const factory = createMockRouterFactory();
        const enhancedRouter = addPushParamsRouterExtension(factory)({} as PlatformStackRouterOptions);
        const routeA = makeRoute('Search', 'search-1', {q: 'v1'});
        const routeB = makeRoute('Search', 'search-2', {q: 'v2'});
        let state: TestState = makeState([routeA, routeB], {
            history: [{...routeA}, {...routeB}] as CustomHistoryEntry[],
        });

        // RESET keeps only the second route (search-2) — search-1's history entry must be filtered out by preserveHistoryForRoutes.
        const reset: PushParamsRouterAction = {
            type: CONST.NAVIGATION.ACTION_TYPE.RESET,
            payload: {routes: [{name: 'Search', key: 'search-2', params: {q: 'v2'}}], index: 0},
        };
        state = enhancedRouter.getStateForAction(state, reset, CONFIG_OPTIONS) as TestState;
        expect(state.history).toHaveLength(1);
        expect((asRouteEntry(state.history?.at(0) as CustomHistoryEntry).params as {q: string}).q).toBe('v2');

        // A subsequent PUSH_PARAMS must reference the (remapped) cursor correctly — previously the numeric cursor could point past the end of the filtered history.
        const afterPush = enhancedRouter.getStateForAction(state, {type: CONST.NAVIGATION.ACTION_TYPE.PUSH_PARAMS, payload: {params: {q: 'v3'}}}, CONFIG_OPTIONS) as TestState;
        expect((afterPush.routes.at(0)?.params as {q: string}).q).toBe('v3');
        expect(afterPush.history).toHaveLength(2);
        expect((asRouteEntry(afterPush.history?.at(0) as CustomHistoryEntry).params as {q: string}).q).toBe('v2');
        expect((asRouteEntry(afterPush.history?.at(1) as CustomHistoryEntry).params as {q: string}).q).toBe('v3');
    });

    it('non-adjacent same-key RESET moves the cursor to the matching entry so subsequent GO_BACK reverts from the right position', () => {
        // Build [A, B, C, D] with cursor=3 (at D). Browser jumps to B (position 1) via history.go(-2). A subsequent GO_BACK must revert to A (history[0]), not C (history[2]).
        const factory = createMockRouterFactory();
        const enhancedRouter = addPushParamsRouterExtension(factory)({} as PlatformStackRouterOptions);
        const initial = makeRoute('Search', 'search-1', {q: 'A'});
        let state: TestState = makeState([initial], {history: [{...initial}] as CustomHistoryEntry[]});

        state = enhancedRouter.getStateForAction(state, {type: CONST.NAVIGATION.ACTION_TYPE.PUSH_PARAMS, payload: {params: {q: 'B'}}}, CONFIG_OPTIONS) as TestState;
        state = enhancedRouter.getStateForAction(state, {type: CONST.NAVIGATION.ACTION_TYPE.PUSH_PARAMS, payload: {params: {q: 'C'}}}, CONFIG_OPTIONS) as TestState;
        state = enhancedRouter.getStateForAction(state, {type: CONST.NAVIGATION.ACTION_TYPE.PUSH_PARAMS, payload: {params: {q: 'D'}}}, CONFIG_OPTIONS) as TestState;
        expect(state.history).toHaveLength(4);

        const jumpToB: PushParamsRouterAction = {
            type: CONST.NAVIGATION.ACTION_TYPE.RESET,
            payload: {routes: [{name: 'Search', key: 'search-1', params: {q: 'B'}}], index: 0},
        };
        state = enhancedRouter.getStateForAction(state, jumpToB, CONFIG_OPTIONS) as TestState;

        state = enhancedRouter.getStateForAction(state, CommonActions.goBack(), CONFIG_OPTIONS) as TestState;
        expect((state.routes.at(0)?.params as {q: string}).q).toBe('A');
    });

    it('fall-through action (NAVIGATE/PUSH stack) after a mid-cursor RESET must sync the cursor to the new focused entry so a subsequent PUSH_PARAMS does not truncate valid history', () => {
        const factory = createMockRouterFactory();
        const enhancedRouter = addPushParamsRouterExtension(factory)({} as PlatformStackRouterOptions);

        const initial = makeRoute('Search', 'search-1', {q: 'A'});
        let state: TestState = makeState([initial], {history: [{...initial}] as CustomHistoryEntry[]});
        state = enhancedRouter.getStateForAction(state, {type: CONST.NAVIGATION.ACTION_TYPE.PUSH_PARAMS, payload: {params: {q: 'B'}}}, CONFIG_OPTIONS) as TestState;
        state = enhancedRouter.getStateForAction(state, {type: CONST.NAVIGATION.ACTION_TYPE.PUSH_PARAMS, payload: {params: {q: 'C'}}}, CONFIG_OPTIONS) as TestState;

        const jumpToA: PushParamsRouterAction = {
            type: CONST.NAVIGATION.ACTION_TYPE.RESET,
            payload: {routes: [{name: 'Search', key: 'search-1', params: {q: 'A'}}], index: 0},
        };
        state = enhancedRouter.getStateForAction(state, jumpToA, CONFIG_OPTIONS) as TestState;

        // NAVIGATE rebuilds history 1:1 — cursor must sync to the new focused entry.
        state = enhancedRouter.getStateForAction(state, {type: 'NAVIGATE', payload: {name: 'Other'}} as unknown as PushParamsRouterAction, CONFIG_OPTIONS) as TestState;
        expect(state.routes).toHaveLength(2);
        expect(state.history).toHaveLength(2);

        state = enhancedRouter.getStateForAction(state, {type: CONST.NAVIGATION.ACTION_TYPE.PUSH_PARAMS, payload: {params: {extra: 'X'}}}, CONFIG_OPTIONS) as TestState;

        expect(state.history).toHaveLength(3);
        const lastTwo = state.history?.slice(-2) ?? [];
        expect(asRouteEntry(lastTwo.at(0) as CustomHistoryEntry).name).toBe('Other');
        expect((asRouteEntry(lastTwo.at(1) as CustomHistoryEntry).params as {extra?: string})?.extra).toBe('X');
    });

    it('RESET that replaces every route resets the cursor so a subsequent PUSH_PARAMS starts fresh', () => {
        const factory = createMockRouterFactory();
        const enhancedRouter = addPushParamsRouterExtension(factory)({} as PlatformStackRouterOptions);
        const initial = makeRoute('Search', 'search-1', {q: 'A'});
        let state: TestState = makeState([initial], {history: [{...initial}] as CustomHistoryEntry[]});
        state = enhancedRouter.getStateForAction(state, {type: CONST.NAVIGATION.ACTION_TYPE.PUSH_PARAMS, payload: {params: {q: 'B'}}}, CONFIG_OPTIONS) as TestState;
        state = enhancedRouter.getStateForAction(state, {type: CONST.NAVIGATION.ACTION_TYPE.PUSH_PARAMS, payload: {params: {q: 'C'}}}, CONFIG_OPTIONS) as TestState;

        // RESET with an entirely different route key so preserveHistoryForRoutes filters out everything.
        const replaceAll: PushParamsRouterAction = {
            type: CONST.NAVIGATION.ACTION_TYPE.RESET,
            payload: {routes: [{name: 'Other', key: 'other-1', params: {tab: 'foo'}}], index: 0},
        };
        state = enhancedRouter.getStateForAction(state, replaceAll, CONFIG_OPTIONS) as TestState;

        // A subsequent PUSH_PARAMS on a new route must start a fresh cursor — if the old cursor leaked (at 2), this would truncate nothing because the new history has 1 entry.
        const afterPush = enhancedRouter.getStateForAction(state, {type: CONST.NAVIGATION.ACTION_TYPE.PUSH_PARAMS, payload: {params: {tab: 'bar'}}}, CONFIG_OPTIONS) as TestState;
        expect(afterPush.history?.length).toBeGreaterThanOrEqual(1);
        expect((afterPush.routes.at(0)?.params as {tab: string}).tab).toBe('bar');
    });

    it('PUSH_PARAMS history grows monotonically across long sessions so React Navigation web linker keeps issuing pushState (not replaceState on length stagnation)', () => {
        const factory = createMockRouterFactory();
        const enhancedRouter = addPushParamsRouterExtension(factory)({} as PlatformStackRouterOptions);
        const initial = makeRoute('Search', 'search-1', {q: '0'});
        let state: TestState = makeState([initial], {history: [{...initial}] as CustomHistoryEntry[]});

        let prevLength = state.history?.length ?? 0;
        for (let i = 1; i <= 40; i += 1) {
            state = enhancedRouter.getStateForAction(state, {type: CONST.NAVIGATION.ACTION_TYPE.PUSH_PARAMS, payload: {params: {q: String(i)}}}, CONFIG_OPTIONS) as TestState;
            const length = state.history?.length ?? 0;
            expect(length).toBe(prevLength + 1);
            prevLength = length;
        }
        expect(state.history).toHaveLength(41);
        expect((asRouteEntry(state.history?.at(0) as CustomHistoryEntry).params as {q: string}).q).toBe('0');
        expect((asRouteEntry(state.history?.at(-1) as CustomHistoryEntry).params as {q: string}).q).toBe('40');
    });

    it('PUSH_PARAMS on a non-terminal-index state captures the focused route (not routes.at(-1))', () => {
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
                return makeState(routes, {history: state.history, index: state.index});
            }
            return state;
        });
        const enhancedRouter = addPushParamsRouterExtension(factory)({} as PlatformStackRouterOptions);

        const focused = makeRoute('Search', 'search-focused', {q: 'original'});
        const trailing = makeRoute('Other', 'other-trailing', {kind: 'unrelated'});
        const state = makeState([focused, trailing], {
            index: 0,
            history: [{...focused}, {...trailing}] as CustomHistoryEntry[],
        });
        (notifyPushParamsForward as jest.Mock).mockClear();

        enhancedRouter.getStateForAction(state, {type: CONST.NAVIGATION.ACTION_TYPE.PUSH_PARAMS, payload: {params: {q: 'updated'}}}, CONFIG_OPTIONS);

        expect(notifyPushParamsForward).toHaveBeenCalledTimes(1);
        expect(notifyPushParamsForward).toHaveBeenCalledWith('search-focused', {q: 'original'});
    });

    it('PUSH_PARAMS on a non-terminal-index state appends the focused route to history (not routes.at(-1))', () => {
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
                return makeState(routes, {history: state.history, index: state.index});
            }
            return state;
        });
        const enhancedRouter = addPushParamsRouterExtension(factory)({} as PlatformStackRouterOptions);

        const focused = makeRoute('Search', 'search-focused', {q: 'original'});
        const trailing = makeRoute('Other', 'other-trailing', {kind: 'unrelated'});
        const state = makeState([focused, trailing], {
            index: 0,
            history: [{...focused}, {...trailing}] as CustomHistoryEntry[],
        });

        const newState = enhancedRouter.getStateForAction(state, {type: CONST.NAVIGATION.ACTION_TYPE.PUSH_PARAMS, payload: {params: {q: 'updated'}}}, CONFIG_OPTIONS) as TestState;

        const appended = asRouteEntry(newState.history?.at(-1) as CustomHistoryEntry);
        expect(appended.key).toBe('search-focused');
        expect((appended.params as {q: string}).q).toBe('updated');
    });

    it('GO_BACK on a non-terminal-index state reverts the focused route (not routes.at(-1))', () => {
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
                return makeState(routes, {history: state.history, index: state.index});
            }
            return state;
        });
        const enhancedRouter = addPushParamsRouterExtension(factory)({} as PlatformStackRouterOptions);

        const focused = makeRoute('Search', 'search-focused', {q: 'v1'});
        const trailing = makeRoute('Other', 'other-trailing', {kind: 'unrelated'});
        let state: TestState = makeState([focused, trailing], {
            index: 0,
            history: [{...focused}, {...trailing}] as CustomHistoryEntry[],
        });

        state = enhancedRouter.getStateForAction(state, {type: CONST.NAVIGATION.ACTION_TYPE.PUSH_PARAMS, payload: {params: {q: 'v2'}}}, CONFIG_OPTIONS) as TestState;
        expect((state.routes.at(0)?.params as {q: string}).q).toBe('v2');

        state = enhancedRouter.getStateForAction(state, CommonActions.goBack(), CONFIG_OPTIONS) as TestState;
        // Focused route reverts; trailing route untouched.
        expect((state.routes.at(0)?.params as {q: string}).q).toBe('v1');
        expect((state.routes.at(1)?.params as {kind: string}).kind).toBe('unrelated');
    });

    it('RESET with a non-terminal index resolves cursor direction against the focused route (not routes.at(-1))', () => {
        const factory = createMockRouterFactory();
        const enhancedRouter = addPushParamsRouterExtension(factory)({} as PlatformStackRouterOptions);
        const initial = makeRoute('Search', 'search-1', {q: 'A'});
        let state: TestState = makeState([initial], {history: [{...initial}] as CustomHistoryEntry[]});

        state = enhancedRouter.getStateForAction(state, {type: CONST.NAVIGATION.ACTION_TYPE.PUSH_PARAMS, payload: {params: {q: 'B'}}}, CONFIG_OPTIONS) as TestState;
        (notifyPushParamsBackward as jest.Mock).mockClear();

        // Focused is 'A' at index 0; 'B' is last-in-array. at(-1) would misfire against 'B'.
        const resetWithNonTerminalIndex: PushParamsRouterAction = {
            type: CONST.NAVIGATION.ACTION_TYPE.RESET,
            payload: {
                routes: [
                    {name: 'Search', key: 'search-1', params: {q: 'A'}},
                    {name: 'Search', key: 'search-2', params: {q: 'B'}},
                ],
                index: 0,
            },
        };
        enhancedRouter.getStateForAction(state, resetWithNonTerminalIndex, CONFIG_OPTIONS);

        expect(notifyPushParamsBackward).toHaveBeenCalledTimes(1);
        expect(notifyPushParamsBackward).toHaveBeenCalledWith('search-1', {q: 'A'});
    });

    it('ambiguous RESET (duplicate compound at cursor±1) fires backward focus-restore and advances cursor forward', () => {
        const factory = createMockRouterFactory();
        const enhancedRouter = addPushParamsRouterExtension(factory)({} as PlatformStackRouterOptions);
        const initial = makeRoute('Search', 'search-1', {q: 'A'});
        let state: TestState = makeState([initial], {history: [{...initial}] as CustomHistoryEntry[]});

        // Build [A, B, A] via two PUSH_PARAMS.
        state = enhancedRouter.getStateForAction(state, {type: CONST.NAVIGATION.ACTION_TYPE.PUSH_PARAMS, payload: {params: {q: 'B'}}}, CONFIG_OPTIONS) as TestState;
        state = enhancedRouter.getStateForAction(state, {type: CONST.NAVIGATION.ACTION_TYPE.PUSH_PARAMS, payload: {params: {q: 'A'}}}, CONFIG_OPTIONS) as TestState;

        // Simulate one browser-back to B (cursor 2 → 1 via adjacent-backward probe).
        state = enhancedRouter.getStateForAction(
            state,
            {type: CONST.NAVIGATION.ACTION_TYPE.RESET, payload: {routes: [{name: 'Search', key: 'search-1', params: {q: 'B'}}], index: 0}},
            CONFIG_OPTIONS,
        ) as TestState;

        (notifyPushParamsBackward as jest.Mock).mockClear();
        (cancelPendingFocusRestore as jest.Mock).mockClear();

        // RESET to A with cursor=1: duplicates at indices 0 and 2 — the ambiguous case.
        enhancedRouter.getStateForAction(
            state,
            {type: CONST.NAVIGATION.ACTION_TYPE.RESET, payload: {routes: [{name: 'Search', key: 'search-1', params: {q: 'A'}}], index: 0}},
            CONFIG_OPTIONS,
        );

        // WCAG 2.4.3: backward notification fires regardless of direction ambiguity.
        expect(notifyPushParamsBackward).toHaveBeenCalledTimes(1);
        expect(notifyPushParamsBackward).toHaveBeenCalledWith('search-1', {q: 'A'});
        expect(cancelPendingFocusRestore).not.toHaveBeenCalled();
    });

    it('unknown RESET preserves history entries for OTHER surviving routes while replacing stale entries for the focused key', () => {
        // Multi-route stack: RESET keeps both routes but installs unseen params on the focused one. The non-focused route's history must survive; only the focused-key entries are refreshed.
        const factory = createMockRouterFactory();
        const enhancedRouter = addPushParamsRouterExtension(factory)({} as PlatformStackRouterOptions);
        const routeA = makeRoute('ScreenA', 'a-1', {p: 1});
        const routeB = makeRoute('ScreenB', 'b-1', {q: 'orig'});
        const originalHistory: CustomHistoryEntry[] = [
            {key: 'a-1', name: 'ScreenA', params: {p: 1}} as NavigationRoute<ParamListBase, string>,
            {key: 'b-1', name: 'ScreenB', params: {q: 'orig'}} as NavigationRoute<ParamListBase, string>,
        ];
        const state = makeState([routeA, routeB], {history: originalHistory});

        const action: PushParamsRouterAction = {
            type: CONST.NAVIGATION.ACTION_TYPE.RESET,
            payload: {
                routes: [
                    {name: 'ScreenA', key: 'a-1', params: {p: 1}},
                    {name: 'ScreenB', key: 'b-1', params: {q: 'new'}},
                ],
                index: 1,
            },
        };

        const newState = enhancedRouter.getStateForAction(state, action, CONFIG_OPTIONS) as TestState;
        const history = newState.history ?? [];

        // A's entry survives (different key, still in routes); B's stale entry is replaced by the new focused entry.
        expect(history).toHaveLength(2);
        expect(asRouteEntry(history.at(0) as CustomHistoryEntry).key).toBe('a-1');
        const lastEntry = asRouteEntry(history.at(1) as CustomHistoryEntry);
        expect(lastEntry.key).toBe('b-1');
        expect((lastEntry.params as {q: string}).q).toBe('new');
    });

    it('RESET to unseen params on the same route key re-seeds history so subsequent PUSH_PARAMS branches from the current screen', () => {
        // Reproduces Search's setParams-driven typing + `reset(getState())` on layout change. Without the re-seed, history stays at the initial snapshot and the next PUSH_PARAMS / GO_BACK reverts past the user's current state.
        const factory = createMockRouterFactory();
        const enhancedRouter = addPushParamsRouterExtension(factory)({} as PlatformStackRouterOptions);
        const initial = makeRoute('Search', 'search-1', {q: ''});
        let state: TestState = makeState([initial], {history: [{...initial}] as CustomHistoryEntry[]});

        // Simulate layout-change RESET with live params (setParams-typed) that were never pushed to history.
        state = enhancedRouter.getStateForAction(
            state,
            {type: CONST.NAVIGATION.ACTION_TYPE.RESET, payload: {routes: [{name: 'Search', key: 'search-1', params: {q: 'typed'}}], index: 0}},
            CONFIG_OPTIONS,
        ) as TestState;
        expect(state.history).toHaveLength(1);
        expect((asRouteEntry(state.history?.at(0) as CustomHistoryEntry).params as {q: string}).q).toBe('typed');

        // Next PUSH_PARAMS must branch from 'typed', not from the stale initial snapshot.
        state = enhancedRouter.getStateForAction(state, {type: CONST.NAVIGATION.ACTION_TYPE.PUSH_PARAMS, payload: {params: {q: 'pushed'}}}, CONFIG_OPTIONS) as TestState;
        expect(state.history).toHaveLength(2);
        expect((asRouteEntry(state.history?.at(0) as CustomHistoryEntry).params as {q: string}).q).toBe('typed');
        expect((asRouteEntry(state.history?.at(1) as CustomHistoryEntry).params as {q: string}).q).toBe('pushed');

        // GO_BACK reverts to 'typed' (the state after the layout-change RESET), not the pre-RESET stale snapshot.
        state = enhancedRouter.getStateForAction(state, CommonActions.goBack(), CONFIG_OPTIONS) as TestState;
        expect((state.routes.at(0)?.params as {q: string}).q).toBe('typed');
    });

    it('unknown-RESET preserves history.length (replaces the cursor entry) so a SET_PARAMS-then-RESET on layout change does not trip useLinking into goBack(historyDelta)', () => {
        const factory = createMockRouterFactory();
        const enhancedRouter = addPushParamsRouterExtension(factory)({} as PlatformStackRouterOptions);
        const initial = makeRoute('Search', 'search-1', {q: 'A'});
        let state: TestState = makeState([initial], {history: [{...initial}] as CustomHistoryEntry[]});

        state = enhancedRouter.getStateForAction(state, {type: CONST.NAVIGATION.ACTION_TYPE.PUSH_PARAMS, payload: {params: {q: 'B'}}}, CONFIG_OPTIONS) as TestState;
        state = enhancedRouter.getStateForAction(state, {type: CONST.NAVIGATION.ACTION_TYPE.PUSH_PARAMS, payload: {params: {q: 'C'}}}, CONFIG_OPTIONS) as TestState;
        expect(state.history).toHaveLength(3);

        // SET_PARAMS doesn't push: focused params drift from the cursor entry.
        state = enhancedRouter.getStateForAction(state, CommonActions.setParams({sort: 'desc'}), CONFIG_OPTIONS) as TestState;
        expect(state.history).toHaveLength(3);

        // Layout-change RESET — focused params don't match any captured snapshot → 'unknown'.
        const layoutReset: PushParamsRouterAction = {
            type: CONST.NAVIGATION.ACTION_TYPE.RESET,
            payload: {routes: [{name: 'Search', key: 'search-1', params: {q: 'C', sort: 'desc'}}], index: 0},
        };
        state = enhancedRouter.getStateForAction(state, layoutReset, CONFIG_OPTIONS) as TestState;

        expect(state.history).toHaveLength(3);
        expect((asRouteEntry(state.history?.at(0) as CustomHistoryEntry).params as {q: string}).q).toBe('A');
        expect((asRouteEntry(state.history?.at(1) as CustomHistoryEntry).params as {q: string}).q).toBe('B');
        const cursorEntryParams = asRouteEntry(state.history?.at(2) as CustomHistoryEntry).params as {q: string; sort: string};
        expect(cursorEntryParams.q).toBe('C');
        expect(cursorEntryParams.sort).toBe('desc');
    });
});

describe('resolveCursorForReset (pure function)', () => {
    const mkHistory = (...params: string[]): CustomHistoryEntry[] => params.map((q) => makeRoute('Search', 'search-1', {q})) as CustomHistoryEntry[];

    it("returns 'noop' when target compound matches the cursor's entry", () => {
        const history = mkHistory('A', 'B', 'C');
        expect(resolveCursorForReset(history, 1, {key: 'search-1', params: {q: 'B'}})).toEqual({type: 'noop', cursor: 1});
    });

    it("returns 'backward' when target matches cursor-1 (adjacent back)", () => {
        const history = mkHistory('A', 'B', 'C');
        expect(resolveCursorForReset(history, 2, {key: 'search-1', params: {q: 'B'}})).toEqual({type: 'backward', cursor: 1});
    });

    it("returns 'forward' when target matches cursor+1 (adjacent forward)", () => {
        const history = mkHistory('A', 'B', 'C');
        expect(resolveCursorForReset(history, 0, {key: 'search-1', params: {q: 'B'}})).toEqual({type: 'forward', cursor: 1});
    });

    it("returns 'ambiguous' for duplicate compounds at cursor±1 (direction unknowable from state)", () => {
        // [A, B, A] cursor=1 targeting A: matches at 0 and 2. Cursor advances to 2; caller fires backward notify.
        const history = mkHistory('A', 'B', 'A');
        expect(resolveCursorForReset(history, 1, {key: 'search-1', params: {q: 'A'}})).toEqual({type: 'ambiguous', cursor: 2});
    });

    it("returns 'backward' for a non-adjacent jump to an earlier entry (history.go(-2))", () => {
        const history = mkHistory('A', 'B', 'C', 'D');
        expect(resolveCursorForReset(history, 3, {key: 'search-1', params: {q: 'A'}})).toEqual({type: 'backward', cursor: 0});
    });

    it("returns 'forward' for a non-adjacent jump to a later entry", () => {
        const history = mkHistory('A', 'B', 'C', 'D');
        expect(resolveCursorForReset(history, 0, {key: 'search-1', params: {q: 'D'}})).toEqual({type: 'forward', cursor: 3});
    });

    it('non-adjacent scan picks the nearest match, not the first — browser back from E in [A,B,C,A,D,E] lands on the later A', () => {
        // Without nearest-wins, the scan would stop at index 0 and leave the cursor stuck there, breaking subsequent in-app GO_BACK.
        const history = mkHistory('A', 'B', 'C', 'A', 'D', 'E');
        expect(resolveCursorForReset(history, 5, {key: 'search-1', params: {q: 'A'}})).toEqual({type: 'backward', cursor: 3});
    });

    it('non-adjacent scan tiebreaks forward when two matches are equidistant from cursor', () => {
        // [A, X, X, Y, X, X, A] cursor=3 — both A's at distance 3. Forward (index 6) preferred, consistent with the cursor+1 adjacent probe preference.
        const history: CustomHistoryEntry[] = [
            makeRoute('Search', 'search-1', {q: 'A'}),
            makeRoute('Search', 'search-1', {q: 'X1'}),
            makeRoute('Search', 'search-1', {q: 'X2'}),
            makeRoute('Search', 'search-1', {q: 'Y'}),
            makeRoute('Search', 'search-1', {q: 'X3'}),
            makeRoute('Search', 'search-1', {q: 'X4'}),
            makeRoute('Search', 'search-1', {q: 'A'}),
        ] as CustomHistoryEntry[];
        expect(resolveCursorForReset(history, 3, {key: 'search-1', params: {q: 'A'}})).toEqual({type: 'forward', cursor: 6});
    });

    it("returns 'unknown' when the target compound isn't in history at all", () => {
        const history = mkHistory('A', 'B', 'C');
        expect(resolveCursorForReset(history, 1, {key: 'search-1', params: {q: 'Z'}})).toEqual({type: 'unknown'});
    });

    it('when cursor is out-of-range it skips adjacent probes and relies on the full scan', () => {
        // Cursor was 5 from a prior longer history; history shrunk to 2. Target matches at i=1 in the new history.
        // Without skipping adjacent probes, this would match at the snapped cursor and mis-classify as 'noop'.
        const history = mkHistory('A', 'B');
        const outcome = resolveCursorForReset(history, 5, {key: 'search-1', params: {q: 'B'}});
        expect(outcome.type === 'backward' || outcome.type === 'forward').toBe(true);
    });

    it("returns 'unknown' when different route key even if compound matches", () => {
        const history = mkHistory('A', 'B');
        expect(resolveCursorForReset(history, 1, {key: 'other-route', params: {q: 'B'}})).toEqual({type: 'unknown'});
    });
});
