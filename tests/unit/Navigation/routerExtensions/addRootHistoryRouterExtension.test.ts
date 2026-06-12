import type {NavigationRoute, ParamListBase, PartialState, Router, RouterConfigOptions, StackNavigationState} from '@react-navigation/native';
import type {RootStackNavigatorAction} from '@libs/Navigation/AppNavigator/createRootStackNavigator/types';
import addRootHistoryRouterExtension from '@libs/Navigation/AppNavigator/routerExtensions/addRootHistoryRouterExtension';
import type {CustomHistoryEntry} from '@libs/Navigation/AppNavigator/routerExtensions/types';
import type {PlatformStackRouterOptions} from '@libs/Navigation/PlatformStackNavigation/types';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import type {Route} from '@src/ROUTES';

type TestState = StackNavigationState<ParamListBase> & {history?: CustomHistoryEntry[]};

const SIDE_PANEL = CONST.NAVIGATION.CUSTOM_HISTORY_ENTRY_SIDE_PANEL;
const REVEAL_PADDING = CONST.NAVIGATION.CUSTOM_HISTORY_ENTRY_REVEAL_PADDING;
const REPLACE_FULLSCREEN_UNDER_RHP = CONST.NAVIGATION.ACTION_TYPE.REPLACE_FULLSCREEN_UNDER_RHP;
const REMOVE_FULLSCREEN_UNDER_RHP = CONST.NAVIGATION.ACTION_TYPE.REMOVE_FULLSCREEN_UNDER_RHP;
const DISMISS_MODAL = CONST.NAVIGATION.ACTION_TYPE.DISMISS_MODAL;

// Per-describe counter; assigned in `beforeEach` so each test deterministically gets
// `prefix-1`, `prefix-2`, ... regardless of test ordering or filtering.
let testKeyCounter = 0;
function nextTestKey(prefix: string): string {
    testKeyCounter += 1;
    return `${prefix}-${testKeyCounter}`;
}

function makeRoute(name: string, key?: string, params?: Record<string, unknown>): NavigationRoute<ParamListBase, string> {
    return {key: key ?? nextTestKey(name), name, params} as NavigationRoute<ParamListBase, string>;
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

function createMockRouterFactory(actionHandler?: (state: TestState, action: RootStackNavigatorAction) => TestState | null) {
    const mockRouterFactory = jest.fn((routerOptions: PlatformStackRouterOptions) => {
        const baseRouter: Router<TestState, RootStackNavigatorAction> = {
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

            getStateForAction(state: TestState, action: RootStackNavigatorAction): TestState | null {
                if (actionHandler) {
                    return actionHandler(state, action);
                }

                if (action.type === 'NAVIGATE') {
                    const payload = action.payload as {name: string; params?: Record<string, unknown>};
                    const newRoute = makeRoute(payload.name, nextTestKey(payload.name), payload.params);
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

// Typed action factories. The extension only inspects `action.type` (and snapshots the top
// route's key on REPLACE), so the payload shape is a no-op for these tests; we use the
// minimum-shape `Route` placeholder ({name: '/'}) to satisfy the production action contract
// without forcing test code to fabricate full route objects.
const PLACEHOLDER_ROUTE = '/' as Route;
const makeReplaceAction = (): RootStackNavigatorAction => ({type: REPLACE_FULLSCREEN_UNDER_RHP, payload: {route: PLACEHOLDER_ROUTE}});
const makeRemoveAction = (): RootStackNavigatorAction => ({type: REMOVE_FULLSCREEN_UNDER_RHP, payload: {expectedRouteName: 'X'}});
const makeDismissAction = (): RootStackNavigatorAction => ({type: DISMISS_MODAL});
const makeNavigateAction = (name: string): RootStackNavigatorAction => ({type: 'NAVIGATE', payload: {name}});

// Tiny mirror of `countLeadingRevealPadding` from production. We don't import the production
// helper because it lives inside the extension's module closure and is not exported; this
// re-implementation is identical by inspection. If the production sentinel ever changes,
// `REVEAL_PADDING` (which we DO import) is the single point of update for both copies.
function countLeadingPadding(history: CustomHistoryEntry[] | unknown[] | undefined): number {
    if (!history) {
        return 0;
    }
    let count = 0;
    for (const entry of history) {
        if (entry === REVEAL_PADDING) {
            count += 1;
        } else {
            break;
        }
    }
    return count;
}

describe('addRootHistoryRouterExtension', () => {
    beforeEach(() => {
        testKeyCounter = 0;
    });

    it('getInitialState attaches a history array mirroring routes', () => {
        const factory = createMockRouterFactory();
        const enhancedRouter = addRootHistoryRouterExtension(factory)({} as PlatformStackRouterOptions);

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
        const enhancedRouter = addRootHistoryRouterExtension(factory)({} as PlatformStackRouterOptions);

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
        const enhancedRouter = addRootHistoryRouterExtension(factory)({} as PlatformStackRouterOptions);

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
        const enhancedRouter = addRootHistoryRouterExtension(factory)({} as PlatformStackRouterOptions);

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
        const enhancedRouter = addRootHistoryRouterExtension(factory)({} as PlatformStackRouterOptions);

        const initialState = enhancedRouter.getInitialState(CONFIG_OPTIONS);

        const navigateAction: RootStackNavigatorAction = {
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

    it('getStateForAction preserves original history shape for REPLACE_FULLSCREEN_UNDER_RHP so useLinking sees historyDelta=0', () => {
        const routeA = makeRoute('ScreenA', 'a-1');
        const routeB = makeRoute('ScreenB', 'b-1');
        const routeC = makeRoute('ScreenC', 'c-1');

        const replacedRoute = makeRoute('ScreenReplaced', 'replaced-1');

        const factory = createMockRouterFactory((state) => {
            return makeState([replacedRoute, ...state.routes.slice(1)]);
        });

        const enhancedRouter = addRootHistoryRouterExtension(factory)({} as PlatformStackRouterOptions);

        const initialHistory = [
            {key: 'a-1', name: 'ScreenA'},
            {key: 'b-1', name: 'ScreenB'},
            {key: 'c-1', name: 'ScreenC'},
        ] as CustomHistoryEntry[];

        const state = makeState([routeA, routeB, routeC], {history: initialHistory});

        const newState = enhancedRouter.getStateForAction(state, makeReplaceAction(), CONFIG_OPTIONS);

        expect(newState).not.toBeNull();
        // Defensive copy is returned (not the same reference) but content must match.
        expect(newState?.history).toEqual(initialHistory);
        expect(newState?.history).not.toBe(initialHistory);
    });

    it('getStateForAction returns null when the base router returns null', () => {
        const factory = createMockRouterFactory(() => null);
        const enhancedRouter = addRootHistoryRouterExtension(factory)({} as PlatformStackRouterOptions);

        const initialState = enhancedRouter.getInitialState(CONFIG_OPTIONS);

        const action: RootStackNavigatorAction = {
            type: 'NAVIGATE',
            payload: {name: 'ScreenB'},
        };

        const result = enhancedRouter.getStateForAction(initialState, action, CONFIG_OPTIONS);
        expect(result).toBeNull();
    });

    describe('reveal protocol (REPLACE_FULLSCREEN_UNDER_RHP + DISMISS_MODAL)', () => {
        // Helper that builds a router whose actionHandler implements the minimum shape of the
        // reveal protocol: REPLACE swaps the under-modal route, DISMISS pops the top route,
        // REMOVE undoes the prior REPLACE. We use `{...state, routes, index}` (instead of
        // `makeState(...)`) so unknown fields like `history` are preserved through the spread,
        // mirroring what RN's StackRouter does in production.
        function withRoutes(state: TestState, routes: TestState['routes']): TestState {
            return {...state, routes, routeNames: routes.map((r) => r.name), index: routes.length - 1};
        }
        function makeRevealRouter(replacement: NavigationRoute<ParamListBase, string>) {
            return createMockRouterFactory((state, action) => {
                if (action.type === REPLACE_FULLSCREEN_UNDER_RHP) {
                    return withRoutes(state, [replacement, ...state.routes.slice(1)]);
                }
                if (action.type === REMOVE_FULLSCREEN_UNDER_RHP) {
                    return state;
                }
                if (action.type === DISMISS_MODAL) {
                    return withRoutes(state, state.routes.slice(0, -1));
                }
                if (action.type === 'NAVIGATE') {
                    const payload = action.payload as {name: string; params?: Record<string, unknown>};
                    const newRoute = makeRoute(payload.name, nextTestKey(payload.name), payload.params);
                    return withRoutes(state, [...state.routes, newRoute]);
                }
                return state;
            });
        }

        it('freezes history length on DISMISS_MODAL after a reveal so useLinking sees historyDelta=0', () => {
            // Pre-reveal state: routes=[TabA, RHP], history reflects 3 prior browser entries
            // (e.g. /home → /workspaces → opened the new-workspace RHP).
            const tabA = makeRoute('TabA', 'tab-a-1');
            const tabB = makeRoute('TabB', 'tab-b-1');
            const rhp = makeRoute(NAVIGATORS.RIGHT_MODAL_NAVIGATOR, 'rhp-1');

            const enhancedRouter = addRootHistoryRouterExtension(makeRevealRouter(tabB))({} as PlatformStackRouterOptions);

            const stateWithRHP = makeState([tabA, rhp], {
                history: [
                    {key: 'tab-a-1', name: 'TabA'},
                    {key: 'tab-a-1', name: 'TabA'},
                    {key: 'rhp-1', name: NAVIGATORS.RIGHT_MODAL_NAVIGATOR},
                ] as CustomHistoryEntry[],
            });

            const afterReplace = enhancedRouter.getStateForAction(stateWithRHP, makeReplaceAction(), CONFIG_OPTIONS);
            expect(afterReplace).not.toBeNull();
            expect(afterReplace?.history?.length).toBe(3);

            const afterDismiss = enhancedRouter.getStateForAction(afterReplace as TestState, makeDismissAction(), CONFIG_OPTIONS);
            expect(afterDismiss).not.toBeNull();
            // Routes shrunk by 1 (modal popped)…
            expect(afterDismiss?.routes.length).toBe(1);
            // …but history.length is held at the pre-dismiss length so useLinking's historyDelta = 0.
            expect(afterDismiss?.history?.length).toBe(3);
            // The phantom entries are now sentinel padding at the front, NOT stale route mirrors.
            expect(countLeadingPadding(afterDismiss?.history)).toBe(2);
            // Trailing entries reflect the new (post-dismiss) routes.
            expect(asRouteEntry(afterDismiss?.history?.at(-1) as CustomHistoryEntry).key).toBe('tab-b-1');
        });

        it('maintains the reveal-induced length offset across subsequent inner navigations', () => {
            const tabA = makeRoute('TabA', 'tab-a-1');
            const tabB = makeRoute('TabB', 'tab-b-1');
            const rhp = makeRoute(NAVIGATORS.RIGHT_MODAL_NAVIGATOR, 'rhp-1');

            const enhancedRouter = addRootHistoryRouterExtension(makeRevealRouter(tabB))({} as PlatformStackRouterOptions);

            const stateWithRHP = makeState([tabA, rhp], {
                history: [
                    {key: 'tab-a-1', name: 'TabA'},
                    {key: 'tab-a-1', name: 'TabA'},
                    {key: 'rhp-1', name: NAVIGATORS.RIGHT_MODAL_NAVIGATOR},
                ] as CustomHistoryEntry[],
            });

            const afterReplace = enhancedRouter.getStateForAction(stateWithRHP, makeReplaceAction(), CONFIG_OPTIONS) as TestState;
            const afterDismiss = enhancedRouter.getStateForAction(afterReplace, makeDismissAction(), CONFIG_OPTIONS) as TestState;

            // Sanity: offset of 2.
            expect(countLeadingPadding(afterDismiss.history)).toBe(2);
            expect(afterDismiss.history?.length).toBe(3);

            // Inner NAVIGATE - routes grow by 1; offset must persist.
            const afterNavigate = enhancedRouter.getStateForAction(afterDismiss, makeNavigateAction('TabC'), CONFIG_OPTIONS) as TestState;
            expect(afterNavigate.routes.length).toBe(2);
            expect(afterNavigate.history?.length).toBe(4);
            expect(countLeadingPadding(afterNavigate.history)).toBe(2);
        });

        it('does NOT freeze when DISMISS_MODAL fires without a pending reveal', () => {
            const tabA = makeRoute('TabA', 'tab-a-1');
            const rhp = makeRoute(NAVIGATORS.RIGHT_MODAL_NAVIGATOR, 'rhp-1');

            const factory = createMockRouterFactory((state, action) => {
                if (action.type === DISMISS_MODAL) {
                    return makeState(state.routes.slice(0, -1));
                }
                return state;
            });
            const enhancedRouter = addRootHistoryRouterExtension(factory)({} as PlatformStackRouterOptions);

            const stateWithRHP = makeState([tabA, rhp], {
                history: [
                    {key: 'tab-a-1', name: 'TabA'},
                    {key: 'rhp-1', name: NAVIGATORS.RIGHT_MODAL_NAVIGATOR},
                ] as CustomHistoryEntry[],
            });

            const afterDismiss = enhancedRouter.getStateForAction(stateWithRHP, makeDismissAction(), CONFIG_OPTIONS) as TestState;

            expect(afterDismiss.routes.length).toBe(1);
            expect(afterDismiss.history?.length).toBe(1);
            expect(countLeadingPadding(afterDismiss.history)).toBe(0);
        });

        it('cancels cleanly on REMOVE_FULLSCREEN_UNDER_RHP - no offset is left behind', () => {
            // Reveal protocol's "abort" path: REPLACE happens, then REMOVE rolls it back, no
            // commit. After a subsequent normal modal dismissal we must NOT freeze, NOT pad.
            const tabA = makeRoute('TabA', 'tab-a-1');
            const tabB = makeRoute('TabB', 'tab-b-1');
            const rhp = makeRoute(NAVIGATORS.RIGHT_MODAL_NAVIGATOR, 'rhp-1');

            const factory = createMockRouterFactory((state, action) => {
                if (action.type === REPLACE_FULLSCREEN_UNDER_RHP) {
                    return makeState([tabB, ...state.routes.slice(1)]);
                }
                if (action.type === REMOVE_FULLSCREEN_UNDER_RHP) {
                    return makeState([tabA, ...state.routes.slice(1)]);
                }
                if (action.type === DISMISS_MODAL) {
                    return makeState(state.routes.slice(0, -1));
                }
                return state;
            });
            const enhancedRouter = addRootHistoryRouterExtension(factory)({} as PlatformStackRouterOptions);

            const stateWithRHP = makeState([tabA, rhp], {
                history: [
                    {key: 'tab-a-1', name: 'TabA'},
                    {key: 'rhp-1', name: NAVIGATORS.RIGHT_MODAL_NAVIGATOR},
                ] as CustomHistoryEntry[],
            });

            const afterReplace = enhancedRouter.getStateForAction(stateWithRHP, makeReplaceAction(), CONFIG_OPTIONS) as TestState;
            const afterRemove = enhancedRouter.getStateForAction(afterReplace, makeRemoveAction(), CONFIG_OPTIONS) as TestState;

            // REMOVE freezes too (same intermediate-frame rationale as REPLACE).
            expect(afterRemove.history?.length).toBe(2);
            expect(countLeadingPadding(afterRemove.history)).toBe(0);

            // Now dismiss the modal normally - must NOT engage the freeze logic.
            const afterDismiss = enhancedRouter.getStateForAction(afterRemove, makeDismissAction(), CONFIG_OPTIONS) as TestState;
            expect(afterDismiss.routes.length).toBe(1);
            expect(afterDismiss.history?.length).toBe(1);
            expect(countLeadingPadding(afterDismiss.history)).toBe(0);
        });

        it('handles two consecutive reveal sequences - offset accumulates correctly via leading sentinels', () => {
            const tabA = makeRoute('TabA', 'tab-a-1');
            const tabB = makeRoute('TabB', 'tab-b-1');
            const tabC = makeRoute('TabC', 'tab-c-1');
            const rhp1 = makeRoute(NAVIGATORS.RIGHT_MODAL_NAVIGATOR, 'rhp-1');
            const rhp2 = makeRoute(NAVIGATORS.RIGHT_MODAL_NAVIGATOR, 'rhp-2');

            // Keyed replacements per call so test handler can pick the right one.
            let replaceTarget: NavigationRoute<ParamListBase, string> = tabB;

            const factory = createMockRouterFactory((state, action) => {
                if (action.type === REPLACE_FULLSCREEN_UNDER_RHP) {
                    return makeState([replaceTarget, ...state.routes.slice(1)]);
                }
                if (action.type === DISMISS_MODAL) {
                    return makeState(state.routes.slice(0, -1));
                }
                return state;
            });
            const enhancedRouter = addRootHistoryRouterExtension(factory)({} as PlatformStackRouterOptions);

            // First reveal: starting state has 3 history entries.
            const initialState = makeState([tabA, rhp1], {
                history: [
                    {key: 'tab-a-1', name: 'TabA'},
                    {key: 'tab-a-1', name: 'TabA'},
                    {key: 'rhp-1', name: NAVIGATORS.RIGHT_MODAL_NAVIGATOR},
                ] as CustomHistoryEntry[],
            });

            const afterFirstReplace = enhancedRouter.getStateForAction(initialState, makeReplaceAction(), CONFIG_OPTIONS) as TestState;
            const afterFirstDismiss = enhancedRouter.getStateForAction(afterFirstReplace, makeDismissAction(), CONFIG_OPTIONS) as TestState;
            expect(afterFirstDismiss.history?.length).toBe(3);
            expect(countLeadingPadding(afterFirstDismiss.history)).toBe(2);

            // User opens a second RHP: routes grow by 1, history grows by 1 (offset preserved).
            const stateWithRhp2 = makeState([tabB, rhp2], {history: [...(afterFirstDismiss.history ?? []), {key: 'rhp-2', name: NAVIGATORS.RIGHT_MODAL_NAVIGATOR} as CustomHistoryEntry]});
            // Second reveal: replace TabB → TabC, then dismiss rhp2.
            replaceTarget = tabC;
            const afterSecondReplace = enhancedRouter.getStateForAction(stateWithRhp2, makeReplaceAction(), CONFIG_OPTIONS) as TestState;
            const afterSecondDismiss = enhancedRouter.getStateForAction(afterSecondReplace, makeDismissAction(), CONFIG_OPTIONS) as TestState;

            // Pre-second-dismiss history length was 4 (2 padding + tabB + rhp2). Post-dismiss
            // routes length is 1 (tabC). Offset must be 4 - 1 = 3.
            expect(afterSecondDismiss.routes.length).toBe(1);
            expect(afterSecondDismiss.history?.length).toBe(4);
            expect(countLeadingPadding(afterSecondDismiss.history)).toBe(3);
            expect(asRouteEntry(afterSecondDismiss.history?.at(-1) as CustomHistoryEntry).key).toBe('tab-c-1');
        });

        it('does NOT commit a reveal when an unrelated modal is dismissed between REPLACE and the matching DISMISS', () => {
            // Regression: previously the counter was decremented based on "topRoute is not RIGHT_MODAL_NAVIGATOR",
            // which was incomplete and caused leak-or-misfire. Key-based pairing is robust to non-RHP
            // modal types interleaving - only the dismissal of the snapshotted RHP key commits.
            const tabA = makeRoute('TabA', 'tab-a-1');
            const tabB = makeRoute('TabB', 'tab-b-1');
            const rhp = makeRoute(NAVIGATORS.RIGHT_MODAL_NAVIGATOR, 'rhp-real');
            const otherModal = makeRoute(NAVIGATORS.RIGHT_MODAL_NAVIGATOR, 'rhp-other');

            const factory = createMockRouterFactory((state, action) => {
                if (action.type === REPLACE_FULLSCREEN_UNDER_RHP) {
                    return makeState([tabB, ...state.routes.slice(1)]);
                }
                if (action.type === DISMISS_MODAL) {
                    return makeState(state.routes.slice(0, -1));
                }
                if (action.type === 'NAVIGATE') {
                    const payload = action.payload as {name: string; params?: Record<string, unknown>};
                    const newRoute = payload.name === 'OTHER_MODAL' ? otherModal : makeRoute(payload.name, nextTestKey(payload.name), payload.params);
                    return makeState([...state.routes, newRoute]);
                }
                return state;
            });
            const enhancedRouter = addRootHistoryRouterExtension(factory)({} as PlatformStackRouterOptions);

            const stateWithRHP = makeState([tabA, rhp], {
                history: [
                    {key: 'tab-a-1', name: 'TabA'},
                    {key: 'rhp-real', name: NAVIGATORS.RIGHT_MODAL_NAVIGATOR},
                ] as CustomHistoryEntry[],
            });

            const afterReplace = enhancedRouter.getStateForAction(stateWithRHP, makeReplaceAction(), CONFIG_OPTIONS) as TestState;
            // Open an *unrelated* modal on top of the in-flight reveal.
            const stateAfterOpeningOtherModal = enhancedRouter.getStateForAction(afterReplace, makeNavigateAction('OTHER_MODAL'), CONFIG_OPTIONS) as TestState;
            expect(stateAfterOpeningOtherModal.routes.length).toBe(3);
            expect(stateAfterOpeningOtherModal.routes.at(-1)?.key).toBe('rhp-other');

            // Dismiss the OTHER modal - must NOT commit the in-flight reveal (key mismatch),
            // i.e. no offset is set, history shrinks naturally.
            const afterDismissOther = enhancedRouter.getStateForAction(stateAfterOpeningOtherModal, makeDismissAction(), CONFIG_OPTIONS) as TestState;
            expect(afterDismissOther.routes.length).toBe(2);
            expect(countLeadingPadding(afterDismissOther.history)).toBe(0);

            // Now dismiss the *real* RHP - that's the protocol's second frame; commit the reveal.
            const afterDismissReal = enhancedRouter.getStateForAction(afterDismissOther, makeDismissAction(), CONFIG_OPTIONS) as TestState;
            expect(afterDismissReal.routes.length).toBe(1);
            expect(countLeadingPadding(afterDismissReal.history)).toBeGreaterThan(0);
        });

        it('clears the pending reveal snapshot if the snapshotted RHP disappears via some other path (sanity reset)', () => {
            // If something else dismisses the RHP key we were tracking (without going through DISMISS_MODAL),
            // a subsequent unrelated DISMISS_MODAL must NOT freeze.
            const tabA = makeRoute('TabA', 'tab-a-1');
            const tabB = makeRoute('TabB', 'tab-b-1');
            const rhp = makeRoute(NAVIGATORS.RIGHT_MODAL_NAVIGATOR, 'rhp-1');
            const otherRhp = makeRoute(NAVIGATORS.RIGHT_MODAL_NAVIGATOR, 'rhp-2');

            const factory = createMockRouterFactory((state, action) => {
                if (action.type === REPLACE_FULLSCREEN_UNDER_RHP) {
                    return makeState([tabB, ...state.routes.slice(1)]);
                }
                if (action.type === DISMISS_MODAL) {
                    return makeState(state.routes.slice(0, -1));
                }
                if (action.type === 'NAVIGATE') {
                    const payload = action.payload as {name: string};
                    if (payload.name === '__POP_RHP__') {
                        // Simulate a non-DISMISS_MODAL action that removes the snapshotted RHP.
                        return makeState(state.routes.filter((r) => r.key !== 'rhp-1'));
                    }
                    if (payload.name === '__OPEN_OTHER_RHP__') {
                        return makeState([...state.routes, otherRhp]);
                    }
                    return state;
                }
                return state;
            });
            const enhancedRouter = addRootHistoryRouterExtension(factory)({} as PlatformStackRouterOptions);

            const stateWithRHP = makeState([tabA, rhp], {
                history: [
                    {key: 'tab-a-1', name: 'TabA'},
                    {key: 'rhp-1', name: NAVIGATORS.RIGHT_MODAL_NAVIGATOR},
                ] as CustomHistoryEntry[],
            });

            // REPLACE snapshots rhp-1.
            const afterReplace = enhancedRouter.getStateForAction(stateWithRHP, makeReplaceAction(), CONFIG_OPTIONS) as TestState;
            // Some external action removes rhp-1 without going through DISMISS_MODAL.
            const afterPop = enhancedRouter.getStateForAction(afterReplace, makeNavigateAction('__POP_RHP__'), CONFIG_OPTIONS) as TestState;
            expect(afterPop.routes.find((r) => r.key === 'rhp-1')).toBeUndefined();

            // Open a different RHP.
            const afterSecondRhpOpen = enhancedRouter.getStateForAction(afterPop, makeNavigateAction('__OPEN_OTHER_RHP__'), CONFIG_OPTIONS) as TestState;
            // Dismiss it. Snapshot was cleared by the sanity reset, so this must NOT freeze.
            const afterSecondRhpDismiss = enhancedRouter.getStateForAction(afterSecondRhpOpen, makeDismissAction(), CONFIG_OPTIONS) as TestState;
            expect(countLeadingPadding(afterSecondRhpDismiss.history)).toBe(0);
        });

        it('does NOT freeze when DISMISS_MODAL produces a non-positive lengthDelta (degenerate case)', () => {
            // If routes and history are already in lockstep at REPLACE-time (no real history depth
            // beyond the routes themselves), DISMISS_MODAL produces lengthDelta <= 0 and we must
            // skip the freeze - no padding, history shrinks naturally.
            const tabA = makeRoute('TabA', 'tab-a-1');
            const tabB = makeRoute('TabB', 'tab-b-1');
            const rhp = makeRoute(NAVIGATORS.RIGHT_MODAL_NAVIGATOR, 'rhp-1');

            const enhancedRouter = addRootHistoryRouterExtension(makeRevealRouter(tabB))({} as PlatformStackRouterOptions);

            // History exactly mirrors routes (no real depth beyond the modal).
            const stateWithRHP = makeState([tabA, rhp], {
                history: [
                    {key: 'tab-a-1', name: 'TabA'},
                    {key: 'rhp-1', name: NAVIGATORS.RIGHT_MODAL_NAVIGATOR},
                ] as CustomHistoryEntry[],
            });

            const afterReplace = enhancedRouter.getStateForAction(stateWithRHP, makeReplaceAction(), CONFIG_OPTIONS) as TestState;
            const afterDismiss = enhancedRouter.getStateForAction(afterReplace, makeDismissAction(), CONFIG_OPTIONS) as TestState;

            // pre-dismiss state.history.length = 2; post-dismiss rehydrated.history.length = 1.
            // lengthDelta = 1 → freeze with offset 1 (one sentinel padding entry).
            // This validates the boundary: we still pad when delta is exactly 1.
            expect(afterDismiss.routes.length).toBe(1);
            expect(afterDismiss.history?.length).toBe(2);
            expect(countLeadingPadding(afterDismiss.history)).toBe(1);
        });

        it('correctly accounts for trailing CUSTOM_HISTORY_ENTRY_SIDE_PANEL when computing the offset', () => {
            // Side-panel sentinel is a string entry appended to history. It must NOT inflate
            // the reveal offset - getRehydratedState already preserves it on the new state, so
            // lengthDelta is computed against rehydrated.history.length (which includes the
            // sentinel) rather than rehydrated.routes.length.
            const tabA = makeRoute('TabA', 'tab-a-1');
            const tabB = makeRoute('TabB', 'tab-b-1');
            const rhp = makeRoute(NAVIGATORS.RIGHT_MODAL_NAVIGATOR, 'rhp-1');

            const enhancedRouter = addRootHistoryRouterExtension(makeRevealRouter(tabB))({} as PlatformStackRouterOptions);

            // Pre-reveal: 2 prior entries + RHP + SIDE_PANEL → length 4.
            const stateWithRHP = makeState([tabA, rhp], {
                history: [{key: 'tab-a-1', name: 'TabA'}, {key: 'tab-a-1', name: 'TabA'}, {key: 'rhp-1', name: NAVIGATORS.RIGHT_MODAL_NAVIGATOR}, SIDE_PANEL] as CustomHistoryEntry[],
            });

            const afterReplace = enhancedRouter.getStateForAction(stateWithRHP, makeReplaceAction(), CONFIG_OPTIONS) as TestState;
            const afterDismiss = enhancedRouter.getStateForAction(afterReplace, makeDismissAction(), CONFIG_OPTIONS) as TestState;

            // Post-dismiss: routes=[TabB], rehydrated.history=[TabB-mirror, SIDE_PANEL] (length 2).
            // lengthDelta = 4 - 2 = 2 sentinel padding entries. Final shape:
            // [PAD, PAD, TabB-mirror, SIDE_PANEL] (length 4).
            expect(afterDismiss.history?.length).toBe(4);
            expect(countLeadingPadding(afterDismiss.history)).toBe(2);
            expect(afterDismiss.history?.at(-1)).toBe(SIDE_PANEL);
        });

        it('rejects the freeze when state.history.length diverges between REPLACE and the matching DISMISS', () => {
            // Defends against root-level dispatches that grow `state.history` without changing
            // routes between the two reveal frames (e.g. an in-flight history-mutating action).
            // If history.length does not match the captured snapshot, the freeze is rejected to
            // avoid producing a wrong offset; DISMISS proceeds with the natural shrink.
            const tabA = makeRoute('TabA', 'tab-a-1');
            const tabB = makeRoute('TabB', 'tab-b-1');
            const rhp = makeRoute(NAVIGATORS.RIGHT_MODAL_NAVIGATOR, 'rhp-1');

            const enhancedRouter = addRootHistoryRouterExtension(makeRevealRouter(tabB))({} as PlatformStackRouterOptions);

            const stateWithRHP = makeState([tabA, rhp], {
                history: [
                    {key: 'tab-a-1', name: 'TabA'},
                    {key: 'tab-a-1', name: 'TabA'},
                    {key: 'rhp-1', name: NAVIGATORS.RIGHT_MODAL_NAVIGATOR},
                ] as CustomHistoryEntry[],
            });

            const afterReplace = enhancedRouter.getStateForAction(stateWithRHP, makeReplaceAction(), CONFIG_OPTIONS) as TestState;

            // Simulate an out-of-band history mutation: append an extra route entry without
            // changing routes. Pre-DISMISS state.history.length is now 4 instead of the
            // captured 3.
            const tamperedState: TestState = {
                ...afterReplace,
                history: [...(afterReplace.history ?? []), {key: 'rogue-1', name: 'Rogue'} as unknown as CustomHistoryEntry],
            };

            const afterDismiss = enhancedRouter.getStateForAction(tamperedState, makeDismissAction(), CONFIG_OPTIONS) as TestState;

            // Freeze is rejected (history depth mismatch); routes shrink naturally,
            // history is rebuilt from routes (no padding sentinels).
            expect(afterDismiss.routes.length).toBe(1);
            expect(countLeadingPadding(afterDismiss.history)).toBe(0);
        });

        it('lets a fresh state install via getRehydratedState shed leading reveal-padding sentinels', () => {
            // resetRoot / popstate scenarios install a new state via getRehydratedState. If the
            // installed partial state does NOT carry padding sentinels in its history, the
            // resulting state's history is rebuilt from routes by enhanceStateWithHistory and
            // the offset dies naturally - this is the documented contract.
            const factory = createMockRouterFactory();
            const enhancedRouter = addRootHistoryRouterExtension(factory)({} as PlatformStackRouterOptions);

            const partialState = {
                routes: [{name: 'ScreenA', key: 'a-1'}],
                stale: true as const,
                // partial state arrives WITHOUT padding sentinels (i.e., a fresh resetRoot).
            };

            const rehydrated = enhancedRouter.getRehydratedState(partialState as PartialState<TestState>, CONFIG_OPTIONS);

            // No padding survived rehydration - the history mirrors the routes only.
            expect(countLeadingPadding(rehydrated.history)).toBe(0);
            expect(rehydrated.history?.length).toBe(1);
        });

        it('drops leading reveal-padding sentinels when a partial state carries them through getRehydratedState', () => {
            // Symmetric to the previous test: even if a resetRoot installs state whose history
            // includes leading reveal-padding sentinels (e.g. a captured snapshot),
            // enhanceStateWithHistory rebuilds history from routes and drops that offset at
            // the rehydration boundary.
            const factory = createMockRouterFactory();
            const enhancedRouter = addRootHistoryRouterExtension(factory)({} as PlatformStackRouterOptions);

            const partialState = {
                routes: [{name: 'ScreenA', key: 'a-1'}],
                stale: true as const,
                history: [REVEAL_PADDING, REVEAL_PADDING, {key: 'a-1', name: 'ScreenA'}] as CustomHistoryEntry[],
            };

            const rehydrated = enhancedRouter.getRehydratedState(partialState as PartialState<TestState>, CONFIG_OPTIONS);

            // enhanceStateWithHistory rebuilds history from routes by default, so leading
            // padding is dropped at the rehydration boundary - this is the conservative
            // outcome (offset dies on resetRoot, browser history not over-padded).
            expect(countLeadingPadding(rehydrated.history)).toBe(0);
        });
    });
});
